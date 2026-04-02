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
  apport_personnel?: number
  duree_souhaitee?: number
  type_projet?: string
  taux_endettement?: number
  reste_a_vivre?: number
  mensualite_estimee?: number
  updated_at?: string
  created_at?: string
}

interface Emprunteur {
  id: string
  prenom?: string
  nom?: string
  type_emprunteur?: string
  situation_pro?: string
  revenus_nets_mensuels?: number
  charges_mensuelles?: number
}

const STATUT_CONFIG: Record<string, { label: string; badge: string }> = {
  en_attente: { label: 'En attente', badge: 'badge-warning' },
  en_cours:   { label: 'En cours',   badge: 'badge-info' },
  analyse:    { label: 'En analyse', badge: 'badge-purple' },
  accorde:    { label: 'Accorde',    badge: 'badge-success' },
  refuse:     { label: 'Refuse',     badge: 'badge-danger' },
  archive:    { label: 'Archive',    badge: 'badge-neutral' },
}

const TIMELINE_STEPS = [
  { id: 'creation',    label: 'Creation',    statuts: ['en_attente', 'en_cours', 'analyse', 'accorde', 'refuse', 'archive'] },
  { id: 'collecte',   label: 'Collecte',    statuts: ['en_cours', 'analyse', 'accorde', 'refuse', 'archive'] },
  { id: 'analyse',    label: 'Analyse',     statuts: ['analyse', 'accorde', 'refuse', 'archive'] },
  { id: 'pret_banque',label: 'Pret banque', statuts: ['accorde', 'archive'] },
  { id: 'envoye',     label: 'Envoye',      statuts: ['archive'] },
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

function ScoreRing({ score, size = 90 }: { score: number; size?: number }) {
  const r = (size - 12) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#16a34a' : score >= 55 ? '#0ea5e9' : score >= 40 ? '#ca8a04' : '#dc2626'
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={String(circ)} strokeDashoffset={String(offset)} strokeLinecap="round"
        />
      </svg>
      <div style={{ position: 'relative', textAlign: 'center' }}>
        <div style={{ fontSize: '22px', fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>/100</div>
      </div>
    </div>
  )
}

export default function DossierResumePage() {
  const params = useParams()
  const dossierId = params.id as string
  const supabase = createClient()
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [emprunteurs, setEmprunteurs] = useState<Emprunteur[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: d } = await supabase.from('dossiers').select('*').eq('id', dossierId).single()
        if (d) setDossier(d)
        const { data: e } = await supabase.from('emprunteurs').select('*').eq('dossier_id', dossierId)
        setEmprunteurs(e || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [dossierId, supabase])

  if (loading) return (
    <div className="loading-container" style={{ paddingTop: '80px' }}>
      <div className="loading-spinner" />
      <p>Chargement du dossier...</p>
    </div>
  )

  if (!dossier) return (
    <div className="empty-state" style={{ paddingTop: '80px' }}>
      <div className="empty-state-title">Dossier introuvable</div>
      <Link href="/dossiers" className="btn-secondary" style={{ marginTop: '12px' }}>Retour</Link>
    </div>
  )

  const score = dossier.score_global || 0
  const totalRevenus = emprunteurs.reduce((s, e) => s + (e.revenus_nets_mensuels || 0), 0)
  const totalCharges = emprunteurs.reduce((s, e) => s + (e.charges_mensuelles || 0), 0)
  const tauxEndettement = dossier.taux_endettement || (totalRevenus > 0 ? Math.round((totalCharges / totalRevenus) * 100) : 0)

  const pointsForts: string[] = []
  const pointsVigilance: string[] = []

  emprunteurs.forEach(e => {
    if (e.situation_pro === 'cdi') pointsForts.push('Emploi CDI confirme (' + (e.prenom || 'emprunteur') + ')')
    else if (e.situation_pro === 'fonctionnaire') pointsForts.push('Fonctionnaire - stabilite maximale')
    else if (e.situation_pro === 'independant') pointsVigilance.push('Revenus independant - a lisser sur 3 ans')
    else if (e.situation_pro === 'cdd') pointsVigilance.push('CDD en cours (' + (e.prenom || '') + ') - preciser la duree')
  })

  if (dossier.apport_personnel) {
    const tauxApport = dossier.montant_projet ? Math.round((dossier.apport_personnel / dossier.montant_projet) * 100) : 0
    if (tauxApport >= 15) pointsForts.push('Apport solide : ' + tauxApport + '% du projet')
    else if (tauxApport >= 5) pointsVigilance.push('Apport limite : ' + tauxApport + '% du projet')
    else pointsVigilance.push('Apport faible ou absent - a renforcer')
  }

  if (tauxEndettement > 0) {
    if (tauxEndettement <= 30) pointsForts.push('Endettement maitrise : ' + tauxEndettement + '%')
    else if (tauxEndettement <= 35) pointsVigilance.push("Taux d'endettement a la limite : " + tauxEndettement + '%')
    else pointsVigilance.push("Taux d'endettement eleve : " + tauxEndettement + '% - credits a analyser')
  }

  if (dossier.reste_a_vivre) {
    if (dossier.reste_a_vivre >= 1500) pointsForts.push('Reste a vivre confortable : ' + formatCurrency(dossier.reste_a_vivre) + '/mois')
    else pointsVigilance.push('Reste a vivre serre : ' + formatCurrency(dossier.reste_a_vivre) + '/mois')
  }

  interface ActionItem { label: string; urgence: 'haute' | 'moyenne' | 'faible' }
  const actionsRecommandees: ActionItem[] = []
  if (dossier.statut === 'en_attente') actionsRecommandees.push({ label: 'Relancer le client pour les pieces manquantes', urgence: 'haute' })
  if (score > 0 && score < 50) actionsRecommandees.push({ label: 'Analyser les anomalies documentaires avant soumission', urgence: 'haute' })
  if (tauxEndettement > 33) actionsRecommandees.push({ label: "Preparer un argumentaire pour le taux d'endettement", urgence: 'moyenne' })
  if (!dossier.apport_personnel) actionsRecommandees.push({ label: "Verifier et documenter l'apport personnel", urgence: 'moyenne' })
  if (score >= 70 && dossier.statut !== 'accorde') actionsRecommandees.push({ label: 'Dossier pret - generer la synthese banque', urgence: 'faible' })
  if (actionsRecommandees.length === 0) actionsRecommandees.push({ label: 'Verifier la coherence des pieces collectees', urgence: 'faible' })

  const urgColor = (u: string) => u === 'haute' ? '#dc2626' : u === 'moyenne' ? '#ea580c' : '#16a34a'
  const urgBg   = (u: string) => u === 'haute' ? 'var(--risk-critical-bg)' : u === 'moyenne' ? 'var(--risk-high-bg)' : 'var(--risk-low-bg)'
  const urgBadge = (u: string) => u === 'haute' ? 'badge-danger' : u === 'moyenne' ? 'badge-orange' : 'badge-success'
  const urgLabel = (u: string) => u === 'haute' ? 'Urgent' : u === 'moyenne' ? 'Important' : 'Info'

  return (
    <div style={{ padding: '28px 0 64px', maxWidth: '900px' }}>

      {/* Score + recap */}
      <div style={{ display: 'grid', gridTemplateColumns: score > 0 ? '130px 1fr' : '1fr', gap: '20px', marginBottom: '20px' }}>
        {score > 0 && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px 16px', textAlign: 'center' }}>
            <ScoreRing score={score} size={86} />
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score global</div>
            <span className={'badge ' + (score >= 70 ? 'badge-success' : score >= 50 ? 'badge-info' : score >= 35 ? 'badge-warning' : 'badge-danger')} style={{ fontSize: '11px' }}>
              {score >= 70 ? 'Bon dossier' : score >= 50 ? 'Dossier moyen' : score >= 35 ? 'A corriger' : 'Fragile'}
            </span>
          </div>
        )}
        <div className="card">
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <div className="section-title">Resume instantane</div>
            <Link href={'/dossiers/' + dossierId + '/emprunteurs'} className="btn-ghost" style={{ fontSize: '12px' }}>Modifier</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            {[
              { label: 'Revenus nets/mois',   value: formatCurrency(totalRevenus),    color: 'var(--score-excellent)' },
              { label: "Taux d'endettement",  value: tauxEndettement > 0 ? tauxEndettement + '%' : '-', color: tauxEndettement > 35 ? 'var(--score-poor)' : tauxEndettement > 30 ? 'var(--score-average)' : 'var(--score-excellent)' },
              { label: 'Reste a vivre',        value: formatCurrency(dossier.reste_a_vivre || (totalRevenus - totalCharges - (dossier.mensualite_estimee || 0))), color: 'var(--text-primary)' },
              { label: 'Apport personnel',     value: formatCurrency(dossier.apport_personnel), color: 'var(--brand-primary)' },
              { label: 'Mensualite estimee',   value: formatCurrency(dossier.mensualite_estimee), color: 'var(--text-primary)' },
              { label: 'Duree souhaitee',      value: dossier.duree_souhaitee ? dossier.duree_souhaitee + ' mois' : '-', color: 'var(--text-primary)' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--surface-1)', borderRadius: '8px', padding: '10px 12px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: item.color }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ marginBottom: '18px', padding: '16px 24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Avancement du dossier</div>
        <div className="timeline">
          {TIMELINE_STEPS.map((step, i) => {
            const done = step.statuts.includes(dossier.statut)
            return (
              <div key={step.id} className={'timeline-step' + (done ? ' completed' : '')}>
                <div className={'timeline-dot ' + (done ? 'done' : 'pending')}>{done ? String.fromCharCode(10003) : i + 1}</div>
                <div className="timeline-step-label">{step.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Points forts et vigilance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#16a34a' }}>Points forts</h3>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>{pointsForts.length}</span>
          </div>
          {pointsForts.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Completez le dossier pour voir les points forts.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pointsForts.map((p, i) => (
                <div key={i} className="alert-card alert-card-green" style={{ padding: '8px 12px' }}>
                  <div className="alert-dot" style={{ background: '#16a34a' }} />
                  <span style={{ fontSize: '13px', color: '#166534' }}>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: '#ea580c' }}>Points de vigilance</h3>
            <span className={'badge ' + (pointsVigilance.length > 0 ? 'badge-orange' : 'badge-success')} style={{ fontSize: '10px' }}>{pointsVigilance.length}</span>
          </div>
          {pointsVigilance.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 500 }}>Aucun point de vigilance identifie.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pointsVigilance.map((p, i) => (
                <div key={i} className="alert-card alert-card-orange" style={{ padding: '8px 12px' }}>
                  <div className="alert-dot" style={{ background: '#ea580c' }} />
                  <span style={{ fontSize: '13px', color: '#7c2d12' }}>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions recommandees */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header">
          <h3 className="card-title">Actions recommandees</h3>
          <span className="badge badge-brand" style={{ fontSize: '10px' }}>IA metier</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {actionsRecommandees.map((action, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: urgBg(action.urgence), borderRadius: '8px', border: '1px solid ' + urgColor(action.urgence) + '22' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: urgColor(action.urgence), flexShrink: 0 }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{action.label}</span>
              <span className={'badge ' + urgBadge(action.urgence)} style={{ fontSize: '10px' }}>{urgLabel(action.urgence)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Infos client */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Informations client</h3>
          <Link href={'/dossiers/' + dossierId + '/emprunteurs'} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>Modifier</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0 24px' }}>
          {[
            { label: 'Nom du client', value: dossier.nom_client },
            { label: 'Reference', value: dossier.reference },
            { label: 'Statut', value: STATUT_CONFIG[dossier.statut]?.label || dossier.statut },
            { label: 'Montant projet', value: formatCurrency(dossier.montant_projet) },
            { label: 'Type projet', value: dossier.type_projet },
            { label: 'Cree le', value: dossier.created_at ? new Date(dossier.created_at).toLocaleDateString('fr-FR') : '-' },
          ].map((item, i) => (
            <div key={i} className="stat-row">
              <span className="stat-label">{item.label}</span>
              <span className="stat-value">{item.value || '-'}</span>
            </div>
          ))}
        </div>
        {emprunteurs.length > 0 && (
          <>
            <div className="divider" />
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {emprunteurs.map(e => (
                <div key={e.id} style={{ background: 'var(--surface-1)', border: '1px solid var(--border-primary)', borderRadius: '10px', padding: '10px 14px', flex: '1', minWidth: '200px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    {[e.prenom, e.nom].filter(Boolean).join(' ') || 'Emprunteur'}
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px', textTransform: 'uppercase' }}>{e.type_emprunteur}</span>
                  </div>
                  <div className="stat-row" style={{ padding: '4px 0' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Situation pro</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{e.situation_pro || '-'}</span>
                  </div>
                  <div className="stat-row" style={{ padding: '4px 0' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Revenus nets/mois</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>{formatCurrency(e.revenus_nets_mensuels)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
