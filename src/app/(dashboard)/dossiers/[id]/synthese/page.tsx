'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function formatCurrency(amount?: number) {
  if (!amount) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
}

function generateSynthese(dossier: any, emprunteurs: any[], projet: any, charges: any[]) {
  const nom = dossier?.nom_client || 'M./Mme Client';
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
  const score = dossier?.score_global;
  const risque = dossier?.niveau_risque;

  const contrats = emprunteurs.map((e: any) => e.type_contrat || 'NC').join(', ');
  const nbEmprunteurs = emprunteurs.length;

  const sections = {
    presentation: `${nbEmprunteurs > 1 ? 'Les emprunteurs sont' : 'L\'emprunteur est'} ${emprunteurs.map((e: any) => `${e.prenom || ''} ${e.nom || ''}`.trim()).join(' et ') || nom}. Ce dossier concerne un projet ${projet?.type_projet || 'd\'acquisition immobilière'} pour lequel notre cabinet sollicite votre accompagnement bancaire.`,
    
    situation_pro: `${nbEmprunteurs > 1 ? 'Les emprunteurs exercent' : 'L\'emprunteur exerce'} ${contrats ? 'en ' + contrats : 'une activité professionnelle'}. ${emprunteurs.length > 0 ? emprunteurs.map((e: any) => `${e.prenom || ''} ${e.nom || ''} perçoit ${formatCurrency(e.revenus_retenus || e.revenus_nets)} de revenus nets mensuels`).join(' et ') + '.' : ''} La situation professionnelle présente ${contrats.includes('CDI') || contrats.includes('Fonctionnaire') ? 'une stabilité satisfaisante' : 'un profil à examiner'} pour ce type de financement.`,
    
    situation_financiere: `Le foyer dispose de revenus retenus de ${formatCurrency(revenus)}/mois. ${totalCharges > 0 ? `Les charges mensuelles existantes s\'élèvent à ${formatCurrency(totalCharges)}/mois.` : 'Aucune charge mensuelle significative n\'a été identifiée.'} La mensualité du prêt envisagé est estimée à ${formatCurrency(Math.round(mensualite))}/mois, portant le taux d\'endettement global à ${tauxEnde}%.`,
    
    projet: `Le projet porte sur ${projet?.type_projet || 'une acquisition'} d\'un montant de ${formatCurrency(prixBien)}${projet?.montant_travaux ? ` (dont ${formatCurrency(projet.montant_travaux)} de travaux)` : ''}. L\'apport personnel mobilisé est de ${formatCurrency(apport)}${prixBien ? ` (${Math.round(apport / prixBien * 100)}% du prix d\'acquisition)` : ''}. Le besoin de financement sollicité est de ${formatCurrency(besoin)} sur ${duree} ans.`,
    
    atouts: `Ce dossier présente plusieurs atouts notables : ${[
      apport / prixBien >= 0.10 ? `un apport solide de ${Math.round(apport / prixBien * 100)}%` : null,
      (contrats.includes('CDI') || contrats.includes('Fonctionnaire')) ? 'une situation professionnelle stable' : null,
      parseFloat(tauxEnde) <= 33 ? `un taux d\'endettement maîtrisé à ${tauxEnde}%` : null,
      score && score >= 70 ? `un score de qualité dossier favorable (${score}/100)` : null,
    ].filter(Boolean).join(', ') || 'à compléter après analyse approfondie'}.`,
    
    vigilance: `Points de vigilance à porter à votre attention : ${[
      parseFloat(tauxEnde) > 35 ? `taux d\'endettement ${tauxEnde}% légèrement supérieur à la norme bancaire` : null,
      apport / prixBien < 0.10 ? 'apport personnel limité' : null,
      totalCharges > revenus * 0.15 ? 'charges mensuelles significatives' : null,
      !(contrats.includes('CDI') || contrats.includes('Fonctionnaire')) ? 'profil professionnel atypique nécessitant analyse approfondie' : null,
    ].filter(Boolean).join(', ') || 'aucun point de vigilance majeur identifié à ce stade'}.`,
    
    conclusion: `Sur la base des éléments transmis et de notre analyse, ce dossier nous semble ${score ? (score >= 70 ? 'solide et présentable en banque dans les meilleures conditions' : score >= 50 ? 'recevable sous réserve des points signalés ci-dessus' : 'nécessitant quelques optimisations avant présentation') : 'à étudier'}. Nous restons disponibles pour tout complément d\'information. CortIA — Cabinet de courtage immobilier.`
  };

  return sections;
}

