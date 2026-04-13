export interface CritereBanque {
  id: string
  nom: string
  logo?: string
  taux_endettement_max: number
  apport_minimum_pct: number
  duree_max_mois: number
  revenus_min?: number
  anciennete_min_mois: number
  accepte_cdd: boolean
  accepte_independant: boolean
  accepte_investissement_locatif: boolean
  frais_dossier: number
  taux_moyen: number
  delai_reponse_jours: number
  points_forts: string[]
  points_faibles: string[]
  conditions_speciales?: string[]
}

export const BANQUES_CRITERES: CritereBanque[] = [
  {
    id: 'credit_agricole',
    nom: 'Crédit Agricole',
    taux_endettement_max: 35,
    apport_minimum_pct: 10,
    duree_max_mois: 300,
    revenus_min: 2500,
    anciennete_min_mois: 12,
    accepte_cdd: false,
    accepte_independant: true,
    accepte_investissement_locatif: true,
    frais_dossier: 1000,
    taux_moyen: 3.45,
    delai_reponse_jours: 10,
    points_forts: ['Réseau dense en France', 'Accepte les indépendants avec 3 bilans', 'Souplesse sur l\'apport pour les bons profils'],
    points_faibles: ['Frais de dossier élevés', 'Délai de réponse long'],
    conditions_speciales: ['Domiciliation des revenus obligatoire', 'Assurance groupe possible'],
  },
  {
    id: 'bnp_paribas',
    nom: 'BNP Paribas',
    taux_endettement_max: 35,
    apport_minimum_pct: 10,
    duree_max_mois: 300,
    revenus_min: 3000,
    anciennete_min_mois: 12,
    accepte_cdd: false,
    accepte_independant: true,
    accepte_investissement_locatif: true,
    frais_dossier: 850,
    taux_moyen: 3.40,
    delai_reponse_jours: 7,
    points_forts: ['Réponse rapide', 'Taux compétitifs pour les cadres', 'Expertise investissement locatif'],
    points_faibles: ['Exigeant sur les revenus minimum', 'Peu flexible sur l\'endettement'],
    conditions_speciales: ['Délégation d\'assurance acceptée', 'Préférence clients domiciliés'],
  },
  {
    id: 'societe_generale',
    nom: 'Société Générale',
    taux_endettement_max: 35,
    apport_minimum_pct: 10,
    duree_max_mois: 300,
    revenus_min: 2800,
    anciennete_min_mois: 12,
    accepte_cdd: false,
    accepte_independant: true,
    accepte_investissement_locatif: true,
    frais_dossier: 900,
    taux_moyen: 3.50,
    delai_reponse_jours: 8,
    points_forts: ['Bonne flexibilité sur les profils atypiques', 'Possibilité de modulation des échéances', 'Report d\'échéances possible'],
    points_faibles: ['Taux légèrement plus élevés', 'Process parfois lent'],
  },
  {
    id: 'cic',
    nom: 'CIC',
    taux_endettement_max: 35,
    apport_minimum_pct: 8,
    duree_max_mois: 300,
    revenus_min: 2500,
    anciennete_min_mois: 6,
    accepte_cdd: true,
    accepte_independant: true,
    accepte_investissement_locatif: true,
    frais_dossier: 750,
    taux_moyen: 3.35,
    delai_reponse_jours: 5,
    points_forts: ['Accepte les CDD avec conditions', 'Apport minimum bas (8%)', 'Réponse très rapide', 'Ancienneté 6 mois seulement'],
    points_faibles: ['Exige la domiciliation des revenus'],
  },
  {
    id: 'credit_mutuel',
    nom: 'Crédit Mutuel',
    taux_endettement_max: 35,
    apport_minimum_pct: 10,
    duree_max_mois: 300,
    revenus_min: 2200,
    anciennete_min_mois: 12,
    accepte_cdd: false,
    accepte_independant: true,
    accepte_investissement_locatif: true,
    frais_dossier: 600,
    taux_moyen: 3.30,
    delai_reponse_jours: 7,
    points_forts: ['Meilleurs taux du marché', 'Frais de dossier bas', 'Revenus minimum accessibles'],
    points_faibles: ['Moins flexible sur les profils risqués'],
  },
  {
    id: 'lcl',
    nom: 'LCL',
    taux_endettement_max: 33,
    apport_minimum_pct: 10,
    duree_max_mois: 300,
    revenus_min: 2800,
    anciennete_min_mois: 12,
    accepte_cdd: false,
    accepte_independant: false,
    accepte_investissement_locatif: true,
    frais_dossier: 800,
    taux_moyen: 3.45,
    delai_reponse_jours: 10,
    points_forts: ['Bon suivi client', 'Offres packagées attractives'],
    points_faibles: ['Endettement max 33%', 'N\'accepte pas les indépendants', 'Délai de réponse long'],
  },
  {
    id: 'caisse_epargne',
    nom: 'Caisse d\'Épargne',
    taux_endettement_max: 35,
    apport_minimum_pct: 5,
    duree_max_mois: 300,
    revenus_min: 2000,
    anciennete_min_mois: 12,
    accepte_cdd: false,
    accepte_independant: true,
    accepte_investissement_locatif: true,
    frais_dossier: 700,
    taux_moyen: 3.40,
    delai_reponse_jours: 8,
    points_forts: ['Apport minimum très bas (5%)', 'Revenus minimum accessibles', 'Bonne pour les primo-accédants'],
    points_faibles: ['Taux variables parfois proposés'],
  },
  {
    id: 'banque_populaire',
    nom: 'Banque Populaire',
    taux_endettement_max: 35,
    apport_minimum_pct: 10,
    duree_max_mois: 300,
    revenus_min: 2500,
    anciennete_min_mois: 12,
    accepte_cdd: false,
    accepte_independant: true,
    accepte_investissement_locatif: true,
    frais_dossier: 750,
    taux_moyen: 3.35,
    delai_reponse_jours: 7,
    points_forts: ['Expertise artisans et commerçants', 'Taux compétitifs', 'Flexibilité sur les profils pro'],
    points_faibles: ['Moins présent dans les grandes villes'],
  },
  {
    id: 'la_banque_postale',
    nom: 'La Banque Postale',
    taux_endettement_max: 35,
    apport_minimum_pct: 5,
    duree_max_mois: 300,
    revenus_min: 1800,
    anciennete_min_mois: 6,
    accepte_cdd: true,
    accepte_independant: false,
    accepte_investissement_locatif: false,
    frais_dossier: 500,
    taux_moyen: 3.55,
    delai_reponse_jours: 12,
    points_forts: ['Accessible aux petits revenus', 'Apport minimum 5%', 'Accepte les CDD', 'Frais de dossier très bas'],
    points_faibles: ['Taux plus élevés', 'Pas d\'investissement locatif', 'Délai de réponse long'],
  },
  {
    id: 'boursorama',
    nom: 'Boursorama Banque',
    taux_endettement_max: 33,
    apport_minimum_pct: 15,
    duree_max_mois: 240,
    revenus_min: 3500,
    anciennete_min_mois: 24,
    accepte_cdd: false,
    accepte_independant: false,
    accepte_investissement_locatif: true,
    frais_dossier: 0,
    taux_moyen: 3.20,
    delai_reponse_jours: 3,
    points_forts: ['Zéro frais de dossier', 'Meilleur taux en ligne', 'Réponse ultra rapide (3 jours)', '100% en ligne'],
    points_faibles: ['Apport minimum 15%', 'Revenus élevés exigés', 'Ancienneté 2 ans minimum', 'N\'accepte pas les indépendants'],
  },
  {
    id: 'hello_bank',
    nom: 'Hello Bank',
    taux_endettement_max: 33,
    apport_minimum_pct: 10,
    duree_max_mois: 240,
    revenus_min: 3000,
    anciennete_min_mois: 12,
    accepte_cdd: false,
    accepte_independant: false,
    accepte_investissement_locatif: false,
    frais_dossier: 0,
    taux_moyen: 3.25,
    delai_reponse_jours: 5,
    points_forts: ['Zéro frais de dossier', 'Taux compétitifs', 'Process 100% digital'],
    points_faibles: ['Résidence principale uniquement', 'Durée max 20 ans', 'N\'accepte pas les indépendants'],
  },
  {
    id: 'fortuneo',
    nom: 'Fortuneo',
    taux_endettement_max: 33,
    apport_minimum_pct: 15,
    duree_max_mois: 300,
    revenus_min: 4000,
    anciennete_min_mois: 24,
    accepte_cdd: false,
    accepte_independant: false,
    accepte_investissement_locatif: true,
    frais_dossier: 0,
    taux_moyen: 3.15,
    delai_reponse_jours: 4,
    points_forts: ['Zéro frais de dossier', 'Meilleur taux global', 'Durée jusqu\'à 25 ans', 'Accepte l\'investissement locatif'],
    points_faibles: ['Revenus élevés exigés (4000€)', 'Apport 15% minimum', 'Ancienneté 2 ans'],
  },
]

