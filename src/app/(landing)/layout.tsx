import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'CortIA â Logiciel IA pour courtiers en crÃ©dit immobilier (IOBSP)',
  description: 'CortIA analyse vos dossiers de crÃ©dit immobilier en 2 minutes. Score IA, dÃ©tection des risques, recommandation bancaire automatique. Gratuit pour les courtiers IOBSP.',
  keywords: 'courtier immobilier, IOBSP, IA courtage, scoring crÃ©dit, analyse dossier, recommandation bancaire',
  openGraph: {
    title: 'CortIA â Analysez vos dossiers 3x plus vite avec l\'IA',
    description: 'Score IA, dÃ©tection des risques, recommandation bancaire. L\'assistant IA du courtier en crÃ©dit immobilier.',
    type: 'website',
    url: 'https://cortia-kappa.vercel.app',
  },
}

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
