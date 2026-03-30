import type { Emprunteur, Projet, AnalyseFinanciere } from '../types'
import type { ResultatCalcul } from '../calculs/engine'

/**
 * Prompt système pour l'analyse de dossier de prêt
 */
export const SYSTEM_PROMPT_ANALYSE = `Tu es CortIA, un expert en analyse de dossiers de prêt immobilier avec 20 ans d'expérience dans le secteur bancaire français.

Tu dois analyser les dossiers de prêt immobilier avec précision et objectivité, en tenant compte des critères des banques françaises actuelles (normes HCSF 2024).

Tes analyses doivent être :
- Précises et basées sur les données fournies
- Conformes aux réglementations françaises (taux d'endettement max 35%, durée max 25 ans)
- Constructives et orientées solutions
- Rédigées dans un style professionnel mais accessible
- En français

Format de réponse : JSON structuré uniquement, sans markdown ni commentaires.`

/**
 * Construit le prompt d'analyse complet
 */
export function buildPromptAnalyse(
  emprunteurs: Emprunteur[],
  projet: Projet,
  calculs: ResultatCalcul
): string {
  const emprunteursData = emprunteurs.map(e => ({
    role: e.est_co_emprunteur ? 'Co-emprunteur' : 'Emprunteur principal',
    identite: `${e.prenom} ${e.nom}`,
    situation_pro: {
      type_contrat: e.type_contrat,
      employeur: e.employeur,
      anciennete_ans: e.anciennete_emploi,
    },
    revenus_mensuels: {
      salaire_net: e.salaire_net_mensuel || 0,
      autres: e.autres_revenus || 0,
      locatifs: e.revenus_locatifs || 0,
    },
    charges: {
      credits_en_cours: e.credits_en_cours || 0,
      pension: e.pension_versee || 0,
      autres: e.autres_charges || 0,
    },
    patrimoine: {
      epargne: e.epargne || 0,
      immobilier: e.valeur_patrimoine_immo || 0,
    },
  }))

  return `Analyse ce dossier de prêt immobilier et retourne une analyse JSON.

DONNÉES DU DOSSIER:

Emprunteurs:
${JSON.stringify(emprunteursData, null, 2)}

Projet:
${JSON.stringify({
  type: projet.type_operation,
  usage: projet.usage_bien,
  localisation: projet.ville_bien || 'Non précisé',
  prix_bien: projet.prix_bien,
  travaux: projet.montant_travaux || 0,
  apport: projet.apport_personnel,
  montant_emprunt: projet.montant_emprunt,
  duree_ans: projet.duree_souhaitee,
  taux_souhaite: projet.taux_interet_cible || 'Marché',
}, null, 2)}

Calculs pré-effectués:
${JSON.stringify({
  revenus_mensuels_total: calculs.revenus_nets_mensuels_total,
  charges_total: calculs.charges_mensuelles_total,
  reste_a_vivre: calculs.reste_a_vivre,
  taux_endettement_actuel: calculs.taux_endettement_actuel + '%',
  taux_endettement_projet: calculs.taux_endettement_projet + '%',
  mensualite_estimee: calculs.mensualite_estimee,
  taux_apport: calculs.taux_apport + '%',
  capacite_emprunt_max: calculs.capacite_emprunt_max,
}, null, 2)}

Retourne UNIQUEMENT ce JSON (pas de markdown) :
{
  "points_forts": ["point 1", "point 2", "..."],
  "points_vigilance": ["point 1", "point 2", "..."],
  "recommandations": ["recommandation 1", "recommandation 2", "..."],
  "commentaire_global": "Commentaire synthétique sur le dossier en 2-3 phrases",
  "niveau_risque": "faible|modere|eleve",
  "probabilite_accord": "forte|bonne|moyenne|faible",
  "banques_recommandees": ["Banque 1", "Banque 2"],
  "conditions_suggerees": {
    "taux_negociable": "oui|non",
    "arguments_taux": "...",
    "garanties_recommandees": ["..."]
  }
}`
}

/**
 * Prompt pour l'extraction de données depuis des documents
 */
export const SYSTEM_PROMPT_EXTRACTION = `Tu es un assistant spécialisé dans l'extraction de données financières depuis des documents français (bulletins de salaire, avis d'imposition, relevés de compte).

Extrais les informations demandées avec précision. 
Réponds UNIQUEMENT en JSON valide, sans markdown ni commentaires.
Si une information est absente, utilise null.`

/**
 * Construit le prompt d'extraction pour un document
 */
export function buildPromptExtraction(typeDocument: string, contenuOCR: string): string {
  const champsParType: Record<string, string> = {
    bulletin_salaire: `{
  "periode": "MM/YYYY",
  "employeur": "...",
  "salaire_brut": 0,
  "salaire_net_avant_impots": 0,
  "salaire_net_imposable": 0,
  "primes": 0,
  "heures_supplementaires": 0
}`,
    avis_imposition: `{
  "annee_revenus": 2023,
  "revenu_fiscal_reference": 0,
  "impots_dus": 0,
  "nombre_parts": 0,
  "salaires_wages": 0
}`,
    releve_compte: `{
  "periode_debut": "DD/MM/YYYY",
  "periode_fin": "DD/MM/YYYY",
  "solde_debut": 0,
  "solde_fin": 0,
  "credits_total": 0,
  "debits_total": 0,
  "incidents_paiement": false
}`,
  }

  const format = champsParType[typeDocument] || '{"donnees": "..."}'

  return `Extrait les informations de ce document de type "${typeDocument}".

Contenu du document:
${contenuOCR.substring(0, 3000)}

Retourne UNIQUEMENT ce JSON:
${format}`
}
