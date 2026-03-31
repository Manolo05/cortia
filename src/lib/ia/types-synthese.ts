export interface DonneesSynthese {
  dossier: {
    reference: string
    date_creation: string
    courtier: string
  }
  emprunteurs: Array<{
    nom_complet: string
    role: string
    situation_pro: string
    revenus_nets: number
    anciennete: number
  }>
  projet: {
    type: string
    usage: string
    localisation: string
    prix_bien: number
    travaux: number
    apport: number
    montant_emprunt: number
    duree: number
    taux: number
  }
  analyse: {
    score_global: number
    taux_endettement_projet: number
    mensualite: number
    taux_apport: number
    reste_a_vivre: number
    capacite_emprunt: number
    points_forts: string[]
    points_vigilance: string[]
    recommandations: string[]
  }
  documents: {
    total: number
    valides: number
    en_attente: number
    refuses: number
  }
}

export interface SyntheseGenereeIA {
  titre: string
  resume_executif: string
  sections: SectionSynthese[]
  conclusion: string
  recommandation_finale: 'accord_recommande' | 'accord_sous_conditions' | 'etude_approfondie' | 'refus_recommande'
}

export interface SectionSynthese {
  titre: string
  contenu: string
  icone?: string
}

// Interface principale de synthèse complète utilisée par les composants
export interface SyntheseComplete {
    id?: string
    dossier_id?: string
    date_generation: string
    resume_executif: string
    profil_emprunteur?: {
      description: string
      points_forts?: string[]
      points_attention?: string[]
    }
    analyse_projet?: {
      description: string
      coherence_prix?: string
    }
    analyse_financiere?: {
      description: string
      indicateurs?: Record<string, string | number>
    }
    recommandations?: {
      banques_cibles?: string[]
      actions_requises?: string[]
      texte?: string
    }
    note_bancaire?: string
    sections?: SectionSynthese[]
    recommandation_finale?: string
    genere_par?: string
    version?: number
}
