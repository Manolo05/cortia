'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Dossier {
  id: string;
  reference?: string;
  nom_client?: string;
  email_client?: string;
  telephone_client?: string;
  statut: string;
  score_global?: number;
  niveau_risque?: string;
  montant_projet?: number;
  besoin_financement?: number;
  taux_endettement?: number;
  mensualite_estimee?: number;
  reste_a_vivre?: number;
  apport?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface Emprunteur {
  id: string;
  prenom: string;
  nom: string;
  type_contrat?: string;
  revenus_nets?: number;
  revenus_retenus?: number;
}

interface Projet {
  id: string;
  type_projet?: string;
  prix_bien?: number;
  montant_travaux?: number;
  apport_personnel?: number;
  duree_souhaitee?: number;
}

function formatCurrency(amount?: number) {
  if (!amount) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
  if (score >= 75) return 'Dossier solide';
  if (score >= 55) return 'Acceptable avec ajustements';
  if (score >= 35) return 'Dossier fragile';
  return 'À reprendre';
}

function getLectureClass(score?: number) {
  if (!score) return 'lecture-metier-acceptable';
  if (score >= 75) return 'lecture-metier-solide';
  if (score >= 55) return 'lecture-metier-acceptable';
  if (score >= 35) return 'lecture-metier-fragile';
  return 'lecture-metier-a-reprendre';
}

