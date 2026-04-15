import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'Cle API Anthropic non configuree' }, { status: 500 })
    }

    const dossierId = params.id

    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('dossier_id', dossierId)
      .order('created_at', { ascending: true })

    if (docsError || !documents || documents.length === 0) {
      return NextResponse.json({ error: 'Aucun document trouve' }, { status: 404 })
    }

    const { data: emprunteurs } = await supabase
      .from('emprunteurs')
      .select('*')
      .eq('dossier_id', dossierId)

    const { data: projets } = await supabase
      .from('projets')
      .select('*')
      .eq('dossier_id', dossierId)
      .limit(1)

    const projet = projets && projets.length > 0 ? projets[0] : null

    const docsAnalyses = documents
      .filter((d: any) => d.ocr_data)
      .map((d: any) => ({
        type: d.type_document,
        fichier: d.nom_fichier,
        donnees: d.ocr_data?.donnees_extraites || {},
        type_detecte: d.ocr_data?.type_document || d.type_document,
        confiance: d.ocr_data?.confiance || 0,
        resume: d.ocr_data?.resume || '',
      }))

    if (docsAnalyses.length === 0) {
      return NextResponse.json({
        error: 'Aucun document analyse par OCR. Cliquez sur Extraire IA sur chaque document.'
      }, { status: 400 })
    }

    const emprunteursResume = (emprunteurs || []).map((e: any) => ({
      nom: e.nom, prenom: e.prenom,
      salaire_net_mensuel: e.salaire_net_mensuel,
      autres_revenus: e.autres_revenus,
      revenus_locatifs: e.revenus_locatifs,
      credits_en_cours: e.credits_en_cours,
      pension_versee: e.pension_versee,
      autres_charges: e.autres_charges,
      type_contrat: e.type_contrat,
      employeur: e.employeur,
      est_co_emprunteur: e.est_co_emprunteur,
    }))

    const projetResume = projet ? {
      prix_achat: projet.prix_achat,
      travaux: projet.travaux,
      frais_notaire: projet.frais_notaire,
      apport: projet.apport,
      duree_souhaitee: projet.duree_souhaitee,
      taux_estime: projet.taux_estime,
    } : null

    const prompt = `Tu es un expert analyste de dossiers de credit immobilier pour un courtier IOBSP en France.

EMPRUNTEURS:
${JSON.stringify(emprunteursResume, null, 2)}

PROJET IMMOBILIER:
${JSON.stringify(projetResume, null, 2)}

DOCUMENTS ANALYSES PAR IA (donnees extraites par OCR):
${JSON.stringify(docsAnalyses, null, 2)}

---

Effectue une ANALYSE CROISEE COMPLETE de ce dossier basee sur les documents analyses.

Reponds UNIQUEMENT avec un JSON valide (sans markdown, sans backticks) avec cette structure:
{
  "synthese": {
    "revenus_confirmes": 0,
    "charges_confirmees": 0,
    "taux_endettement": 0,
    "reste_a_vivre": 0,
    "capacite_emprunt_mensuel": 0,
    "score_global": 0,
    "statut": "favorable|a_completer|defavorable"
  },
  "coherence_identite": {
    "statut": "ok|anomalie",
    "details": "description"
  },
  "coherence_revenus": {
    "statut": "ok|anomalie|a_verifier",
    "revenus_fiches_paie": 0,
    "revenus_avis_imposition": 0,
    "ecart_pourcent": 0,
    "details": "description"
  },
  "anomalies": [
    {
      "severite": "haute|moyenne|faible",
      "description": "description",
      "recommandation": "action a prendre"
    }
  ],
  "documents_manquants": ["type de document manquant"],
  "recommandations": ["recommandation pour le courtier"],
  "banques_recommandees": ["noms de banques compatibles avec le profil"],
  "conclusion": "resume executif en 3-4 phrases avec decision recommandee"
}`

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeResponse.ok) {
      const errData = await claudeResponse.json().catch(() => ({}))
      return NextResponse.json({ error: 'Erreur API Claude: ' + (errData.error?.message || claudeResponse.status) }, { status: 500 })
    }

    const claudeData = await claudeResponse.json()
    const rawText = claudeData.content?.[0]?.text || ''

    let analyseResult: any
    try {
      const cleaned = rawText.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`/g, '').trim()
      analyseResult = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Impossible de parser la reponse IA', raw: rawText.substring(0, 500) }, { status: 500 })
    }

    // Sauvegarder l'analyse globale dans le dossier
    const synthese = analyseResult.synthese || {}
    const anomalies = analyseResult.anomalies || []
    const recommandations = analyseResult.recommandations || []

    // Mettre a jour le dossier avec les resultats cles
    await supabase.from('dossiers').update({
      score_global: synthese.score_global || 0,
      taux_endettement: synthese.taux_endettement || 0,
      reste_a_vivre: synthese.reste_a_vivre || 0,
      mensualite_estimee: synthese.capacite_emprunt_mensuel || 0,
      niveau_risque: synthese.statut === 'favorable' ? 'faible' : synthese.statut === 'defavorable' ? 'eleve' : 'moyen',
      analyse_globale: analyseResult,
      updated_at: new Date().toISOString(),
    }).eq('id', dossierId)

    // Sauvegarder dans analyses_financieres (upsert)
    await supabase.from('analyses_financieres').upsert({
      dossier_id: dossierId,
      revenus_nets_mensuels_total: synthese.revenus_confirmes || 0,
      charges_mensuelles_total: synthese.charges_confirmees || 0,
      reste_a_vivre: synthese.reste_a_vivre || 0,
      taux_endettement: synthese.taux_endettement || 0,
      taux_endettement_actuel: synthese.taux_endettement || 0,
      capacite_emprunt_max: (synthese.capacite_emprunt_mensuel || 0) * (projetResume?.duree_souhaitee || 240),
      mensualite_estimee: synthese.capacite_emprunt_mensuel || 0,
      score_global: synthese.score_global || 0,
      niveau_risque: synthese.statut === 'favorable' ? 'faible' : synthese.statut === 'defavorable' ? 'eleve' : 'moyen',
      points_forts: recommandations.slice(0, 3),
      points_vigilance: anomalies.map((a: any) => a.description).slice(0, 5),
      recommandations: recommandations,
      genere_par_ia: true,
      version_modele: 'claude-sonnet-4',
      lecture_metier: analyseResult.conclusion || '',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'dossier_id' })

    return NextResponse.json({
      success: true,
      analyse: analyseResult,
      nombre_documents_analyses: docsAnalyses.length,
      total_documents: documents.length,
    })

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Erreur serveur' }, { status: 500 })
  }
}
