'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Dossier {
  id: string
  reference?: string
  nom_client?: string
  statut: string
  score_global?: number
  montant_projet?: number
}

const STATUT_CONFIG: Record<string, { label: string; badge: string }> = {
  en_attente: { label: 'En attente', badge: 'badge-warning' },
  en_cours:   { label: 'En cours',   badge: 'badge-info' },
  analyse:    { label: 'En analyse', badge: 'badge-purple' },
  accorde:    { label: 'Accorde',    badge: 'badge-success' },
  refuse:     { label: 'Refuse',     badge: 'badge-danger' },
  archive:    { label: 'Archive',    badge: 'badge-neutral' },
}

const TABS = [
  { id: 'resume',        label: 'Resume',        path: '' },
  { id: 'emprunteurs',   label: 'Emprunteur',    path: '/emprunteurs' },
  { id: 'projet',        label: 'Projet',        path: '/projet' },
  { id: 'charges',       label: 'Charges',       path: '/charges' },
  { id: 'analyse',       label: 'Analyse IA',    path: '/analyse' },
  { id: 'controle-docs', label: 'Controle Docs', path: '/controle-docs' },
  { id: 'synthese',      label: 'Synthese Banque', path: '/synthese' },
]

function getScoreColor(score?: number): string {
  if (!score) return 'var(--text-muted)'
  if (score >= 75) return '#16a34a'
  if (score >= 55) return '#0ea5e9'
  if (score >= 40) return '#ca8a04'
  return '#dc2626'
}

function getScoreLabel(score?: number): string {
  if (!score) return 'Non evalue'
  if (score >= 75) return 'Bon dossier'
  if (score >= 55) return 'Correct'
  if (score >= 40) return 'A ameliorer'
  return 'Fragile'
}

function formatCurrency(amount?: number): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

export default function DossierLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const dossierId = params.id as string
  const supabase = createClient()
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('dossiers').select('id, reference, nom_client, statut, score_global, montant_projet').eq('id', dossierId).single()
        if (data) setDossier(data)
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [dossierId, supabase])

  const sc = dossier ? (STATUT_CONFIG[dossier.statut] || STATUT_CONFIG.en_attente) : null
  const score = dossier?.score_global || 0
  const isPretBanque = score >= 70 && dossier?.statut !== 'refuse' && dossier?.statut !== 'archive'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-app)' }}>
      <div style={{ background: 'var(--surface-0)', borderBottom: '1px solid var(--border-primary)', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>

          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link href="/dossiers" className="btn-ghost" style={{ fontSize: '13px', padding: '5px 10px' }}>
                Retour aux dossiers
              </Link>
              <div style={{ width: '1px', height: '20px', background: 'var(--border-primary)' }} />
              {loading ? (
                <div style={{ height: '20px', width: '180px', background: 'var(--surface-2)', borderRadius: '6px' }} />
              ) : dossier ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="avatar" style={{ width: '34px', height: '34px', fontSize: '13px', background: 'var(--brand-primary)', flexShrink: 0 }}>
                    {(dossier.nom_client || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                        {dossier.nom_client || 'Client inconnu'}
                      </span>
                      {isPretBanque && (
                        <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', border: '1px solid #bbf7d0', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                          Pret banque
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 500 }}>
                        {dossier.reference || dossierId.slice(0, 8).toUpperCase()}
                      </span>
                      {sc && <span className={'badge ' + sc.badge} style={{ fontSize: '10px' }}>{sc.label}</span>}
                      {dossier.montant_projet ? (
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>{formatCurrency(dossier.montant_projet)}</span>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Right: score + action */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {score > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface-1)', border: '1px solid var(--border-primary)', borderRadius: '10px', padding: '6px 12px' }}>
                  <div style={{ position: 'relative', width: '32px', height: '32px', flexShrink: 0 }}>
                    <svg width="32" height="32" style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx="16" cy="16" r="12" fill="none" stroke="var(--surface-3)" strokeWidth="3.5" />
                      <circle cx="16" cy="16" r="12" fill="none" stroke={getScoreColor(score)} strokeWidth="3.5"
                        strokeDasharray={String(2 * Math.PI * 12)}
                        strokeDashoffset={String(2 * Math.PI * 12 * (1 - score / 100))}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: getScoreColor(score) }}>{score}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: getScoreColor(score) }}>{score}/100</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{getScoreLabel(score)}</div>
                  </div>
                </div>
              )}
              <Link href={'/dossiers/' + dossierId + '/synthese'} className="btn-primary" style={{ fontSize: '12.5px', padding: '8px 14px' }}>
                Synthese banque
              </Link>
            </div>
          </div>

          {/* Tab nav */}
          <div className="tab-nav">
            {TABS.map(tab => {
              const tabPath = '/dossiers/' + dossierId + tab.path
              const isActive = tab.path === '' ? pathname === '/dossiers/' + dossierId : pathname.startsWith(tabPath)
              return (
                <Link key={tab.id} href={tabPath} className={'tab-item' + (isActive ? ' active' : '')}>
                  {tab.id === 'controle-docs' && (
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', display: 'inline-block' }} />
                  )}
                  {tab.label}
                  {tab.id === 'synthese' && isPretBanque && (
                    <span style={{ background: '#dcfce7', color: '#16a34a', fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '20px', marginLeft: '2px' }}>
                      OK
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
        {children}
      </div>
    </div>
  )
}
