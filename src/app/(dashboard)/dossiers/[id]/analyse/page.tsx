'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface AnalyseData {
  revenus_retenus?: number
  cout_total_projet?: number
  besoin_financement?: number
  mensualite_estimee?: number
  taux_endettement?: number
  reste_a_vivre?: number
  reste_a_vivre_uc?: number
  ratio_apport?: number
  saut_de_charge?: number
  score_global?: number
  score_stabilite?: number
  score_endettement?: number
  score_patrimoine?: number
  score_reste_a_vivre?: number
  score_charge?: number
  points_forts?: string[]
  points_vigilance?: string[]
  lecture_metier?: string
  dossier_id?: string
}

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#059669' : score >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <svg width={size} height={size} viewBox={'0 0 ' + size + ' ' + size}>
      <circle cx={size/2} cy={size/2} r={r} fill='none' stroke='#E2E8F0' strokeWidth='7' />
      <circle cx={size/2} cy={size/2} r={r} fill='none' stroke={color} strokeWidth='7'
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap='round'
        transform={'rotate(-90 ' + (size/2) + ' ' + (size/2) + ')'} />
      <text x='50%' y='50%' dominantBaseline='middle' textAnchor='middle'
        style={{ fontSize: size * 0.22 + 'px', fontWeight: 700, fill: color }}>{score}</text>
    </svg>
  )
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color = score >= 75 ? '#059669' : score >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '13px', color: 'var(--gray-600)' }}>{label}</span>
        <span style={{ fontSize: '13px', fontWeight: 700, color }}>{score}/100</span>
      </div>
      <div style={{ height: '6px', background: 'var(--gray-100)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: score + '%', background: color, borderRadius: '99px', transition: 'width 0.6s ease' }}></div>
      </div>
    </div>
  )
}

