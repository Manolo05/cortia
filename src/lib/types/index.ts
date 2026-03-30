// Types principaux CortIA

export type StatutDossier = 
  | 'nouveau'
  | 'en_cours'
  | 'analyse'
  | 'soumis'
  | 'accepte'
  | 'refuse'
  | 'archive'

export type TypeDocument = 
  | 'bulletin_salaire'
  | 'avis_imposition'
  | 'releve_compte'
  | 'justificatif_domicile'
  | 'piece_identite'
  | 'compromis_vente'
  | 'titre_propriete'
  | 'devis_travaux'
  | 'autre'

export type RoleMembreEquipe = 'admin' | 'courtier' | 'assistant'

export interface Cabinet {
  id: string
  nom: string
  siret?: string
  adresse?: string
  telephone?: string
  email?: string
  logo_url?: string
  plan_abonnement: 'starter' | 'pro' | 'enterprise'
  created_at: string
  updated_at: string
}

export interface ProfilUtilisateur {
  id: string
  cabinet_id: string
  email: string
  nom_complet: string
  role: RoleMembreEquipe
  avatar_url?: string
  telephone?: string
  created_at: string
  updated_at: string
  cabinet?: Cabinet
}

export interface Dossier {
  id: string
  cabinet_id: string
  reference: string
  statut: StatutDossier
  courtier_id: string
  notes?: string
  created_at: string
  updated_at: string
  courtier?: ProfilUtilisateur
  emprunteurs?: Emprunteur[]
  projet?: Projet
  documents?: Document[]
  analyse?: AnalyseFinanciere
}

export interface Emprunteur {
  id: string
  dossier_id: string
  est_co_emprunteur: boolean
  civilite?: string
  prenom: string
  nom: string
  date_naissance?: string
  situation_familiale?: string
  nb_enfants_charge?: number
  email?: string
  telephone?: string
  adresse?: string
  code_postal?: string
  ville?: string
  nationalite?: string
  // Revenus
  type_contrat?: string
  employeur?: string
  anciennete_emploi?: number
  salaire_net_mensuel?: number
  autres_revenus?: number
  revenus_locatifs?: number
  // Charges
  loyer_actuel?: number
  credits_en_cours?: number
  pension_versee?: number
  autres_charges?: number
  // Patrimoine
  epargne?: number
  valeur_patrimoine_immo?: number
  created_at: string
  updated_at: string
}

export interface Projet {
  id: string
  dossier_id: string
  type_operation: 'achat_neuf' | 'achat_ancien' | 'travaux' | 'rachat_credit' | 'autre'
  usage_bien: 'residence_principale' | 'residence_secondaire' | 'investissement_locatif'
  adresse_bien?: string
  code_postal_bien?: string
  ville_bien?: string
  surface_bien?: number
  // Financement
  prix_bien: number
  montant_travaux?: number
  apport_personnel: number
  montant_emprunt: number
  duree_souhaitee: number
  taux_interet_cible?: number
  // Assurance
  taux_assurance?: number
  created_at: string
  updated_at: string
}

export interface DocumentDossier {
  id: string
  dossier_id: string
  emprunteur_id?: string
  type_document: TypeDocument
  nom_fichier: string
  url_stockage: string
  taille_fichier?: number
  mime_type?: string
  statut_verification: 'en_attente' | 'valide' | 'refuse' | 'a_remplacer'
  notes_verification?: string
  contenu_extrait?: Record<string, unknown>
  uploaded_by: string
  created_at: string
  updated_at: string
  emprunteur?: Emprunteur
}

export interface AnalyseFinanciere {
  id: string
  dossier_id: string
  // Revenus consolidés
  revenus_nets_mensuels_total: number
  charges_mensuelles_total: number
  reste_a_vivre: number
  // Ratios
  taux_endettement_actuel: number
  taux_endettement_projet: number
  capacite_emprunt_max: number
  // Scores
  score_global: number
  score_revenus: number
  score_stabilite: number
  score_endettement: number
  score_apport: number
  score_patrimoine: number
  // Apport
  taux_apport: number
  // Mensualite
  mensualite_estimee: number
  // Commentaires IA
  points_forts: string[]
  points_vigilance: string[]
  recommandations: string[]
  // Metadata
  genere_par_ia: boolean
  version_modele?: string
  created_at: string
  updated_at: string
}

export interface SyntheseIA {
  id: string
  dossier_id: string
  contenu_markdown: string
  contenu_html?: string
  version: number
  genere_par: string
  created_at: string
}

export interface InvitationMembre {
  id: string
  cabinet_id: string
  email: string
  role: RoleMembreEquipe
  token: string
  expire_le: string
  accepte_le?: string
  created_at: string
}

// Types pour les formulaires
export type DossierFormData = Omit<Dossier, 'id' | 'cabinet_id' | 'reference' | 'created_at' | 'updated_at' | 'courtier' | 'emprunteurs' | 'projet' | 'documents' | 'analyse'>
export type EmprunteurFormData = Omit<Emprunteur, 'id' | 'dossier_id' | 'created_at' | 'updated_at'>
export type ProjetFormData = Omit<Projet, 'id' | 'dossier_id' | 'created_at' | 'updated_at'>

// Types pour les filtres
export interface FiltresDossier {
  statut?: StatutDossier
  courtier_id?: string
  recherche?: string
  date_debut?: string
  date_fin?: string
}

// Types pour les stats dashboard
export interface StatsDashboard {
  total_dossiers: number
  dossiers_en_cours: number
  dossiers_acceptes: number
  dossiers_refuses: number
  taux_acceptation: number
  montant_total_finance: number
}
