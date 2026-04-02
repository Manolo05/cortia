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
  en_cours:   { label: 'En cours',   badge: 'badge-info',    dot: '#0ea5e9' },
  analyse:    { label: 'En analyse', badge: 'badge-purple',  dot: '#7c3aed' },
  accorde:    { label: 'Accordé',     badge: 'badge-success', dot: '#16a34a' },
  refuse:     { label: 'Refusé',     badge: 'badge-danger',  dot: '#dc2626' },
  archive:    { label: 'Archivé',    badge: 'badge-neutral', dot: '#94a3b8' },
}

const PIPELINE_STAGES = [
  { key: 'collecte',   label: 'Collecte',    color: '#94a3b8', match: (d: Dossier) => d.statut === 'en_attente' },
  { key: 'analyse',    label: 'Analyse',     color: '#7c3aed', match: (d: Dossier) => d.statut === 'analyse' },
  { key: 'en_cours',   label: 'En cours',    color: '#0ea5e9', match: (d: Dossier) => d.statut === 'en_cours' },
  { key: 'pret_banque',label: 'Prêt banque', color: '#16a34a', match: (d: Dossier) => d.statut === 'accorde' && (d.score_global || 0) >= 70 },
  { key: 'envoye',     label: 'Envoyé',     color: '#1e40af', match: (d: Dossier) => d.statut === 'accorde' },
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
  if (!amount) return '—'
  if (amount >= 1000000) return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'à l'instant'
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function generateActions(dossiers: Dossier[]): Array<{ type: string; label: string; sub: string; color: string; bg: string; icon: string; href: string }> {
  const actions = []
  const docs_manquants = dossiers.filter(d => d.statut === 'en_attente')
  if (docs_manquants.length > 0) {
    actions.push({
      type: 'docs',
      label: `${docs_manquants.length} dossier(s) en attente de pièces`,
      sub: 'Relancer les emprunteurs pour compléter leurs documents',
      color: '#ca8a04',
      bg: 'var(--risk-medium-bg)',
      icon: '\u{1F4CE}',
      href: '/dossiers?statut=en_attente'
    })
  }
  const score_faibles = dossiers.filter(d => (d.score_global || 0) > 0 && (d.score_global || 0) < 45)
  if (score_faibles.length > 0) {
    actions.push({
      type: 'score',
      label: `${score_faibles.length} dossier(s) avec score faible`,
      sub: 'Vérifier les anomalies et corriger avant soumission',
      color: '#dc2626',
      bg: 'var(--risk-critical-bg)',
      icon: '\u26A0\uFE0F',
      href: '/dossiers'
    })
  }
  const prets = dossiers.filter(d => (d.score_global || 0) >= 70 && d.statut !== 'accorde' && d.statut !== 'archive')
  if (prets.length > 0) {
    actions.push({
      type: 'ready',
      label: `${prets.length} dossier(s) prêts pour soumission`,
      sub: 'Scores solides — préparer le dossier banque',
      color: '#16a34a',
      bg: 'var(--risk-low-bg)',
      icon: '\u2705',
      href: '/dossiers'
    })
  }
  const en_analyse = dossiers.filter(d => d.statut === 'analyse')
  if (en_analyse.length > 0) {
    actions.push({
      type: 'analyse',
      label: `${en_analyse.length} dossier(s) en cours d’analyse`,
      sub: 'Contrôle documentaire et cohérence à finaliser',
      color: '#7c3aed',
      bg: '#f5f3ff',
      icon: '\u{1F50D}',
      href: '/dossiers?statut=analyse'
    })
  }
  if (actions.length === 0) {
    actions.push({
      type: 'ok',
      label: 'Aucune action urgente',
      sub: 'Votre activité est à jour',
      color: '#16a34a',
      bg: 'var(--risk-low-bg)',
      icon: '\u2728',
      href: '/dossiers'
    })
  }
  return actions
}

export default function DashboardPage() {
  const supabase = createClient()
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [loading, setLoading] = useState(true)
  const [cabinetNom, setCabinetNom] = useState('')
  const [heure] = useState(() => {
    const h = new Date().getHours()
    if (h < 12) return 'Bonjour'
    if (h < 18) return 'Bon après-midi'
    return 'Bonsoir'
  })

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
  const aCorreiger = dossiers.filter(d => d.statut === 'en_attente' || ((d.score_global || 0) > 0 && (d.score_global || 0) < 40)).length
  const withScore = dossiers.filter(d => (d.score_global || 0) > 0)
  const avgScore = withScore.length > 0 ? Math.round(withScore.reduce((s, d) => s + (d.score_global || 0), 0) / withScore.length) : 0
  const volumeTotal = dossiers.reduce((s, d) => s + (d.montant_projet || 0), 0)
  const anomalies = dossiers.filter(d => (d.score_global || 0) > 0 && (d.score_global || 0) < 50).length
  const avgEndettement = dossiers.filter(d => (d.taux_endettement || 0) > 0).length > 0
    ? Math.round(dossiers.filter(d => d.taux_endettement).reduce((s, d) => s + (d.taux_endettement || 0), 0) / dossiers.filter(d => d.taux_endettement).length)
    : 0

  const actions = generateActions(dossiers)
  const aRisque = dossiers.filter(d => (d.niveau_risque === 'eleve' || d.niveau_risque === 'critique') || ((d.score_global || 0) > 0 && (d.score_global || 0) < 45)).slice(0, 5)
  const pretsBanque = dossiers.filter(d => (d.score_global || 0) >= 70 && d.statut !== 'refuse' && d.statut !== 'archive').slice(0, 5)
  const recent = dossiers.slice(0, 6)

  const kpis = [
    { label: 'Dossiers actifs', value: actifs, icon: '\u25CE', color: '#0ea5e9', accent: '#0ea5e9', sub: `sur ${total} total` },
    { label: 'Prêts banque', value: pretsBank, icon: '\u2713', color: '#16a34a', accent: '#16a34a', sub: 'Score ≥ 70/100' },
    { label: 'À corriger', value: aCorreiger, icon: '\u26A0', color: aCorreiger > 0 ? '#ea580c' : '#16a34a', accent: aCorreiger > 0 ? '#ea580c' : '#16a34a', sub: 'Attention requise' },
    { label: 'Score moyen', value: avgScore ? avgScore + '/100' : '—', icon: '\u25C8', color: getScoreColor(avgScore), accent: getScoreColor(avgScore), sub: 'Financiéabilité' },
    { label: 'Anomalies docs', value: anomalies, icon: '\u{1F50D}', color: anomalies > 0 ? '#dc2626' : '#16a34a', accent: anomalies > 0 ? '#dc2626' : '#16a34a', sub: 'Cohérence doc.' },
    { label: 'Volume total', value: formatCurrency(volumeTotal), icon: '\u20AC', color: '#1e40af', accent: '#1e40af', sub: 'Projets en cours' },
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

      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{heure}{cabinetNom ? ', ' + cabinetNom : ''} \u{1F44B}</h1>
          <p className="page-subtitle">Voici l&apos;état de votre activité aujourd’hui — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <Link href="/dossiers/nouveau" className="btn-primary">
          + Nouveau dossier
        </Link>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', marginBottom: '28px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card" style={{ padding: '18px 16px' }}>
            <div className="kpi-card-accent" style={{ background: kpi.accent }} />
            <div className="kpi-header">
              <span className="kpi-label">{kpi.label}</span>
              <span style={{ fontSize: '15px', color: kpi.color }}>{kpi.icon}</span>
            </div>
            <div className="kpi-value" style={{ color: kpi.color, fontSize: '24px' }}>{kpi.value}</div>
            <div className="kpi-trend">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Pipeline cabinet */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div className="section-header" style={{ marginBottom: '16px' }}>
          <div>
            <div className="section-title">Pipeline cabinet</div>
            <div className="section-subtitle">{total} dossiers au total</div>
          </div>
          <Link href="/dossiers" className="btn-ghost" style={{ fontSize: '12px', color: 'var(--brand-primary)' }}>
            Voir tous →
          </Link>
        </div>
        <div className="pipeline-track">
          {PIPELINE_STAGES.map((stage) => {
            const count = dossiers.filter(stage.match).length
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <Link key={stage.key} href={`/dossiers?statut=${stage.key}`} className="pipeline-stage" style={{ textDecoration: 'none' }}>
                <div className="pipeline-stage-count" style={{ color: count > 0 ? stage.color : 'var(--text-muted)' }}>{count}</div>
                <div className="pipeline-stage-label">{stage.label}</div>
                <div className="pipeline-stage-bar" style={{ background: count > 0 ? stage.color : 'var(--surface-3)', opacity: 0.8 }} />
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '-2px' }}>{pct}%</div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Actions prioritaires + Dossiers à surveiller */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Actions prioritaires */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span style={{ background: '#fef3c7', color: '#92400e', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>\u26A1</span>
              Actions prioritaires
            </h2>
            <span className="badge badge-warning" style={{ fontSize: '10px' }}>{actions.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actions.map((action, i) => (
              <Link key={i} href={action.href} className="action-item" style={{ textDecoration: 'none' }}>
                <div className="action-icon" style={{ background: action.bg, fontSize: '16px' }}>{action.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: action.color, lineHeight: '1.3' }}>{action.label}</div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.3' }}>{action.sub}</div>
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px', flexShrink: 0 }}>\u203A</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Dossiers à surveiller */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span style={{ background: '#fef2f2', color: '#dc2626', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>\u26A0</span>
              Dossiers à surveiller
            </h2>
            <span className="badge badge-danger" style={{ fontSize: '10px' }}>{aRisque.length}</span>
          </div>
          {aRisque.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-state-icon">\u2705</div>
              <div className="empty-state-title">Tous les dossiers sont en ordre</div>
              <div className="empty-state-desc">Aucun dossier n’affiche de signal d’alerte.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {aRisque.map(d => {
                const sc = d.statut ? STATUT_CONFIG[d.statut] : STATUT_CONFIG.en_attente
                return (
                  <Link key={d.id} href={`/dossiers/${d.id}`} className="dossier-row" style={{ textDecoration: 'none', padding: '10px 14px' }}>
                    <div className="avatar" style={{ background: d.score_global && d.score_global < 45 ? '#fee2e2' : '#fef3c7', color: d.score_global && d.score_global < 45 ? '#dc2626' : '#92400e', width: '32px', height: '32px', fontSize: '12px' }}>
                      {(d.nom_client || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nom_client || 'Client inconnu'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>{formatCurrency(d.montant_projet)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {d.score_global ? (
                        <span style={{ fontSize: '13px', fontWeight: 700, color: getScoreColor(d.score_global), background: getScoreBg(d.score_global), padding: '2px 7px', borderRadius: '6px' }}>
                          {d.score_global}
                        </span>
                      ) : null}
                      <span className={`badge ${sc?.badge || 'badge-neutral'}`} style={{ fontSize: '10px' }}>{sc?.label || d.statut}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dossiers prêts banque + Activité récente */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Prêts banque */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span style={{ background: '#dcfce7', color: '#16a34a', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>\u2713</span>
              Prêts pour la banque
            </h2>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>{pretsBanque.length}</span>
          </div>
          {pretsBanque.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-state-icon">\u{1F3E6}</div>
              <div className="empty-state-title">Aucun dossier prêt</div>
              <div className="empty-state-desc">Les dossiers avec un score ≥ 70 apparaîtront ici.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pretsBanque.map(d => (
                <Link key={d.id} href={`/dossiers/${d.id}/synthese`} className="dossier-row" style={{ textDecoration: 'none', padding: '10px 14px', borderColor: 'var(--risk-low-border)', background: 'var(--risk-low-bg)' }}>
                  <div className="avatar" style={{ background: '#16a34a', width: '32px', height: '32px', fontSize: '12px' }}>
                    {(d.nom_client || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nom_client || 'Client inconnu'}</div>
                    <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '1px', fontWeight: 500 }}>{formatCurrency(d.montant_projet)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', background: 'white', padding: '2px 7px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                      {d.score_global}
                    </span>
                    <span style={{ fontSize: '10px', color: '#16a34a' }}>Voir synthèse →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activite recente */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <span style={{ background: '#f0f9ff', color: '#0ea5e9', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>\u25D7</span>
              Activité récente
            </h2>
            <Link href="/dossiers" className="badge badge-neutral" style={{ textDecoration: 'none', fontSize: '10px' }}>Tous</Link>
          </div>
          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="empty-state-icon">\u{1F4C2}</div>
              <div className="empty-state-title">Aucun dossier</div>
              <div className="empty-state-desc">Créez votre premier dossier pour démarrer.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {recent.map(d => {
                const sc = d.statut ? STATUT_CONFIG[d.statut] : STATUT_CONFIG.en_attente
                return (
                  <Link key={d.id} href={`/dossiers/${d.id}`} className="dossier-row" style={{ textDecoration: 'none', padding: '9px 12px' }}>
                    <div className="avatar" style={{ background: 'var(--brand-primary)', width: '30px', height: '30px', fontSize: '11px' }}>
                      {(d.nom_client || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nom_client || 'Client inconnu'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{formatCurrency(d.montant_projet)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                      <span className={`badge ${sc?.badge || 'badge-neutral'}`} style={{ fontSize: '10px' }}>{sc?.label || d.statut}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{timeAgo(d.updated_at)}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
            <Link href="/dossiers" style={{ fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
              Voir tous les dossiers →
            </Link>
          </div>
        </div>
      </div>

    </div>
  )
}
