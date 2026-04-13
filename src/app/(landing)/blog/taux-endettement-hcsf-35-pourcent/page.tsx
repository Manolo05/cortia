import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Taux d\'endettement HCSF à 35% : guide complet pour courtiers IOBSP | CortIA',
  description: 'Comprendre la norme HCSF de 35% de taux d\'endettement maximum. Calcul, dérogations, stratégies d\'optimisation pour les courtiers en crédit immobilier.',
  keywords: 'taux endettement, HCSF 35%, courtier IOBSP, crédit immobilier, norme endettement, calcul endettement',
  openGraph: {
    title: 'Taux d\'endettement HCSF à 35% : guide complet',
    description: 'Tout savoir sur la norme HCSF et comment optimiser les dossiers de vos clients.',
    type: 'article',
  },
}

export default function ArticleHCSF() {
  return (
    <article style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <Link href="/blog" style={{ fontSize: '14px', color: '#6366f1', fontWeight: 500, marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
        ← Retour au blog
      </Link>

      <div style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: '#dc262615', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Réglementation</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>10 avril 2026</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>8 min de lecture</span>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '20px', letterSpacing: '-0.02em' }}>
        Taux d&apos;endettement HCSF à 35% : guide complet pour les courtiers
      </h1>

      <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px' }}>
        Depuis janvier 2022, le Haut Conseil de stabilité financière (HCSF) impose un taux d&apos;endettement maximum de 35% pour les crédits immobiliers. Cette norme a profondément transformé le métier de courtier. Voici tout ce que vous devez savoir.
      </p>

      <div style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Comment calculer le taux d&apos;endettement ?
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Le taux d&apos;endettement se calcule en divisant l&apos;ensemble des charges de crédit (y compris le nouveau prêt) par les revenus nets du foyer. La formule est simple :
        </p>
        <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px', fontFamily: 'monospace', fontSize: '15px', textAlign: 'center' }}>
          Taux d&apos;endettement = (Charges mensuelles + Nouvelle mensualité) / Revenus nets × 100
        </div>
        <p style={{ marginBottom: '16px' }}>
          Les <strong>revenus pris en compte</strong> incluent les salaires nets, les revenus fonciers (pondérés à 70%), les pensions et les allocations récurrentes. Les revenus variables (primes, heures supplémentaires) sont généralement moyennés sur 3 ans.
        </p>
        <p style={{ marginBottom: '16px' }}>
          Les <strong>charges retenues</strong> comprennent tous les crédits en cours (immobilier, consommation, automobile), les pensions alimentaires versées et le nouveau crédit demandé.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Les dérogations possibles
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Le HCSF autorise les banques à déroger à la règle des 35% pour <strong>20% de leur production trimestrielle</strong>. Ces dérogations sont réparties ainsi :
        </p>
        <ul style={{ marginBottom: '24px', paddingLeft: '24px' }}>
          <li style={{ marginBottom: '8px' }}><strong>80% des dérogations</strong> sont réservées aux primo-accédants pour l&apos;achat de leur résidence principale</li>
          <li style={{ marginBottom: '8px' }}><strong>20% restants</strong> peuvent être utilisés librement par la banque (investissement locatif, résidence secondaire)</li>
        </ul>
        <p style={{ marginBottom: '16px' }}>
          En pratique, les banques réservent ces dérogations aux dossiers à fort reste à vivre (&gt; 2 000 €/mois) et aux profils patrimoniaux solides.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          5 stratégies pour respecter la norme des 35%
        </h2>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
          1. Allonger la durée du prêt
        </h3>
        <p style={{ marginBottom: '16px' }}>
          Passer de 20 à 25 ans réduit la mensualité de 15 à 20%. Sur un prêt de 300 000 € à 3,5%, la mensualité passe de 1 740 € (20 ans) à 1 501 € (25 ans) — soit 239 € de moins par mois. Attention : la durée maximale autorisée par le HCSF est de 25 ans (27 ans dans le neuf avec différé).
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
          2. Augmenter l&apos;apport personnel
        </h3>
        <p style={{ marginBottom: '16px' }}>
          Chaque euro d&apos;apport supplémentaire réduit le besoin de financement et donc la mensualité. Un apport de 20% au lieu de 10% sur un projet à 300 000 € réduit la mensualité de 150 €/mois environ.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
          3. Solder les crédits en cours
        </h3>
        <p style={{ marginBottom: '16px' }}>
          Un crédit consommation de 300 €/mois qui peut être soldé libère immédiatement de la capacité d&apos;endettement. Pour un ménage à 5 000 € de revenus, solder ce crédit permet d&apos;emprunter environ 60 000 € de plus.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
          4. Intégrer un co-emprunteur
        </h3>
        <p style={{ marginBottom: '16px' }}>
          Ajouter un co-emprunteur augmente les revenus pris en compte et dilue le taux d&apos;endettement. Un couple avec deux CDI aura toujours un meilleur profil qu&apos;un emprunteur seul.
        </p>

        <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginTop: '24px', marginBottom: '12px' }}>
          5. Optimiser l&apos;assurance emprunteur
        </h3>
        <p style={{ marginBottom: '16px' }}>
          L&apos;assurance emprunteur est incluse dans le calcul de l&apos;endettement. Une délégation d&apos;assurance peut faire économiser 50 à 100 €/mois par rapport à l&apos;assurance groupe de la banque.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Comment CortIA vous aide à respecter la norme HCSF
        </h2>
        <p style={{ marginBottom: '16px' }}>
          CortIA calcule automatiquement le taux d&apos;endettement de chaque dossier et identifie les leviers d&apos;optimisation. Le scoring IA analyse 5 dimensions (stabilité professionnelle, endettement, patrimoine, reste à vivre, saut de charge) et recommande les banques les plus adaptées au profil de l&apos;emprunteur.
        </p>
        <p style={{ marginBottom: '16px' }}>
          Avec l&apos;OCR intégré, les bulletins de salaire et avis d&apos;imposition sont analysés automatiquement — plus besoin de saisie manuelle. Le courtier peut se concentrer sur le conseil et la relation client.
        </p>
      </div>

      <div style={{ marginTop: '48px', padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, #0B1D3A, #1e3a5f)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
          Analysez vos dossiers en 2 minutes
        </h3>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
          Scoring IA, recommandation bancaire, OCR documents — tout est inclus.
        </p>
        <Link href="/register" style={{
          display: 'inline-flex', padding: '11px 24px', borderRadius: '10px',
          background: '#D4A843', color: '#0B1D3A', fontWeight: 700, fontSize: '14px',
          textDecoration: 'none',
        }}>
          Essayer CortIA gratuitement →
        </Link>
      </div>
    </article>
  )
}
