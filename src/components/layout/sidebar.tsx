'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

const navigation = [
  {
    name: 'Tableau de bord',
    href: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    name: 'Dossiers',
    href: '/dossiers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      </svg>
    ),
  },
  {
    name: 'Cabinet',
    href: '/cabinet',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    name: 'Paramètres',
    href: '/parametres',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [userInfo, setUserInfo] = useState<{name: string, cabinet: string, initials: string} | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profil } = await supabase
          .from('profils_utilisateurs')
          .select('nom_complet, cabinet_id')
          .eq('id', user.id)
          .single()
        if (profil) {
          const name = profil.nom_complet || user.email || 'Courtier'
          const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          setUserInfo({ name, cabinet: 'Mon Cabinet', initials })
        }
      }
    }
    loadUser()
  }, [supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="cortia-sidebar flex flex-col h-full w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5" style={{borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'}}>
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight">CortIA</span>
          <p className="text-xs" style={{color: 'rgba(148,163,184,0.8)'}}>Courtage Immobilier</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map(item => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
            >
              <span style={{color: isActive ? '#60a5fa' : 'rgba(148,163,184,0.8)'}}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4" style={{borderTop: '1px solid rgba(255,255,255,0.1)'}}>
        {userInfo && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl" style={{background: 'rgba(255,255,255,0.05)'}}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)'}}>
              {userInfo.initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{userInfo.name}</p>
              <p className="text-xs truncate" style={{color: 'rgba(148,163,184,0.7)'}}>{userInfo.cabinet}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="sidebar-nav-item w-full"
        >
          <svg className="w-5 h-5" fill="none" stroke="rgba(148,163,184,0.8)" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span style={{color: 'rgba(148,163,184,0.8)'}}>Déconnexion</span>
        </button>
      </div>
    </div>
  )
}
