'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface AnalyseItem {
    id: string;
    dossier_id: string;
    nom_client?: string;
    reference?: string;
    statut?: string;
    score_global?: number;
    niveau_risque?: string;
    taux_endettement?: number;
    reste_vivre?: number;
    revenus_retenus?: number;
    mensualite?: number;
}

function formatCurrency(amount?: number) {
    if (!amount) return '—';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

function getScoreColor(score?: number) {
    if (!score) return '#94a3b8';
    if (score >= 75) return 'var(--risk-low)';
    if (score >= 55) return 'var(--risk-medium)';
    if (score >= 35) return 'var(--risk-high)';
    return 'var(--risk-critical)';
}

function getScoreLabel(score?: number) {
    if (!score) return '—';
    if (score >= 75) return 'Solide';
    if (score >= 55) return 'Acceptable';
    if (score >= 35) return 'Fragile';
    return 'Critique';
}

export default function AnalysesPage() {
    const supabase = createClient();
    const [analyses, setAnalyses] = useState<AnalyseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRisque, setFilterRisque] = useState('');

  useEffect(() => {
        const load = async () => {
                try {
                          const { data: dossiers } = await supabase
                            .from('dossiers')
                            .select('id, nom_client, reference, statut, score_global, niveau_risque')
                            .order('score_global', { ascending: true });

                  const { data: analyses_data } = await supabase
                            .from('analyses_financieres')
                            .select('dossier_id, taux_endettement_actuel, reste_a_vivre, revenus_nets_mensuels_total, mensualite_estimee');

                  const analyseMap: Record<string, any> = {};
                          (analyses_data || []).forEach((a: any) => {
                                      analyseMap[a.dossier_id] = a;
                          });

                  const mapped = (dossiers || []).map((d: any) => ({
                              id: d.id,
                              dossier_id: d.id,
                              nom_client: d.nom_client,
                              reference: d.reference,
                              statut: d.statut,
                              score_global: d.score_global,
                              niveau_risque: d.niveau_risque,
                              taux_endettement: analyseMap[d.id]?.taux_endettement_actuel,
                              reste_vivre: analyseMap[d.id]?.reste_a_vivre,
                              revenus_retenus: analyseMap[d.id]?.revenus_nets_mensuels_total,
                              mensualite: analyseMap[d.id]?.mensualite_estimee,
                  }));

                  setAnalyses(mapped);
                } catch (e) {
                          // silent
                } finally {
                          setLoading(false);
                }
        };
        load();
  }, [supabase]);

  const RISQUES = ['', 'faible', 'moyen', 'eleve', 'critique'];
    const RISQUE_LABELS: Record<string, string> = {
          '': 'Tous les risques',
          faible: '🟢 Faible',
          moyen: '🟡 Moyen',
          eleve: '🔴 Élevé',
          critique: '⛔ Critique',
    };

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

  const filtered = analyses.filter(a => {
        if (!filterRisque) return true;
        return a.niveau_risque === filterRisque;
  });

  const analysesAvecScore = analyses.filter(a => a.score_global && a.score_global > 0);
    const avgScore = analysesAvecScore.length > 0
      ? Math.round(analysesAvecScore.reduce((s, a) => s + (a.score_global || 0), 0) / analysesAvecScore.length)
          : 0;

  const scoreDistrib = {
        solide: analyses.filter(a => (a.score_global || 0) >= 75).length,
        acceptable: analyses.filter(a => (a.score_global || 0) >= 55 && (a.score_global || 0) < 75).length,
        fragile: analyses.filter(a => (a.score_global || 0) >= 35 && (a.score_global || 0) < 55).length,
        critique: analyses.filter(a => (a.score_global || 0) > 0 && (a.score_global || 0) < 35).length,
  };

  return (
        <div className="page-container">
              <div className="page-header">
                      <div>
                                <h1 className="page-title">Analyses</h1>h1>
                                <p className="page-subtitle">{analyses.length} dossier{analyses.length > 1 ? 's' : ''} • {analysesAvecScore.length} analysé{analysesAvecScore.length > 1 ? 's' : ''}</p>p>
                      </div>div>
              </div>div>
        
          {/* KPIs résumé */}
              <div className="kpi-grid" style={{ marginBottom: '1.5rem' }}>
                      <div className="kpi-card">
                                <div className="kpi-header">
                                            <span className="kpi-label">Score moyen</span>span>
                                            <span style={{ color: getScoreColor(avgScore), fontSize: '1rem' }}>◈</span>span>
                                </div>div>
                                <div className="kpi-value" style={{ color: getScoreColor(avgScore) }}>{avgScore > 0 ? `${avgScore}/100` : '—'}</div>div>
                      </div>div>
                      <div className="kpi-card">
                                <div className="kpi-header">
                                            <span className="kpi-label">Dossiers solides</span>span>
                                            <span style={{ color: 'var(--risk-low)', fontSize: '1rem' }}>✓</span>span>
                                </div>div>
                                <div className="kpi-value" style={{ color: 'var(--risk-low)' }}>{scoreDistrib.solide}</div>div>
                      </div>div>
                      <div className="kpi-card">
                                <div className="kpi-header">
                                            <span className="kpi-label">Dossiers fragiles</span>span>
                                            <span style={{ color: 'var(--risk-high)', fontSize: '1rem' }}>⚠</span>span>
                                </div>div>
                                <div className="kpi-value" style={{ color: 'var(--risk-high)' }}>{scoreDistrib.fragile + scoreDistrib.critique}</div>div>
                      </div>div>
                      <div className="kpi-card">
                                <div className="kpi-header">
                                            <span className="kpi-label">Total dossiers</span>span>
                                            <span style={{ color: 'var(--brand-blue)', fontSize: '1rem' }}>◧</span>span>
                                </div>div>
                                <div className="kpi-value" style={{ color: 'var(--brand-blue)' }}>{analyses.length}</div>div>
                      </div>div>
              </div>div>
        
          {/* Filtre */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                      <select
                                  value={filterRisque}
                                  onChange={e => setFilterRisque(e.target.value)}
                                  className="form-select"
                                  style={{ width: 'auto', minWidth: '160px' }}
                                >
                        {RISQUES.map(r => <option key={r} value={r}>{RISQUE_LABELS[r]}</option>option>)}
                      </select>select>
                {filterRisque && (
                    <button
                                  onClick={() => setFilterRisque('')}
                                  style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--border-primary)', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}
                                >
                                Effacer
                    </button>button>
                      )}
                      <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
                      </span>span>
              </div>div>
        
          {loading ? (
                  <div className="loading-container"><div className="loading-spinner" /><p>Chargement...</p>p></div>div>
                ) : analyses.length === 0 ? (
                  <div className="card">
                            <div className="empty-state">
                                        <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>◈</p>p>
                                        <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Aucun dossier disponible</p>p>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                      Créez des dossiers et lancez des analyses pour les voir ici.
                                        </p>p>
                                        <Link href="/dossiers" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                                                      Voir les dossiers
                                        </Link>Link>
                            </div>div>
                  </div>div>
                ) : (
                  <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                            <table className="data-table">
                                        <thead>
                                                      <tr>
                                                                      <th>Client</th>th>
                                                                      <th>Score</th>th>
                                                                      <th>Risque</th>th>
                                                                      <th>Endettement</th>th>
                                                                      <th>Revenus</th>th>
                                                                      <th>Mensualité</th>th>
                                                                      <th>Reste à vivre</th>th>
                                                                      <th>Statut</th>th>
                                                                      <th>Action</th>th>
                                                      </tr>tr>
                                        </thead>thead>
                                        <tbody>
                                          {filtered.map(a => (
                                    <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/dossiers/${a.dossier_id}/analyse`}>
                                                      <td>
                                                                          <div>
                                                                                                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.nom_client || '—'}</div>div>
                                                                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                                                                                                  {a.reference || a.dossier_id?.slice(0, 8).toUpperCase()}
                                                                                                  </div>div>
                                                                          </div>div>
                                                      </td>td>
                                                      <td>
                                                        {a.score_global && a.score_global > 0 ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                    <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${getScoreColor(a.score_global)}20`, border: `2px solid ${getScoreColor(a.score_global)}`, fontSize: '0.7rem', fontWeight: 800, color: getScoreColor(a.score_global) }}>
                                                                                      {a.score_global}
                                                                                      </div>div>
                                                                                    <span style={{ fontSize: '0.75rem', color: getScoreColor(a.score_global), fontWeight: 500 }}>
                                                                                      {getScoreLabel(a.score_global)}
                                                                                      </span>span>
                                                            </div>div>
                                                          ) : (
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Non analysé</span>span>
                                                                          )}
                                                      </td>td>
                                                      <td>
                                                        {a.niveau_risque && a.niveau_risque !== 'non_calcule' ? (
                                                            <span style={{ fontSize: '0.85rem' }}>{RISQUE_LABELS[a.niveau_risque] || a.niveau_risque}</span>span>
                                                          ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>—</span>span>}
                                                      </td>td>
                                                      <td>
                                                        {a.taux_endettement != null && a.taux_endettement > 0 ? (
                                                            <span style={{ fontWeight: 600, color: a.taux_endettement > 35 ? 'var(--risk-high)' : 'var(--text-secondary)' }}>
                                                              {a.taux_endettement.toFixed(1)}%
                                                            </span>span>
                                                          ) : <span style={{ color: 'var(--text-muted)' }}>—</span>span>}
                                                      </td>td>
                                                      <td style={{ fontWeight: 500 }}>
                                                        {a.revenus_retenus ? formatCurrency(a.revenus_retenus) + '/mois' : '—'}
                                                      </td>td>
                                                      <td style={{ fontWeight: 500 }}>
                                                        {a.mensualite ? formatCurrency(a.mensualite) + '/mois' : '—'}
                                                      </td>td>
                                                      <td style={{ fontWeight: 500 }}>
                                                        {a.reste_vivre ? formatCurrency(a.reste_vivre) + '/mois' : '—'}
                                                      </td>td>
                                                      <td>
                                                                          <span className={`badge ${STATUT_CLASSES[a.statut || ''] || 'badge-neutral'}`}>
                                                                            {STATUT_LABELS[a.statut || ''] || a.statut || '—'}
                                                                          </span>span>
                                                      </td>td>
                                                      <td>
                                                                          <Link
                                                                                                  href={`/dossiers/${a.dossier_id}/analyse`}
                                                                                                  className="btn-secondary"
                                                                                                  style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', display: 'inline-block', textDecoration: 'none' }}
                                                                                                  onClick={e => e.stopPropagation()}
                                                                                                >
                                                                                                Analyser
                                                                          </Link>Link>
                                                      </td>td>
                                    </tr>tr>
                                  ))}
                                        </tbody>tbody>
                            </table>table>
                  </div>div>
              )}
        </div>div>
      );
}</div>
