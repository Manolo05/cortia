-- ============================================================
-- CortIA - Schéma Supabase complet
-- Migration 001 - Schéma initial
-- ============================================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLE: cabinets
-- ============================================================
CREATE TABLE IF NOT EXISTS cabinets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  siret VARCHAR(14),
  adresse TEXT,
  telephone VARCHAR(20),
  email VARCHAR(255),
  logo_url TEXT,
  plan_abonnement VARCHAR(20) DEFAULT 'starter' CHECK (plan_abonnement IN ('starter', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: profils_utilisateurs
-- ============================================================
CREATE TABLE IF NOT EXISTS profils_utilisateurs (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cabinet_id UUID REFERENCES cabinets(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nom_complet VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'courtier' CHECK (role IN ('admin', 'courtier', 'assistant')),
  avatar_url TEXT,
  telephone VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: dossiers
-- ============================================================
CREATE TABLE IF NOT EXISTS dossiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cabinet_id UUID NOT NULL REFERENCES cabinets(id) ON DELETE CASCADE,
  reference VARCHAR(50) UNIQUE NOT NULL,
  statut VARCHAR(20) DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'en_cours', 'analyse', 'soumis', 'accepte', 'refuse', 'archive')),
  courtier_id UUID REFERENCES profils_utilisateurs(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: emprunteurs
-- ============================================================
CREATE TABLE IF NOT EXISTS emprunteurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  est_co_emprunteur BOOLEAN DEFAULT FALSE,
  civilite VARCHAR(10),
  prenom VARCHAR(100) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  date_naissance DATE,
  situation_familiale VARCHAR(30),
  nb_enfants_charge INTEGER DEFAULT 0,
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  code_postal VARCHAR(10),
  ville VARCHAR(100),
  nationalite VARCHAR(50),
  -- Situation professionnelle
  type_contrat VARCHAR(50),
  employeur VARCHAR(255),
  anciennete_emploi DECIMAL(4,1),
  salaire_net_mensuel DECIMAL(10,2),
  autres_revenus DECIMAL(10,2) DEFAULT 0,
  revenus_locatifs DECIMAL(10,2) DEFAULT 0,
  -- Charges
  loyer_actuel DECIMAL(10,2) DEFAULT 0,
  credits_en_cours DECIMAL(10,2) DEFAULT 0,
  pension_versee DECIMAL(10,2) DEFAULT 0,
  autres_charges DECIMAL(10,2) DEFAULT 0,
  -- Patrimoine
  epargne DECIMAL(12,2) DEFAULT 0,
  valeur_patrimoine_immo DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: projets
-- ============================================================
CREATE TABLE IF NOT EXISTS projets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dossier_id UUID NOT NULL UNIQUE REFERENCES dossiers(id) ON DELETE CASCADE,
  type_operation VARCHAR(30) CHECK (type_operation IN ('achat_neuf', 'achat_ancien', 'travaux', 'rachat_credit', 'autre')),
  usage_bien VARCHAR(30) CHECK (usage_bien IN ('residence_principale', 'residence_secondaire', 'investissement_locatif')),
  adresse_bien TEXT,
  code_postal_bien VARCHAR(10),
  ville_bien VARCHAR(100),
  surface_bien DECIMAL(8,2),
  prix_bien DECIMAL(12,2) NOT NULL DEFAULT 0,
  montant_travaux DECIMAL(12,2) DEFAULT 0,
  apport_personnel DECIMAL(12,2) DEFAULT 0,
  montant_emprunt DECIMAL(12,2) NOT NULL DEFAULT 0,
  duree_souhaitee INTEGER DEFAULT 20,
  taux_interet_cible DECIMAL(5,3),
  taux_assurance DECIMAL(5,3) DEFAULT 0.36,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: documents
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  emprunteur_id UUID REFERENCES emprunteurs(id) ON DELETE SET NULL,
  type_document VARCHAR(50) NOT NULL,
  nom_fichier VARCHAR(255) NOT NULL,
  url_stockage TEXT NOT NULL,
  taille_fichier INTEGER,
  mime_type VARCHAR(100),
  statut_verification VARCHAR(20) DEFAULT 'en_attente' CHECK (statut_verification IN ('en_attente', 'valide', 'refuse', 'a_remplacer')),
  notes_verification TEXT,
  contenu_extrait JSONB,
  uploaded_by UUID REFERENCES profils_utilisateurs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: analyses_financieres
-- ============================================================
CREATE TABLE IF NOT EXISTS analyses_financieres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dossier_id UUID NOT NULL UNIQUE REFERENCES dossiers(id) ON DELETE CASCADE,
  -- Revenus et charges
  revenus_nets_mensuels_total DECIMAL(10,2) DEFAULT 0,
  charges_mensuelles_total DECIMAL(10,2) DEFAULT 0,
  reste_a_vivre DECIMAL(10,2) DEFAULT 0,
  -- Ratios
  taux_endettement_actuel DECIMAL(5,2) DEFAULT 0,
  taux_endettement_projet DECIMAL(5,2) DEFAULT 0,
  capacite_emprunt_max DECIMAL(12,2) DEFAULT 0,
  -- Scores
  score_global INTEGER DEFAULT 0 CHECK (score_global BETWEEN 0 AND 100),
  score_revenus INTEGER DEFAULT 0 CHECK (score_revenus BETWEEN 0 AND 100),
  score_stabilite INTEGER DEFAULT 0 CHECK (score_stabilite BETWEEN 0 AND 100),
  score_endettement INTEGER DEFAULT 0 CHECK (score_endettement BETWEEN 0 AND 100),
  score_apport INTEGER DEFAULT 0 CHECK (score_apport BETWEEN 0 AND 100),
  score_patrimoine INTEGER DEFAULT 0 CHECK (score_patrimoine BETWEEN 0 AND 100),
  -- Autres
  taux_apport DECIMAL(5,2) DEFAULT 0,
  mensualite_estimee DECIMAL(10,2) DEFAULT 0,
  -- Commentaires IA
  points_forts JSONB DEFAULT '[]',
  points_vigilance JSONB DEFAULT '[]',
  recommandations JSONB DEFAULT '[]',
  -- Metadata
  genere_par_ia BOOLEAN DEFAULT FALSE,
  version_modele VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: syntheses_ia
-- ============================================================
CREATE TABLE IF NOT EXISTS syntheses_ia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  contenu_markdown TEXT NOT NULL,
  contenu_html TEXT,
  version INTEGER DEFAULT 1,
  genere_par UUID REFERENCES profils_utilisateurs(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TABLE: invitations_membres
-- ============================================================
CREATE TABLE IF NOT EXISTS invitations_membres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cabinet_id UUID NOT NULL REFERENCES cabinets(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'courtier',
  token VARCHAR(100) UNIQUE NOT NULL DEFAULT uuid_generate_v4()::TEXT,
  expire_le TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepte_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRIGGERS: updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cabinets_updated_at BEFORE UPDATE ON cabinets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_profils_updated_at BEFORE UPDATE ON profils_utilisateurs
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_dossiers_updated_at BEFORE UPDATE ON dossiers
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_emprunteurs_updated_at BEFORE UPDATE ON emprunteurs
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_projets_updated_at BEFORE UPDATE ON projets
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_analyses_updated_at BEFORE UPDATE ON analyses_financieres
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- FUNCTION: Création automatique du profil et cabinet
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_cabinet_id UUID;
  nom_cabinet TEXT;
BEGIN
  -- Récupérer le nom du cabinet depuis les métadonnées
  nom_cabinet := COALESCE(NEW.raw_user_meta_data->>'nom_cabinet', 'Mon Cabinet');
  
  -- Créer le cabinet
  INSERT INTO cabinets (nom)
  VALUES (nom_cabinet)
  RETURNING id INTO new_cabinet_id;
  
  -- Créer le profil
  INSERT INTO profils_utilisateurs (id, cabinet_id, email, nom_complet, role)
  VALUES (
    NEW.id,
    new_cabinet_id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nom_complet', split_part(NEW.email, '@', 1)),
    'admin'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE cabinets ENABLE ROW LEVEL SECURITY;
ALTER TABLE profils_utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE emprunteurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses_financieres ENABLE ROW LEVEL SECURITY;
ALTER TABLE syntheses_ia ENABLE ROW LEVEL SECURITY;

-- Policies: les utilisateurs voient uniquement leur cabinet
CREATE POLICY "Users see their cabinet" ON cabinets
  FOR ALL USING (
    id IN (
      SELECT cabinet_id FROM profils_utilisateurs WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users see cabinet profiles" ON profils_utilisateurs
  FOR ALL USING (
    cabinet_id IN (
      SELECT cabinet_id FROM profils_utilisateurs WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users see cabinet dossiers" ON dossiers
  FOR ALL USING (
    cabinet_id IN (
      SELECT cabinet_id FROM profils_utilisateurs WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users see dossier emprunteurs" ON emprunteurs
  FOR ALL USING (
    dossier_id IN (
      SELECT d.id FROM dossiers d
      JOIN profils_utilisateurs p ON p.cabinet_id = d.cabinet_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users see dossier projets" ON projets
  FOR ALL USING (
    dossier_id IN (
      SELECT d.id FROM dossiers d
      JOIN profils_utilisateurs p ON p.cabinet_id = d.cabinet_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users see dossier documents" ON documents
  FOR ALL USING (
    dossier_id IN (
      SELECT d.id FROM dossiers d
      JOIN profils_utilisateurs p ON p.cabinet_id = d.cabinet_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users see dossier analyses" ON analyses_financieres
  FOR ALL USING (
    dossier_id IN (
      SELECT d.id FROM dossiers d
      JOIN profils_utilisateurs p ON p.cabinet_id = d.cabinet_id
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users see dossier syntheses" ON syntheses_ia
  FOR ALL USING (
    dossier_id IN (
      SELECT d.id FROM dossiers d
      JOIN profils_utilisateurs p ON p.cabinet_id = d.cabinet_id
      WHERE p.id = auth.uid()
    )
  );

-- ============================================================
-- STORAGE BUCKET pour les documents
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- ============================================================
-- INDEX pour les performances
-- ============================================================
CREATE INDEX idx_dossiers_cabinet ON dossiers(cabinet_id);
CREATE INDEX idx_dossiers_statut ON dossiers(statut);
CREATE INDEX idx_dossiers_courtier ON dossiers(courtier_id);
CREATE INDEX idx_emprunteurs_dossier ON emprunteurs(dossier_id);
CREATE INDEX idx_documents_dossier ON documents(dossier_id);
CREATE INDEX idx_profils_cabinet ON profils_utilisateurs(cabinet_id);
