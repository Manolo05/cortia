'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Dossier {
  id: string
  reference?: string
  nom_client?: string
  statut: string
  score_global?: number
  niveau_risque?: string
  montant_projet?: number
  taux_endettement?: number
  reste_a_vivre?: number
  apport?: number
  saut_de_charge?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

interface Document {
  id: string
  nom: string
  statut: string
}

const STATUT_CONFIG: Record<string, { label: string; badge: string }> = {
  en_attente: { label: 'En attente', badge: 'badge-warning' },
  en_cours: { label: 'En cours', badge: 'badge-info' },
  analyse: { label: 'En analyse', badge: 'badge-purple' },
  accorde: { label: 'Accorde', badge: 'badge-success' },
  refuse: { label: 'Refuse', badge: 'badge-danger' },
  archive: { label: 'Archive', badge: 'badge-neutral' },
}

function getScoreColor(score?: number): string {
  if (!score) return '#94a3b8'
  if (score >= 75) return '#16a34a'
  if (score >= 55) return '#0ea5e9'
  if (score >= 40) return '#ca8a04'
  return '#dc2626'
}

function getScoreBg(score?: number): string {
  if (!score) return 'var(--surface-2)'
  if (score >= 75) return '#f0fdf4'
  if (score >= 55) return '#f0f9ff'
  if (score >= 40) return '#fefce8'
  return '#fef2f2'
}

function getRisqueLabel(score?: number): string {
  if (!score) return 'Non evalue'
  if (score >= 75) return 'Risque faible'
  if (score >= 55) return 'Risque modere'
  if (score >= 40) return 'Risque moyen'
  return 'Risque eleve'
}

function getRisqueBadge(score?: number): string {
  if (!score) return 'badge-neutral'
  if (score >= 75) return 'badge-success'
  if (score >= 55) return 'badge-info'
  if (score >= 40) return 'badge-warning'
  return 'badge-danger'
}

