'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/* ================================================================
   DASHBOARD PREMIUM — COCKPIT CABINET
   CortIA v2.0
   ================================================================ */

interface DossierDashboard {
  id: string
  reference?: string
  nom_client?: string
  statut: string
  score_global?: number
  niveau_risque?: string
  montant_projet?: number
  updated_at?: string
  created_at?: string
  taux_endettement?: number
  emprunteurs?: Array<{
    prenom: string
    nom: string
    salaire_net_mensuel?: number
    type_contrat?: string
  }>
  analyses_financieres?: Array<{
    score_global: number
    taux_endettement_projet?: number
    reste_a_vivre?: number
    taux_apport?: number
    points_forts?: string[]
    points_vigilance?: string[]
    recommandations?: string[]
    mensualite_estimee?: number
  }>
  documents?: Array<{
    id: string
    type_document: string
    statut_verification: string
  }>
  controles_docs?: Array<{
    id: string
    type_controle: string
    resultat: string
    niveau_alerte?: string
  }>
}

const STATUT_CONFIG: Record<string, { label: string; badge: string; dot: string }> = {
  nouveau:    { label: 'Nouveau',    badge: 'badge-info',    dot: '#0ea5e9' },
  en_attente: { label: 'En attente', badge: 'badge-warning', dot: '#ca8a04' },
  en_cours:   { label: 'En cours',   badge: 'badge-info',    dot: '#0ea5e9' },
  analyse:    { label: 'Analyse',    badge: 'badge-purple',  dot: '#7c3aed' },
  soumis:     { label: 'Soumis',     badge: 'badge-brand',   dot: '#1e40af' },
  accepte:    { label: 'Accepté',  badge: 'badge-success', dot: '#059669' },
  accorde:    { label: 'Accordé',  badge: 'badge-success', dot: '#16a34a' },
  refuse:     { label: 'Refusé',   badge: 'badge-danger',  dot: '#dc2626' },
  archive:    { label: 'Archivé',  badge: 'badge-neutral', dot: '#94a3b8' },
}

const PIPELINE_STAGES = [
  { key: 'collecte',    label: 'Collecte',       color: '#94a3b8', matchFn: (d: DossierDashboard) => d.statut === 'nouveau' || d.statut === 'en_attente' },
  { key: 'analyse',     label: 'Analyse IA',     color: '#7c3aed', matchFn: (d: DossierDashboard) => d.statut === 'analyse' || d.statut === 'en_cours' },
  { key: 'a_corriger',  label: 'À corriger',    color: '#ea580c', matchFn: (d: DossierDashboard) => (d.score_global || 0) > 0 && (d.score_global || 0) < 50 && !['refuse','archive','accepte','accorde'].includes(d.statut) },
  { key: 'pret_banque', label: 'Prêt banque',   color: '#059669', matchFn: (d: DossierDashboard) => (d.score_global || 0) >= 70 && !['refuse','archive'].includes(d.statut) },
  { key: 'envoye',      label: 'Envoyé',        color: '#1e40af', matchFn: (d: DossierDashboard) => d.statut === 'soumis' || d.statut === 'accepte' || d.statut === 'accorde' },
]

