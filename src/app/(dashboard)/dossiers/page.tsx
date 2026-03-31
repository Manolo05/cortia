'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Dossier {
  id: string
  nom_client: string
  statut: string
  type_bien: string | null
  montant_pret: number | null
  created_at: string
  cabinet_id: string
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  en_cours: { label: 'En cours', color: '#d97706', bg: 'rgba(245,158,11,0.1)' },
  accorde: { label: 'Accordé', color: '#059669', bg: 'rgba(16,185,129,0.1)' },
  refuse: { label: 'Refusé', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  en_attente: { label: 'En attente', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
  analyse: { label: 'Analyse IA', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
}

export default function DossiersPage() {
  const supabase = createClient()
  const [dossiers, setDossiers] = useState<Dossier[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profil } = await supabase
        .from('profil_utilisateur')
        .select('cabinet_id')
        .eq('user_id', user.id)
        .single()

      if (profil?.cabinet_id) {
        const { data } = await supabase
          .from('dossiers')
          .select('*')
          .eq('cabinet_id', profil.cabinet_id)
          .order('created_at', { ascending: false })

        setDossiers(data || [])
      }
      setLoading(false)
    }
    load()
  }, [supabase])

  const filtered = dossiers.filter(d => {
    const matchFilter = filter === 'tous' || d.statut === filter
    const matchSearch = !search || d.nom_client.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  const counts = {
    tous: dossiers.length,
    en_cours: dossiers.filter(d => d.statut === 'en_cours').length,
    accorde: dossiers.filter(d => d.statut === 'accorde').length,
    en_attente: dossiers.filter(d => d.statut === 'en_attente').length,
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dossiers clients</h1>
          <p className="text-slate-500 mt-1">{dossiers.length} dossier{dossiers.length !== 1 ? 's' : ''} au total</p>
        </div>
        <Link href="/dossiers/nouveau" className="cortia-button-primary px-5 py-2.5 text-sm font-medium">
          + Nouveau dossier
        </Link>
      </div>

      {/* Filter tabs + search */}
      <div className="cortia-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'tous', label: 'Tous' },
              { key: 'en_cours', label: 'En cours' },
              { key: 'accorde', label: 'Accordés' },
              { key: 'en_attente', label: 'En attente' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={
                  filter === tab.key
                    ? { background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: 'white', boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }
                    : { background: '#f1f5f9', color: '#64748b' }
                }
              >
                {tab.label} ({counts[tab.key as keyof typeof counts] ?? dossiers.length})
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="cortia-input w-full pl-10"
            />
          </div>
        </div>
      </div>

      {/* Dossiers list */}
      <div className="cortia-card">
        {loading ? (
          <div className="space-y-3 p-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))' }}>
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="url(#grad)">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              {search || filter !== 'tous' ? 'Aucun résultat' : 'Aucun dossier'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {search || filter !== 'tous'
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Créez votre premier dossier pour commencer à gérer vos clients'}
            </p>
            {!search && filter === 'tous' && (
              <Link href="/dossiers/nouveau" className="cortia-button-primary px-6 py-2.5 text-sm">
                Créer mon premier dossier
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <span className="col-span-2">Client</span>
              <span>Type de bien</span>
              <span>Montant</span>
              <span>Statut</span>
            </div>
            <div className="divide-y divide-slate-50">
              {filtered.map(d => {
                const s = statusConfig[d.statut] || { label: d.statut, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
                return (
                  <Link key={d.id} href={`/dossiers/${d.id}`} className="grid grid-cols-5 px-4 py-4 items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-2 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                        {d.nom_client?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{d.nom_client}</p>
                        <p className="text-xs text-slate-400">{new Date(d.created_at).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <span className="text-sm text-slate-600">{d.type_bien || '—'}</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {d.montant_pret
                        ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(d.montant_pret)
                        : '—'}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full w-fit" style={{ color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
