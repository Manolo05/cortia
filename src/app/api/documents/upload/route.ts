import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 120

// Extraire le texte brut d'un PDF avec pdf-parse
async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  try {
    // Import dynamique pour eviter les problemes de bundling
    const pdfParse = await import('pdf-parse')
    const data = await pdfParse.default(buffer)
    return data.text || ''
  } catch (err) {
    console.error('Erreur extraction pdf-parse:', err)
    return ''
  }
}

// Analyser le texte extrait avec OpenAI GPT-4o
async function analyserAvecIA(texte: string, fileName: string, typeDocument: string, openai: OpenAI): Promise<any> {
  if (!texte || texte.trim().length < 10) {
    return {
      erreur: 'Texte PDF non extractible ou document vide',
      resume_extraction: 'Impossible de lire le contenu du PDF'
    }
  }

  // Tronquer si trop long (max ~15000 chars pour rester dans les limites token)
  const texteTronque = texte.length > 15000 ? texte.substring(0, 15000) + '\n[... document tronque ...]' : texte

  const prompt = `Tu es un expert en analyse de documents immobiliers et financiers francais.
Analyse ce document et extrais TOUTES les informations importantes.

Type de document: ${typeDocument}
Nom du fichier: ${fileName}

CONTENU DU DOCUMENT:
${texteTronque}

Reponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) avec exactement cette structure:
{
  "type_document_detecte": "type exact detecte dans le document",
  "periode": "periode couverte (ex: janvier 2024, annee 2023, etc.)",
  "identite": {
    "nom": "nom de famille",
    "prenom": "prenom",
    "date_naissance": "JJ/MM/AAAA",
    "adresse": "adresse complete"
  },
  "revenus": {
    "salaire_net_mensuel": 0,
    "salaire_brut_mensuel": 0,
    "salaire_net_annuel": 0,
    "primes": 0,
    "heures_supplementaires": 0,
    "autres_revenus": 0,
    "total_mensuel_net": 0
  },
  "employeur": {
    "nom": "nom de la societe",
    "siret": "",
    "type_contrat": "CDI/CDD/interim/etc",
    "poste": "intitule du poste",
    "anciennete": "depuis quand",
    "convention_collective": ""
  },
  "charges": {
    "credit_immobilier": 0,
    "credit_consommation": 0,
    "loyer": 0,
    "pension": 0,
    "autres": 0,
    "total_charges": 0
  },
  "bancaire": {
    "banque": "nom de la banque",
    "iban_partiel": "FR76****",
    "solde_moyen": 0,
    "solde_fin_periode": 0,
    "total_credits": 0,
    "total_debits": 0,
    "incidents_paiement": [],
    "epargne": 0
  },
  "fiscal": {
    "revenu_fiscal_reference": 0,
    "impot_sur_revenu": 0,
    "nombre_parts": 0,
    "annee_imposition": "",
    "situation_familiale": ""
  },
  "bien_immobilier": {
    "adresse": "",
    "prix_vente": 0,
    "prix_reservation": 0,
    "type_bien": "",
    "surface": 0,
    "notaire": ""
  },
  "document_identite": {
    "type": "CNI/passeport/titre_sejour",
    "numero": "",
    "date_expiration": "",
    "nationalite": ""
  },
  "anomalies_detectees": [],
  "coherence_interne": "evaluation de la coherence interne du document",
  "resume_extraction": "resume en 2-3 phrases des informations cles"
}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 4096,
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: 'Tu es un expert en analyse de documents financiers et immobiliers. Tu reponds toujours avec un JSON valide uniquement, sans aucun texte supplementaire.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const content = response.choices?.[0]?.message?.content || '{}'
  
  try {
    // Nettoyer les backticks markdown si presents
    const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return {
      texte_brut: content,
      resume_extraction: content.substring(0, 500)
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File
    const dossierId = formData.get('dossier_id') as string
    const typeDocument = formData.get('type_document') as string
    const emprunteurId = formData.get('emprunteur_id') as string | null

    if (!file || !dossierId || !typeDocument) {
      return NextResponse.json({ error: 'Parametres manquants' }, { status: 400 })
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && !file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptes' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Fichier trop volumineux (max 10MB)' }, { status: 400 })
    }

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
      urlStockage = `local://${fileName}`
    } else {
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)
      urlStockage = publicUrl
    }

    // Extraction et analyse avec OpenAI
    let donneeesExtraites: any = { resume_extraction: 'OpenAI non configure' }
    
    const openaiKey = process.env.OPENAI_API_KEY || process.env.CLE_API_OPENAI
    if (openaiKey) {
      try {
        // Etape 1: Extraire le texte du PDF
        const textePDF = await extractTextFromPDFBuffer(buffer)
        
        // Etape 2: Analyser avec GPT-4o
        const openai = new OpenAI({ apiKey: openaiKey })
        donneeesExtraites = await analyserAvecIA(textePDF, file.name, typeDocument, openai)
        
        console.log('Extraction reussie pour:', file.name, '- Type detecte:', donneeesExtraites.type_document_detecte)
      } catch (err: any) {
        console.error('Erreur analyse OpenAI:', err)
        donneeesExtraites = {
          erreur: err.message,
          resume_extraction: 'Erreur lors de l analyse IA'
        }
      }
    }

    // Enregistrer en base de donnees
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
        contenu_extrait: donneeesExtraites,
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
    })

  } catch (error: any) {
    console.error('Erreur upload:', error)
    return NextResponse.json({ error: 'Erreur serveur: ' + error.message }, { status: 500 })
  }
}
