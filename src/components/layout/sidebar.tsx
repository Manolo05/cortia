'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

const NAV_ITEMS = [
  { href: '/',           label: 'Tableau de bord' },
  { href: '/dossiers',   label: 'Dossiers' },
  { href: '/clients',    label: 'Clients' },
  { href: '/analyses',   label: 'Analyses IA' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const supabase = createClient()
  const [userName, setUserName] = useState('')
  const [cabinetNom, setCabinetNom] = useState('')
  const [initials, setInitials] = useState('U')

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        const { data } = await supabase
          .from('profils_utilisateurs')
          .select('nom_complet, cabinets(nom)')
          .eq('id', user.id)
          .single()
        if (data?.nom_complet) {
          setUserName(data.nom_complet)
          setInitials(data.nom_complet.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2))
        }
        if (data?.cabinets) setCabinetNom((data.cabinets as any).nom || '')
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
      width: '220px',
      minHeight: '100vh',
      background: '#0f172a',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0, top: 0, bottom: 0,
      zIndex: 50,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '9px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 800, color: 'white', flexShrink: 0,
            boxShadow: '0 2px 8px rgba(99,102,241,0.4)',
          }}>C</div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'white', letterSpacing: '-0.3px', lineHeight: 1 }}>CortIA</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '2px', fontWeight: 500, letterSpacing: '0.3px' }}>
              {cabinetNom || 'Assistant courtier'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '12px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '1px' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '4px 10px 8px', marginTop: '4px' }}>
          Navigation
        </div>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '9px',
              padding: '8px 10px', borderRadius: '8px',
              color: active ? '#93c5fd' : 'rgba(255,255,255,0.5)',
              fontWeight: active ? 600 : 400, fontSize: '13.5px',
              textDecoration: 'none',
              background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
              transition: 'all 0.12s',
              borderLeft: active ? '2px solid #3b82f6' : '2px solid transparent',
            }}>
              {item.label}
            </Link>
          )
        })}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '12px 8px' }} />
        <Link href="/dossiers/nouveau" style={{
          display: 'flex', alignItems: 'center', gap: '9px',
          padding: '8px 10px', borderRadius: '8px',
          color: 'rgba(255,255,255,0.5)', fontSize: '13.5px',
          textDecoration: 'none', borderLeft: '2px solid transparent',
        }}>
          + Nouveau dossier
        </Link>
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '12px 8px' }}>
        <Link href="/parametres" style={{
          display: 'flex', alignItems: 'center', gap: '9px',
          padding: '7px 10px', borderRadius: '8px',
          color: 'rgba(255,255,255,0.4)', fontSize: '13px',
          textDecoration: 'none', marginBottom: '4px',
        }}>
          Parametres
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userName || 'Utilisateur'}
            </div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>Courtier</div>
          </div>
          <button onClick={handleSignOut} title="Deconnexion" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.25)', fontSize: '13px', padding: '2px', borderRadius: '4px', flexShrink: 0 }}>
            x
          </button>
        </div>
      </div>
    </aside>
  )
}
