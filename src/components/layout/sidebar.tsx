'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

// SVG Icon components as inline functions
function IconDashboard({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function IconDossiers({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function IconClients({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function IconAnalyse({ color }: { color: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
      <polyline points="7.5 19.79 7.5 14.6 3 12" />
      <polyline points="21 12 16.5 14.6 16.5 19.79" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function IconPlus({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function IconSettings({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconLogout({ color }: { color: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

const NAV_ITEMS = [
  { href: '/', label: 'Tableau de bord', Icon: IconDashboard },
  { href: '/dossiers', label: 'Dossiers', Icon: IconDossiers },
  { href: '/clients', label: 'Clients', Icon: IconClients },
  { href: '/analyses', label: 'Analyses IA', Icon: IconAnalyse },
]

export function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()

  const [userName, setUserName] = useState('')
  const [cabinetNom, setCabinetNom] = useState('')
  const [initials, setInitials] = useState('U')
  const [dossierCount, setDossierCount] = useState<number | null>(null)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('profils_utilisateurs')
          .select('nom_complet, cabinet_id, cabinets(nom)')
          .eq('id', user.id)
          .single()

        if (data?.nom_complet) {
          setUserName(data.nom_complet)
          setInitials(
            data.nom_complet
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          )
        }
        if (data?.cabinets) setCabinetNom((data.cabinets as any).nom || '')

        // Dossier count
        if (data?.cabinet_id) {
          const { count } = await supabase
            .from('dossiers')
            .select('id', { count: 'exact', head: true })
            .eq('cabinet_id', data.cabinet_id)
          if (count !== null) setDossierCount(count)
        }
      } catch {}
    }
    load()
  }, [supabase])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside style={{
      width: '220px', minHeight: '100vh', background: '#0f172a',
      display: 'flex', flexDirection: 'column',
      position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 50,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>

      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px', fontWeight: 900, color: 'white', flexShrink: 0,
            boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
          }}>C</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px', lineHeight: 1 }}>CortIA</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '3px', fontWeight: 500, letterSpacing: '0.3px' }}>
              {cabinetNom || 'Assistant courtier'}
            </div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 10px', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <div style={{
          fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.2)',
          textTransform: 'uppercase', letterSpacing: '1px',
          padding: '0 8px 8px', marginTop: '0'
        }}>
          Navigation
        </div>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          const hovered = hoveredItem === item.href
          const iconColor = active ? '#93c5fd' : hovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)'
          return (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '9px 10px', borderRadius: '8px',
                color: active ? '#e0ecff' : hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
                fontWeight: active ? 600 : 400,
                fontSize: '13.5px', textDecoration: 'none',
                background: active ? 'rgba(59,130,246,0.15)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent',
                transition: 'all 0.15s ease',
                borderLeft: active ? '3px solid #3b82f6' : '3px solid transparent',
                position: 'relative',
              }}
            >
              <item.Icon color={iconColor} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.href === '/dossiers' && dossierCount !== null && dossierCount > 0 && (
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  background: active ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.08)',
                  color: active ? '#93c5fd' : 'rgba(255,255,255,0.4)',
                  padding: '2px 7px', borderRadius: '10px',
                  minWidth: '20px', textAlign: 'center',
                }}>
                  {dossierCount}
                </span>
              )}
            </Link>
          )
        })}

        {/* Separator */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '12px 8px' }} />

        {/* Nouveau dossier */}
        <Link
          href="/dossiers/nouveau"
          onMouseEnter={() => setHoveredItem('nouveau')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px',
            color: hoveredItem === 'nouveau' ? '#86efac' : 'rgba(255,255,255,0.4)',
            fontSize: '13.5px', textDecoration: 'none',
            borderLeft: '3px solid transparent',
            background: hoveredItem === 'nouveau' ? 'rgba(134,239,172,0.06)' : 'transparent',
            transition: 'all 0.15s ease',
          }}
        >
          <IconPlus color={hoveredItem === 'nouveau' ? '#86efac' : 'rgba(255,255,255,0.3)'} />
          <span>Nouveau dossier</span>
        </Link>
      </nav>

      {/* Bottom section */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '10px 10px 12px' }}>

        {/* Paramètres */}
        <Link
          href="/parametres"
          onMouseEnter={() => setHoveredItem('settings')}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 10px', borderRadius: '8px',
            color: hoveredItem === 'settings' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)',
            fontSize: '13px', textDecoration: 'none',
            borderLeft: '3px solid transparent',
            background: hoveredItem === 'settings' ? 'rgba(255,255,255,0.04)' : 'transparent',
            transition: 'all 0.15s ease',
            marginBottom: '8px',
          }}
        >
          <IconSettings color={hoveredItem === 'settings' ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'} />
          Paramètres
        </Link>

        {/* User card */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 10px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
            boxShadow: '0 1px 4px rgba(99,102,241,0.3)',
          }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '12.5px', fontWeight: 600, color: 'rgba(255,255,255,0.75)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {userName || 'Utilisateur'}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>Courtier</div>
          </div>
          <button
            onClick={handleSignOut}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            title="Déconnexion"
            style={{
              background: hoveredItem === 'logout' ? 'rgba(239,68,68,0.15)' : 'none',
              border: 'none', cursor: 'pointer',
              color: hoveredItem === 'logout' ? '#f87171' : 'rgba(255,255,255,0.25)',
              padding: '5px', borderRadius: '6px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <IconLogout color={hoveredItem === 'logout' ? '#f87171' : 'rgba(255,255,255,0.25)'} />
          </button>
        </div>
      </div>
    </aside>
  )
}
