import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return NextResponse.json({ error: 'Non authentifie' }, { status: 401 })

    const dossierId = params.id

    // Recuperer tous les documents du dossier avec leur contenu extrait
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id, type_document, nom_fichier, contenu_extrait, created_at')
      .eq('dossier_id', dossierId)
      .order('created_at', { ascending: true })

    if (docsError) {
      return NextResponse.json({ error: 'Erreur recuperation documents: ' + docsError.message }, { status: 400 })
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({ error: 'Aucun document trouve pour ce dossier' }, { status: 404 })
    }

    // Recuperer les infos du dossier et des emprunteurs directement
    const { data: dossier, error: dossierError } = await supabase
      .from('dossiers')
      .select('id, reference, statut, montant_projet, apport_personnel, duree_souhaitee')
      .eq('id', dossierId)
      .single()

    const { data: emprunteurs } = await supabase
      .from('emprunteurs')
      .select('id, prenom, nom, date_naissance, situation_pro, revenus_nets_mensuels, charges_mensuelles')
      .eq('dossier_id', dossierId)

    const openaiKey = process.env.OPENAI_API_KEY || process.env.CLE_API_OPENAI
    if (!openaiKey) {
      return NextResponse.json({ error: 'Cle OpenAI non configuree' }, { status: 500 })
    }

    const openai = new OpenAI({ apiKey: openaiKey })

    // Preparer le resume des documents pour l'analyse croisee
    const resumeDocuments = documents.map(doc => {
      const extrait = doc.contenu_extrait || {}
      return {
        type: doc.type_document,
        fichier: doc.nom_fichier,
        donnees: extrait
      }
    })

    const resumeEmprunteurs = (emprunteurs || []).map(e => ({
      nom: `${e.prenom} ${e.nom}`,
      date_naissance: e.date_naissance,
      situation_pro: e.situation_pro,
      revenus_declares: e.revenus_nets_mensuels,
      charges_declarees: e.charges_mensuelles
    }))

    // Prompt d'analyse croisee approfondie
    const promptAnalyse = `Tu es un expert analyste de dossiers de credit immobilier pour un courtier.

DOSSIER: ${dossier?.reference || dossierId}
Montant projet: ${dossier?.montant_projet || 'non precise'} EUR
Apport: ${dossier?.apport_personnel || 'non precise'} EUR
Duree souhaitee: ${dossier?.duree_souhaitee || 'non precise'} mois

EMPRUNTEURS DECLARES:
${JSON.stringify(resumeEmprunteurs, null, 2)}

DOCUMENTS ANALYSES PAR L'IA:
${JSON.stringify(resumeDocuments, null, 2)}

---

Effectue une ANALYSE CROISEE COMPLETE et RIGOUREUSE de ces documents:

1. VERIFICATION DE COHERENCE IDENTITAIRE
   - Verifie que les noms, prenoms, dates de naissance sont identiques sur tous les documents
   - Signale toute discordance orthographique ou numerique

2. VERIFICATION DES REVENUS
   - Compare les revenus sur les fiches de paie avec l'avis d'imposition
   - Verifie la coherence avec les releves bancaires (virements employeur reguliers)
   - Calcule le revenu moyen sur les 3 derniers mois si plusieurs fiches disponibles
   - Signale toute anomalie (revenus fluctuants, primes exceptionnelles non expliquees)

3. ANALYSE DES CHARGES
   - Identifie toutes les charges recurrentes dans les releves bancaires
   - Compare avec les credits declares par l'emprunteur
   - Calcule le taux d'endettement actuel

4. ANALYSE DE LA CAPACITE DE REMBOURSEMENT
   - Revenus nets mensuels confirmes par documents
   - Charges mensuelles totales
   - Capacite de remboursement mensuelle (33% max standard)
   - Reste a vivre

5. ANALYSE DU BIEN IMMOBILIER (si contrat de reservation/compromis)
   - Prix du bien vs capacite d'emprunt
   - Coheherence apport/financement

6. DETECTION D'ANOMALIES ET RISQUES
   - Incoherences entre documents
   - Elements suspects
   - Donnees manquantes critiques

Reponds UNIQUEMENT avec un JSON valide (sans markdown) avec cette structure:
{
  "synthese_bancaire": {
    "revenus_confirmes_mensuel": 0,
    "revenus_sources": [],
    "charges_mensuelles": 0,
    "capacite_remboursement": 0,
    "taux_endettement_actuel": 0,
    "reste_a_vivre": 0,
    "epargne_detectee": 0,
    "score_bancaire": "excellent/bon/moyen/insuffisant",
    "commentaire_score": ""
  },
  "coherence_identite": {
    "statut": "ok/anomalie",
    "details": []
  },
  "coherence_revenus": {
    "statut": "ok/anomalie/a_verifier",
    "fiches_paie_vs_impots": "",
    "fiches_paie_vs_banque": "",
    "details": []
  },
  "coherence_charges": {
    "statut": "ok/anomalie/a_verifier",
    "charges_declarees": 0,
    "charges_detectees_banque": 0,
    "details": []
  },
  "analyse_bien": {
    "prix_bien": 0,
    "apport_disponible": 0,
    "montant_a_emprunter": 0,
    "mensualite_estimee": 0,
    "taux_endettement_projete": 0,
    "faisabilite": "favorable/limite/defavorable"
  },
  "anomalies": [
    {
      "severite": "haute/moyenne/faible",
      "type": "type d anomalie",
      "description": "description detaillee",
      "documents_concernes": [],
      "recommandation": ""
    }
  ],
  "documents_manquants": [],
  "recommandations_courtier": [],
  "conclusion_globale": {
    "statut_dossier": "favorable/a_completer/defavorable",
    "score_global": 0,
    "resume": "resume executif en 3-4 phrases",
    "prochaines_etapes": []
  }
}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 4096,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content: 'Tu es un expert analyste credit immobilier. Tu fais des analyses rigoureuses et reponds toujours en JSON valide uniquement.'
        },
        {
          role: 'user',
          content: promptAnalyse
        }
      ]
    })

    const content = response.choices?.[0]?.message?.content || '{}'
    
    let analyseResult: any = {}
    try {
      const cleaned = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      analyseResult = JSON.parse(cleaned)
    } catch {
      analyseResult = {
        erreur_parsing: 'Impossible de parser la reponse IA',
        contenu_brut: content.substring(0, 2000)
      }
    }

    // Sauvegarder l'analyse dans le dossier
    const { error: updateError } = await supabase
      .from('dossiers')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', dossierId)

    // Sauvegarder l'analyse dans une table si elle existe, sinon retourner le resultat
    const { data: analyseData, error: analyseError } = await supabase
      .from('analyses_documents')
      .upsert({
        dossier_id: dossierId,
        analyse_complete: analyseResult,
        nombre_documents: documents.length,
        analysed_at: new Date().toISOString(),
        analysed_by: session.user.id
      }, {
        onConflict: 'dossier_id'
      })
      .select()

    if (analyseError) {
      console.log('Table analyses_documents inexistante, analyse retournee directement')
    }

    return NextResponse.json({
      success: true,
      analyse: analyseResult,
      nombre_documents_analyses: documents.length,
      documents_types: documents.map(d => d.type_document)
    })

  } catch (error: any) {
    console.error('Erreur analyse documents:', error)
    return NextResponse.json({ error: 'Erreur serveur: ' + error.message }, { status: 500 })
  }
}
