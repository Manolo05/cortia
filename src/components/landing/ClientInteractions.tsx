'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function NavButtons() {
  const router = useRouter()
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <div style={{ display: 'flex', gap: 28, fontSize: 14, fontWeight: 500, color: '#5A6B80' }}>
        <button onClick={() => scrollTo('ia-metier')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>{"L'IA M\u00e9tier"}</button>
        <button onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>{"Fonctionnalit\u00e9s"}</button>
        <button onClick={() => scrollTo('banques')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Banques</button>
        <button onClick={() => scrollTo('pricing')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>Tarifs</button>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button onClick={() => router.push('/login')} style={{ background: 'none', color: '#5A6B80', padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 500, border: 'none', cursor: 'pointer' }}>Connexion</button>
        <DemoButton variant="nav" />
      </div>
    </>
  )
}

export function DemoButton({ variant = 'primary' }: { variant?: 'primary' | 'nav' | 'gold' | 'outline' }) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: '#D4A843', color: '#0B1D3A', padding: '16px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
    nav: { background: '#D4A843', color: '#0B1D3A', padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' },
    gold: { background: '#D4A843', color: '#0B1D3A', padding: '18px 40px', borderRadius: 10, fontSize: 16, fontWeight: 600, border: 'none', cursor: 'pointer' },
    outline: { background: 'transparent', color: '#0B1D3A', padding: '16px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, border: '1.5px solid rgba(11,29,58,0.15)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 },
  }
  const label = variant === 'gold' ? "D\u00e9marrer mon essai gratuit \u2192" : "R\u00e9server une d\u00e9mo"
  return <button onClick={() => window.open('https://calendly.com', '_blank')} style={styles[variant]}>{label}</button>
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

export function BankLogos() {
  const banks = [
    "Cr\u00e9dit Agricole", "BNP Paribas", "Soci\u00e9t\u00e9 G\u00e9n\u00e9rale", "CIC",
    "LCL", "Caisse d'\u00c9pargne", "La Banque Postale", "Cr\u00e9dit Mutuel",
    "HSBC", "Boursorama", "ING", "Hello bank!"
  ]
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
      {banks.map((b) => (
        <div key={b} style={{ padding: '12px 22px', background: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 600, color: '#5A6B80', border: '1px solid rgba(11,29,58,0.06)', whiteSpace: 'nowrap' }}>{b}</div>
      ))}
    </div>
  )
}

export function FooterLinks() {
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#5A6B80' }}>
      <button onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 }}>{"Fonctionnalit\u00e9s"}</button>
      <button onClick={() => scrollTo('ia-metier')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 }}>{"L'IA M\u00e9tier"}</button>
      <button onClick={() => scrollTo('pricing')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 }}>Tarifs</button>
    </div>
  )
}

export function FooterLegalLinks() {
  const router = useRouter()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#5A6B80' }}>
      <button onClick={() => router.push('/mentions-legales')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 }}>{"Mentions l\u00e9gales"}</button>
      <button onClick={() => router.push('/cgu')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 }}>CGU</button>
      <button onClick={() => router.push('/confidentialite')} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left', padding: 0 }}>{"Confidentialit\u00e9"}</button>
    </div>
  )
}

export function PricingCTA({ label, primary }: { label: string; primary: boolean }) {
  const handleClick = () => {
    if (primary) {
      window.open('https://calendly.com', '_blank')
    } else {
      window.location.href = '/login'
    }
  }
  return (
    <button onClick={handleClick} style={{ width: '100%', padding: '16px 0', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', background: primary ? '#D4A843' : 'transparent', color: primary ? '#0B1D3A' : '#0B1D3A', border: primary ? 'none' : '1.5px solid rgba(11,29,58,0.15)' }}>{label}</button>
  )
}
