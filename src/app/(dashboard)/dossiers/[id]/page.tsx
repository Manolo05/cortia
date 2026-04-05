'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

/* ================================================================
   PAGE DOSSIER PREMIUM — ULTRA ACTIONNABLE
   CortIA v2.0
   ================================================================ */

interface Emprunteur {
  id: string
  prenom: string
  nom: string
  est_co_emprunteur: boolean
  salaire_net_mensuel?: number
  type_contrat?: string
  employeur?: string
  anciennete_emploi?: number
  autres_revenus?: number
  revenus_locatifs?: number
  loyer_actuel?: number
  credits_en_cours?: number
  pension_versee?: number
  autres_charges?: number
  epargne?: number
  date_naissance?: string
  situation_familiale?: string
  nb_enfants_charge?: number
}

interface Projet {
  type_operation?: string
  usage_bien?: string
  prix_bien?: number
  montant_travaux?: number
  apport_personnel?: number
  montant_emprunt?: number
  duree_souhaitee?: number
  taux_interet_cible?: number
  surface_bien?: number
  ville_bien?: string
}

interface AnalyseFinanciere {
  score_global: number
  score_revenus?: number
  score_stabilite?: number
  score_endettement?: number
  score_apport?: number
  score_patrimoine?: number
  taux_endettement_actuel?: number
  taux_endettement_projet?: number
  revenus_nets_mensuels_total?: number
  charges_mensuelles_total?: number
  reste_a_vivre?: number
  capacite_emprunt_max?: number
  taux_apport?: number
  mensualite_estimee?: number
  points_forts?: string[]
  points_vigilance?: string[]
  recommandations?: string[]
}

interface DocumentDossier {
  id: string
  type_document: string
  nom_fichier: string
  statut_verification: string
}

interface ControlDoc {
  id: string
  type_controle: string
  resultat: string
  niveau_alerte?: string
  details?: string
}

interface DossierFull {
  id: string
  reference?: string
  nom_client?: string
  statut: string
  score_global?: number
  niveau_risque?: string
  montant_projet?: number
  taux_endettement?: number
  notes?: string
  created_at?: string
  updated_at?: string
  emprunteurs?: Emprunteur[]
  projet?: Projet[]
  analyses_financieres?: AnalyseFinanciere[]
  documents?: DocumentDossier[]
  controles_docs?: ControlDoc[]
}

const STATUT_CONFIG: Record<string, { label: string; badge: string; color: string }> = {
  nouveau:    { label: 'Nouveau',      badge: 'badge-info',    color: '#0ea5e9' },
  en_attente: { label: 'En attente',   badge: 'badge-warning', color: '#ca8a04' },
  en_cours:   { label: 'En cours',     badge: 'badge-info',    color: '#0ea5e9' },
  analyse:    { label: 'Analyse',      badge: 'badge-purple',  color: '#7c3aed' },
  soumis:     { label: 'Soumis',       badge: 'badge-brand',   color: '#1e40af' },
  accepte:    { label: 'Accepté',   badge: 'badge-success', color: '#059669' },
  accorde:    { label: 'Accordé',   badge: 'badge-success', color: '#16a34a' },
  refuse:     { label: 'Refusé',    badge: 'badge-danger',  color: '#dc2626' },
  archive:    { label: 'Archivé',   badge: 'badge-neutral', color: '#94a3b8' },
}

