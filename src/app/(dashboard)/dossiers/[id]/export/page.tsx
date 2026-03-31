'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function formatCurrency(amount?: number) {
  if (!amount) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

function generateNoteBancaire(dossier: any, emprunteurs: any[], projet: any, charges: any[]): string {
  const nom = dossier?.nom_client || 'Client';
  const revenus = emprunteurs.reduce((s: number, e: any) => s + (e.revenus_retenus || e.revenus_nets || 0), 0);
  const totalCharges = charges.reduce((s, c) => s + c.mensualite, 0);
  const prixBien = projet?.prix_bien || dossier?.montant_projet || 0;
  const apport = projet?.apport_personnel || 0;
  const besoin = Math.max(0, prixBien - apport);
  const duree = projet?.duree_souhaitee || 20;
  const taux = 0.037;
  const n = duree * 12;
  const mensualite = besoin > 0 ? (besoin * (taux / 12)) / (1 - Math.pow(1 + taux / 12, -n)) : 0;
  const tauxEnde = revenus > 0 ? ((mensualite + totalCharges) / revenus * 100).toFixed(1) : '—';

  return `NOTE BANCAIRE — ${nom.toUpperCase()}

1. PRÉSENTATION CLIENT
${emprunteurs.map((e: any) => `${e.prenom || ''} ${e.nom || ''}`.trim()).join(' et ') || nom} — Dossier de financement immobilier.

2. SITUATION PROFESSIONNELLE
${emprunteurs.map((e: any) => `${e.prenom || ''} ${e.nom || ''} : ${e.type_contrat || 'NC'} — Revenus nets : ${formatCurrency(e.revenus_retenus || e.revenus_nets)}/mois`).join('\n') || 'À compléter.'}

3. SITUATION FINANCIÈRE
Revenus retenus : ${formatCurrency(revenus)}/mois
Charges mensuelles : ${formatCurrency(totalCharges)}/mois
Mensualité estimée : ${formatCurrency(Math.round(mensualite))}/mois
Taux d'endettement : ${tauxEnde}%

4. PRÉSENTATION DU PROJET
Type : ${projet?.type_projet || 'Acquisition'}
Prix du bien : ${formatCurrency(prixBien)}
Apport : ${formatCurrency(apport)} (${prixBien ? Math.round(apport / prixBien * 100) : 0}%)
Besoin financement : ${formatCurrency(besoin)} sur ${duree} ans

5. ATOUTS
Score dossier CortIA : ${dossier?.score_global || '—'}/100
Niveau de risque : ${dossier?.niveau_risque || '—'}

6. CONCLUSION
Dossier présenté par notre cabinet. Document généré le ${new Date().toLocaleDateString('fr-FR')} — CortIA.`;
}

function generateFicheClient(dossier: any, emprunteurs: any[], projet: any): string {
  return `FICHE CLIENT — ${(dossier?.nom_client || 'Client').toUpperCase()}

Client : ${dossier?.nom_client || '—'}
Email : ${dossier?.email_client || '—'}
Téléphone : ${dossier?.telephone_client || '—'}

EMPRUNTEURS
${emprunteurs.map((e: any) => `- ${e.prenom || ''} ${e.nom || ''} | ${e.type_contrat || 'NC'} | ${formatCurrency(e.revenus_retenus || e.revenus_nets)}/mois`).join('\n') || '— Non renseigné'}

PROJET
Type : ${projet?.type_projet || '—'}
Prix : ${formatCurrency(projet?.prix_bien)}
Apport : ${formatCurrency(projet?.apport_personnel)}
Durée : ${projet?.duree_souhaitee || '—'} ans

Réf. dossier : ${dossier?.reference || dossier?.id?.slice(0, 8).toUpperCase()}
Généré par CortIA le ${new Date().toLocaleDateString('fr-FR')}`;
}

