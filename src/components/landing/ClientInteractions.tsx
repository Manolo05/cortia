'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function NavButtons() {
  const router = useRouter()
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <div style={{ display: 'flex', gap: 32, fontSize: 14, fontWeight: 500, color: '#5A6B80' }}>
        <button onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Fonctionnalit\u00e9s</button>
        <button onClick={() => scrollTo('how')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Comment \u00e7a marche</button>
        <button onClick={() => scrollTo('pricing')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Tarifs</button>
      </div>
      <button onClick={() => router.push('/login')} style={{ background: '#0B1D3A', color: '#fff', padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}>{"Acc\u00e9der \u00e0 l'app"}</button>
    </>
  )
}

export function LogoClick({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
      {children}
    </div>
  )
}

export function AnimatedBar() {
  const [barWidth, setBarWidth] = useState(0)
  useEffect(() => { const t = setTimeout(() => setBarWidth(87), 800); return () => clearTimeout(t) }, [])
  return (
    <div style={{ height: 8, background: 'rgba(11,29,58,0.06)', borderRadius: 9999, overflow: 'hidden' }}>
      <div style={{ height: '100%', borderRadius: 9999, background: 'linear-gradient(to right, #1D9E75, #2CC98F)', transition: 'width 2s ease-out', width: `${barWidth}%` }} />
    </div>
  )
}

export function CTAButton({ children, variant = 'primary' }: { children: React.ReactNode; variant?: 'primary' | 'secondary' | 'gold' }) {
  const router = useRouter()
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: '#0B1D3A', color: '#fff', padding: '16px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' },
    secondary: { background: 'transparent', color: '#0B1D3A', padding: '16px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, border: '1.5px solid rgba(11,29,58,0.15)', cursor: 'pointer' },
    gold: { background: '#D4A843', color: '#0B1D3A', padding: '18px 40px', borderRadius: 10, fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer', position: 'relative' as const },
  }
  return <button onClick={() => router.push('/login')} style={styles[variant]}>{children}</button>
}

export function ScrollButton({ targetId, children, style }: { targetId: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return <button onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' })} style={style}>{children}</button>
}

export function FooterLinks() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#5A6B80' }}>
      <button onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Fonctionnalit\u00e9s</button>
      <button onClick={() => scrollTo('pricing')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Tarifs</button>
    </div>
  )
}

export function PricingCTA({ label, primary }: { label: string; primary: boolean }) {
  const router = useRouter()
  return (
    <button onClick={() => router.push('/login')} style={{ width: '100%', padding: '16px 0', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', background: primary ? '#0B1D3A' : 'transparent', color: primary ? '#fff' : '#0B1D3A', border: primary ? 'none' : '1.5px solid rgba(11,29,58,0.15)' }}>{label}</button>
  )
}
