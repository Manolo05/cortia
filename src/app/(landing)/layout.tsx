import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-dm-serif' })

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
  return (
    <div className={`${dmSans.variable} ${dmSerif.variable}`}>
      <style>{`
        .lp-serif { font-family: var(--font-dm-serif), serif; }
        body { font-family: var(--font-dm-sans), system-ui, sans-serif; }
      `}</style>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Qu\'est-ce que CortIA ?',
                acceptedAnswer: { '@type': 'Answer', text: 'CortIA est un logiciel IA pour courtiers en cr\u00e9dit immobilier (IOBSP) qui analyse automatiquement les dossiers de pr\u00eat, calcule un score de risque et recommande les banques les plus adapt\u00e9es.' }
              },
              {
                '@type': 'Question',
                name: 'CortIA est-il gratuit ?',
                acceptedAnswer: { '@type': 'Answer', text: 'Oui, le plan Solo est 100% gratuit avec 5 dossiers par mois, le score IA et le support email. Les plans Pro (49\u20ac/mois) et Cabinet (99\u20ac/mois) offrent des fonctionnalit\u00e9s avanc\u00e9es.' }
              },
              {
                '@type': 'Question',
                name: 'Comment fonctionne le scoring IA de CortIA ?',
                acceptedAnswer: { '@type': 'Answer', text: 'CortIA analyse automatiquement le taux d\'endettement, le reste \u00e0 vivre, la stabilit\u00e9 des revenus et l\'apport personnel pour g\u00e9n\u00e9rer un score de 0 \u00e0 100 et identifier les points de vigilance.' }
              },
              {
                '@type': 'Question',
                name: 'Quelles banques sont analys\u00e9es par CortIA ?',
                acceptedAnswer: { '@type': 'Answer', text: 'CortIA compare les crit\u00e8res d\'acceptation de 12 grandes banques fran\u00e7aises dont Cr\u00e9dit Agricole, BNP Paribas, Soci\u00e9t\u00e9 G\u00e9n\u00e9rale, CIC, LCL et Caisse d\'\u00c9pargne.' }
              },
              {
                '@type': 'Question',
                name: 'CortIA est-il conforme au RGPD ?',
                acceptedAnswer: { '@type': 'Answer', text: 'Oui, CortIA est h\u00e9berg\u00e9 en France, conforme au RGPD et \u00e0 l\'AI Act europ\u00e9en. Les donn\u00e9es des dossiers sont chiffr\u00e9es et ne sont jamais partag\u00e9es.' }
              }
            ]
          })
        }}
      />
      {children}
    </div>
  )
}
