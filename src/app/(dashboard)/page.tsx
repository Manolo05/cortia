'use client'

import { useState, useEffect } from 'react'
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
  updated_at?: string
  taux_endettement?: number
}

const STATUT_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  en_attente: { label: 'En attente', badge: 'badge-warning', dot: '#ca8a04' },
  en_cours: { label: 'En cours', badge: 'badge-info', dot: '#0ea5e9' },
  analyse: { label: 'En analyse', badge: 'badge-purple', dot: '#7c3aed' },
  accorde: { label: 'Accorde', badge: 'badge-success', dot: '#16a34a' },
  refuse: { label: 'Refuse', badge: 'badge-danger', dot: '#dc2626' },
  archive: { label: 'Archive', badge: 'badge-neutral', dot: '#94a3b8' },
}

const PIPELINE_STAGES = [
  { key: 'collecte', label: 'Collecte', color: '#94a3b8', matchFn: (d: Dossier) => d.statut === 'en_attente' },
  { key: 'analyse', label: 'Analyse', color: '#7c3aed', matchFn: (d: Dossier) => d.statut === 'analyse' },
  { key: 'en_cours', label: 'En cours', color: '#0ea5e9', matchFn: (d: Dossier) => d.statut === 'en_cours' },
  { key: 'pret_banque', label: 'Pret banque', color: '#16a34a', matchFn: (d: Dossier) => d.statut === 'accorde' && (d.score_global || 0) >= 70 },
  { key: 'envoye', label: 'Envoye', color: '#1e40af', matchFn: (d: Dossier) => d.statut === 'accorde' },
]

function getScoreColor(score?: number): string {
  if (!score) return 'var(--text-muted)'
  if (score >= 75) return 'var(--score-excellent)'
  if (score >= 55) return 'var(--score-good)'
  if (score >= 40) return 'var(--score-average)'
  return 'var(--score-poor)'
}

function getScoreBg(score?: number): string {
  if (!score) return 'var(--surface-2)'
  if (score >= 75) return 'var(--risk-low-bg)'
  if (score >= 55) return 'var(--color-info-bg)'
  if (score >= 40) return 'var(--risk-medium-bg)'
  return 'var(--risk-critical-bg)'
}

function formatCurrency(amount?: number): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'a l instant'
  if (diff < 3600) return 'il y a ' + Math.floor(diff / 60) + 'min'
  if (diff < 86400) return 'il y a ' + Math.floor(diff / 3600) + 'h'
  if (diff < 604800) return 'il y a ' + Math.floor(diff / 86400) + 'j'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

interface ActionItem {
  label: string
  sub: string
  color: string
  bg: string
  tag: string
  href: string
}

function generateActions(dossiers: Dossier[]): ActionItem[] {
  const actions: ActionItem[] = []
  const docs_manquants = dossiers.filter(d => d.statut === 'en_attente')
  if (docs_manquants.length > 0) {
    actions.push({ label: docs_manquants.length + ' dossier(s) en attente de pieces', sub: 'Relancer les emprunteurs pour completer leurs documents', color: '#ca8a04', bg: 'var(--risk-medium-bg)', tag: 'Docs', href: '/dossiers' })
  }
  const score_faibles = dossiers.filter(d => (d.score_global || 0) > 0 && (d.score_global || 0) < 45)
  if (score_faibles.length > 0) {
    actions.push({ label: score_faibles.length + ' dossier(s) avec score faible', sub: 'Verifier les anomalies et corriger avant soumission', color: '#dc2626', bg: 'var(--risk-critical-bg)', tag: 'Alerte', href: '/dossiers' })
  }
  const prets = dossiers.filter(d => (d.score_global || 0) >= 70 && d.statut !== 'accorde' && d.statut !== 'archive')
  if (prets.length > 0) {
    actions.push({ label: prets.length + ' dossier(s) prets pour soumission', sub: 'Scores solides - preparer le dossier banque', color: '#16a34a', bg: 'var(--risk-low-bg)', tag: 'Pret', href: '/dossiers' })
  }
  const en_analyse = dossiers.filter(d => d.statut === 'analyse')
  if (en_analyse.length > 0) {
    actions.push({ label: en_analyse.length + ' dossier(s) en cours d analyse', sub: 'Controle documentaire et coherence a finaliser', color: '#7c3aed', bg: '#f5f3ff', tag: 'IA', href: '/dossiers' })
  }
  if (actions.length === 0) {
    actions.push({ label: 'Aucune action urgente', sub: 'Votre activite est a jour', color: '#16a34a', bg: 'var(--risk-low-bg)', tag: 'OK', href: '/dossiers' })
  }
  return actions
}