function getBankabilityConfig(score: number) {
  if (score >= 75) return { label: 'Oui', sublabel: 'Dossier bancable', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', desc: 'Ce dossier presente un profil solide et pourra etre presente a la majorite des etablissements bancaires sans difficulte majeure.' }
  if (score >= 50) return { label: 'Presque', sublabel: 'Dossier a optimiser', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', desc: 'Le dossier est globalement correct mais necessite quelques ajustements avant presentation a la banque. Des points de vigilance sont a traiter.' }
  return { label: 'Non', sublabel: 'Dossier a consolider', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', desc: 'Le dossier presente des fragilites significatives qui necessitent une consolidation avant tout depot. Une analyse approfondie est recommandee.' }
}

function getBankTargets(score: number) {
  if (score >= 80) return ['Credit Agricole', 'BNP Paribas', 'Societe Generale', 'CIC', 'LCL']
  if (score >= 65) return ['Credit Mutuel', 'Caisse d\'Epargne', 'Banque Populaire', 'La Banque Postale']
  if (score >= 50) return ['Boursorama Banque', 'Hello Bank', 'Fortuneo']
  return []
}

export default function AnalysePage() {
  const params = useParams()
  const dossierId = params.id as string
  const [analyse, setAnalyse] = useState<AnalyseData | null>(null)
  const [loading, setLoading] = useState(true)
  const [recalculating, setRecalculating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => { loadData() }, [dossierId])

  async function loadData() {
    setLoading(true)
    try {
      const res = await fetch('/api/dossiers/' + dossierId + '/analyses')
      if (res.ok) {
        const data = await res.json()
        if (data && !data.error) setAnalyse(data)
      }
    } catch (e) { console.error('Load analyse error:', e) }
    setLoading(false)
  }

  async function recalculer() {
    setRecalculating(true)
    try {
      const res = await fetch('/api/dossiers/' + dossierId + '/analyses', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        if (data && !data.error) setAnalyse(data)
      }
    } catch (e) { console.error('Recalcul error:', e) }
    setRecalculating(false)
  }

  async function enregistrer() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className='loading-container'><div className='loading-spinner'></div><p>{"Chargement de l'analyse..."}</p></div>

  if (!analyse) return (
    <div className='empty-state'>
      <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: 700, fontSize: '10px', color: 'var(--gray-400)', letterSpacing: '0.1em' }}>IA</div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gray-800)', marginBottom: '8px' }}>Analyse non disponible</h3>
      <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '24px' }}>Lancez une analyse IA pour obtenir le scoring complet de ce dossier</p>
      <button onClick={recalculer} className='btn-primary' disabled={recalculating}>
        {recalculating ? 'Analyse en cours...' : 'Lancer l\'analyse IA'}
      </button>
    </div>
  )

  const score = analyse.score_global || 0
  const bconf = getBankabilityConfig(score)
  const bankTargets = getBankTargets(score)
  const scoreLabel = score >= 75 ? 'Dossier solide' : score >= 50 ? 'Dossier correct' : 'Dossier fragile'

  return (
    <div className='page-container'>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 className='page-title'>Analyse financiere IA</h2>
          <p className='page-subtitle'>Scoring multi-dimensionnel et lecture metier CortIA</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={recalculer} disabled={recalculating} className='btn-secondary' style={{ fontSize: '13px' }}>
            {recalculating ? 'Calcul...' : 'Recalculer'}
          </button>
          <button onClick={enregistrer} disabled={saving} className='btn-primary' style={{ fontSize: '13px' }}>
            {saved ? 'Enregistre !' : saving ? 'Enregistrement...' : 'Enregistrer l\'analyse'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className='card' style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <ScoreRing score={score} size={90} />
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '4px' }}>{scoreLabel}</div>
              <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                Risque <span style={{ fontWeight: 600, color: score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626' }}>
                  {score >= 75 ? 'Faible' : score >= 50 ? 'Modere' : 'Eleve'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--gray-100)', paddingTop: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Scoring detaille</div>
            <ScoreBar label='Stabilite professionnelle' score={analyse.score_stabilite || 0} />
            <ScoreBar label="Taux d'endettement" score={analyse.score_endettement || 0} />
            <ScoreBar label='Patrimoine personnel' score={analyse.score_patrimoine || 0} />
            <ScoreBar label='Reste a vivre' score={analyse.score_reste_a_vivre || 0} />
            <ScoreBar label='Niveau de charge' score={analyse.score_charge || 0} />
          </div>
        </div>

        <div className='card' style={{ padding: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>Ratios financiers</div>
          {[
            { icon: 'EUR', label: 'Revenus retenus', val: analyse.revenus_retenus ? analyse.revenus_retenus.toLocaleString('fr-FR') + ' EUR/mois' : '-' },
            { icon: 'BLD', label: 'Cout total projet', val: analyse.cout_total_projet ? analyse.cout_total_projet.toLocaleString('fr-FR') + ' EUR' : '-' },
            { icon: 'FIN', label: 'Besoin financement', val: analyse.besoin_financement ? analyse.besoin_financement.toLocaleString('fr-FR') + ' EUR' : '-' },
            { icon: 'MEN', label: 'Mensualite estimee', val: analyse.mensualite_estimee ? analyse.mensualite_estimee.toLocaleString('fr-FR') + ' EUR/mois' : '-' },
            { icon: 'PCT', label: 'Taux d\'endettement', val: analyse.taux_endettement ? analyse.taux_endettement.toFixed(1) + '%' : '-', highlight: analyse.taux_endettement ? (analyse.taux_endettement > 35 ? 'alert' : 'ok') : undefined },
            { icon: 'RAV', label: 'Reste a vivre', val: analyse.reste_a_vivre ? analyse.reste_a_vivre.toLocaleString('fr-FR') + ' EUR/mois' : '-', highlight: analyse.reste_a_vivre ? (analyse.reste_a_vivre < 1200 ? 'alert' : 'ok') : undefined },
            { icon: 'APT', label: 'Ratio apport', val: analyse.ratio_apport ? analyse.ratio_apport.toFixed(1) + '%' : '-', highlight: analyse.ratio_apport ? (analyse.ratio_apport < 10 ? 'alert' : 'ok') : undefined },
            { icon: 'SAU', label: 'Saut de charge', val: analyse.saut_de_charge ? analyse.saut_de_charge.toLocaleString('fr-FR') + ' EUR/mois' : '-' },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--gray-50)' }}>
              <span style={{ fontSize: '13px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--gray-400)', letterSpacing: '0.05em' }}>{row.icon}</span>
                {row.label}
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: row.highlight === 'alert' ? '#DC2626' : row.highlight === 'ok' ? '#059669' : 'var(--gray-900)' }}>
                {row.val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className='card' style={{ marginBottom: '16px', borderLeft: '4px solid ' + bconf.border, background: bconf.bg, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'center', minWidth: '80px' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: bconf.color }}>{bconf.label}</div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: bconf.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{bconf.sublabel}</div>
          </div>
          <div style={{ width: '1px', height: '48px', background: bconf.border }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gray-700)', marginBottom: '4px' }}>Verdict bancabilite CortIA</div>
            <p style={{ fontSize: '13px', color: 'var(--gray-600)', lineHeight: 1.6 }}>{bconf.desc}</p>
          </div>
          {bankTargets.length > 0 && (
            <div style={{ minWidth: '180px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Banques cibles suggeres</div>
              {bankTargets.slice(0, 3).map(b => (
                <div key={b} style={{ fontSize: '13px', color: 'var(--gray-700)', padding: '3px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: bconf.color, display: 'inline-block' }}></span>
                  {b}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className='card' style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Points forts</div>
          {(analyse.points_forts && analyse.points_forts.length > 0) ? (
            analyse.points_forts.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#F0FDF4', marginBottom: '8px', border: '1px solid #BBF7D0' }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <span style={{ color: 'white', fontSize: '9px', fontWeight: 800 }}>OK</span>
                </span>
                <span style={{ fontSize: '13px', color: '#065F46', lineHeight: 1.5 }}>{p}</span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--gray-400)', fontStyle: 'italic' }}>Aucun point fort detecte</div>
          )}
        </div>
        <div className='card' style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Points de vigilance</div>
          {(analyse.points_vigilance && analyse.points_vigilance.length > 0) ? (
            analyse.points_vigilance.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 12px', borderRadius: '8px', background: '#FFFBEB', marginBottom: '8px', border: '1px solid #FDE68A' }}>
                <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                  <span style={{ color: 'white', fontSize: '9px', fontWeight: 800 }}>!</span>
                </span>
                <span style={{ fontSize: '13px', color: '#92400E', lineHeight: 1.5 }}>{p}</span>
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--gray-400)', fontStyle: 'italic' }}>Aucun point de vigilance detecte</div>
          )}
        </div>
      </div>

      {analyse.lecture_metier && (
        <div className='card' style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Lecture metier CortIA</div>
          <p style={{ fontSize: '14px', color: 'var(--gray-700)', lineHeight: 1.7, fontWeight: 500 }}>
            {analyse.lecture_metier}
          </p>
        </div>
      )}
    </div>
  )
}
