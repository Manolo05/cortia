'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface DashboardStats {
  totalDossiers: number
  enCours: number
  accordes: number
  enAttente: number
}

interface UserInfo {
  name: string
  cabinet: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats>({ totalDossiers: 0, enCours: 0, accordes: 0, enAttente: 0 })
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: 'Courtier', cabinet: 'Mon Cabinet' })
  const [loading, setLoading] = useState(true)
  const [recentDossiers, setRecentDossiers] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profil } = await supabase
        .from('profils_utilisateurs')
        .select('nom_complet, cabinet_id')
        .eq('id', user.id)
        .single()

      if (profil) {
        setUserInfo({
          name: profil.nom_complet || user.email || 'Courtier',
          cabinet: 'Mon Cabinet',
        })

        const { data: dossiers } = await supabase
          .from('dossiers')
          .select('id, nom_client, statut, created_at, montant_pret')
          .eq('cabinet_id', profil.cabinet_id)
          .order('created_at', { ascending: false })

        if (dossiers) {
          setRecentDossiers(dossiers.slice(0, 5))
          setStats({
            totalDossiers: dossiers.length,
            enCours: dossiers.filter(d => d.statut === 'en_cours' || d.statut === 'analyse').length,
            accordes: dossiers.filter(d => d.statut === 'accorde').length,
            enAttente: dossiers.filter(d => d.statut === 'en_attente').length,
          })
        }
      }

      setLoading(false)
    }
    load()
  }, [supabase])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const statCards = [
    {
      label: 'Total Dossiers',
      value: stats.totalDossiers,
      icon: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z',
      bg: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      light: 'rgba(59,130,246,0.1)',
    },
    {
      label: 'En cours',
      value: stats.enCours,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      bg: 'linear-gradient(135deg, #f59e0b, #d97706)',
      light: 'rgba(245,158,11,0.1)',
    },
    {
      label: 'Accordés',
      value: stats.accordes,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      bg: 'linear-gradient(135deg, #10b981, #059669)',
      light: 'rgba(16,185,129,0.1)',
    },
    {
      label: 'En attente',
      value: stats.enAttente,
      icon: 'M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z',
      bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      light: 'rgba(139,92,246,0.1)',
    },
  ]

  const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
    en_cours: { label: 'En cours', color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
    accorde: { label: 'Accordé', color: '#059669', bg: 'rgba(16,185,129,0.1)' },
    refuse: { label: 'Refusé', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
    en_attente: { label: 'En attente', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    analyse: { label: 'Analyse', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, <span style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{userInfo.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 mt-1">{userInfo.cabinet} — Voici un aperçu de votre activité</p>
        </div>
        <Link
          href="/dossiers/nouveau"
          className="cortia-button-primary px-5 py-2.5 text-sm font-medium"
        >
          + Nouveau dossier
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div key={card.label} className="cortia-stat-card">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: card.light }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" style={{ stroke: card.bg.includes('3b82f6') ? '#3b82f6' : card.bg.includes('f59e0b') ? '#f59e0b' : card.bg.includes('10b981') ? '#10b981' : '#8b5cf6' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={card.icon} />
                </svg>
              </div>
              <span className="text-3xl font-bold text-slate-900">{loading ? '—' : card.value}</span>
            </div>
            <p className="text-sm font-medium text-slate-500">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent dossiers */}
      <div className="cortia-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Dossiers récents</h2>
          <Link href="/dossiers" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Voir tous →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : recentDossiers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(59,130,246,0.1)' }}>
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">Aucun dossier pour l&apos;instant</h3>
            <p className="text-slate-500 text-sm mb-4">Créez votre premier dossier client pour commencer</p>
            <Link href="/dossiers/nouveau" className="cortia-button-primary px-4 py-2 text-sm">
              Créer un dossier
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentDossiers.map((d) => {
              const s = statusLabels[d.statut] || { label: d.statut, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
              return (
                <Link key={d.id} href={`/dossiers/${d.id}`} className="cortia-table-row flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                    {d.nom_client?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{d.nom_client}</p>
                    <p className="text-xs text-slate-500">{new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {d.montant_pret && (
                    <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                      {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(d.montant_pret)}
                    </span>
                  )}
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0" style={{ color: s.color, background: s.bg }}>
                    {s.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
