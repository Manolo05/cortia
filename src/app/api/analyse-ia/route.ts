import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = await req.json()
    const { dossier_id, context } = body

    if (!dossier_id) {
      return NextResponse.json({ error: 'dossier_id requis' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        synthese: genererSyntheseLocale(context),
        source: 'local',
      })
    }

    const prompt = construirePrompt(context)

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      return NextResponse.json({
        synthese: genererSyntheseLocale(context),
        source: 'local',
      })
    }

    const data = await response.json()
    const synthese = data.content?.[0]?.text || genererSyntheseLocale(context)

    return NextResponse.json({ synthese, source: 'ia' })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function construirePrompt(context: any): string {
  const { emprunteurs, projet, analyse, charges } = context || {}

  const revenus = emprunteurs?.reduce((sum: number, e: any) => {
    return sum + (e.salaire_net_mensuel || 0) + (e.autres_revenus || 0) + (e.revenus_locatifs || 0)
  }, 0) || 0

  const chargesTotal = emprunteurs?.reduce((sum: number, e: any) => {
    return sum + (e.credits_en_cours || 0) + (e.pension_versee || 0)
  }, 0) || 0

  const emprunteurPrincipal = emprunteurs?.[0]
  const nomComplet = emprunteurPrincipal
    ? emprunteurPrincipal.prenom + ' ' + emprunteurPrincipal.nom
    : 'Emprunteur'

  return 'Tu es un courtier immobilier expert. Redige une synthese bancaire professionnelle concise (300 mots max) pour ce dossier:\n\n' +
    'Client: ' + nomComplet + '\n' +
    'Contrat: ' + (emprunteurPrincipal?.type_contrat || 'CDI') + ' - ' + (emprunteurPrincipal?.employeur || 'Non renseigne') + '\n' +
    'Revenus mensuels nets: ' + revenus.toLocaleString('fr-FR') + ' EUR\n' +
    'Charges mensuelles: ' + chargesTotal.toLocaleString('fr-FR') + ' EUR\n' +
    'Projet: ' + (projet?.type_bien || 'Bien') + ' - ' + (projet?.usage || 'Residence principale') + '\n' +
    'Prix: ' + ((projet?.prix_bien || 0).toLocaleString('fr-FR')) + ' EUR\n' +
    'Apport: ' + ((projet?.apport || 0).toLocaleString('fr-FR')) + ' EUR\n' +
    'Financement demande: ' + ((projet?.besoin_financement || 0).toLocaleString('fr-FR')) + ' EUR\n' +
    'Duree: ' + (projet?.duree_souhaitee || 20) + ' ans\n' +
    'Taux endettement: ' + (analyse?.taux_endettement?.toFixed(1) || '?') + '%\n\n' +
    'Structure: 1) Presentation client 2) Situation professionnelle 3) Situation financiere 4) Projet 5) Atouts 6) Points de vigilance 7) Conclusion\n' +
    'Ton: professionnel, neutre, factuel. Adapte pour une banque.'
}

function genererSyntheseLocale(context: any): string {
  const { emprunteurs, projet, analyse } = context || {}
  const emprunteurPrincipal = emprunteurs?.[0]
  const nomComplet = emprunteurPrincipal
    ? emprunteurPrincipal.prenom + ' ' + emprunteurPrincipal.nom
    : 'Emprunteur non renseigne'

  const revenus = emprunteurs?.reduce((sum: number, e: any) => {
    return sum + (e.salaire_net_mensuel || 0) + (e.autres_revenus || 0) + (e.revenus_locatifs || 0)
  }, 0) || 0

  const apportPct = projet?.prix_bien > 0 ? Math.round((projet.apport || 0) / projet.prix_bien * 100) : 0
  const taux = analyse?.taux_endettement || 0

  const lines = [
    '## 1. Presentation client',
    nomComplet + ', ' + (emprunteurPrincipal?.type_contrat || 'CDI') + (emprunteurPrincipal?.employeur ? ' chez ' + emprunteurPrincipal.employeur : '') + '.',
    '',
    '## 2. Situation professionnelle',
    'Contrat ' + (emprunteurPrincipal?.type_contrat || 'CDI') + '. Stabilite professionnelle ' + (emprunteurPrincipal?.type_contrat === 'CDI' || emprunteurPrincipal?.type_contrat === 'Fonctionnaire' ? 'confirmee.' : 'a apprecier selon anciennete.'),
    '',
    '## 3. Situation financiere',
    'Revenus mensuels nets : ' + revenus.toLocaleString('fr-FR') + ' EUR/mois. Taux d endettement : ' + taux.toFixed(1) + '%. ' + (taux <= 35 ? 'Endettement dans les normes.' : 'Endettement eleve, necessite attention.'),
    '',
    '## 4. Presentation du projet',
    (projet?.type_bien || 'Bien') + ' - ' + (projet?.usage || 'Residence principale') + (projet?.ville ? ' a ' + projet.ville : '') + '. Prix : ' + ((projet?.prix_bien || 0).toLocaleString('fr-FR')) + ' EUR. Financement demande : ' + ((projet?.besoin_financement || 0).toLocaleString('fr-FR')) + ' EUR sur ' + (projet?.duree_souhaitee || 20) + ' ans.',
    '',
    '## 5. Atouts du dossier',
    apportPct >= 15
      ? 'Apport solide (' + apportPct + '%) qui temoigne d une capacite d epargne serieuse.'
      : apportPct >= 10
        ? 'Apport personnel correct (' + apportPct + '%), couvrant les frais annexes.'
        : 'Apport limite (' + apportPct + '%), dossier a consolider.',
    '',
    '## 6. Points de vigilance',
    taux > 35
      ? 'Taux d endettement superieur a 35%, a discuter avec l etablissement. Solder un credit pourrait ameliorer le dossier.'
      : 'Aucun point de vigilance majeur identifie. Dossier globalement coherent.',
    '',
    '## 7. Conclusion',
    analyse?.lecture_metier || ('Dossier ' + (taux <= 33 ? 'solide' : taux <= 38 ? 'acceptable avec vigilance' : 'fragile') + ', a presenter aux etablissements partenaires selon la grille d acceptation.'),
  ]

  return lines.join('\n')
}
