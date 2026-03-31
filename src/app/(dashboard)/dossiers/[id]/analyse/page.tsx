'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AnalyseData {
  revenus_retenus?: number;
  cout_total_projet?: number;
  besoin_financement?: number;
  mensualite_estimee?: number;
  taux_endettement?: number;
  reste_a_vivre?: number;
  reste_a_vivre_uc?: number;
  ratio_apport?: number;
  saut_de_charge?: number;
  score_global?: number;
  score_stabilite_pro?: number;
  score_endettement?: number;
  score_apport?: number;
  score_reste_a_vivre?: number;
  score_saut_charge?: number;
  niveau_risque?: string;
  points_forts?: string[];
  points_faibles?: string[];
  recommandations?: string[];
  axes_optimisation?: string[];
  lecture_metier?: string;
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

function computeAnalyse(dossier: any, emprunteurs: any[], projet: any, charges: any[]): AnalyseData {
  const revenus = emprunteurs.reduce((s: number, e: any) => s + (e.revenus_retenus || e.revenus_nets || 0), 0);
  const prixBien = projet?.prix_bien || 0;
  const travaux = projet?.montant_travaux || 0;
  const apport = projet?.apport_personnel || 0;
  const duree = projet?.duree_souhaitee || 20;
  const totalCharges = charges.reduce((s, c) => s + c.mensualite, 0);
  
  const coutTotal = prixBien + travaux;
  const besoin = Math.max(0, coutTotal - apport);
  const taux = 0.037; // 3.7% estimation
  const n = duree * 12;
  const mensualite = besoin > 0 && n > 0 ? (besoin * (taux / 12)) / (1 - Math.pow(1 + taux / 12, -n)) : 0;
  
  const totalMensualites = mensualite + totalCharges;
  const tauxEndettement = revenus > 0 ? (totalMensualites / revenus) * 100 : 0;
  const resteAVivre = revenus - totalMensualites;
  const nbUC = emprunteurs.length <= 1 ? 1 : 1.5;
  const resteAVivreUC = resteAVivre / nbUC;
  const ratioApport = coutTotal > 0 ? (apport / coutTotal) * 100 : 0;
  const sautDeCharge = mensualite - (charges.find((c: any) => c.type === 'loyer')?.mensualite || 0);

  // Scoring multi-dimensions
  const stabPro = emprunteurs.every((e: any) => e.type_contrat === 'CDI' || e.type_contrat === 'Fonctionnaire') ? 85 : 
    emprunteurs.some((e: any) => e.type_contrat === 'CDI') ? 65 : 40;
  
  const scoreEnde = tauxEndettement <= 28 ? 90 : tauxEndettement <= 33 ? 75 : tauxEndettement <= 35 ? 60 : tauxEndettement <= 40 ? 40 : 20;
  const scoreApport = ratioApport >= 20 ? 90 : ratioApport >= 10 ? 70 : ratioApport >= 5 ? 50 : 30;
  const scoreRAV = resteAVivreUC >= 1500 ? 90 : resteAVivreUC >= 1000 ? 75 : resteAVivreUC >= 700 ? 55 : 30;
  const scoreSaut = sautDeCharge <= 0 ? 90 : sautDeCharge <= 300 ? 75 : sautDeCharge <= 600 ? 55 : 35;
  
  const scoreGlobal = Math.round(stabPro * 0.25 + scoreEnde * 0.30 + scoreApport * 0.20 + scoreRAV * 0.15 + scoreSaut * 0.10);
  
  const risque = scoreGlobal >= 75 ? 'faible' : scoreGlobal >= 55 ? 'moyen' : scoreGlobal >= 35 ? 'eleve' : 'critique';
  
  const pointsForts: string[] = [];
  const pointsFaibles: string[] = [];
  const recommandations: string[] = [];
  const axesOpti: string[] = [];

  if (stabPro >= 75) pointsForts.push('Stabilité professionnelle solide (CDI / Fonctionnaire)');
  else if (stabPro < 50) pointsFaibles.push('Situation professionnelle précaire (CDD / Indépendant)');

  if (tauxEndettement <= 33) pointsForts.push(`Taux d'endettement maîtrisé (${tauxEndettement.toFixed(1)}%)`);
  else { pointsFaibles.push(`Taux d'endettement élevé (${tauxEndettement.toFixed(1)}%)`); axesOpti.push('Augmenter l\'apport pour réduire l\'endettement'); axesOpti.push('Allonger la durée du prêt'); }

  if (ratioApport >= 10) pointsForts.push(`Apport personnel significatif (${ratioApport.toFixed(0)}%)`);
  else { pointsFaibles.push(`Apport insuffisant (${ratioApport.toFixed(0)}%)`); axesOpti.push('Augmenter l\'apport personnel'); }

  if (resteAVivreUC >= 1000) pointsForts.push(`Reste à vivre confortable (${formatCurrency(resteAVivreUC)}/UC)`);
  else { pointsFaibles.push(`Reste à vivre tendu (${formatCurrency(resteAVivreUC)}/UC)`); axesOpti.push('Solder certains crédits en cours'); }

  const chargesSoldables = charges.filter(c => c.soldable);
  if (chargesSoldables.length > 0) {
    axesOpti.push(`Solder les crédits soldables (${chargesSoldables.map(c => c.libelle).join(', ')})`);
  }
  if (scoreGlobal < 60) {
    recommandations.push('Renforcer le dossier avant présentation en banque');
    recommandations.push('Consulter les axes d\'optimisation ci-dessous');
  } else {
    recommandations.push('Dossier présentable. Cibler des banques compatibles avec le profil.');
  }

  const lecture = scoreGlobal >= 75 ? 'Dossier solide' : scoreGlobal >= 55 ? 'Acceptable avec ajustements' : scoreGlobal >= 35 ? 'Dossier fragile' : 'À reprendre';

  return {
    revenus_retenus: revenus, cout_total_projet: coutTotal, besoin_financement: besoin,
    mensualite_estimee: Math.round(mensualite), taux_endettement: Math.round(tauxEndettement * 10) / 10,
    reste_a_vivre: Math.round(resteAVivre), reste_a_vivre_uc: Math.round(resteAVivreUC),
    ratio_apport: Math.round(ratioApport * 10) / 10, saut_de_charge: Math.round(sautDeCharge),
    score_global: scoreGlobal, score_stabilite_pro: stabPro, score_endettement: scoreEnde,
    score_apport: scoreApport, score_reste_a_vivre: scoreRAV, score_saut_charge: scoreSaut,
    niveau_risque: risque, points_forts: pointsForts, points_faibles: pointsFaibles,
    recommandations, axes_optimisation: axesOpti, lecture_metier: lecture,
  };
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color }}>{value}/100</span>
      </div>
      <div style={{ height: '6px', background: 'var(--border-primary)', borderRadius: '3px' }}>
        <div style={{ height: '100%', width: `${value}%`, background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function AnalysePage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const [analyse, setAnalyse] = useState<AnalyseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadAndCompute = async () => {
    setLoading(true);
    try {
      const [dossierRes, emprunteursRes, projetRes, chargesRes] = await Promise.all([
        supabase.from('dossiers').select('*').eq('id', params.id).single(),
        supabase.from('emprunteurs').select('*').eq('dossier_id', params.id),
        supabase.from('projets').select('*').eq('dossier_id', params.id).single(),
        supabase.from('charges').select('*').eq('dossier_id', params.id),
      ]);
      const result = computeAnalyse(
        dossierRes.data || {},
        emprunteursRes.data || [],
        projetRes.data,
        chargesRes.data || []
      );
      setAnalyse(result);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAndCompute(); }, [params.id]);

  const handleSave = async () => {
    if (!analyse) return;
    setSaving(true);
    try {
      await supabase.from('dossiers').update({
        score_global: analyse.score_global,
        niveau_risque: analyse.niveau_risque,
        taux_endettement: analyse.taux_endettement,
        mensualite_estimee: analyse.mensualite_estimee,
        reste_a_vivre: analyse.reste_a_vivre,
        besoin_financement: analyse.besoin_financement,
        updated_at: new Date().toISOString(),
      }).eq('id', params.id);

      const { data: existing } = await supabase.from('analyses_financieres').select('id').eq('dossier_id', params.id).single();
      const payload = {
        revenus_retenus: analyse.revenus_retenus,
        mensualite_estimee: analyse.mensualite_estimee,
        taux_endettement: analyse.taux_endettement,
        reste_a_vivre: analyse.reste_a_vivre,
        score_global: analyse.score_global,
        niveau_risque: analyse.niveau_risque,
        updated_at: new Date().toISOString(),
      };
      if (existing) {
        await supabase.from('analyses_financieres').update(payload).eq('dossier_id', params.id);
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        const { data: profil } = await supabase.from('profils_utilisateurs').select('cabinet_id').eq('id', user!.id).single();
        await supabase.from('analyses_financieres').insert({ ...payload, dossier_id: params.id, cabinet_id: profil?.cabinet_id });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Calcul en cours...</p></div>;
  if (!analyse) return <div className="page-container"><p>Données insuffisantes pour l'analyse.</p></div>;

  const globalColor = getScoreColor(analyse.score_global);
  const lectureClass = (analyse.score_global || 0) >= 75 ? 'lecture-metier-solide' : (analyse.score_global || 0) >= 55 ? 'lecture-metier-acceptable' : (analyse.score_global || 0) >= 35 ? 'lecture-metier-fragile' : 'lecture-metier-a-reprendre';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">◈ Analyse financière</h1>
          <p className="page-subtitle">Scoring multi-dimensionnel et lecture métier CortIA</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={loadAndCompute} style={{
            padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--border-primary)',
            borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)'
          }}>
            ↻ Recalculer
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer l\'analyse'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Score global */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Score global</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '5rem', height: '5rem', borderRadius: '50%', flexShrink: 0,
              border: `4px solid ${globalColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: `${globalColor}15`
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: globalColor, lineHeight: 1 }}>{analyse.score_global}</div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>/100</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {analyse.lecture_metier}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                Risque {analyse.niveau_risque === 'faible' ? '🟢 Faible' : analyse.niveau_risque === 'moyen' ? '🟡 Moyen' : analyse.niveau_risque === 'eleve' ? '🔴 Élevé' : '⛔ Critique'}
              </div>
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>SCORING DÉTAILLÉ</div>
            <ScoreBar label="Stabilité professionnelle" value={analyse.score_stabilite_pro || 0} color={getScoreColor(analyse.score_stabilite_pro)} />
            <ScoreBar label="Endettement" value={analyse.score_endettement || 0} color={getScoreColor(analyse.score_endettement)} />
            <ScoreBar label="Apport personnel" value={analyse.score_apport || 0} color={getScoreColor(analyse.score_apport)} />
            <ScoreBar label="Reste à vivre" value={analyse.score_reste_a_vivre || 0} color={getScoreColor(analyse.score_reste_a_vivre)} />
            <ScoreBar label="Saut de charge" value={analyse.score_saut_charge || 0} color={getScoreColor(analyse.score_saut_charge)} />
          </div>
        </div>

        {/* Ratios clés */}
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>Ratios financiers</h2>
          {[
            { label: 'Revenus retenus', value: formatCurrency(analyse.revenus_retenus) + '/mois', icon: '€' },
            { label: 'Coût total projet', value: formatCurrency(analyse.cout_total_projet), icon: '⊞' },
            { label: 'Besoin financement', value: formatCurrency(analyse.besoin_financement), icon: '◧' },
            { label: 'Mensualité estimée', value: formatCurrency(analyse.mensualite_estimee) + '/mois', icon: '◉', alert: (analyse.taux_endettement || 0) > 35 },
            { label: "Taux d'endettement", value: (analyse.taux_endettement || 0) + '%', icon: '%', alert: (analyse.taux_endettement || 0) > 35 },
            { label: 'Reste à vivre', value: formatCurrency(analyse.reste_a_vivre) + '/mois', icon: '◈', alert: (analyse.reste_a_vivre || 0) < 800 },
            { label: 'Reste à vivre/UC', value: formatCurrency(analyse.reste_a_vivre_uc) + '/UC', icon: '◯' },
            { label: 'Ratio apport', value: (analyse.ratio_apport || 0) + '%', icon: '⊕' },
            { label: 'Saut de charge', value: formatCurrency(analyse.saut_de_charge) + '/mois', icon: '↑' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.5rem 0', borderBottom: '1px solid var(--border-primary)'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.icon} {item.label}
              </span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: item.alert ? 'var(--risk-high)' : 'var(--text-primary)' }}>
                {item.value} {item.alert && '⚠'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Points forts / faibles */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem', color: 'var(--risk-low)' }}>✓ Points forts</h2>
          {(analyse.points_forts || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Aucun point fort identifié</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(analyse.points_forts || []).map((pt, i) => (
                <li key={i} style={{
                  padding: '0.5rem 0.75rem', background: 'rgba(16, 185, 129, 0.08)',
                  borderRadius: '0.375rem', borderLeft: '3px solid var(--risk-low)',
                  fontSize: '0.875rem', color: 'var(--text-secondary)'
                }}>
                  {pt}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '1rem', color: 'var(--risk-high)' }}>⚠ Points de vigilance</h2>
          {(analyse.points_faibles || []).length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Aucun point de vigilance détecté</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {(analyse.points_faibles || []).map((pt, i) => (
                <li key={i} style={{
                  padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: '0.375rem', borderLeft: '3px solid var(--risk-high)',
                  fontSize: '0.875rem', color: 'var(--text-secondary)'
                }}>
                  {pt}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Axes d'optimisation */}
      {(analyse.axes_optimisation || []).length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 className="card-title" style={{ marginBottom: '1rem' }}>⊕ Axes d'optimisation</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {(analyse.axes_optimisation || []).map((axe, i) => (
              <div key={i} style={{
                padding: '0.75rem 1rem', background: 'var(--surface-secondary)',
                borderRadius: '0.5rem', border: '1px solid var(--border-primary)',
                fontSize: '0.875rem', color: 'var(--text-secondary)',
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem'
              }}>
                <span style={{ color: 'var(--brand-blue)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                {axe}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lecture métier */}
      <div className={`lecture-metier-bloc ${lectureClass}`} style={{ marginTop: '1.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          Lecture métier CortIA — {analyse.lecture_metier}
        </div>
        {(analyse.recommandations || []).map((r, i) => (
          <div key={i} style={{ fontSize: '0.875rem', opacity: 0.9 }}>→ {r}</div>
        ))}
      </div>
    </div>
  );
}
