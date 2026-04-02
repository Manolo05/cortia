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

export default function DossierLayout({ children }: { children: React.ReactNode }) {
  const params = useParams()
  const pathname = usePathname()
  const id = params.id as string
  const supabase = createClient()
  const [dossier, setDossier] = useState<Dossier | null>(null)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('dossiers')
        .select('id, reference, nom_client, statut, score_global, montant_projet')
        .eq('id', id)
        .single()
      setDossier(data)
    }
    if (id) load()
  }, [id, supabase])

  const tabs = [
    { href: '/dossiers/' + id, label: 'Resume' },
    { href: '/dossiers/' + id + '/documents', label: 'Documents' },
    { href: '/dossiers/' + id + '/controle-docs', label: 'Controle docs' },
    { href: '/dossiers/' + id + '/analyse', label: 'Analyse IA' },
    { href: '/dossiers/' + id + '/synthese', label: 'Synthese banque' },
  ]

  const sc = dossier ? (STATUT_CONFIG[dossier.statut] || STATUT_CONFIG.en_attente) : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <div style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--surface-1)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', height: '56px' }}>
            <Link href="/dossiers" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {'<'} Dossiers
            </Link>
            <span style={{ color: 'var(--border-default)' }}>/</span>
            {dossier ? (
              <>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {dossier.nom_client || 'Dossier'}
                </span>
                {dossier.reference && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: '5px', fontFamily: 'monospace' }}>
                    {dossier.reference}
                  </span>
                )}
                {sc && (
                  <span className={'badge ' + sc.badge} style={{ fontSize: '11px' }}>{sc.label}</span>
                )}
                {dossier.score_global ? (
                  <span style={{ fontSize: '13px', fontWeight: 700, color: getScoreColor(dossier.score_global), background: 'var(--surface-2)', padding: '3px 10px', borderRadius: '8px', marginLeft: 'auto' }}>
                    {dossier.score_global}/100
                  </span>
                ) : null}
              </>
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Chargement...</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0px', borderTop: '1px solid var(--border-light)' }}>
            {tabs.map(tab => {
              const isActive = pathname === tab.href
              return (
                <Link key={tab.href} href={tab.href} style={{
                  padding: '10px 16px',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  textDecoration: 'none',
                  borderBottom: isActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  marginBottom: '-1px',
                  transition: 'all 0.12s',
                  whiteSpace: 'nowrap',
                }}>
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 32px' }}>
        {children}
      </div>
    </div>
  )
}