function getScoreColor(s?: number): string {
  if (!s) return 'var(--text-tertiary)'
  if (s >= 75) return 'var(--success)'
  if (s >= 55) return '#0d9488'
  if (s >= 40) return 'var(--warning)'
  return 'var(--danger)'
}
function getScoreBg(s?: number): string {
  if (!s) return 'var(--surface-2)'
  if (s >= 75) return 'var(--success-light)'
  if (s >= 55) return '#ccfbf1'
  if (s >= 40) return 'var(--warning-light)'
  return 'var(--danger-light)'
}
function getRiskLabel(s?: number): string {
  if (!s) return 'Non évalué'
  if (s >= 75) return 'Risque faible'
  if (s >= 55) return 'Risque modéré'
  if (s >= 40) return 'Risque élevé'
  return 'Risque critique'
}
function getRiskBadge(s?: number): string {
  if (!s) return 'badge-neutral'
  if (s >= 75) return 'badge-success'
  if (s >= 55) return 'badge-info'
  if (s >= 40) return 'badge-warning'
  return 'badge-danger'
}
function fmt(n?: number): string {
  if (!n) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function fmtPct(n?: number): string {
  if (n === undefined || n === null) return '-'
  return n.toFixed(1) + '%'
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const sw = 9, r = (size - sw) / 2
  const circ = 2 * Math.PI * r
  const dash = (Math.min(score, 100) / 100) * circ
  const color = getScoreColor(score)
  return (
    <svg width={size} height={size} viewBox={'0 0 ' + size + ' ' + size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={sw} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeDasharray={dash + ' ' + (circ - dash)} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <g style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}>
        <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize="24" fontWeight="800" fill={color}>{score}</text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">/100</text>
      </g>
    </svg>
  )
}

function MiniScore({ label, value, max = 100 }: { label: string; value?: number; max?: number }) {
  const pct = value ? Math.min((value / max) * 100, 100) : 0
  const color = getScoreColor(value)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)', minWidth: '90px' }}>{label}</span>
      <div style={{ flex: 1, height: '6px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: color, borderRadius: '3px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 700, color, minWidth: '32px', textAlign: 'right' }}>{value || '-'}</span>
    </div>
  )
}

