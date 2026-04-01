'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface DossierInfo {
  id: string;
  reference?: string;
  nom_client?: string;
  statut: string;
  score_global?: number;
  niveau_risque?: string;
  montant_projet?: number;
  updated_at?: string;
}

const TABS = [
  { href: '', label: 'Résumé' },
  { href: '/emprunteurs', label: 'Emprunteur' },
  { href: '/projet', label: 'Projet' },
  { href: '/charges', label: 'Charges' },
  { href: '/analyse', label: 'Analyse' },
  { href: '/controle-docs', label: 'Contrôle Docs' },
  { href: '/synthese', label: 'Synthèse Banque' },
  { href: '/export', label: 'Export' },
];

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente', en_cours: 'En cours', analyse: 'En analyse',
  accorde: 'Accordé', refuse: 'Refusé', archive: 'Archivé',
};
const STATUT_CLASSES: Record<string, string> = {
  en_attente: 'badge-warning', en_cours: 'badge-info', analyse: 'badge-info',
  accorde: 'badge-success', refuse: 'badge-danger', archive: 'badge-neutral',
};

function getScoreColor(score?: number) {
  if (!score) return '#94a3b8';
  if (score >= 75) return 'var(--risk-low)';
  if (score >= 55) return 'var(--risk-medium)';
  if (score >= 35) return 'var(--risk-high)';
  return 'var(--risk-critical)';
}

function getRisqueLabel(risque?: string) {
  const map: Record<string, string> = { faible: '🟢 Faible', moyen: '🟡 Moyen', eleve: '🔴 Élevé', critique: '⛔ Critique' };
  return risque ? (map[risque] || risque) : null;
}

function formatCurrency(amount?: number) {
  if (!amount) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function DossierLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const pathname = usePathname();
  const supabase = createClient();
  const [dossier, setDossier] = useState<DossierInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('dossiers')
          .select('*')
          .eq('id', params.id)
          .single();
        setDossier(data);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase, params.id]);

  const basePath = `/dossiers/${params.id}`;

  const isTabActive = (tabHref: string) => {
    const fullPath = basePath + tabHref;
    if (tabHref === '') return pathname === basePath;
    return pathname.startsWith(fullPath);
  };

  return (
    <div>
      {/* Dossier Header */}
      <div className="dossier-header">
        <div className="dossier-header-content">
          <div className="dossier-header-back">
            <Link href="/dossiers" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              ← Tous les dossiers
            </Link>
          </div>
          
          {loading ? (
            <div style={{ height: '2rem', display: 'flex', alignItems: 'center' }}>
              <div className="loading-spinner" style={{ width: '1.25rem', height: '1.25rem' }} />
            </div>
          ) : dossier ? (
            <div className="dossier-header-main">
              <div className="dossier-header-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <h1 className="dossier-header-title">
                    {dossier.nom_client || 'Dossier sans nom'}
                  </h1>
                  <span className={`badge ${STATUT_CLASSES[dossier.statut] || 'badge-neutral'}`}>
                    {STATUT_LABELS[dossier.statut] || dossier.statut}
                  </span>
                  {dossier.niveau_risque && (
                    <span style={{ fontSize: '0.8rem' }}>{getRisqueLabel(dossier.niveau_risque)}</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Réf. {dossier.reference || dossier.id.slice(0, 8).toUpperCase()}
                  </span>
                  {dossier.montant_projet && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {formatCurrency(dossier.montant_projet)}
                    </span>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Modifié le {formatDate(dossier.updated_at)}
                  </span>
                </div>
              </div>

              <div className="dossier-header-meta">
                {dossier.score_global ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '3rem', height: '3rem', borderRadius: '50%',
                      border: `3px solid ${getScoreColor(dossier.score_global)}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem', fontWeight: 800, color: getScoreColor(dossier.score_global),
                      background: `${getScoreColor(dossier.score_global)}15`
                    }}>
                      {dossier.score_global}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Score</div>
                  </div>
                ) : null}
                <Link
                  href={`${basePath}/export`}
                  style={{
                    padding: '0.5rem 1rem', background: 'var(--brand-blue)', color: 'white',
                    borderRadius: '0.5rem', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 600
                  }}
                >
                  ↗ Exporter
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Dossier introuvable</div>
          )}

          {/* Tabs */}
          <div className="dossier-tabs">
            {TABS.map(tab => (
              <Link
                key={tab.href}
                href={basePath + tab.href}
                className={`dossier-tab ${isTabActive(tab.href) ? 'active' : ''}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="dossier-content">
        {children}
      </div>
    </div>
  );
}
