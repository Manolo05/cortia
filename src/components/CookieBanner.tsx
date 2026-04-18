'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('cortia-cookies-accepted')
    if (!accepted) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cortia-cookies-accepted', 'true')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#0B1D3A', color: '#fff', padding: '16px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      flexWrap: 'wrap', fontSize: 13, lineHeight: 1.5,
      boxShadow: '0 -4px 24px rgba(11,29,58,0.2)',
    }}>
      <p style={{ margin: 0, maxWidth: 600 }}>
        CortIA utilise uniquement des cookies essentiels au fonctionnement du service (authentification).
        Aucun cookie publicitaire n&apos;est utilis\u00e9.{' '}
        <Link href="/confidentialite" style={{ color: '#D4A843', textDecoration: 'underline' }}>En savoir plus</Link>
      </p>
      <button
        onClick={accept}
        style={{
          background: '#D4A843', color: '#0B1D3A', border: 'none', padding: '10px 24px',
          borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        J&apos;accepte
      </button>
    </div>
  )
}