function getScoreColor(score?: number): string {
  if (!score) return 'var(--text-tertiary)'
  if (score >= 75) return 'var(--success)'
  if (score >= 55) return '#0d9488'
  if (score >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

function getScoreBg(score?: number): string {
  if (!score) return 'var(--surface-2)'
  if (score >= 75) return 'var(--success-light)'
  if (score >= 55) return '#ccfbf1'
  if (score >= 40) return 'var(--warning-light)'
  return 'var(--danger-light)'
}

function getRiskLabel(score?: number): { label: string; color: string; bg: string } {
  if (!score) return { label: 'Non analysé', color: 'var(--text-tertiary)', bg: 'var(--surface-2)' }
  if (score >= 75) return { label: 'Risque faible', color: 'var(--success)', bg: 'var(--success-light)' }
  if (score >= 55) return { label: 'Risque modéré', color: '#0d9488', bg: '#ccfbf1' }
  if (score >= 40) return { label: 'Risque élevé', color: 'var(--warning)', bg: 'var(--warning-light)' }
  return { label: 'Risque critique', color: 'var(--danger)', bg: 'var(--danger-light)' }
}

function formatCurrency(amount?: number): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function formatK(amount?: number): string {
  if (!amount) return '-'
  if (amount >= 1000000) return (amount / 1000000).toFixed(1).replace('.0', '') + 'M€'
  if (amount >= 1000) return Math.round(amount / 1000) + 'k€'
  return amount + '€'
}

function timeAgo(dateStr?: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return "à l’instant"
  if (diff < 3600) return 'il y a ' + Math.floor(diff / 60) + ' min'
  if (diff < 86400) return 'il y a ' + Math.floor(diff / 3600) + 'h'
  if (diff < 604800) return 'il y a ' + Math.floor(diff / 86400) + 'j'
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

interface ActionPrioritaire {
  id: string
  label: string
  description: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  tag: string
  count: number
  href: string
}

function generateSmartActions(dossiers: DossierDashboard[]): ActionPrioritaire[] {
  const actions: ActionPrioritaire[] = []

  const docsProblemes = dossiers.filter(d => {
    const docs = d.documents || []
    return docs.some(doc => doc.statut_verification === 'refuse' || doc.statut_verification === 'a_remplacer')
  })
  if (docsProblemes.length > 0) {
    actions.push({
      id: 'docs_anomalies',
      label: docsProblemes.length + ' dossier(s) avec documents à remplacer',
      description: 'Pièces refusées ou à remplacer — relancer les emprunteurs',
      severity: 'critical',
      tag: 'DOCS',
      count: docsProblemes.length,
      href: '/dossiers'
    })
  }

  const scoreFaibles = dossiers.filter(d => (d.score_global || 0) > 0 && (d.score_global || 0) < 40 && !['refuse', 'archive'].includes(d.statut))
  if (scoreFaibles.length > 0) {
    actions.push({
      id: 'score_faible',
      label: scoreFaibles.length + ' dossier(s) avec score critique (<40)',
      description: 'Analyser les points de vigilance et corriger avant soumission',
      severity: 'critical',
      tag: 'ALERTE',
      count: scoreFaibles.length,
      href: '/dossiers'
    })
  }

  const enAttente = dossiers.filter(d => d.statut === 'en_attente' || d.statut === 'nouveau')
  if (enAttente.length > 0) {
    actions.push({
      id: 'en_attente',
      label: enAttente.length + ' dossier(s) en attente de pièces',
      description: 'Compléter la collecte documentaire pour lancer l’analyse',
      severity: 'warning',
      tag: 'COLLECTE',
      count: enAttente.length,
      href: '/dossiers'
    })
  }

  const pretsBanque = dossiers.filter(d => (d.score_global || 0) >= 70 && !['refuse', 'archive', 'soumis', 'accepte', 'accorde'].includes(d.statut))
  if (pretsBanque.length > 0) {
    actions.push({
      id: 'pret_banque',
      label: pretsBanque.length + ' dossier(s) prêt(s) pour soumission bancaire',
      description: 'Scores solides — préparer la synthèse et envoyer',
      severity: 'success',
      tag: 'PRÊT',
      count: pretsBanque.length,
      href: '/dossiers'
    })
  }

  const enAnalyse = dossiers.filter(d => d.statut === 'analyse' || d.statut === 'en_cours')
  if (enAnalyse.length > 0) {
    actions.push({
      id: 'en_analyse',
      label: enAnalyse.length + ' dossier(s) en cours d’analyse IA',
      description: 'Contrôle documentaire et cohérence financière en cours',
      severity: 'info',
      tag: 'IA',
      count: enAnalyse.length,
      href: '/dossiers'
    })
  }

  if (actions.length === 0) {
    actions.push({
      id: 'all_clear',
      label: 'Aucune action urgente',
      description: 'Votre activité est à jour. Tous les dossiers sont en ordre.',
      severity: 'success',
      tag: 'OK',
      count: 0,
      href: '/dossiers'
    })
  }

  return actions
}

const SEVERITY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  critical: { color: 'var(--danger)', bg: 'var(--danger-bg)', border: '#fecaca' },
  warning:  { color: 'var(--warning)', bg: 'var(--warning-bg)', border: '#fde68a' },
  info:     { color: 'var(--info)', bg: 'var(--info-bg)', border: '#bfdbfe' },
  success:  { color: 'var(--success)', bg: 'var(--success-bg)', border: '#a7f3d0' },
}

function ScoreRing({ score, size = 64, strokeWidth = 5 }: { score: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(score, 100) / 100
  const offset = circumference * (1 - progress)
  const color = getScoreColor(score)

  return (
    <div className="score-ring-container" style={{ width: size, height: size }}>
      <svg className="score-ring" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--surface-2)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <span className="score-ring-value" style={{ fontSize: size > 50 ? '16px' : '12px', color }}>{score}</span>
    </div>
  )
}

export default function DashboardPage() {
  const supabase = createClient()
  const [dossiers, setDossiers] = useState<DossierDashboard[]>([])
  const [loading, setLoading] = useState(true)
  const [cabinetNom, setCabinetNom] = useState('')
  const [userName, setUserName] = useState('')

  const h = new Date().getHours()
  const salutation = h < 12 ? 'Bonjour' : h < 18 ? 'Bon après-midi' : 'Bonsoir'

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

        if (profil) {
          setCabinetNom((profil.cabinets as any)?.nom || '')
          setUserName(profil.nom_complet || '')
        }

        const { data } = await supabase
          .from('dossiers')
          .select(`
            *,
            emprunteurs(prenom, nom, salaire_net_mensuel, type_contrat),
            analyses_financieres(score_global, taux_endettement_projet, reste_a_vivre, taux_apport, points_forts, points_vigilance, recommandations, mensualite_estimee),
            documents(id, type_document, statut_verification),
            controles_docs(id, type_controle, resultat, niveau_alerte)
          `)
          .order('updated_at', { ascending: false })

        setDossiers(data || [])
      } catch (e) {
        console.error('Dashboard load error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const total = dossiers.length
  const actifs = dossiers.filter(d => !['refuse', 'archive'].includes(d.statut)).length
  const pretsBanque = dossiers.filter(d => (d.score_global || 0) >= 70 && !['refuse', 'archive'].includes(d.statut)).length
  const aCorreger = dossiers.filter(d => {
    const hasLowScore = (d.score_global || 0) > 0 && (d.score_global || 0) < 50
    const hasDocIssues = (d.documents || []).some(doc => doc.statut_verification === 'refuse' || doc.statut_verification === 'a_remplacer')
    return (hasLowScore || hasDocIssues) && !['refuse', 'archive'].includes(d.statut)
  }).length
  const withScore = dossiers.filter(d => (d.score_global || 0) > 0)
  const avgScore = withScore.length > 0 ? Math.round(withScore.reduce((s, d) => s + (d.score_global || 0), 0) / withScore.length) : 0
  
  const withEndettement = dossiers.filter(d => {
    const analyse = (d.analyses_financieres || [])[0]
    return analyse && analyse.taux_endettement_projet
  })
  const avgEndettement = withEndettement.length > 0
    ? Math.round(withEndettement.reduce((s, d) => s + ((d.analyses_financieres || [])[0]?.taux_endettement_projet || 0), 0) / withEndettement.length)
    : 0

  const volumeTotal = dossiers.reduce((s, d) => s + (d.montant_projet || 0), 0)
  
  const alertesDocs = dossiers.filter(d => {
    const docs = d.documents || []
    return docs.some(doc => doc.statut_verification === 'refuse' || doc.statut_verification === 'a_remplacer')
  }).length

  const actions = generateSmartActions(dossiers)

  const dossiersSurveiller = dossiers
    .filter(d => {
      const lowScore = (d.score_global || 0) > 0 && (d.score_global || 0) < 50
      const waiting = d.statut === 'en_attente' || d.statut === 'nouveau'
      const docIssue = (d.documents || []).some(doc => doc.statut_verification === 'refuse')
      return (lowScore || waiting || docIssue) && !['refuse', 'archive'].includes(d.statut)
    })
    .sort((a, b) => (a.score_global || 999) - (b.score_global || 999))
    .slice(0, 5)

  const dossiersPretsBank = dossiers
    .filter(d => (d.score_global || 0) >= 70 && !['refuse', 'archive'].includes(d.statut))
    .sort((a, b) => (b.score_global || 0) - (a.score_global || 0))
    .slice(0, 5)

  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const kpis = [
    { label: 'Dossiers actifs', value: String(actifs), accent: 'var(--info)', sub: total + ' au total' },
    { label: 'Prêts banque', value: String(pretsBanque), accent: 'var(--success)', sub: 'Score ≥ 70' },
    { label: 'À corriger', value: String(aCorreger), accent: aCorreger > 0 ? '#ea580c' : 'var(--success)', sub: 'Attention requise' },
    { label: 'Score moyen', value: avgScore > 0 ? avgScore + '/100' : '-', accent: getScoreColor(avgScore), sub: 'Financiabilité cabinet' },
    { label: 'Taux endett. moy.', value: avgEndettement > 0 ? avgEndettement + '%' : '-', accent: avgEndettement > 35 ? 'var(--danger)' : avgEndettement > 25 ? 'var(--warning)' : 'var(--success)', sub: avgEndettement > 35 ? 'Au-dessus du seuil' : 'Seuil HCSF : 35%' },
    { label: 'Volume financé', value: formatK(volumeTotal), accent: 'var(--brand-primary)', sub: 'Montant total projets' },
    { label: 'Alertes docs', value: String(alertesDocs), accent: alertesDocs > 0 ? 'var(--danger)' : 'var(--success)', sub: alertesDocs > 0 ? 'Documents à vérifier' : 'Tout est en ordre' },
  ]

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>Chargement du cockpit...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '4px' }}>
            {salutation}{userName ? ', ' + userName.split(' ')[0] : ''}
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.8125rem' }}>
            {cabinetNom ? cabinetNom + ' — ' : ''}{todayStr}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link href="/dossiers" className="btn-secondary" style={{ fontSize: '12.5px', padding: '8px 16px', textDecoration: 'none' }}>
            Tous les dossiers
          </Link>
          <Link href="/dossiers/nouveau" className="btn-primary" style={{ fontSize: '12.5px', padding: '8px 18px', textDecoration: 'none' }}>
            + Nouveau dossier
          </Link>
        </div>
      </div>

      {/* KPI GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card" style={{ padding: '16px 14px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: kpi.accent, borderRadius: '12px 12px 0 0' }} />
            <div style={{ marginBottom: '8px' }}>
              <span className="kpi-label" style={{ fontSize: '10.5px' }}>{kpi.label}</span>
            </div>
            <div className="kpi-value" style={{ color: kpi.accent, fontSize: '22px', marginBottom: '4px' }}>{kpi.value}</div>
            <div className="kpi-trend" style={{ fontSize: '11px' }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* PIPELINE */}
      <div className="card" style={{ marginBottom: '24px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '0.9375rem' }}>Pipeline cabinet</h2>
            <p className="section-subtitle" style={{ marginTop: '2px' }}>{total} dossiers au total</p>
          </div>
          <Link href="/dossiers" style={{ fontSize: '12px', color: 'var(--brand-primary)', fontWeight: 500, textDecoration: 'none' }}>
            Voir tous les dossiers →
          </Link>
        </div>

        <div className="pipeline-track" style={{ gap: '10px' }}>
          {PIPELINE_STAGES.map((stage) => {
            const count = dossiers.filter(stage.matchFn).length
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            return (
              <Link key={stage.key} href="/dossiers" className="pipeline-stage" style={{ textDecoration: 'none', padding: '16px 12px', transition: 'all 0.2s ease' }}>
                <div className="pipeline-stage-count" style={{ color: count > 0 ? stage.color : 'var(--text-tertiary)', fontSize: '1.375rem' }}>{count}</div>
                <div className="pipeline-stage-label" style={{ fontSize: '10px', marginTop: '2px' }}>{stage.label}</div>
                <div style={{ height: '3px', borderRadius: '2px', marginTop: '10px', background: count > 0 ? stage.color : 'var(--surface-3)', opacity: count > 0 ? 1 : 0.5, transition: 'all 0.3s ease' }} />
                <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px', fontWeight: 500 }}>{pct}%</div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ACTIONS + SURVEILLER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Actions Prioritaires */}
        <div className="card">
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="card-title">Actions prioritaires</h2>
              <span className="badge badge-warning" style={{ fontSize: '10px', padding: '2px 8px' }}>{actions.length}</span>
            </div>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {actions.map((action) => {
              const sev = SEVERITY_STYLES[action.severity]
              return (
                <Link key={action.id} href={action.href} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                  borderRadius: 'var(--radius-md)', border: '1px solid ' + sev.border,
                  background: sev.bg, textDecoration: 'none', transition: 'all 0.15s ease'
                }}>
                  <div style={{
                    fontSize: '9.5px', fontWeight: 700, color: sev.color, background: 'white',
                    padding: '3px 8px', borderRadius: '4px', border: '1px solid ' + sev.border,
                    minWidth: '48px', textAlign: 'center', letterSpacing: '0.02em'
                  }}>{action.tag}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>{action.label}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.3 }}>{action.description}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M6 4l4 4-4 4" stroke={sev.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Dossiers à surveiller */}
        <div className="card">
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="card-title">Dossiers à surveiller</h2>
              <span className="badge badge-danger" style={{ fontSize: '10px', padding: '2px 8px' }}>{dossiersSurveiller.length}</span>
            </div>
          </div>
          {dossiersSurveiller.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-title" style={{ fontSize: '14px' }}>Tous les dossiers sont en ordre</div>
              <div className="empty-state-desc" style={{ fontSize: '12px' }}>Aucun dossier ne nécessite votre attention immédiate.</div>
            </div>
          ) : (
            <div style={{ padding: '8px 12px' }}>
              {dossiersSurveiller.map(d => {
                const sc = STATUT_CONFIG[d.statut] || STATUT_CONFIG.en_attente
                const analyse = (d.analyses_financieres || [])[0]
                return (
                  <Link key={d.id} href={'/dossiers/' + d.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    borderRadius: 'var(--radius-md)', textDecoration: 'none', transition: 'background 0.1s ease',
                    borderBottom: '1px solid var(--border-light)'
                  }}>
                    <div className="avatar" style={{
                      background: (d.score_global || 0) < 40 ? 'var(--danger-light)' : 'var(--warning-light)',
                      color: (d.score_global || 0) < 40 ? 'var(--danger)' : 'var(--warning)',
                      width: '36px', height: '36px', fontSize: '13px', fontWeight: 700
                    }}>
                      {(d.nom_client || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.nom_client || 'Client inconnu'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{d.reference || '-'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{formatCurrency(d.montant_projet)}</span>
                        {analyse?.taux_endettement_projet ? (
                          <span style={{ fontSize: '10px', color: analyse.taux_endettement_projet > 35 ? 'var(--danger)' : 'var(--text-tertiary)', fontWeight: 500 }}>
                            Endett. {analyse.taux_endettement_projet}%
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {d.score_global ? (
                        <span style={{
                          fontSize: '12px', fontWeight: 700, color: getScoreColor(d.score_global),
                          background: getScoreBg(d.score_global), padding: '3px 8px', borderRadius: '6px'
                        }}>{d.score_global}</span>
                      ) : null}
                      <span className={'badge ' + sc.badge} style={{ fontSize: '10px' }}>{sc.label}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* PRETS BANQUE + ACTIVITE RECENTE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Dossiers Prêts Banque */}
        <div className="card">
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 className="card-title">Dossiers prêts banque</h2>
              <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 8px' }}>{dossiersPretsBank.length}</span>
            </div>
            <Link href="/dossiers" style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 500, textDecoration: 'none' }}>Voir tous</Link>
          </div>
          {dossiersPretsBank.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-title" style={{ fontSize: '14px' }}>Aucun dossier prêt</div>
              <div className="empty-state-desc" style={{ fontSize: '12px' }}>Les dossiers avec un score ≥ 70 apparaêtront ici.</div>
            </div>
          ) : (
            <div style={{ padding: '8px 12px' }}>
              {dossiersPretsBank.map(d => {
                const analyse = (d.analyses_financieres || [])[0]
                return (
                  <Link key={d.id} href={'/dossiers/' + d.id + '/synthese'} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    borderRadius: 'var(--radius-md)', textDecoration: 'none',
                    background: 'var(--success-bg)', border: '1px solid #a7f3d0',
                    marginBottom: '6px', transition: 'all 0.15s ease'
                  }}>
                    <div className="avatar" style={{ background: 'var(--success)', width: '36px', height: '36px', fontSize: '13px' }}>
                      {(d.nom_client || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.nom_client || 'Client inconnu'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 500 }}>{formatCurrency(d.montant_projet)}</span>
                        {analyse?.taux_endettement_projet ? (
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Endett. {analyse.taux_endettement_projet}%</span>
                        ) : null}
                        {analyse?.reste_a_vivre ? (
                          <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>RAV {formatCurrency(analyse.reste_a_vivre)}</span>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '13px', fontWeight: 700, color: 'var(--success)',
                        background: 'white', padding: '3px 10px', borderRadius: '6px',
                        border: '1px solid #bbf7d0'
                      }}>{d.score_global}</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M6 4l4 4-4 4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div className="card">
          <div className="card-header" style={{ padding: '16px 20px' }}>
            <h2 className="card-title">Activité récente</h2>
            <Link href="/dossiers" className="badge badge-neutral" style={{ textDecoration: 'none', fontSize: '10px' }}>Tous</Link>
          </div>
          {dossiers.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="empty-state-title" style={{ fontSize: '14px' }}>Aucun dossier</div>
              <div className="empty-state-desc" style={{ fontSize: '12px' }}>Créez votre premier dossier pour commencer.</div>
            </div>
          ) : (
            <div style={{ padding: '8px 12px' }}>
              {dossiers.slice(0, 6).map(d => {
                const sc = STATUT_CONFIG[d.statut] || STATUT_CONFIG.en_attente
                return (
                  <Link key={d.id} href={'/dossiers/' + d.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px',
                    borderRadius: 'var(--radius-md)', textDecoration: 'none',
                    borderBottom: '1px solid var(--border-light)', transition: 'background 0.1s ease'
                  }}>
                    <div className="avatar" style={{ background: 'var(--brand-primary)', width: '32px', height: '32px', fontSize: '11px' }}>
                      {(d.nom_client || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {d.nom_client || 'Client inconnu'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{formatCurrency(d.montant_projet)}</span>
                        {d.score_global ? (
                          <span style={{ fontSize: '10px', fontWeight: 600, color: getScoreColor(d.score_global) }}>Score {d.score_global}</span>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', flexShrink: 0 }}>
                      <span className={'badge ' + sc.badge} style={{ fontSize: '10px' }}>{sc.label}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{timeAgo(d.updated_at)}</span>
                    </div>
                  </Link>
                )
              })}
              <div style={{ padding: '12px 0 8px', textAlign: 'center', borderTop: '1px solid var(--border-light)', marginTop: '4px' }}>
                <Link href="/dossiers" style={{ fontSize: '12px', color: 'var(--brand-primary)', textDecoration: 'none', fontWeight: 500 }}>
                  Voir tous les dossiers →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