export default function DashboardPage() {
  const supabase = createClient()
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [loading, setLoading] = useState(true)
  const [cabinetNom, setCabinetNom] = useState('')

  const h = new Date().getHours()
  const salutation = h < 12 ? 'Bonjour' : h < 18 ? 'Bon apres-midi' : 'Bonsoir'

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data: profil } = await supabase
          .from('profils_utilisateurs')
          .select('nom_complet, cabinets(nom)')
          .eq('id', user.id)
          .single()
        if (profil) setCabinetNom((profil.cabinets as any)?.nom || '')
        const { data } = await supabase
          .from('dossiers')
          .select('*')
          .order('updated_at', { ascending: false })
        setDossiers(data || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [supabase])

  const total = dossiers.length
  const actifs = dossiers.filter(d => ['en_cours', 'analyse'].includes(d.statut)).length
  const pretsBank = dossiers.filter(d => (d.score_global || 0) >= 70 && d.statut !== 'refuse' && d.statut !== 'archive').length
  const aCorreger = dossiers.filter(d => d.statut === 'en_attente' || ((d.score_global || 0) > 0 && (d.score_global || 0) < 40)).length
  const withScore = dossiers.filter(d => (d.score_global || 0) > 0)
  const avgScore = withScore.length > 0 ? Math.round(withScore.reduce((s, d) => s + (d.score_global || 0), 0) / withScore.length) : 0
  const volumeTotal = dossiers.reduce((s, d) => s + (d.montant_projet || 0), 0)
  const anomalies = dossiers.filter(d => (d.score_global || 0) > 0 && (d.score_global || 0) < 50).length

  const actions = generateActions(dossiers)
  const aRisque = dossiers.filter(d => ((d.score_global || 0) > 0 && (d.score_global || 0) < 45) || d.statut === 'en_attente').slice(0, 5)
  const pretsBanque = dossiers.filter(d => (d.score_global || 0) >= 70 && d.statut !== 'refuse' && d.statut !== 'archive').slice(0, 5)
  const recent = dossiers.slice(0, 6)
  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  const kpis = [
    { label: 'Dossiers actifs', value: String(actifs), color: '#0ea5e9', sub: 'sur ' + total + ' total' },
    { label: 'Prets banque', value: String(pretsBank), color: '#16a34a', sub: 'Score superieur a 70' },
    { label: 'A corriger', value: String(aCorreger), color: aCorreger > 0 ? '#ea580c' : '#16a34a', sub: 'Attention requise' },
    { label: 'Score moyen', value: avgScore ? avgScore + '/100' : '-', color: getScoreColor(avgScore), sub: 'Financiabilite' },
    { label: 'Anomalies docs', value: String(anomalies), color: anomalies > 0 ? '#dc2626' : '#16a34a', sub: 'Coherence docs' },
    { label: 'Volume total', value: formatCurrency(volumeTotal), color: '#1e40af', sub: 'Projets en cours' },
  ]

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">{salutation}{cabinetNom ? ', ' + cabinetNom : ''}</h1>
          <p className="page-subtitle">{'Etat de votre activite - ' + todayStr}</p>
        </div>
        <Link href="/dossiers/nouveau" className="btn-primary">+ Nouveau dossier</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card" style={{ padding: '18px 16px' }}>
            <div className="kpi-header">
              <span className="kpi-label">{kpi.label}</span>
            </div>
            <div className="kpi-value" style={{ color: kpi.color, fontSize: '24px' }}>{kpi.value}</div>
            <div className="kpi-trend">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="section-title">Pipeline cabinet</div>
            <div className="section-subtitle">{total} dossiers au total</div>
          </div>
          <Link href="/dossiers" className="btn-ghost" style={{ fontSize: '12px', color: 'var(--brand-primary)' }}>Voir tous</Link>
        </div>
        <div className="pipeline-track">
          {PIPELINE_STAGES.map((stage) => {
            const count = dossiers.filter(stage.matchFn).length
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <Link key={stage.key} href="/dossiers" className="pipeline-stage" style={{ textDecoration: 'none' }}>
                <div className="pipeline-stage-count" style={{ color: count > 0 ? stage.color : 'var(--text-muted)' }}>{count}</div>
                <div className="pipeline-stage-label">{stage.label}</div>
                <div className="pipeline-stage-bar" style={{ background: count > 0 ? stage.color : 'var(--surface-3)' }} />
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '-2px' }}>{pct}%</div>
              </Link>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Actions prioritaires</h2>
            <span className="badge badge-warning" style={{ fontSize: '10px' }}>{actions.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actions.map((action, i) => (
              <Link key={i} href={action.href} className="action-item" style={{ textDecoration: 'none' }}>
                <div className="action-icon" style={{ background: action.bg, fontSize: '11px', fontWeight: 700, color: action.color, padding: '4px 8px', borderRadius: '6px', minWidth: '40px', textAlign: 'center' }}>{action.tag}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: action.color, lineHeight: '1.3' }}>{action.label}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.3' }}>{action.sub}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }}>{'>'}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Dossiers a surveiller</h2>
            <span className="badge badge-danger" style={{ fontSize: '10px' }}>{aRisque.length}</span>
          </div>
          {aRisque.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-state-title">Tous les dossiers sont en ordre</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {aRisque.map(d => {
                const sc = STATUT_CONFIG[d.statut] || STATUT_CONFIG.en_attente
                return (
                  <Link key={d.id} href={'/dossiers/' + d.id} className="dossier-row" style={{ textDecoration: 'none', padding: '10px 14px' }}>
                    <div className="avatar" style={{ background: (d.score_global || 0) < 45 ? '#fee2e2' : '#fef3c7', color: (d.score_global || 0) < 45 ? '#dc2626' : '#92400e', width: '32px', height: '32px', fontSize: '12px' }}>
                      {(d.nom_client || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nom_client || 'Client inconnu'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatCurrency(d.montant_projet)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {d.score_global ? <span style={{ fontSize: '13px', fontWeight: 700, color: getScoreColor(d.score_global), background: getScoreBg(d.score_global), padding: '2px 7px', borderRadius: '6px' }}>{d.score_global}</span> : null}
                      <span className={'badge ' + sc.badge} style={{ fontSize: '10px' }}>{sc.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Prets pour la banque</h2>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>{pretsBanque.length}</span>
          </div>
          {pretsBanque.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-state-title">Aucun dossier pret</div>
              <div className="empty-state-desc">Les dossiers avec un score superieur a 70 apparaitront ici.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pretsBanque.map(d => (
                <Link key={d.id} href={'/dossiers/' + d.id + '/synthese'} className="dossier-row" style={{ textDecoration: 'none', padding: '10px 14px', borderColor: 'var(--risk-low-border)', background: 'var(--risk-low-bg)' }}>
                  <div className="avatar" style={{ background: '#16a34a', width: '32px', height: '32px', fontSize: '12px' }}>{(d.nom_client || 'C').charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nom_client || 'Client inconnu'}</div>
                    <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 500 }}>{formatCurrency(d.montant_projet)}</div>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', background: 'white', padding: '2px 7px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>{d.score_global}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Activite recente</h2>
            <Link href="/dossiers" className="badge badge-neutral" style={{ textDecoration: 'none', fontSize: '10px' }}>Tous</Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-state-title">Aucun dossier</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recent.map(d => {
                const sc = STATUT_CONFIG[d.statut] || STATUT_CONFIG.en_attente
                return (
                  <Link key={d.id} href={'/dossiers/' + d.id} className="dossier-row" style={{ textDecoration: 'none', padding: '9px 12px' }}>
                    <div className="avatar" style={{ background: 'var(--brand-primary)', width: '30px', height: '30px', fontSize: '11px' }}>{(d.nom_client || 'C').charAt(0).toUpperCase()}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nom_client || 'Client inconnu'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatCurrency(d.montant_projet)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <span className={'badge ' + sc.badge} style={{ fontSize: '10px' }}>{sc.label}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{timeAgo(d.updated_at)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <Link href="/dossiers" style={{ fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>Voir tous les dossiers</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
