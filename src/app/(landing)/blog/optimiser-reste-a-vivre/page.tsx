import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '5 stratégies pour optimiser le reste à vivre de vos clients | CortIA',
  description: 'Le reste à vivre est un critère clé pour les banques. Découvrez 5 leviers concrets pour améliorer ce ratio et décrocher l\'accord de financement.',
  keywords: 'reste à vivre, optimiser reste à vivre, crédit immobilier, capacité emprunt, courtier conseil',
}

export default function ArticleRAV() {
  return (
    <article style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <Link href="/blog" style={{ fontSize: '14px', color: '#6366f1', fontWeight: 500, marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>← Retour au blog</Link>
      <div style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: '#d9770615', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conseil</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>28 mars 2026</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>7 min de lecture</span>
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '20px', letterSpacing: '-0.02em' }}>
        5 stratégies pour optimiser le reste à vivre de vos clients
      </h1>
      <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px' }}>
        Au-delà du taux d&apos;endettement, le reste à vivre est souvent le critère qui fait basculer la décision de la banque. Un dossier à 34% d&apos;endettement avec un reste à vivre de 3 000 € sera accepté. Le même dossier avec 800 € de reste à vivre sera refusé.
      </p>
      <div style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>Qu&apos;est-ce que le reste à vivre ?</h2>
        <p style={{ marginBottom: '16px' }}>Le reste à vivre (RAV) est le montant qui reste au foyer après paiement de toutes les charges fixes : crédits, loyer ou future mensualité, assurances obligatoires. C&apos;est la somme disponible pour les dépenses courantes : alimentation, transport, loisirs, épargne.</p>
        <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', fontFamily: 'monospace', fontSize: '15px', textAlign: 'center' }}>
          RAV = Revenus nets - Mensualité crédit - Charges fixes
        </div>
        <p style={{ marginBottom: '16px' }}>Les banques exigent généralement un minimum de <strong>800 à 1 200 € par personne</strong> (ou par unité de consommation). Un couple avec deux enfants devra justifier d&apos;un RAV d&apos;au moins 2 400 à 3 000 € pour obtenir un accord.</p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>Stratégie 1 : Réduire le montant emprunté</h2>
        <p style={{ marginBottom: '16px' }}>La première approche est la plus évidente : emprunter moins. Chaque tranche de 10 000 € en moins réduit la mensualité d&apos;environ 55 € (sur 25 ans à 3,5%). Concrètement, un emprunteur peut revoir à la baisse le budget travaux, choisir un bien légèrement moins cher, ou négocier le prix d&apos;achat.</p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>Stratégie 2 : Allonger la durée</h2>
        <p style={{ marginBottom: '16px' }}>Passer de 20 à 25 ans réduit la mensualité de 15 à 20%. Sur un prêt de 250 000 €, c&apos;est environ 300 € de moins par mois — directement ajoutés au reste à vivre. Le coût total du crédit augmente, mais le dossier passe.</p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>Stratégie 3 : Solder les petits crédits</h2>
        <p style={{ marginBottom: '16px' }}>Un crédit auto de 200 €/mois et un crédit revolving de 80 €/mois pèsent 280 € sur le reste à vivre. Si l&apos;emprunteur dispose de l&apos;épargne nécessaire pour les solder, c&apos;est un double bénéfice : le RAV augmente de 280 € et le taux d&apos;endettement baisse.</p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>Stratégie 4 : Valoriser tous les revenus</h2>
        <p style={{ marginBottom: '16px' }}>Certains revenus sont souvent oubliés ou mal valorisés : les revenus fonciers (pris à 70%), les allocations familiales stables, les pensions alimentaires reçues, les primes contractuelles récurrentes. Assurez-vous de les intégrer dans le calcul.</p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>Stratégie 5 : Ajouter un co-emprunteur</h2>
        <p style={{ marginBottom: '16px' }}>Un co-emprunteur apporte des revenus supplémentaires qui augmentent directement le reste à vivre. Même un co-emprunteur avec un salaire modeste (1 500 €/mois) peut faire passer un dossier de la zone rouge à la zone verte.</p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>CortIA calcule le RAV automatiquement</h2>
        <p style={{ marginBottom: '16px' }}>Le moteur de scoring CortIA calcule le reste à vivre en temps réel et le compare aux seuils de chaque banque. Si le RAV est insuffisant, CortIA identifie les leviers d&apos;optimisation et recommande les banques les plus souples sur ce critère.</p>
      </div>

      <div style={{ marginTop: '48px', padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, #0B1D3A, #1e3a5f)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Optimisez chaque dossier en 2 minutes</h3>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>Scoring multi-dimensionnel, reste à vivre, recommandation bancaire.</p>
        <Link href="/register" style={{ display: 'inline-flex', padding: '11px 24px', borderRadius: '10px', background: '#D4A843', color: '#0B1D3A', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Essayer CortIA gratuitement →</Link>
      </div>
    </article>
  )
}
