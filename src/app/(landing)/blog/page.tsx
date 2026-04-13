import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog CortIA — Conseils courtage immobilier et analyse IA',
  description: 'Guides pratiques, analyses de marché et conseils pour les courtiers IOBSP. Optimisez vos dossiers de prêt avec l\'intelligence artificielle.',
  openGraph: {
    title: 'Blog CortIA — Conseils courtage immobilier',
    description: 'Guides pratiques pour les courtiers IOBSP',
  },
}

const articles = [
  {
    slug: 'taux-endettement-hcsf-35-pourcent',
    title: 'Taux d\'endettement HCSF à 35% : guide complet pour les courtiers',
    excerpt: 'Depuis janvier 2022, le HCSF impose un taux d\'endettement maximum de 35%. Comment optimiser vos dossiers pour respecter cette norme tout en maximisant la capacité d\'emprunt de vos clients.',
    date: '2026-04-10',
    category: 'Réglementation',
    readTime: '8 min',
  },
  {
    slug: 'scoring-emprunteur-ia',
    title: 'Comment l\'IA révolutionne le scoring emprunteur en courtage',
    excerpt: 'Les algorithmes d\'intelligence artificielle permettent d\'analyser un dossier de prêt en 2 minutes au lieu de 2 heures. Découvrez comment le scoring IA transforme le métier de courtier.',
    date: '2026-04-08',
    category: 'Innovation',
    readTime: '6 min',
  },
  {
    slug: 'ocr-documents-courtage',
    title: 'OCR et extraction automatique : fini la saisie manuelle des bulletins de salaire',
    excerpt: 'L\'OCR intelligent extrait automatiquement les revenus, l\'employeur et le type de contrat depuis les bulletins de salaire et avis d\'imposition. Un gain de temps considérable pour les courtiers.',
    date: '2026-04-05',
    category: 'Technologie',
    readTime: '5 min',
  },
  {
    slug: 'criteres-acceptation-banques-2026',
    title: 'Critères d\'acceptation des banques en 2026 : comparatif complet',
    excerpt: 'Crédit Agricole, BNP, Société Générale, CIC, Boursorama... Chaque banque a ses propres critères. Notre comparatif détaillé vous aide à orienter vos clients vers la bonne banque.',
    date: '2026-04-01',
    category: 'Marché',
    readTime: '10 min',
  },
  {
    slug: 'optimiser-reste-a-vivre',
    title: '5 stratégies pour optimiser le reste à vivre de vos clients',
    excerpt: 'Le reste à vivre est un critère clé pour les banques. Découvrez les leviers concrets pour améliorer ce ratio et décrocher l\'accord de financement.',
    date: '2026-03-28',
    category: 'Conseil',
    readTime: '7 min',
  },
  {
    slug: 'investissement-locatif-scoring',
    title: 'Investissement locatif : comment présenter le dossier aux banques',
    excerpt: 'Les dossiers d\'investissement locatif ont des critères spécifiques. Revenus locatifs pondérés, endettement différentiel, banques spécialisées — le guide complet.',
    date: '2026-03-25',
    category: 'Conseil',
    readTime: '9 min',
  },
]

const categoryColors: Record<string, string> = {
  'Réglementation': '#dc2626',
  'Innovation': '#7c3aed',
  'Technologie': '#2563eb',
  'Marché': '#059669',
  'Conseil': '#d97706',
}

export default function BlogPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <div style={{ marginBottom: '48px' }}>
        <Link href="/" style={{ fontSize: '14px', color: '#6366f1', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
          ← Retour à CortIA
        </Link>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0B1D3A', letterSpacing: '-0.03em', marginBottom: '12px' }}>
          Blog CortIA
        </h1>
        <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.6 }}>
          Guides pratiques, analyses de marché et conseils pour les courtiers en crédit immobilier.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {articles.map((article, i) => (
          <Link key={article.slug} href={'/blog/' + article.slug}
            style={{
              display: 'block', padding: '28px 32px', borderRadius: '16px',
              background: 'white', border: '1px solid #e2e8f0',
              textDecoration: 'none', transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{
                fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px',
                background: (categoryColors[article.category] || '#6366f1') + '15',
                color: categoryColors[article.category] || '#6366f1',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {article.category}
              </span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>{article.date}</span>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>{article.readTime}</span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>
              {article.title}
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b', lineHeight: 1.6 }}>
              {article.excerpt}
            </p>
          </Link>
        ))}
      </div>

      <div style={{ marginTop: '64px', padding: '40px', borderRadius: '20px', background: 'linear-gradient(135deg, #0B1D3A, #1e3a5f)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
          Gagnez du temps sur chaque dossier
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
          CortIA analyse vos dossiers en 2 minutes et recommande les meilleures banques automatiquement.
        </p>
        <Link href="/register" style={{
          display: 'inline-flex', padding: '12px 28px', borderRadius: '10px',
          background: '#D4A843', color: '#0B1D3A', fontWeight: 700, fontSize: '15px',
          textDecoration: 'none',
        }}>
          Démarrer gratuitement →
        </Link>
      </div>
    </div>
  )
}
