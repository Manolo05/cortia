import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

interface DocumentExtrait {
  id: string
  type_document: string
  nom_fichier: string
  notes: any
}

interface Anomalie {
  type: 'incoherence' | 'manque' | 'vigilance' | 'fraude_potentielle'
  severite: 'haute' | 'moyenne' | 'faible'
  titre: string
  description: string
}

interface AnalyseDocumentaire {
  score_fiabilite: number
  alertes: Anomalie[]
  resume: string
  recommandation: string
  synthese_bancaire: string
  documents_analyses: number
  documents_manquants: string[]
}

const DOCUMENTS_REQUIS = [
  { type: 'piece_identite', label: "Pièce d'identité" },
  { type: 'justificatif_domicile', label: 'Justificatif de domicile' },
  { type: 'avis_imposition', label: "Avis d'imposition" },
  { type: 'bulletin_salaire', label: 'Bulletins de salaire (3 derniers)' },
  { type: 'releve_compte', label: 'Relevés de compte (3 derniers mois)' },
]

async function analyserAvecOpenAI(
  documentsExtraits: DocumentExtrait[],
  dossierData: any,
  apiKey: string
): Promise<AnalyseDocumentaire> {
  const docsResume = documentsExtraits.map(doc => {
    const notes = typeof doc.notes === 'string'
      ? JSON.parse(doc.notes || '{}')
      : (doc.notes || {})
    return `=== ${doc.type_document.toUpperCase()} (${doc.nom_fichier}) ===
${JSON.stringify(notes, null, 2)}`
  }).join('\n\n')

  const emprunteurPrincipal = dossierData.emprunteurs?.[0] || {}
  const nomComplet = `${emprunteurPrincipal.prenom || ''} ${emprunteurPrincipal.nom || ''}`.trim()
  const salaireDeclare = emprunteurPrincipal.salaire_net_mensuel || 0

  const prompt = `Tu es un expert en analyse de dossiers de prêt immobilier et en détection de fraude documentaire.

DONNÉES DU DOSSIER:
- Emprunteur: ${nomComplet}
- Salaire net mensuel déclaré: ${salaireDeclare}€
- Type contrat: ${emprunteurPrincipal.type_contrat || 'NC'}
- Employeur: ${emprunteurPrincipal.employeur || 'NC'}

DOCUMENTS UPLOADÉS ET CONTENU EXTRAIT:
${docsResume || 'Aucun document uploadé'}

ANALYSE REQUISE:
1. Compare les informations entre tous les documents (cohérence nom, adresse, revenus, employeur, dates)
2. Compare les données des documents avec les données déclarées dans le dossier
3. Détecte les anomalies, incohérences et signaux de fraude potentielle
4. Identifie les documents manquants pour un dossier complet
5. Calcule un score de fiabilité globale (0-100)
6. Rédige une synthèse bancaire complète incluant: revenus nets moyens, capacité d'épargne, comportement bancaire, incidents éventuels, ratio charges/revenus

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "score_fiabilite": 85,
  "alertes": [
    {
      "type": "incoherence",
      "severite": "haute",
      "titre": "Titre court de l'anomalie",
      "description": "Description détaillée de l'anomalie et des documents concernés"
    }
  ],
  "resume": "Résumé de l'analyse documentaire en 2-3 phrases",
  "recommandation": "Recommandation actionnable pour le courtier",
  "synthese_bancaire": "Synthèse bancaire détaillée: revenus, épargne, comportement, ratio charges/revenus, appréciation globale",
  "documents_analyses": ${documentsExtraits.length},
  "documents_manquants": ["types de documents manquants"]
}`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 3000,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }]
    })
  })

  if (!response.ok) throw new Error(`OpenAI error: ${response.status}`)
  const data = await response.json()
  const content = data.choices?.[0]?.message?.content || '{}'
  return JSON.parse(content)
}

function analyserSansIA(documentsExtraits: DocumentExtrait[], dossierData: any): AnalyseDocumentaire {
  const alertes: Anomalie[] = []
  const typesPresents = documentsExtraits.map(d => d.type_document)
  const manquants = DOCUMENTS_REQUIS
    .filter(r => !typesPresents.includes(r.type))
    .map(r => r.label)

  if (manquants.length > 0) {
    alertes.push({
      type: 'manque',
      severite: manquants.length > 2 ? 'haute' : 'moyenne',
      titre: 'Documents manquants',
      description: `Les documents suivants sont absents: ${manquants.join(', ')}`,
    })
  }

  const score = Math.max(20, 100 - (alertes.length * 15) - (manquants.length * 10))
  const salaireDeclare = dossierData.emprunteurs?.[0]?.salaire_net_mensuel || 0

  return {
    score_fiabilite: score,
    alertes,
    resume: documentsExtraits.length === 0
      ? 'Aucun document uploadé. Veuillez ajouter les pièces justificatives.'
      : `${documentsExtraits.length} document(s) analysé(s). ${alertes.length} anomalie(s) détectée(s).`,
    recommandation: manquants.length > 0
      ? `Demander les pièces manquantes: ${manquants.join(', ')}`
      : 'Vérifier la cohérence des informations entre les documents.',
    synthese_bancaire: salaireDeclare > 0
      ? `Revenus déclarés: ${salaireDeclare}€/mois. Analyse complète disponible après configuration OpenAI.`
      : 'Synthèse bancaire disponible après upload des documents et configuration OpenAI.',
    documents_analyses: documentsExtraits.length,
    documents_manquants: manquants,
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const dossierId = params.id

    const { data: documents } = await supabase
      .from('documents')
      .select('id, type_document, nom_fichier, contenu_extrait, statut_verification')
      .eq('dossier_id', dossierId)

    const [empRes] = await Promise.all([
      fetch(`${req.nextUrl.origin}/api/dossiers/${dossierId}/emprunteurs`, {
        headers: { cookie: req.headers.get('cookie') || '' }
      }),
    ])

    const dossierData = {
      emprunteurs: empRes.ok ? await empRes.json() : [],
    }

    const documentsExtraits: DocumentExtrait[] = (documents || []).map(doc => ({
      ...doc,
      notes: (() => {
        try {
          return typeof doc.notes === 'string' ? JSON.parse(doc.notes || '{}') : (doc.notes || {})
        } catch { return {} }
      })()
    }))

    let analyse: AnalyseDocumentaire
    const openaiKey = process.env.OPENAI_API_KEY

    if (openaiKey && documentsExtraits.length > 0) {
      try {
        analyse = await analyserAvecOpenAI(documentsExtraits, dossierData, openaiKey)
      } catch (err) {
        console.error('Fallback local:', err)
        analyse = analyserSansIA(documentsExtraits, dossierData)
      }
    } else {
      analyse = analyserSansIA(documentsExtraits, dossierData)
    }

    await supabase
      .from('controles_docs')
      .upsert({
        dossier_id: dossierId,
        score_fiabilite: analyse.score_fiabilite,
        resume_ia: analyse.resume,
        alertes: analyse.alertes,
        recommandation: analyse.recommandation,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'dossier_id' })

    return NextResponse.json(analyse)
  } catch (error: any) {
    console.error('Erreur analyse-docs:', error)
    return NextResponse.json({ error: 'Erreur: ' + error.message }, { status: 500 })
  }
}
