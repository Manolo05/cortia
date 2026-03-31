'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Dossier {
  id: string;
  reference?: string;
  nom_client?: string;
  email_client?: string;
  statut: string;
  score_global?: number;
  niveau_risque?: string;
  montant_projet?: number;
  besoin_financement?: number;
  taux_endettement?: number;
  updated_at?: string;
  created_at?: string;
}

const STATUTS = ['', 'en_attente', 'en_cours', 'analyse', 'accorde', 'refuse', 'archive'];
const STATUT_LABELS: Record<string, string> = {
  '': 'Tous les statuts',
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

const RISQUES = ['', 'faible', 'moyen', 'eleve', 'critique'];
const RISQUE_LABELS: Record<string, string> = {
  '': 'Tous les risques',
  faible: '🟢 Faible',
  moyen: '🟡 Moyen',
  eleve: '🔴 Élevé',
  critique: '⛔ Critique',
};

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

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function getRisqueLabel(risque?: string) {
  if (!risque) return '—';
  const map: Record<string, string> = { faible: '🟢 Faible', moyen: '🟡 Moyen', eleve: '🔴 Élevé', critique: '⛔ Critique' };
  return map[risque] || risque;
}

export default function DossiersPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterRisque, setFilterRisque] = useState('');
  const [sortField, setSortField] = useState<string>('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const load = async () => {
      try {
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

  const filtered = dossiers.filter(d => {
    const matchSearch = !search ||
      (d.nom_client || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.reference || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.email_client || '').toLowerCase().includes(search.toLowerCase());
    const matchStatut = !filterStatut || d.statut === filterStatut;
    const matchRisque = !filterRisque || d.niveau_risque === filterRisque;
    return matchSearch && matchStatut && matchRisque;
  }).sort((a, b) => {
    let va: any = (a as any)[sortField] || '';
    let vb: any = (b as any)[sortField] || '';
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const sortIndicator = (field: string) => sortField === field ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dossiers</h1>
          <p className="page-subtitle">{dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/dossiers/nouveau" className="btn-primary">+ Nouveau dossier</Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <input
            type="text"
            placeholder="Rechercher un client, référence..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
          />
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>⊕</span>
        </div>
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: '150px' }}>
          {STATUTS.map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
        </select>
        <select value={filterRisque} onChange={e => setFilterRisque(e.target.value)} className="form-select" style={{ width: 'auto', minWidth: '150px' }}>
          {RISQUES.map(r => <option key={r} value={r}>{RISQUE_LABELS[r]}</option>)}
        </select>
        {(search || filterStatut || filterRisque) && (
          <button onClick={() => { setSearch(''); setFilterStatut(''); setFilterRisque(''); }}
            style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--border-primary)', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Effacer
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading-container"><div className="loading-spinner" /><p>Chargement...</p></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>◧</p>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{dossiers.length === 0 ? 'Aucun dossier' : 'Aucun résultat'}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {dossiers.length === 0 ? 'Créez votre premier dossier pour démarrer.' : 'Modifiez vos filtres de recherche.'}
            </p>
            {dossiers.length === 0 && (
              <Link href="/dossiers/nouveau" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Créer un dossier</Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('reference')} style={{ cursor: 'pointer' }}>Référence{sortIndicator('reference')}</th>
                <th onClick={() => handleSort('nom_client')} style={{ cursor: 'pointer' }}>Client{sortIndicator('nom_client')}</th>
                <th onClick={() => handleSort('montant_projet')} style={{ cursor: 'pointer' }}>Projet{sortIndicator('montant_projet')}</th>
                <th onClick={() => handleSort('besoin_financement')} style={{ cursor: 'pointer' }}>Financement{sortIndicator('besoin_financement')}</th>
                <th onClick={() => handleSort('score_global')} style={{ cursor: 'pointer' }}>Score{sortIndicator('score_global')}</th>
                <th onClick={() => handleSort('taux_endettement')} style={{ cursor: 'pointer' }}>Endettement{sortIndicator('taux_endettement')}</th>
                <th onClick={() => handleSort('niveau_risque')} style={{ cursor: 'pointer' }}>Risque{sortIndicator('niveau_risque')}</th>
                <th onClick={() => handleSort('statut')} style={{ cursor: 'pointer' }}>Statut{sortIndicator('statut')}</th>
                <th onClick={() => handleSort('updated_at')} style={{ cursor: 'pointer' }}>Modifié{sortIndicator('updated_at')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} onClick={() => router.push(`/dossiers/${d.id}`)} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {d.reference || d.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{d.nom_client || '—'}</div>
                    {d.email_client && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.email_client}</div>}
                  </td>
                  <td style={{ fontWeight: 500 }}>{formatCurrency(d.montant_projet)}</td>
                  <td>{formatCurrency(d.besoin_financement)}</td>
                  <td>
                    {d.score_global ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${getScoreColor(d.score_global)}20`, border: `2px solid ${getScoreColor(d.score_global)}`,
                          fontSize: '0.65rem', fontWeight: 800, color: getScoreColor(d.score_global)
                        }}>{d.score_global}</div>
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    {d.taux_endettement ? (
                      <span style={{ fontWeight: 600, color: d.taux_endettement > 35 ? 'var(--risk-high)' : 'var(--text-secondary)' }}>
                        {d.taux_endettement.toFixed(1)}%
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    {d.niveau_risque ? (
                      <span style={{ fontSize: '0.8rem' }}>{getRisqueLabel(d.niveau_risque)}</span>
                    ) : '—'}
                  </td>
                  <td><span className={`badge ${STATUT_CLASSES[d.statut] || 'badge-neutral'}`}>{STATUT_LABELS[d.statut] || d.statut}</span></td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(d.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