export default function ExportPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const [dossier, setDossier] = useState<any>(null);
  const [emprunteurs, setEmprunteurs] = useState<any[]>([]);
  const [projet, setProjet] = useState<any>(null);
  const [charges, setCharges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [dRes, eRes, pRes, cRes] = await Promise.all([
          supabase.from('dossiers').select('*').eq('id', params.id).single(),
          supabase.from('emprunteurs').select('*').eq('dossier_id', params.id),
          supabase.from('projets').select('*').eq('dossier_id', params.id).single(),
          supabase.from('charges').select('*').eq('dossier_id', params.id),
        ]);
        setDossier(dRes.data);
        setEmprunteurs(eRes.data || []);
        setProjet(pRes.data);
        setCharges(cRes.data || []);
      } catch (e) {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params.id]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 3000);
    });
  };

  const exportActions = [
    {
      id: 'note-bancaire',
      icon: '⊛',
      label: 'Copier la note bancaire',
      description: 'Note bancaire complète en 7 sections, prête à coller dans un email ou document Word.',
      color: 'var(--brand-blue)',
      action: () => handleCopy(generateNoteBancaire(dossier, emprunteurs, projet, charges), 'note-bancaire'),
    },
    {
      id: 'fiche-client',
      icon: '◯',
      label: 'Copier la fiche client',
      description: 'Résumé client structuré avec coordonnées, emprunteurs et projet.',
      color: 'var(--risk-low)',
      action: () => handleCopy(generateFicheClient(dossier, emprunteurs, projet), 'fiche-client'),
    },
    {
      id: 'resume',
      icon: '◉',
      label: 'Copier le résumé dossier',
      description: 'Résumé rapide des données clés du dossier pour usage interne.',
      color: '#8b5cf6',
      action: () => handleCopy(
        `RÉSUMÉ DOSSIER\n\nClient : ${dossier?.nom_client || '—'}\nMontant : ${formatCurrency(dossier?.montant_projet)}\nStatut : ${dossier?.statut || '—'}\nScore : ${dossier?.score_global || '—'}/100\nRisque : ${dossier?.niveau_risque || '—'}\nEndettement : ${dossier?.taux_endettement || '—'}%`,
        'resume'
      ),
    },
  ];

  const comingSoon = [
    { icon: '📄', label: 'Export PDF', description: 'Note bancaire en PDF formaté avec le logo du cabinet. (Bientôt disponible)' },
    { icon: '📊', label: 'Export Excel', description: 'Tableau de bord financier exportable. (Bientôt disponible)' },
    { icon: '🏦', label: 'Envoi banque', description: 'Envoi direct au réseau bancaire partenaire. (Bientôt disponible)' },
  ];

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Chargement...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">↗ Export</h1>
          <p className="page-subtitle">Exportez et partagez les informations du dossier</p>
        </div>
      </div>

      {/* Export disponible */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          EXPORT DISPONIBLE
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {exportActions.map(action => (
            <div key={action.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.5rem', background: 'var(--surface-elevated)',
              border: '1px solid var(--border-primary)', borderRadius: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.25rem', color: action.color }}>{action.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{action.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{action.description}</div>
                </div>
              </div>
              <button onClick={action.action} style={{
                padding: '0.5rem 1.25rem', background: copied === action.id ? 'var(--risk-low)' : action.color,
                color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', transition: 'background 0.2s'
              }}>
                {copied === action.id ? '✓ Copié !' : '⎘ Copier'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coming soon */}
      <div>
        <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
          PROCHAINEMENT
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {comingSoon.map((item, i) => (
            <div key={i} style={{
              padding: '1.25rem', background: 'var(--surface-secondary)',
              border: '1px solid var(--border-primary)', borderRadius: '0.75rem', opacity: 0.65
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.label}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div style={{
        marginTop: '1.5rem', padding: '0.875rem 1rem',
        background: 'var(--surface-secondary)', borderRadius: '0.5rem',
        fontSize: '0.78rem', color: 'var(--text-muted)', border: '1px solid var(--border-primary)'
      }}>
        💡 Les exports par copie sont disponibles immédiatement. Collez le contenu dans votre email, Word ou outil habituel. Les exports PDF et intégrations bancaires seront disponibles dans une prochaine version de CortIA.
      </div>
    </div>
  );
}