// Match a dossier against banks and return ranked recommendations
export function matchBanques(profil: {
  revenus: number
  taux_endettement: number
  ratio_apport: number
  duree_mois: number
  anciennete_mois: number
  type_contrat: string
  est_investissement: boolean
}): { banque: CritereBanque; score: number; eligible: boolean; raisons_refus: string[] }[] {
  return BANQUES_CRITERES.map(banque => {
    const raisons: string[] = []
    let score = 100

    if (profil.taux_endettement > banque.taux_endettement_max) {
      raisons.push('Endettement ' + profil.taux_endettement.toFixed(1) + '% > max ' + banque.taux_endettement_max + '%')
      score -= 40
    }
    if (profil.ratio_apport < banque.apport_minimum_pct) {
      raisons.push('Apport ' + profil.ratio_apport.toFixed(0) + '% < min ' + banque.apport_minimum_pct + '%')
      score -= 30
    }
    if (profil.duree_mois > banque.duree_max_mois) {
      raisons.push('Durée ' + Math.round(profil.duree_mois/12) + ' ans > max ' + Math.round(banque.duree_max_mois/12) + ' ans')
      score -= 20
    }
    if (banque.revenus_min && profil.revenus < banque.revenus_min) {
      raisons.push('Revenus ' + profil.revenus + '€ < min ' + banque.revenus_min + '€')
      score -= 25
    }
    if (profil.anciennete_mois < banque.anciennete_min_mois) {
      raisons.push('Ancienneté ' + profil.anciennete_mois + ' mois < min ' + banque.anciennete_min_mois + ' mois')
      score -= 20
    }
    if (profil.type_contrat === 'CDD' && !banque.accepte_cdd) {
      raisons.push('CDD non accepté')
      score -= 50
    }
    if ((profil.type_contrat === 'Independant' || profil.type_contrat === 'TNS') && !banque.accepte_independant) {
      raisons.push('Indépendants non acceptés')
      score -= 50
    }
    if (profil.est_investissement && !banque.accepte_investissement_locatif) {
      raisons.push('Investissement locatif non accepté')
      score -= 50
    }

    return {
      banque,
      score: Math.max(0, score),
      eligible: raisons.length === 0,
      raisons_refus: raisons,
    }
  }).sort((a, b) => b.score - a.score)
}
