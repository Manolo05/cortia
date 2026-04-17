import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CortIA \u2014 Logiciel IA pour courtiers en cr\u00e9dit immobilier (IOBSP)',
  description: 'CortIA analyse vos dossiers de cr\u00e9dit immobilier en 2 minutes. Score IA, d\u00e9tection des risques, recommandation bancaire automatique. Gratuit pour les courtiers IOBSP.',
  keywords: 'courtier immobilier, IOBSP, IA courtage, scoring cr\u00e9dit, analyse dossier, recommandation bancaire',
  openGraph: {
    title: 'CortIA \u2014 Analysez vos dossiers 3x plus vite avec l\'IA',
    description: 'Score IA, d\u00e9tection des risques, recommandation bancaire. L\'assistant IA du courtier en cr\u00e9dit immobilier.',
    type: 'website',
    url: 'https://cortia-kappa.vercel.app',
  },
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
