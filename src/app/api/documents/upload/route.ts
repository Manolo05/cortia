import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// Extraire le texte d'un PDF via OpenAI GPT-4o
async function extractTextFromPDF(fileBuffer: Buffer, fileName: string, apiKey: string): Promise<string> {
  // Convert PDF buffer to base64
  const base64 = fileBuffer.toString('base64')
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Tu es un expert en analyse de documents immobiliers et financiers français. 
Analyse ce document PDF et extrais TOUTES les informations importantes de façon structurée.

Document: ${fileName}

Extrais notamment:
- Identité (nom, prénom, date naissance, adresse, numéro pièce identité si présent)
- Revenus (salaires, primes, revenus locatifs, autres revenus - montants précis)
- Employeur et contrat de travail (type, ancienneté, poste)
- Charges et crédits en cours (montants, organismes)
- Informations bancaires (numéro compte masqué, banque, soldes moyens)
- Prix et caractéristiques du bien immobilier si contrat de réservation/compromis
- Impôts (revenu fiscal de référence, impôt payé)
- Toute autre information financière ou juridique pertinente

Réponds en JSON structuré avec ces champs:
{
  "type_document_detecte": "...",
  "periode": "...",
  "identite": { "nom": "", "prenom": "", "date_naissance": "", "adresse": "" },
  "revenus": { "salaire_net_mensuel": 0, "salaire_brut_mensuel": 0, "primes": 0, "autres": 0, "total_annuel": 0 },
  "employeur": { "nom": "", "type_contrat": "", "poste": "", "anciennete": "" },
  "charges": { "credits": 0, "loyer": 0, "autres": 0 },
  "bancaire": { "banque": "", "solde_moyen": 0, "incidents": [] },
  "fiscal": { "revenu_fiscal": 0, "impot_paye": 0, "nombre_parts": 0 },
  "bien_immobilier": { "adresse": "", "prix": 0, "type": "", "surface": 0 },
  "anomalies_detectees": [],
  "resume_extraction": "..."
}`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:application/pdf;base64,${base64}`,
                detail: 'high'
              }
            }
          ]
        }
      ]
    })
  })

  if (!response.ok) {
    // Fallback: essayer d'extraire le texte brut
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const dossierId = formData.get('dossier_id') as string
    const typeDocument = formData.get('type_document') as string
    const emprunteurId = formData.get('emprunteur_id') as string | null

    if (!file || !dossierId || !typeDocument) {
      return NextResponse.json({ error: 'Paramètres manquants: file, dossier_id, type_document requis' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 })
    }

    // Récupérer le cabinet_id
    const { data: profil } = await supabase
      .from('profils_utilisateurs')
      .select('cabinet_id')
      .eq('id', session.user.id)
      .single()

    // Lire le fichier
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload dans Supabase Storage
    const fileName = `${dossierId}/${typeDocument}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    let urlStockage = ''
    if (uploadError) {
      // Si le bucket n'existe pas ou erreur, on continue sans storage
      urlStockage = `local://${fileName}`
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)
      urlStockage = publicUrl
    }

    // Extraction du texte via OpenAI
    let texteExtrait = ''
    let donneeesExtraites: any = {}
    const openaiKey = process.env.OPENAI_API_KEY

    if (openaiKey) {
      try {
        const extraction = await extractTextFromPDF(buffer, file.name, openaiKey)
        texteExtrait = extraction
        try {
          // Tenter de parser le JSON
          const jsonMatch = extraction.match(/{[sS]*}/)
          if (jsonMatch) {
            donneeesExtraites = JSON.parse(jsonMatch[0])
          }
        } catch {
          donneeesExtraites = { resume_extraction: extraction }
        }
      } catch (err) {
        console.error('Erreur extraction OpenAI:', err)
        donneeesExtraites = { resume_extraction: 'Extraction non disponible' }
      }
    }

    // Enregistrer en base de données
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert({
        dossier_id: dossierId,
        emprunteur_id: emprunteurId || null,
        type_document: typeDocument,
        nom_fichier: file.name,
        url_stockage: urlStockage,
        taille_fichier: file.size,
        mime_type: 'application/pdf',
        statut_verification: 'en_attente',
        cabinet_id: profil?.cabinet_id,
        // Stocker les données extraites dans les notes
        notes: JSON.stringify(donneeesExtraites),
      })
      .select()
      .single()

    if (docError) {
      console.error('Erreur DB:', docError)
      return NextResponse.json({ error: 'Erreur enregistrement: ' + docError.message }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      document: docData,
      extraction: donneeesExtraites,
      texte_brut: texteExtrait.substring(0, 500),
    })

  } catch (error: any) {
    console.error('Erreur upload:', error)
    return NextResponse.json({ error: 'Erreur serveur: ' + error.message }, { status: 500 })
  }
}
