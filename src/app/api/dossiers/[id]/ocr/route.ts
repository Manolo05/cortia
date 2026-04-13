import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

const OCR_PROMPT = `Tu es un expert en analyse de documents financiers pour le courtage immobilier en France.
Analyse ce document et extrais les informations suivantes au format JSON strict (sans markdown, sans backticks) :

{
  "type_document": "bulletin_salaire" | "avis_imposition" | "releve_bancaire" | "justificatif_domicile" | "piece_identite" | "autre",
  "confiance": 0.0 à 1.0,
  "donnees_extraites": {
    "nom": "string ou null",
    "prenom": "string ou null",
    "employeur": "string ou null",
    "type_contrat": "CDI" | "CDD" | "Fonctionnaire" | "Independant" | "autre" | null,
    "salaire_net_mensuel": number ou null,
    "salaire_brut_mensuel": number ou null,
    "revenus_annuels": number ou null,
    "date_document": "YYYY-MM" ou null,
    "anciennete_debut": "YYYY-MM" ou null,
    "adresse": "string ou null",
    "numero_fiscal": "string ou null",
    "revenu_fiscal_reference": number ou null,
    "nombre_parts": number ou null,
    "loyer_mensuel": number ou null
  },
  "resume": "Description courte du document en 1-2 phrases"
}

Réponds UNIQUEMENT avec le JSON, sans aucun texte autour.`

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Clé API Anthropic non configurée. Ajoutez ANTHROPIC_API_KEY dans les variables Vercel.' }, { status: 500 })
    }

    const dossierId = params.id
    const { documentUrl, documentId } = await req.json()

    if (!documentUrl) {
      return NextResponse.json({ error: 'URL du document requise' }, { status: 400 })
    }

    // Fetch the document from Supabase Storage
    const docResponse = await fetch(documentUrl)
    if (!docResponse.ok) {
      return NextResponse.json({ error: 'Impossible de récupérer le document' }, { status: 404 })
    }

    const contentType = docResponse.headers.get('content-type') || ''
    const buffer = await docResponse.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')

    // Determine media type
    let mediaType = 'application/pdf'
    if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) mediaType = 'image/jpeg'
    else if (contentType.includes('image/png')) mediaType = 'image/png'
    else if (contentType.includes('image/webp')) mediaType = 'image/webp'

    // Call Claude API for OCR
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: [
            {
              type: mediaType === 'application/pdf' ? 'document' : 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: OCR_PROMPT },
          ],
        }],
      }),
    })

    if (!claudeResponse.ok) {
      const errData = await claudeResponse.json().catch(() => ({}))
      return NextResponse.json({ error: 'Erreur API Claude: ' + (errData.error?.message || claudeResponse.status) }, { status: 500 })
    }

    const claudeData = await claudeResponse.json()
    const rawText = claudeData.content?.[0]?.text || ''

    // Parse the JSON response
    let extracted: any
    try {
      const cleaned = rawText.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`/g, '').trim()
      extracted = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Impossible de parser la réponse IA', raw: rawText }, { status: 500 })
    }

    // Auto-fill emprunteur data if we extracted financial info
    const donnees = extracted.donnees_extraites || {}
    if (donnees.salaire_net_mensuel || donnees.nom) {
      try {
        const { data: emps } = await supabase
          .from('emprunteurs')
          .select('id')
          .eq('dossier_id', dossierId)
          .eq('est_co_emprunteur', false)
          .limit(1)

        if (emps && emps.length > 0) {
          const updateData: any = {}
          if (donnees.salaire_net_mensuel) updateData.salaire_net_mensuel = donnees.salaire_net_mensuel
          if (donnees.type_contrat) updateData.type_contrat = donnees.type_contrat
          if (donnees.employeur) updateData.employeur = donnees.employeur
          if (donnees.nom) updateData.nom = donnees.nom
          if (donnees.prenom) updateData.prenom = donnees.prenom

          if (Object.keys(updateData).length > 0) {
            await supabase.from('emprunteurs').update(updateData).eq('id', emps[0].id)
            extracted.auto_filled = true
            extracted.updated_fields = Object.keys(updateData)
          }
        }
      } catch {}
    }

    // Update document status if documentId provided
    if (documentId) {
      try {
        await supabase
          .from('documents')
          .update({ statut_verification: 'verifie', ocr_data: extracted })
          .eq('id', documentId)
      } catch {}
    }

    return NextResponse.json({
      success: true,
      dossier_id: dossierId,
      extraction: extracted,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
