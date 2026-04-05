'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface DossierHeader {
  id: string
  reference?: string
  statut: string
}

interface Emprunteur {
  prenom: string
  nom: string
  est_co_emprunteur: boolean
}

interface Analyse {
  score_global: number
}

const STATUT_CONFIG: Record<string, { label: string; badge: string }> = {
  nouveau: { label: 'Nouveau', badge: 'badge-blue' },
  en_cours: { label: 'En cours', badge: 'badge-warning' },
  en_attente: { label: 'En attente', badge: 'badge-warning' },
  analyse: { label: 'Analyse', badge: 'badge-purple' },
  instruction: { label: 'Instruction', badge: 'badge-purple' },
  soumis: { label: 'Soumis', badge: 'badge-blue' },
  accord: { label: 'Accord', badge: 'badge-success' },
  accorde: { label: 'Accordé', badge: 'badge-success' },
  accepte: { label: 'Accepté', badge: 'badge-success' },
  signe: { label: 'Signé', badge: 'badge-success' },
  refuse: { label: 'Refusé', badge: 'badge-danger' },
  archive: { label: 'Archivé', badge: 'badge-neutral' },
}

function getScoreColor(score?: number): string {
  if (!score) return '#94a3b8'
  if (score >= 75) return '#16a34a'
  if (score >= 55) return '#0ea5e9'
  if (score >= 40) return '#ca8a04'
  return '#dc2626'
}

export default function DossierLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string
  const supabase = createClient()

  const [dossier, setDossier] = useState<DossierHeader | null>(null)
  const [nomClient, setNomClient] = useState<string>('')
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: d } = await supabase
          .from('dossiers')
          .select('id, reference, statut')
          .eq('id', id)
          .single()
        if (d) setDossier(d)

        const [empRes, anaRes] = await Promise.all([
          supabase.from('emprunteurs').select('prenom, nom, est_co_emprunteur').eq('dossier_id', id),
          supabase.from('analyses_financieres').select('score_global').eq('dossier_id', id).single()
        ])

        const emp = empRes.data?.find((e: Emprunteur) => !e.est_co_emprunteur) || empRes.data?.[0]
        if (emp) setNomClient(emp.prenom + ' ' + emp.nom)
        if (anaRes.data?.score_global) setScore(anaRes.data.score_global)
      } catch {}
    }
    if (id) load()
  }, [id, supabase])

  const tabs = [
    { href: '/dossiers/' + id, label: 'Résumé' },
    { href: '/dossiers/' + id + '/documents', label: 'Documents' },
    { href: '/dossiers/' + id + '/controle-docs', label: 'Contrôle docs' },
    { href: '/dossiers/' + id + '/analyse', label: 'Analyse IA' },
    { href: '/dossiers/' + id + '/synthese', label: 'Synthèse banque' },
  ]

  const sc = dossier ? (STATUT_CONFIG[dossier.statut] || { label: dossier.statut, badge: 'badge-neutral' }) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* Breadcrumb + Tabs header */}
      <div style={{
        borderBottom: '1px solid var(--border-default)',
        background: 'var(--surface-1)',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 32px' }}>

          {/* Breadcrumb row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '56px' }}>
            <Link href="/dossiers" style={{
              color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0,
              padding: '4px 8px', borderRadius: '6px',
              background: 'transparent', transition: 'background 0.15s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Dossiers
            </Link>
            <span style={{ color: 'var(--border-default)', fontSize: '14px' }}>/</span>

            {dossier ? (
              <>
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {nomClient || 'Dossier'}
                </span>
                {dossier.reference && (
                  <span style={{
                    fontSize: '11px', color: 'var(--text-muted)',
                    background: 'var(--surface-2)', padding: '3px 8px',
                    borderRadius: '5px', fontFamily: 'ui-monospace, monospace',
                    letterSpacing: '0.3px',
                  }}>
                    {dossier.reference}
                  </span>
                )}
                {sc && (
                  <span className={'badge ' + sc.badge} style={{ fontSize: '11px' }}>
                    {sc.label}
                  </span>
                )}

                <div style={{ flex: 1 }} />

                {score !== null && score > 0 && (
                  <span style={{
                    fontSize: '14px', fontWeight: 700,
                    color: getScoreColor(score),
                    background: 'var(--surface-2)',
                    padding: '4px 12px', borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={getScoreColor(score)} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                    {score}/100
                  </span>
                )}
              </>
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Chargement...</span>
            )}
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: '0', borderTop: '1px solid var(--border-light)',
            overflowX: 'auto',
          }}>
            {tabs.map(tab => {
              const isActive = pathname === tab.href
              return (
                <Link key={tab.href} href={tab.href} style={{
                  padding: '11px 18px', fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  marginBottom: '-1px',
                  transition: 'all 0.12s',
                  whiteSpace: 'nowrap',
                  position: 'relative',
                }}>
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 32px' }}>
        {children}
      </div>
    </div>
  )
}
