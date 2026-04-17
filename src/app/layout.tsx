import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

const SITE_URL = 'https://cortia-kappa.vercel.app'

export const metadata: Metadata = {
  title: 'CortIA \u2014 Logiciel IA pour courtiers en cr\u00e9dit immobilier (IOBSP)',
  description: 'CortIA analyse vos dossiers de cr\u00e9dit immobilier en 2 minutes. Score IA, d\u00e9tection des risques, recommandation bancaire automatique. Gratuit pour les courtiers IOBSP.',
  keywords: 'courtier cr\u00e9dit immobilier, logiciel courtage, IOBSP, analyse dossier pr\u00eat, score risque IA, recommandation bancaire, OCR documents courtier, SaaS courtage',
  authors: [{ name: 'CortIA' }],
  creator: 'CortIA',
  publisher: 'CortIA',
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'CortIA',
    title: 'CortIA — Analysez vos dossiers immobiliers 3x plus vite avec l\'IA',
    description: 'Logiciel IA pour courtiers IOBSP : score de risque, recommandation bancaire automatique, OCR documents. Essai gratuit 14 jours.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CortIA - Plateforme IA pour courtiers en cr\u00e9dit immobilier',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CortIA — Logiciel IA pour courtiers immobiliers',
    description: 'Analysez vos dossiers 3x plus vite. Score IA, recommandation bancaire, OCR documents. Essai gratuit.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'CortIA',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              url: SITE_URL,
              description: 'Logiciel IA pour courtiers en cr\u00e9dit immobilier. Analyse de dossiers, score de risque, recommandation bancaire automatique.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
                description: 'Plan Solo gratuit - 5 dossiers/mois',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'CortIA',
              url: SITE_URL,
              logo: SITE_URL + '/favicon.ico',
              description: 'CortIA - L\'assistant IA qui transforme chaque courtier en expert',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: 'French',
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