export default function SynthesePage({ params }: { params: { id: string } }) {
  const supabase = createClientComponentClient();
  const [sections, setSections] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dossierNom, setDossierNom] = useState('');

  const loadAndGenerate = async () => {
    setLoading(true);
    try {
      const [dossierRes, emprunteursRes, projetRes, chargesRes] = await Promise.all([
        supabase.from('dossiers').select('*').eq('id', params.id).single(),
        supabase.from('emprunteurs').select('*').eq('dossier_id', params.id),
        supabase.from('projets').select('*').eq('dossier_id', params.id).single(),
        supabase.from('charges').select('*').eq('dossier_id', params.id),
      ]);
      setDossierNom(dossierRes.data?.nom_client || 'Dossier');
      const result = generateSynthese(
        dossierRes.data || {},
        emprunteursRes.data || [],
        projetRes.data,
        chargesRes.data || []
      );
      setSections(result);
    } catch (e) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAndGenerate(); }, [params.id]);

  const handleCopy = () => {
    if (!sections) return;
    const text = [
      'NOTE BANCAIRE — ' + dossierNom.toUpperCase(),
      '',
      '1. PRÉSENTATION CLIENT',
      sections.presentation,
      '',
      '2. SITUATION PROFESSIONNELLE',
      sections.situation_pro,
      '',
      '3. SITUATION FINANCIÈRE',
      sections.situation_financiere,
      '',
      '4. PRÉSENTATION DU PROJET',
      sections.projet,
      '',
      '5. ATOUTS DU DOSSIER',
      sections.atouts,
      '',
      '6. POINTS DE VIGILANCE',
      sections.vigilance,
      '',
      '7. CONCLUSION COURTIER',
      sections.conclusion,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handleSave = async () => {
    if (!sections) return;
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profil } = await supabase.from('profils_utilisateurs').select('cabinet_id').eq('id', user!.id).single();
      const { data: existing } = await supabase.from('syntheses_ia').select('id').eq('dossier_id', params.id).single();
      const payload = { contenu: JSON.stringify(sections), updated_at: new Date().toISOString() };
      if (existing) {
        await supabase.from('syntheses_ia').update(payload).eq('dossier_id', params.id);
      } else {
        await supabase.from('syntheses_ia').insert({ ...payload, dossier_id: params.id, cabinet_id: profil?.cabinet_id });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const sectionLabels: Record<string, string> = {
    presentation: '1. Présentation client',
    situation_pro: '2. Situation professionnelle',
    situation_financiere: '3. Situation financière',
    projet: '4. Présentation du projet',
    atouts: '5. Atouts du dossier',
    vigilance: '6. Points de vigilance',
    conclusion: '7. Conclusion courtier',
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner" /><p>Génération de la synthèse...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">⊛ Synthèse banque</h1>
          <p className="page-subtitle">Note bancaire structurée en 7 sections — prête à transmettre</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={loadAndGenerate} style={{
            padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--border-primary)',
            borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)'
          }}>↻ Régénérer</button>
          <button onClick={handleCopy} style={{
            padding: '0.5rem 1rem', background: 'none', border: '1px solid var(--brand-blue)',
            borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--brand-blue)', fontWeight: 600
          }}>
            {copied ? '✓ Copié !' : '⎘ Copier la note'}
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Enregistrement...' : saved ? '✓ Enregistré' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {sections && (
        <div className="card">
          <div style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-primary)' }}>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              NOTE BANCAIRE
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {dossierNom.toUpperCase()}
            </div>
          </div>

          {Object.entries(sections).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '1.5rem' }}>
              <div style={{
                fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.05em', color: 'var(--brand-blue)', marginBottom: '0.5rem'
              }}>
                {sectionLabels[key] || key}
              </div>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>
                {value}
              </p>
            </div>
          ))}

          <div style={{
            marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-primary)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Généré automatiquement par CortIA — {new Date().toLocaleDateString('fr-FR')}
            </span>
            <button onClick={handleCopy} style={{
              padding: '0.5rem 1.25rem', background: 'var(--brand-blue)', color: 'white',
              border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
            }}>
              {copied ? '✓ Copié !' : '⎘ Copier la note complète'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