export default function DossierDetailPage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [dossier, setDossier] = useState<DossierFull | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from('dossiers')
          .select(`
            *,
            emprunteurs(*),
            projet:projets(*),
            analyses_financieres(*),
            documents(id, type_document, nom_fichier, statut_verification),
            controles_docs(id, type_controle, resultat, niveau_alerte, details)
          `)
          .eq('id', id)
          .single()
        setDossier(data)
      } catch (err) {
        console.error('Dossier load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner" />
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>Chargement du dossier...</p>
        </div>
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-title">Dossier introuvable</div>
          <div className="empty-state-desc">Ce dossier n’existe pas ou a été supprimé.</div>
          <Link href="/dossiers" className="btn-primary" style={{ marginTop: '16px', textDecoration: 'none' }}>Retour aux dossiers</Link>
        </div>
      </div>
    )
  }

  const sc = STATUT_CONFIG[dossier.statut] || STATUT_CONFIG.en_attente
  const analyse = (dossier.analyses_financieres || [])[0]
  const projet = (dossier.projet || [])[0]
  const emprunteur = (dossier.emprunteurs || []).find(e => !e.est_co_emprunteur)
  const coEmprunteur = (dossier.emprunteurs || []).find(e => e.est_co_emprunteur)
  const docs = dossier.documents || []
  const controles = dossier.controles_docs || []
  const score = analyse?.score_global || dossier.score_global || 0

  const docsValides = docs.filter(d => d.statut_verification === 'valide').length
  const docsRefuses = docs.filter(d => d.statut_verification === 'refuse' || d.statut_verification === 'a_remplacer').length
  const docsTotal = docs.length

  // Financial data
  const endettement = analyse?.taux_endettement_projet || dossier.taux_endettement
  const rav = analyse?.reste_a_vivre
  const apport = projet?.apport_personnel
  const tauxApport = analyse?.taux_apport
  const mensualite = analyse?.mensualite_estimee
  const revenus = analyse?.revenus_nets_mensuels_total
  const charges = analyse?.charges_mensuelles_total
  const capacite = analyse?.capacite_emprunt_max
  const montantProjet = projet?.prix_bien || dossier.montant_projet

  // Points forts / vigilance from analysis
  const ptsForts = analyse?.points_forts || []
  const ptsVigilance = analyse?.points_vigilance || []
  const recommandations = analyse?.recommandations || []

  // Smart computed insights if analyse is empty
  const computedForts: string[] = [...ptsForts]
  const computedVigilance: string[] = [...ptsVigilance]
  const computedActions: string[] = [...recommandations]

  if (ptsForts.length === 0 && ptsVigilance.length === 0) {
    if (endettement && endettement <= 33) computedForts.push('Taux d’endettement maêtrisé (' + endettement.toFixed(1) + '%)')
    if (endettement && endettement > 33) computedVigilance.push('Taux d’endettement élevé (' + endettement.toFixed(1) + '%) — seuil HCSF à 35%')
    if (rav && rav > 1500) computedForts.push('Reste à vivre confortable (' + fmt(rav) + ')')
    if (rav && rav > 0 && rav <= 800) computedVigilance.push('Reste à vivre faible (' + fmt(rav) + ')')
    if (apport && apport > 10000) computedForts.push('Apport personnel présent (' + fmt(apport) + ')')
    if (docsTotal > 0 && docsValides === docsTotal) computedForts.push('Dossier documentaire complet (' + docsTotal + ' pièces validées)')
    if (docsRefuses > 0) computedVigilance.push(docsRefuses + ' document(s) refusé(s) ou à remplacer')
    if (score >= 75) computedForts.push('Score de financiabilité solide')
    if (score > 0 && score < 40) computedVigilance.push('Score de financiabilité critique — revue approfondie recommandée')
    if (emprunteur?.type_contrat === 'CDI' || emprunteur?.type_contrat === 'cdi') computedForts.push('Contrat CDI (stabilité professionnelle)')
    if (emprunteur?.anciennete_emploi && emprunteur.anciennete_emploi >= 24) computedForts.push('Ancienneté emploi ' + Math.floor(emprunteur.anciennete_emploi / 12) + ' ans')
  }

  if (recommandations.length === 0) {
    if (docsRefuses > 0) computedActions.push('Demander au client de remplacer les ' + docsRefuses + ' document(s) refusé(s)')
    if (docsTotal === 0) computedActions.push('Collecter les pièces justificatives (avis imposition, fiches de paie, relevés bancaires)')
    if (score === 0) computedActions.push('Lancer l’analyse IA pour évaluer la financiabilité')
    if (endettement && endettement > 33 && endettement <= 40) computedActions.push('Optimiser l’endettement : rénégocier ou solder un crédit en cours')
    if (score >= 70) computedActions.push('Préparer la synthèse bancaire et soumettre le dossier')
    if (score > 0 && score < 70 && score >= 40) computedActions.push('Améliorer le dossier sur les points de vigilance avant soumission')
  }

  // Pret banque ready?
  const pretBanque = score >= 70 && docsRefuses === 0

  // Timeline
  const timeline = [
    { label: 'Création', done: true, detail: dossier.created_at ? new Date(dossier.created_at).toLocaleDateString('fr-FR') : '' },
    { label: 'Collecte docs', done: docsTotal > 0, detail: docsTotal > 0 ? docsValides + '/' + docsTotal + ' validés' : 'En attente' },
    { label: 'Analyse IA', done: score > 0, detail: score > 0 ? 'Score ' + score + '/100' : 'Non lancée' },
    { label: 'Corrections', done: score > 0 && computedVigilance.length === 0 && docsRefuses === 0, detail: computedVigilance.length > 0 ? computedVigilance.length + ' point(s)' : score > 0 ? 'Aucune requise' : '' },
    { label: 'Prêt banque', done: pretBanque, detail: pretBanque ? 'Prêt à soumettre' : score >= 70 ? 'Docs à corriger' : '' },
  ]

  return (
    <div className="page-container" style={{ animation: 'fadeIn 0.4s ease' }}>

      {/* ===== HEADER PREMIUM ===== */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Link href="/dossiers" style={{ fontSize: '13px', color: 'var(--text-tertiary)', textDecoration: 'none' }}>Dossiers</Link>
          <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>/</span>
          <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{dossier.nom_client || 'Dossier'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="avatar" style={{ width: '48px', height: '48px', fontSize: '18px', background: score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--brand-primary)' : score > 0 ? 'var(--warning)' : 'var(--surface-3)', color: score > 0 ? 'white' : 'var(--text-tertiary)' }}>
              {(dossier.nom_client || 'D').charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 className="page-title" style={{ fontSize: '1.375rem' }}>{dossier.nom_client || 'Client inconnu'}</h1>
                <span className={'badge ' + sc.badge} style={{ fontSize: '11px' }}>{sc.label}</span>
                {pretBanque && (
                  <span className="badge badge-success" style={{ fontSize: '11px', fontWeight: 700 }}>Prêt banque</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                {dossier.reference && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Réf. {dossier.reference}</span>}
                {montantProjet ? <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{fmt(montantProjet)}</span> : null}
                {emprunteur && <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{emprunteur.prenom} {emprunteur.nom}{coEmprunteur ? ' + ' + coEmprunteur.prenom + ' ' + coEmprunteur.nom : ''}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link href={'/dossiers/' + id + '/controle-docs'} className="btn-secondary" style={{ fontSize: '12px', padding: '7px 14px', textDecoration: 'none' }}>Contrôle docs</Link>
            {score >= 60 && (
              <Link href={'/dossiers/' + id + '/synthese'} className="btn-primary" style={{ fontSize: '12px', padding: '7px 14px', textDecoration: 'none' }}>Synthèse banque</Link>
            )}
          </div>
        </div>
      </div>

      {/* ===== ROW 1: SCORE + RESUME + SCORES DETAIL ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 280px', gap: '16px', marginBottom: '16px' }}>

        {/* Score Ring */}
        <div className="card" style={{ padding: '24px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {score > 0 ? (
            <>
              <ScoreRing score={score} size={110} />
              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '8px', color: 'var(--text-primary)' }}>Score global</div>
              <span className={'badge ' + getRiskBadge(score)} style={{ fontSize: '10px', marginTop: '4px' }}>{getRiskLabel(score)}</span>
              {pretBanque && (
                <div style={{ marginTop: '10px', padding: '5px 12px', background: 'var(--success-bg)', border: '1px solid #a7f3d0', borderRadius: '8px', fontSize: '11px', fontWeight: 700, color: 'var(--success)' }}>
                  Prêt pour la banque
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--text-tertiary)' }}>
                Non analysé
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '8px', color: 'var(--text-tertiary)' }}>Score global</div>
              <Link href={'/dossiers/' + id + '/analyse'} className="btn-primary" style={{ marginTop: '10px', fontSize: '11px', padding: '6px 14px', textDecoration: 'none' }}>
                Lancer l’analyse
              </Link>
            </>
          )}
        </div>

        {/* Résumé instantané */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Résumé instantané</h2>
            <span className={'badge ' + sc.badge} style={{ fontSize: '10px' }}>{sc.label}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Endettement', value: endettement ? fmtPct(endettement) : '-', alert: (endettement || 0) > 33, sub: 'Seuil 35%' },
              { label: 'Reste à vivre', value: rav ? fmt(rav) : '-', alert: (rav || 0) > 0 && (rav || 0) < 800, sub: '/mois' },
              { label: 'Apport', value: apport ? fmt(apport) : '-', alert: false, sub: tauxApport ? fmtPct(tauxApport) + ' du projet' : '' },
              { label: 'Mensualité', value: mensualite ? fmt(mensualite) : '-', alert: false, sub: '/mois estimée' },
              { label: 'Revenus nets', value: revenus ? fmt(revenus) : '-', alert: false, sub: '/mois total' },
              { label: 'Documents', value: docsTotal > 0 ? docsValides + '/' + docsTotal : 'Aucun', alert: docsRefuses > 0, sub: docsRefuses > 0 ? docsRefuses + ' à corriger' : docsTotal > 0 ? 'validés' : '' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '10px 12px', borderRadius: 'var(--radius-md)',
                background: item.alert ? 'var(--warning-bg)' : 'var(--surface-1)',
                border: '1px solid ' + (item.alert ? '#fde68a' : 'var(--border-light)')
              }}>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: item.alert ? 'var(--warning)' : 'var(--text-primary)', lineHeight: 1.2 }}>{item.value}</div>
                {item.sub && <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{item.sub}</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Scores détaillés */}
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Scores détaillés</h2>
          {score > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <MiniScore label="Revenus" value={analyse?.score_revenus} />
              <MiniScore label="Stabilité" value={analyse?.score_stabilite} />
              <MiniScore label="Endettement" value={analyse?.score_endettement} />
              <MiniScore label="Apport" value={analyse?.score_apport} />
              <MiniScore label="Patrimoine" value={analyse?.score_patrimoine} />
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              Lancez l’analyse pour voir le détail des scores
            </div>
          )}
        </div>
      </div>

      {/* ===== ROW 2: POINTS FORTS + POINTS VIGILANCE ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Points forts */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--success)' }}>Points forts</h2>
            <span className="badge badge-success" style={{ fontSize: '10px', padding: '1px 7px' }}>{computedForts.length}</span>
          </div>
          {computedForts.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>À compléter après analyse IA</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {computedForts.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0, fontSize: '14px', lineHeight: 1.3 }}>+</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Points de vigilance */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: computedVigilance.length > 0 ? 'var(--danger)' : 'var(--success)', flexShrink: 0 }} />
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: computedVigilance.length > 0 ? 'var(--danger)' : 'var(--success)' }}>Points de vigilance</h2>
            <span className={'badge ' + (computedVigilance.length > 0 ? 'badge-danger' : 'badge-success')} style={{ fontSize: '10px', padding: '1px 7px' }}>{computedVigilance.length}</span>
          </div>
          {computedVigilance.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--success)' }}>Aucun point de vigilance identifié</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {computedVigilance.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--danger)', fontWeight: 700, flexShrink: 0, fontSize: '14px', lineHeight: 1.3 }}>!</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== ROW 3: ACTIONS RECOMMANDEES + TIMELINE ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Actions recommandées */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Actions recommandées</h2>
            <span className="badge badge-brand" style={{ fontSize: '10px', padding: '1px 7px' }}>{computedActions.length}</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
            Quoi demander au client, quoi corriger, quoi optimiser
          </div>
          {computedActions.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Aucune action spécifique pour le moment</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {computedActions.map((act, i) => (
                <div key={i} style={{
                  display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '10px 12px',
                  background: 'var(--info-bg)', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4
                }}>
                  <span style={{ color: 'var(--info)', fontWeight: 700, flexShrink: 0, fontSize: '11px', background: 'white', padding: '1px 6px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>{i + 1}</span>
                  <span>{act}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {docsTotal === 0 || docsRefuses > 0 ? (
              <Link href={'/dossiers/' + id + '/documents'} className="btn-primary" style={{ fontSize: '11.5px', padding: '6px 12px', textDecoration: 'none' }}>
                Compléter les documents
              </Link>
            ) : null}
            {score === 0 ? (
              <Link href={'/dossiers/' + id + '/analyse'} className="btn-primary" style={{ fontSize: '11.5px', padding: '6px 12px', textDecoration: 'none' }}>
                Lancer l’analyse IA
              </Link>
            ) : (
              <Link href={'/dossiers/' + id + '/analyse'} className="btn-ghost" style={{ fontSize: '11.5px', padding: '6px 12px', textDecoration: 'none' }}>
                Voir l’analyse
              </Link>
            )}
            <Link href={'/dossiers/' + id + '/controle-docs'} className="btn-ghost" style={{ fontSize: '11.5px', padding: '6px 12px', textDecoration: 'none' }}>
              Contrôle docs
            </Link>
            {score >= 60 && (
              <Link href={'/dossiers/' + id + '/synthese'} style={{ fontSize: '11.5px', padding: '6px 12px', textDecoration: 'none', background: 'var(--success)', color: 'white', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                Synthèse banque →
              </Link>
            )}
          </div>
        </div>

        {/* Timeline dossier */}
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px' }}>Timeline dossier</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {timeline.map((step, i) => {
              const isLast = i === timeline.length - 1
              const isCurrent = step.done && (isLast || !timeline[i + 1].done)
              return (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', paddingBottom: isLast ? '0' : '20px', position: 'relative' }}>
                  {!isLast && (
                    <div style={{
                      position: 'absolute', left: '13px', top: '28px', bottom: 0, width: '2px',
                      background: step.done ? 'var(--success)' : 'var(--border-light)'
                    }} />
                  )}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, zIndex: 1,
                    background: step.done ? (isCurrent ? 'var(--brand-primary)' : 'var(--success)') : 'var(--surface-0)',
                    border: '2px solid ' + (step.done ? (isCurrent ? 'var(--brand-primary)' : 'var(--success)') : 'var(--border-default)'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isCurrent ? '0 0 0 4px rgba(30,64,175,0.12)' : 'none'
                  }}>
                    {step.done && <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>{isCurrent ? '•' : '\u2713'}</span>}
                  </div>
                  <div style={{ paddingTop: '3px' }}>
                    <div style={{ fontSize: '13px', fontWeight: step.done ? 600 : 400, color: step.done ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                      {step.label}
                    </div>
                    {step.detail && (
                      <div style={{ fontSize: '11px', color: isCurrent ? 'var(--brand-primary)' : 'var(--text-tertiary)', marginTop: '1px', fontWeight: isCurrent ? 500 : 400 }}>
                        {step.detail}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== NOTES ===== */}
      {dossier.notes && (
        <div className="card" style={{ padding: '20px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>Notes</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{dossier.notes}</p>
        </div>
      )}
    </div>
  )
}
