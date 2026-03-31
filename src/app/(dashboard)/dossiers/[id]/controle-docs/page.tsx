'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AlerteDoc {
  categorie: string;
  titre: string;
  description: string;
  niveau: 'ok' | 'attention' | 'alerte';
}

interface ControleResult {
  score_fiabilite: number;
  resume: string;
  alertes: AlerteDoc[];
  recommandation: string;
}

function analyseDocumentaire(dossier: any, emprunteurs: any[], documents: any[]): ControleResult {
  const alertes: AlerteDoc[] = [];
  let score = 100;

  // Check documents présents
  const typesPresents = documents.map((d: any) => (d.type_document || '').toLowerCase());
  
  const docsRequis = [
    { type: 'identite', label: "Pièce d'identité", key: ['identite', 'cni', 'passeport'] },
    { type: 'revenus', label: 'Justificatifs de revenus (fiches de paie)', key: ['paie', 'salaire', 'revenus', 'fiche'] },
    { type: 'fiscal', label: 'Avis d'imposition', key: ['imposition', 'fiscal', 'impot', 'tax'] },
    { type: 'bancaire', label: 'Relevés bancaires', key: ['bancaire', 'releve', 'compte'] },
    { type: 'domicile', label: 'Justificatif de domicile', key: ['domicile', 'logement', 'quittance', 'facture'] },
  ];

  const manquants: string[] = [];
  docsRequis.forEach(doc => {
    const present = typesPresents.some(t => doc.key.some(k => t.includes(k)));
    if (!present) {
      manquants.push(doc.label);
      score -= 10;
    }
  });

  if (manquants.length > 0) {
    alertes.push({
      categorie: 'Pièces manquantes',
      titre: `${manquants.length} document(s) non fourni(s)`,
      description: 'Documents attendus non détectés dans le dossier : ' + manquants.join(', ') + '. Vérification recommandée.',
      niveau: manquants.length > 2 ? 'alerte' : 'attention',
    });
  }

  // Cohérence nominale
  if (emprunteurs.length > 0 && dossier?.nom_client) {
    const nomClient = (dossier.nom_client || '').toLowerCase();
    const hasCoherence = emprunteurs.some((e: any) => 
      nomClient.includes((e.nom || '').toLowerCase()) || 
      nomClient.includes((e.prenom || '').toLowerCase())
    );
    if (!hasCoherence) {
      alertes.push({
        categorie: 'Cohérence administrative',
        titre: 'Incohérence nominale potentielle',
        description: 'Le nom du dossier et les emprunteurs déclarés présentent une incohérence potentielle. Vérification des pièces d'identité recommandée.',
        niveau: 'attention',
      });
      score -= 8;
    }
  }

  // Cohérence revenus
  const hasRevenus = typesPresents.some(t => t.includes('paie') || t.includes('salaire') || t.includes('revenus'));
  const emprunteursAvecRevenus = emprunteurs.filter((e: any) => e.revenus_nets || e.revenus_retenus);
  if (hasRevenus && emprunteursAvecRevenus.length === 0) {
    alertes.push({
      categorie: 'Cohérence revenus',
      titre: 'Revenus non renseignés malgré documents fournis',
      description: 'Des justificatifs de revenus ont été déposés mais aucun montant de revenus n\'a été saisi pour les emprunteurs. Vérification et mise à jour recommandées.',
      niveau: 'attention',
    });
    score -= 5;
  }

  if (emprunteursAvecRevenus.length > 0 && !hasRevenus) {
    alertes.push({
      categorie: 'Cohérence revenus',
      titre: 'Revenus déclarés sans justificatifs',
      description: 'Des revenus ont été déclarés pour les emprunteurs, mais aucun justificatif de revenus n\'a été détecté. Vérification des documents recommandée.',
      niveau: 'alerte',
    });
    score -= 12;
  }

  // Signal de vigilance si peu de documents
  if (documents.length === 0) {
    alertes.push({
      categorie: 'Qualité documentaire',
      titre: 'Aucun document déposé',
      description: 'Le dossier ne contient aucun document. Un dossier complet est nécessaire avant toute présentation bancaire.',
      niveau: 'alerte',
    });
    score = 20;
  } else if (documents.length < 3) {
    alertes.push({
      categorie: 'Qualité documentaire',
      titre: 'Dossier documentaire incomplet',
      description: 'Peu de documents ont été déposés. Un dossier bancaire complet nécessite généralement 10 à 15 pièces justificatives.',
      niveau: 'attention',
    });
    score -= 8;
  }

  // Points positifs
  if (documents.length >= 8 && manquants.length === 0) {
    alertes.push({
      categorie: 'Qualité documentaire',
      titre: 'Dossier documentaire bien fourni',
      description: 'Le nombre et la diversité des documents déposés sont satisfaisants.',
      niveau: 'ok',
    });
  }

  const scoreFinal = Math.max(0, Math.min(100, score));
  const alertesFortes = alertes.filter(a => a.niveau === 'alerte').length;
  const alertesMoyennes = alertes.filter(a => a.niveau === 'attention').length;
  
  let resume = '';
  if (scoreFinal >= 80) resume = 'Le dossier documentaire présente une fiabilité élevée. Les pièces essentielles semblent présentes et cohérentes.';
  else if (scoreFinal >= 60) resume = `Quelques anomalies ou incohérences ont été détectées (${alertesMoyennes} signal(s) de vigilance). Une vérification ciblée est recommandée avant présentation banque.`;
  else resume = `Des anomalies significatives ont été détectées (${alertesFortes} alerte(s) forte(s)). Ce dossier nécessite une revue documentaire complète.`;

  let recommandation = '';
  if (scoreFinal >= 80) recommandation = 'Dossier documentaire de bonne qualité. Procéder à la vérification humaine finale avant présentation bancaire.';
  else if (scoreFinal >= 60) recommandation = 'Corriger les points signalés et compléter les pièces manquantes. Une revue humaine des documents est nécessaire.';
  else recommandation = 'Revue documentaire complète indispensable. Ne pas présenter ce dossier en banque sans correction préalable.';

  return { score_fiabilite: scoreFinal, resume, alertes, recommandation };
}

export default function ControleDocsPage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const [result, setResult] = useState<ControleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const runControle = async () => {
    setLoading(true);
    try {
      const [dossierRes, emprunteursRes, documentsRes] = await Promise.all([
        supabase.from('dossiers').select('*').eq('id', params.id).single(),
        supabase.from('emprunteurs').select('*').eq('dossier_id', params.id),
        supabase.from('documents').select('*').eq('dossier_id', params.id),
      ]);
      const res = analyseDocumentaire(
        dossierRes.data,
        emprunteursRes.data || [],
        documentsRes.data || []
      );
      setResult(res);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { runControle(); }, [params.id]);

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profil } = await supabase.from('profils_utilisateurs').select('cabinet_id').eq('id', user!.id).single();
      const { data: existing } = await supabase.from('controles_docs').select('id').eq('dossier_id', params.id).single();
      const payload = {
        score_fiabilite: result.score_fiabilite, resume_ia: result.resume,
        alertes: result.alertes, recommandation: result.recommandation,
        updated_at: new Date().toISOString(),
      };
      if (existing) {
        await supabase.from('controles_docs').update(payload).eq('dossier_id', params.id);
      } else {
        await supabase.from('controles_docs').insert({ ...payload, dossier_id: params.id, cabinet_id: profil?.cabinet_id });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => score >= 80 ? 'var(--risk-low)' : score >= 60 ? 'var(--risk-medium)' : 'var(--risk-high)';
  const getScoreLabel = (score: number) => score >= 80 ? '🟢 Fiabilité élevée' : score >= 60 ? '🟡 Quelques anomalies' : '🔴 Anomalies fortes';
  const getNiveauColor = (niveau: string) => niveau === 'ok' ? 'var(--risk-low)' : niveau === 'attention' ? 'var(--risk-medium)' : 'var(--risk-high)';
  const getNiveauBg = (niveau: string) => niveau === 'ok' ? 'rgba(16,185,129,0.08)' : niveau === 'attention' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)';
  const getNiveauLabel = (niveau: string) => niveau === 'ok' ? '✓ OK' : niveau === 'attention' ? '⚠ Signal de vigilance' : '⛔ Anomalie détectée';

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Analyse documentaire en cours...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">⊕ Contrôle documentaire IA</h1>
          <p className="page-subtitle">Détection d'anomalies, incohérences et signaux de vigilance</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={runControle} style={{
            padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--border-primary)',
            borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)'
          }}>↻ Relancer</button>
          <button onClick={handleSave} disabled={saving || !result} className="btn-primary">
            {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {result && (
        <>
          {/* Score de fiabilité */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="card" style={{ textAlign: 'center', minWidth: '180px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
                SCORE DE FIABILITÉ DOCUMENTAIRE
              </div>
              <div style={{
                width: '5rem', height: '5rem', borderRadius: '50%', margin: '0 auto 0.75rem',
                border: `4px solid ${getScoreColor(result.score_fiabilite)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${getScoreColor(result.score_fiabilite)}15`
              }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: getScoreColor(result.score_fiabilite), lineHeight: 1 }}>{result.score_fiabilite}</div>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>/100</div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: getScoreColor(result.score_fiabilite) }}>
                {getScoreLabel(result.score_fiabilite)}
              </div>
            </div>

            <div className="card">
              <h2 className="card-title" style={{ marginBottom: '0.75rem' }}>Résumé documentaire</h2>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{result.resume}</p>
              <div style={{
                marginTop: '1rem', padding: '0.75rem 1rem',
                background: `${getScoreColor(result.score_fiabilite)}10`,
                borderRadius: '0.5rem', borderLeft: `3px solid ${getScoreColor(result.score_fiabilite)}`,
                fontSize: '0.85rem', color: 'var(--text-secondary)'
              }}>
                <strong>Recommandation CortIA :</strong> {result.recommandation}
              </div>
            </div>
          </div>

          {/* Alertes */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '1rem' }}>
              Détail des contrôles ({result.alertes.length} élément{result.alertes.length > 1 ? 's' : ''})
            </h2>
            {result.alertes.length === 0 ? (
              <div className="empty-state">
                <p>✓ Aucune anomalie détectée</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {result.alertes.map((alerte, i) => (
                  <div key={i} style={{
                    padding: '1rem', background: getNiveauBg(alerte.niveau), borderRadius: '0.5rem',
                    borderLeft: `3px solid ${getNiveauColor(alerte.niveau)}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                          color: 'var(--text-muted)', letterSpacing: '0.05em'
                        }}>{alerte.categorie}</span>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.15rem' }}>
                          {alerte.titre}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '0.25rem', fontSize: '0.7rem', fontWeight: 700,
                        background: getNiveauBg(alerte.niveau), color: getNiveauColor(alerte.niveau),
                        border: `1px solid ${getNiveauColor(alerte.niveau)}40`, whiteSpace: 'nowrap'
                      }}>
                        {getNiveauLabel(alerte.niveau)}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                      {alerte.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{
            marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--surface-secondary)',
            borderRadius: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)',
            border: '1px solid var(--border-primary)'
          }}>
            ℹ️ <strong>CortIA Contrôle Documentaire</strong> est un outil d'aide à la vérification. Il détecte des incohérences potentielles et des signaux de vigilance. Toute décision finale doit être confirmée par un examen humain des pièces originales. Ce module ne constitue pas un audit légal ou une certification.
          </div>
        </>
      )}
    </div>
  );
}