function formatCurrency(amount?: number): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function ScoreRing({ score }: { score: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = getScoreColor(score)
  return (
    <svg width="120" height="120" viewBox="0 0 120 120">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="9" />
      <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={String(dash) + ' ' + String(circ - dash)}
        strokeDashoffset={String(circ * 0.25)} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease' }}
      />
      <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fill={color}>{score}</text>
      <text x="60" y="72" textAnchor="middle" fontSize="11" fill="var(--text-muted)">/100</text>
    </svg>
  )
}

export default function DossierResumePage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: d } = await supabase.from('dossiers').select('*').eq('id', id).single()
        setDossier(d)
        const { data: docData } = await supabase.from('documents').select('id, nom, statut').eq('dossier_id', id)
        setDocs(docData || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Chargement du dossier...</p>
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">!</div>
        <div className="empty-state-title">Dossier introuvable</div>
        <Link href="/dossiers" className="btn-ghost" style={{ marginTop: '16px' }}>Retour aux dossiers</Link>
      </div>
    )
  }

  const sc = STATUT_CONFIG[dossier.statut] || STATUT_CONFIG.en_attente
  const score = dossier.score_global || 0
  const docsValides = docs.filter(d => d.statut === 'valide').length
  const docsTotal = docs.length

  const pointsForts: string[] = []
  const pointsVigilance: string[] = []

  if ((dossier.taux_endettement || 0) > 0 && (dossier.taux_endettement || 0) <= 33) pointsForts.push('Taux d endettement maitrise (' + dossier.taux_endettement + '%)')
  if ((dossier.taux_endettement || 0) > 33) pointsVigilance.push('Taux d endettement eleve (' + dossier.taux_endettement + '%)')
  if ((dossier.reste_a_vivre || 0) > 1500) pointsForts.push('Reste a vivre confortable (' + formatCurrency(dossier.reste_a_vivre) + ')')
  if ((dossier.reste_a_vivre || 0) > 0 && (dossier.reste_a_vivre || 0) <= 800) pointsVigilance.push('Reste a vivre faible (' + formatCurrency(dossier.reste_a_vivre) + ')')
  if ((dossier.apport || 0) > 10000) pointsForts.push('Apport present (' + formatCurrency(dossier.apport) + ')')
  if (docsTotal > 0 && docsValides === docsTotal) pointsForts.push('Dossier documentaire complet (' + docsTotal + ' docs valides)')
  if (docsTotal > 0 && docsValides < docsTotal) pointsVigilance.push((docsTotal - docsValides) + ' document(s) en attente de validation')
  if (score >= 75) pointsForts.push('Score de financiabilite solide')
  if (score > 0 && score < 40) pointsVigilance.push('Score de financiabilite faible - verification requise')

  const actions: { label: string; href: string; variant: string }[] = []
  if (docsValides < docsTotal) actions.push({ label: 'Completer les documents', href: '/dossiers/' + id + '/documents', variant: 'btn-primary' })
  if (score === 0) actions.push({ label: 'Lancer l analyse IA', href: '/dossiers/' + id + '/analyse', variant: 'btn-primary' })
  if (score > 0) actions.push({ label: 'Voir l analyse IA', href: '/dossiers/' + id + '/analyse', variant: 'btn-ghost' })
  actions.push({ label: 'Controle docs', href: '/dossiers/' + id + '/controle-docs', variant: 'btn-ghost' })
  if (score >= 60) actions.push({ label: 'Synthese banque', href: '/dossiers/' + id + '/synthese', variant: 'btn-success' })

  const timeline = [
    { label: 'Creation', done: true, date: dossier.created_at ? new Date(dossier.created_at).toLocaleDateString('fr-FR') : '' },
    { label: 'Collecte docs', done: docsTotal > 0, date: docsTotal > 0 ? docsValides + '/' + docsTotal : '' },
    { label: 'Analyse IA', done: score > 0, date: score > 0 ? score + '/100' : '' },
    { label: 'Corrections', done: score > 0 && pointsVigilance.length === 0, date: '' },
    { label: 'Pret banque', done: score >= 70, date: score >= 70 ? 'Score OK' : '' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 1fr', gap: '20px', alignItems: 'start' }}>
        <div className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
            {score > 0 ? <ScoreRing score={score} /> : (
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                Non analyse
              </div>
            )}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Score global</div>
          <span className={'badge ' + getRisqueBadge(score)} style={{ fontSize: '11px' }}>{getRisqueLabel(score)}</span>
          {score >= 70 && (
            <div style={{ marginTop: '12px', padding: '6px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#16a34a' }}>
              Pret pour la banque
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <h2 className="card-title">Resume instantane</h2>
            <span className={'badge ' + sc.badge}>{sc.label}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'Endettement', value: dossier.taux_endettement ? dossier.taux_endettement + '%' : '-', alert: (dossier.taux_endettement || 0) > 33 },
              { label: 'Reste a vivre', value: formatCurrency(dossier.reste_a_vivre), alert: (dossier.reste_a_vivre || 0) > 0 && (dossier.reste_a_vivre || 0) < 800 },
              { label: 'Apport', value: formatCurrency(dossier.apport), alert: false },
              { label: 'Montant projet', value: formatCurrency(dossier.montant_projet), alert: false },
              { label: 'Saut de charge', value: dossier.saut_de_charge ? formatCurrency(dossier.saut_de_charge) : '-', alert: (dossier.saut_de_charge || 0) > 500 },
              { label: 'Documents', value: docsTotal > 0 ? docsValides + '/' + docsTotal + ' valides' : 'Aucun', alert: docsTotal > 0 && docsValides < docsTotal },
            ].map((item, i) => (
              <div key={i} style={{ padding: '12px', background: item.alert ? 'var(--risk-medium-bg)' : 'var(--surface-2)', borderRadius: '8px', border: '1px solid ' + (item.alert ? 'var(--risk-medium-border)' : 'var(--border-light)') }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: item.alert ? '#ca8a04' : 'var(--text-primary)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '12px', color: '#16a34a' }}>Points forts</h2>
            {pointsForts.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>A completer apres analyse</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pointsForts.map((p, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#16a34a', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, fontWeight: 700 }}>+</span>{p}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '12px', color: '#dc2626' }}>Points de vigilance</h2>
            {pointsVigilance.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#16a34a' }}>Aucun point de vigilance identifie</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pointsVigilance.map((p, i) => (
                  <li key={i} style={{ fontSize: '13px', color: '#dc2626', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <span style={{ flexShrink: 0, fontWeight: 700 }}>!</span>{p}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <h2 className="card-title">Actions recommandees</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actions.map((action, i) => (
              <Link key={i} href={action.href} className={action.variant} style={{ textDecoration: 'none', textAlign: 'center' }}>
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header" style={{ marginBottom: '16px' }}>
            <h2 className="card-title">Timeline dossier</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {timeline.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: i < timeline.length - 1 ? '16px' : '0', position: 'relative' }}>
                {i < timeline.length - 1 && (
                  <div style={{ position: 'absolute', left: '11px', top: '24px', bottom: 0, width: '2px', background: step.done ? '#16a34a' : 'var(--border-light)' }} />
                )}
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: step.done ? '#16a34a' : 'var(--surface-3)', border: '2px solid ' + (step.done ? '#16a34a' : 'var(--border-default)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                  {step.done && <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>v</span>}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: step.done ? 600 : 400, color: step.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>{step.label}</div>
                  {step.date && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{step.date}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {dossier.notes && (
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '12px' }}>Notes</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{dossier.notes}</p>
        </div>
      )}
    </div>
  )
}
