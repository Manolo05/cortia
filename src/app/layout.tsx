import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CortIA - Plateforme courtage immobilier',
  description: 'Solution SaaS B2B pour les courtiers en immobilier. Gestion de dossiers, analyse financière et synthèse IA.',
  keywords: 'courtage immobilier, prêt immobilier, analyse financière, IA, SaaS',
  authors: [{ name: 'CortIA' }],
  viewport: 'width=device-width, initial-scale=1',
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
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