export default function DossierPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const [dossier, setDossier] = useState<Dossier | null>(null);
  const [emprunteurs, setEmprunteurs] = useState<Emprunteur[]>([]);
  const [projet, setProjet] = useState<Projet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [dossierRes, emprunteursRes, projetRes] = await Promise.all([
          supabase.from('dossiers').select('*').eq('id', params.id).single(),
          supabase.from('emprunteurs').select('*').eq('dossier_id', params.id),
          supabase.from('projets').select('*').eq('dossier_id', params.id).single(),
        ]);
        setDossier(dossierRes.data);
        setEmprunteurs(emprunteursRes.data || []);
        setProjet(projetRes.data);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [supabase, params.id]);

  if (loading) {
    return <div className="loading-container"><div className="loading-spinner" /><p>Chargement du dossier...</p></div>;
  }

  if (!dossier) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <p style={{ fontSize: '1.5rem' }}>◧</p>
          <p style={{ fontWeight: 600 }}>Dossier introuvable</p>
          <Link href="/dossiers" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>Retour aux dossiers</Link>
        </div>
      </div>
    );
  }

  const totalRevenus = emprunteurs.reduce((s, e) => s + (e.revenus_retenus || e.revenus_nets || 0), 0);
  const tauxEndettemnt = dossier.taux_endettement;

  return (
    <div className="page-container">
      {/* Lecture métier CortIA */}
      {dossier.score_global && (
        <div className={`lecture-metier-bloc ${getLectureClass(dossier.score_global)}`} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '50%', flexShrink: 0,
              border: `2.5px solid ${getScoreColor(dossier.score_global)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 800, color: getScoreColor(dossier.score_global),
            }}>
              {dossier.score_global}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Lecture métier CortIA — {getScoreLabel(dossier.score_global)}</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.15rem' }}>
                {dossier.score_global >= 75 && "Ce dossier présente de bons fondamentaux. Présentation banque possible sans ajustement majeur."}
                {dossier.score_global >= 55 && dossier.score_global < 75 && "Dossier recevable avec quelques points à renforcer. Consultez l'onglet Analyse pour les axes d'optimisation."}
                {dossier.score_global >= 35 && dossier.score_global < 55 && "Dossier fragile nécessitant des ajustements avant présentation banque. Voir recommandations."}
                {dossier.score_global < 35 && "Dossier à reprendre avant toute présentation. Des éléments fondamentaux sont à corriger."}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Client info */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">◯ Informations client</h2>
              <Link href={`/dossiers/${params.id}/emprunteurs`} style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', textDecoration: 'none' }}>
                Modifier →
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Nom du client</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dossier.nom_client || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email</div>
                <div style={{ fontSize: '0.875rem' }}>{dossier.email_client || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Téléphone</div>
                <div style={{ fontSize: '0.875rem' }}>{dossier.telephone_client || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Dossier créé le</div>
                <div style={{ fontSize: '0.875rem' }}>{formatDate(dossier.created_at)}</div>
              </div>
            </div>

            {emprunteurs.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-primary)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Emprunteurs</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {emprunteurs.map(e => (
                    <div key={e.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.375rem 0.75rem', background: 'var(--surface-secondary)',
                      borderRadius: '0.375rem', border: '1px solid var(--border-primary)'
                    }}>
                      <div style={{
                        width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                        background: 'var(--brand-blue)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'white'
                      }}>
                        {e.prenom?.charAt(0)}{e.nom?.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{e.prenom} {e.nom}</div>
                        {e.type_contrat && <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{e.type_contrat}</div>}
                      </div>
                      {(e.revenus_retenus || e.revenus_nets) && (
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--risk-low)', marginLeft: '0.5rem' }}>
                          {formatCurrency(e.revenus_retenus || e.revenus_nets)}/mois
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Projet */}
          {projet && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">⊞ Projet immobilier</h2>
                <Link href={`/dossiers/${params.id}/projet`} style={{ fontSize: '0.75rem', color: 'var(--brand-blue)', textDecoration: 'none' }}>
                  Modifier →
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Type de projet</div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{projet.type_projet || '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Prix du bien</div>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(projet.prix_bien)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Apport personnel</div>
                  <div style={{ fontWeight: 600, color: 'var(--risk-low)' }}>{formatCurrency(projet.apport_personnel)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Montant travaux</div>
                  <div style={{ fontWeight: 600 }}>{formatCurrency(projet.montant_travaux)}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Durée souhaitée</div>
                  <div style={{ fontWeight: 600 }}>{projet.duree_souhaitee ? `${projet.duree_souhaitee} ans` : '—'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Besoin financement</div>
                  <div style={{ fontWeight: 600, color: 'var(--brand-blue)' }}>{formatCurrency(dossier.besoin_financement)}</div>
                </div>
              </div>
            </div>
          )}

          {dossier.notes && (
            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>◎ Notes</h2>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{dossier.notes}</p>
            </div>
          )}
        </div>

        {/* Right column - KPIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Ratios clés */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>◈ Ratios clés</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {[
                { label: 'Taux endettement', value: tauxEndettemnt ? `${tauxEndettemnt.toFixed(1)}%` : '—', alert: tauxEndettemnt && tauxEndettemnt > 35 },
                { label: 'Mensualité estimée', value: formatCurrency(dossier.mensualite_estimee) },
                { label: 'Reste à vivre', value: formatCurrency(dossier.reste_a_vivre), alert: dossier.reste_a_vivre && dossier.reste_a_vivre < 800 },
                { label: 'Revenus retenus', value: totalRevenus ? formatCurrency(totalRevenus) + '/mois' : '—' },
                { label: 'Apport', value: dossier.apport ? formatCurrency(dossier.apport) : formatCurrency(projet?.apport_personnel) },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.625rem', borderBottom: '1px solid var(--border-primary)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: item.alert ? 'var(--risk-high)' : 'var(--text-primary)' }}>
                    {item.value}
                    {item.alert && <span style={{ marginLeft: '0.25rem' }}>⚠</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>Actions rapides</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {[
                { label: '◈ Lancer l\'analyse', href: `/dossiers/${params.id}/analyse` },
                { label: '⊕ Contrôle documents', href: `/dossiers/${params.id}/controle-docs` },
                { label: '⊛ Synthèse banque', href: `/dossiers/${params.id}/synthese` },
                { label: '↗ Exporter', href: `/dossiers/${params.id}/export` },
              ].map((action, i) => (
                <Link key={i} href={action.href} style={{
                  display: 'block', padding: '0.625rem 0.875rem',
                  background: 'var(--surface-secondary)', border: '1px solid var(--border-primary)',
                  borderRadius: '0.375rem', textDecoration: 'none',
                  fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)',
                  transition: 'border-color 0.15s'
                }}>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
