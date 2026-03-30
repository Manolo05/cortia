import type { DonneesSynthese } from './types-synthese'
import { formatMontant, formatDuree } from '../utils/format'

export const SYSTEM_PROMPT_SYNTHESE = `Tu es CortIA, expert en rédaction de synthèses de dossiers de prêt immobilier pour courtiers français.

Tu rédiges des synthèses professionnelles, précises et concises destinées à être présentées aux banques.
Style : professionnel, factuel, valorisant les points positifs sans cacher les risques.
Langue : français soigné, terminologie bancaire appropriée.

Retourne UNIQUEMENT du JSON valide, sans markdown.`

export function buildPromptSynthese(donnees: DonneesSynthese): string {
  const emprunteursStr = donnees.emprunteurs.map(e => 
    `- ${e.nom_complet} (${e.role}): ${e.situation_pro}, ${formatMontant(e.revenus_nets)}/mois nets, ${e.anciennete} ans d'ancienneté`
  ).join('\n')

  return `Génère une synthèse professionnelle de ce dossier de prêt immobilier.

DOSSIER ${donnees.dossier.reference}
Courtier : ${donnees.dossier.courtier}

EMPRUNTEURS :
${emprunteursStr}

PROJET :
- Type : ${donnees.projet.type} - ${donnees.projet.usage}
- Localisation : ${donnees.projet.localisation}
- Prix du bien : ${formatMontant(donnees.projet.prix_bien)}
- Travaux : ${formatMontant(donnees.projet.travaux)}
- Apport personnel : ${formatMontant(donnees.projet.apport)} (${donnees.analyse.taux_apport.toFixed(0)}%)
- Montant emprunté : ${formatMontant(donnees.projet.montant_emprunt)}
- Durée : ${formatDuree(donnees.projet.duree * 12)}
- Taux envisagé : ${donnees.projet.taux}%

ANALYSE FINANCIÈRE :
- Score global : ${donnees.analyse.score_global}/100
- Taux d'endettement avec projet : ${donnees.analyse.taux_endettement_projet.toFixed(1)}%
- Mensualité estimée : ${formatMontant(donnees.analyse.mensualite)}
- Reste à vivre : ${formatMontant(donnees.analyse.reste_a_vivre)}/mois
- Points forts : ${donnees.analyse.points_forts.join(', ')}
- Points de vigilance : ${donnees.analyse.points_vigilance.join(', ')}

DOCUMENTS :
- ${donnees.documents.valides}/${donnees.documents.total} documents validés

Retourne ce JSON :
{
  "titre": "Synthèse de dossier - [NOM(S) EMPRUNTEUR(S)]",
  "resume_executif": "Paragraphe de 3-4 phrases résumant le dossier",
  "sections": [
    {
      "titre": "Présentation des emprunteurs",
      "contenu": "...",
      "icone": "users"
    },
    {
      "titre": "Description du projet",
      "contenu": "...",
      "icone": "home"
    },
    {
      "titre": "Analyse financière",
      "contenu": "...",
      "icone": "chart"
    },
    {
      "titre": "Points forts du dossier",
      "contenu": "...",
      "icone": "star"
    },
    {
      "titre": "Points de vigilance",
      "contenu": "...",
      "icone": "alert"
    }
  ],
  "conclusion": "Paragraphe de conclusion avec recommandation",
  "recommandation_finale": "accord_recommande|accord_sous_conditions|etude_approfondie|refus_recommande"
}`
}
