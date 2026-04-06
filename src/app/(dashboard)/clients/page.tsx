'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Client {
  id: string;
  dossier_id: string;
  nom_complet: string;
  email?: string;
  telephone?: string;
  type_contrat?: string;
  salaire_net?: number;
  role?: string;
  reference?: string;
  statut?: string;
  score_global?: number;
}

function formatCurrency(amount?: number) {
  if (!amount) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

export default function ClientsPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data: emprunteurs, error: empErr } = await supabase
          .from('emprunteurs')
          .select('*')
          .order('nom', { ascending: true });

        if (empErr || !emprunteurs || emprunteurs.length === 0) {
          setClients([]);
          setLoading(false);
          return;
        }

        const dossierIds = [...new Set(emprunteurs.map((e: any) => e.dossier_id))];

        const [dossierRes, analyseRes] = await Promise.all([
          supabase.from('dossiers').select('id, reference, statut').in('id', dossierIds),
          supabase.from('analyses_financieres').select('dossier_id, score_global').in('dossier_id', dossierIds),
        ]);

        const dossierMap: Record<string, any> = {};
        (dossierRes.data || []).forEach((d: any) => { dossierMap[d.id] = d; });
        const analyseMap: Record<string, any> = {};
        (analyseRes.data || []).forEach((a: any) => { analyseMap[a.dossier_id] = a; });

        const mapped = emprunteurs.map((e: any) => ({
          id: e.id,
          dossier_id: e.dossier_id,
          nom_complet: `${e.prenom || ''} ${e.nom || ''}`.trim() || '—',
          email: e.email || e['e-mail'] || undefined,
          telephone: e.telephone,
          type_contrat: e.type_contrat,
          salaire_net: e.salaire_net_mensuel,
          role: e.est_co_emprunteur ? 'co_emprunteur' : 'emprunteur_principal',
          reference: dossierMap[e.dossier_id]?.reference,
          statut: dossierMap[e.dossier_id]?.statut,
          score_global: analyseMap[e.dossier_id]?.score_global,
        }));

        setClients(mapped);
      } catch (e) {
        console.error('Clients load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const STATUT_LABELS: Record<string, string> = {
    en_attente: 'En attente', en_cours: 'En cours', analyse: 'En analyse',
    accorde: 'Accordé', refuse: 'Refusé', archive: 'Archivé',
    nouveau: 'Nouveau', soumis: 'Soumis',
  };
  const STATUT_CLASSES: Record<string, string> = {
    en_attente: 'badge-warning', en_cours: 'badge-info', analyse: 'badge-info',
    accorde: 'badge-success', refuse: 'badge-danger', archive: 'badge-neutral',
    nouveau: 'badge-info', soumis: 'badge-info',
  };
  const CONTRAT_LABELS: Record<string, string> = {
    CDI: 'CDI', CDD: 'CDD', independant: 'Indépendant',
    fonctionnaire: 'Fonctionnaire', retraite: 'Retraité', sans_emploi: 'Sans emploi',
  };

  function getScoreColor(score?: number) {
    if (!score) return '#94a3b8';
    if (score >= 75) return 'var(--risk-low)';
    if (score >= 55) return 'var(--risk-medium)';
    if (score >= 35) return 'var(--risk-high)';
    return 'var(--risk-critical)';
  }

  const filtered = clients.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.nom_complet?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.reference?.toLowerCase().includes(q) ||
      c.telephone?.includes(q)
    );
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="page-subtitle">{clients.length} client{clients.length > 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/dossiers/nouveau" className="btn-primary">+ Nouveau dossier</Link>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Rechercher un client, email, référence..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
          />
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>🔍</span>
        </div>
        {search && (
          <button onClick={() => setSearch('')} style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--border-primary)', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
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
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
              {clients.length === 0 ? 'Aucun client' : 'Aucun résultat'}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {clients.length === 0 ? 'Créez un dossier pour ajouter des clients.' : 'Modifiez votre recherche.'}
            </p>
            {clients.length === 0 && (
              <Link href="/dossiers/nouveau" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                Créer un dossier
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Contrat</th>
                <th>Revenus</th>
                <th>Dossier</th>
                <th>Score</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => window.location.href = `/dossiers/${c.dossier_id}`} style={{ cursor: 'pointer' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'var(--brand-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {(c.nom_complet || 'C').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.nom_complet}</div>
                        {c.role === 'co_emprunteur' && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Co-emprunteur</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem' }}>
                      {c.email && <div style={{ color: 'var(--text-secondary)' }}>{c.email}</div>}
                      {c.telephone && <div style={{ color: 'var(--text-muted)', marginTop: '0.1rem' }}>{c.telephone}</div>}
                      {!c.email && !c.telephone && <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                      {CONTRAT_LABELS[c.type_contrat || ''] || c.type_contrat || '—'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{formatCurrency(c.salaire_net)}/mois</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.reference || c.dossier_id?.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {c.score_global ? (
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${getScoreColor(c.score_global)}20`, border: `2px solid ${getScoreColor(c.score_global)}`, fontSize: '0.65rem', fontWeight: 800, color: getScoreColor(c.score_global) }}>
                        {c.score_global}
                      </div>
                    ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    <span className={`badge ${STATUT_CLASSES[c.statut || ''] || 'badge-neutral'}`}>
                      {STATUT_LABELS[c.statut || ''] || c.statut || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
