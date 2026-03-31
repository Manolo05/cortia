'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Dossier {
  id: string;
  reference?: string;
  nom_client?: string;
  statut: string;
  score_global?: number;
  niveau_risque?: string;
  montant_projet?: number;
  updated_at?: string;
}

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente',
  en_cours: 'En cours',
  analyse: 'En analyse',
  accorde: 'Accordé',
  refuse: 'Refusé',
  archive: 'Archivé',
};

const STATUT_CLASSES: Record<string, string> = {
  en_attente: 'badge-warning',
  en_cours: 'badge-info',
  analyse: 'badge-info',
  accorde: 'badge-success',
  refuse: 'badge-danger',
  archive: 'badge-neutral',
};

function getRiskClass(risque?: string) {
  if (risque === 'faible') return 'risk-low';
  if (risque === 'moyen') return 'risk-medium';
  if (risque === 'eleve') return 'risk-high';
  if (risque === 'critique') return 'risk-critical';
  return 'risk-medium';
}

function getScoreColor(score?: number) {
  if (!score) return '#94a3b8';
  if (score >= 75) return 'var(--risk-low)';
  if (score >= 55) return 'var(--risk-medium)';
  if (score >= 35) return 'var(--risk-high)';
  return 'var(--risk-critical)';
}

function formatCurrency(amount?: number) {
  if (!amount) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'À l\'instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)} j`;
  return date.toLocaleDateString('fr-FR');
}

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [cabinetNom, setCabinetNom] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profil } = await supabase
          .from('profils_utilisateurs')
          .select('nom_complet, cabinets(nom)')
          .eq('id', user.id)
          .single();
        if (profil) setCabinetNom((profil.cabinets as any)?.nom || '');
        const { data } = await supabase
          .from('dossiers')
          .select('*')
          .order('updated_at', { ascending: false });
        setDossiers(data || []);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase]);

  const total = dossiers.length;
  const actifs = dossiers.filter(d => ['en_cours', 'analyse'].includes(d.statut)).length;
  const pretsBank = dossiers.filter(d => d.statut === 'accorde').length;
  const aCorrect = dossiers.filter(d => d.statut === 'en_attente' || (d.score_global && d.score_global < 40)).length;
  const avgScore = dossiers.filter(d => d.score_global).length > 0
    ? Math.round(dossiers.reduce((s, d) => s + (d.score_global || 0), 0) / dossiers.filter(d => d.score_global).length)
    : 0;
  const volumeTotal = dossiers.reduce((s, d) => s + (d.montant_projet || 0), 0);
  const montantMoyen = total > 0 ? Math.round(volumeTotal / total) : 0;

  const prioritaires = dossiers.filter(d =>
    d.statut === 'en_attente' || (d.score_global && d.score_global < 45)
  ).slice(0, 5);
  const recent = dossiers.slice(0, 8);

  const kpis = [
    { label: 'Total dossiers', value: total, icon: '◧', color: 'var(--brand-blue)' },
    { label: 'Dossiers actifs', value: actifs, icon: '◉', color: 'var(--risk-low)' },
    { label: 'Accordés banque', value: pretsBank, icon: '✓', color: 'var(--risk-low)' },
    { label: 'À corriger', value: aCorrect, icon: '⚠', color: 'var(--risk-high)' },
    { label: 'Score moyen', value: avgScore ? avgScore + '/100' : '—', icon: '◈', color: getScoreColor(avgScore) },
    { label: 'Volume total', value: formatCurrency(volumeTotal), icon: '€', color: 'var(--brand-blue)' },
    { label: 'Montant moyen', value: formatCurrency(montantMoyen), icon: '≈', color: '#64748b' },
    { label: 'En analyse', value: dossiers.filter(d => d.statut === 'analyse').length, icon: '⊕', color: '#8b5cf6' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">{cabinetNom ? `${cabinetNom} · ` : ''}Vue d'ensemble de votre activité</p>
        </div>
        <Link href="/dossiers/nouveau" className="btn-primary">
          + Nouveau dossier
        </Link>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Chargement...</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="kpi-grid">
            {kpis.map((kpi, i) => (
              <div key={i} className="kpi-card">
                <div className="kpi-header">
                  <span className="kpi-label">{kpi.label}</span>
                  <span style={{ fontSize: '1.1rem', color: kpi.color }}>{kpi.icon}</span>
                </div>
                <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            {/* Dossiers prioritaires */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">⚠ Dossiers prioritaires</h2>
                <span className="badge badge-warning">{prioritaires.length}</span>
              </div>
              {prioritaires.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 0' }}>
                  <p>Aucun dossier nécessitant une attention immédiate</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {prioritaires.map(d => (
                    <Link key={d.id} href={`/dossiers/${d.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.75rem 1rem', background: 'var(--surface-secondary)', borderRadius: '0.5rem',
                        border: '1px solid var(--border-primary)', cursor: 'pointer',
                        transition: 'border-color 0.15s'
                      }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {d.nom_client || 'Client inconnu'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                            {d.reference || d.id.slice(0, 8).toUpperCase()} · {formatCurrency(d.montant_projet)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {d.score_global ? (
                            <span style={{
                              fontSize: '0.8rem', fontWeight: 700, color: getScoreColor(d.score_global)
                            }}>{d.score_global}/100</span>
                          ) : null}
                          <span className={`badge ${STATUT_CLASSES[d.statut] || 'badge-neutral'}`}>
                            {STATUT_LABELS[d.statut] || d.statut}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-primary)' }}>
                <Link href="/dossiers" style={{ fontSize: '0.8rem', color: 'var(--brand-blue)', textDecoration: 'none' }}>
                  Voir tous les dossiers →
                </Link>
              </div>
            </div>

            {/* Activité récente */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">◷ Activité récente</h2>
                <Link href="/dossiers" className="badge badge-neutral" style={{ textDecoration: 'none' }}>
                  Tous
                </Link>
              </div>
              {recent.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 0' }}>
                  <p>Aucun dossier récent</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {recent.map(d => (
                    <Link key={d.id} href={`/dossiers/${d.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.625rem 0.875rem', background: 'var(--surface-secondary)', borderRadius: '0.5rem',
                        border: '1px solid var(--border-primary)', cursor: 'pointer'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '2rem', height: '2rem', borderRadius: '50%',
                            background: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0
                          }}>
                            {(d.nom_client || 'C').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                              {d.nom_client || 'Client inconnu'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              {formatCurrency(d.montant_projet)}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                          <span className={`badge ${STATUT_CLASSES[d.statut] || 'badge-neutral'}`} style={{ fontSize: '0.65rem' }}>
                            {STATUT_LABELS[d.statut] || d.statut}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {timeAgo(d.updated_at)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
