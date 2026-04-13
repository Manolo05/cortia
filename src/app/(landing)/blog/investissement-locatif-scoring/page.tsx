import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Investissement locatif : comment présenter le dossier aux banques | CortIA',
  description: 'Guide complet pour monter un dossier d\'investissement locatif. Revenus locatifs pondérés, endettement différentiel, banques spécialisées — tout pour décrocher le financement.',
  keywords: 'investissement locatif, dossier banque investissement, revenus locatifs pondérés, endettement différentiel, courtier investissement',
}

export default function ArticleInvestissement() {
  return (
    <article style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <Link href="/blog" style={{ fontSize: '14px', color: '#6366f1', fontWeight: 500, marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>← Retour au blog</Link>
      <div style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: '#d9770615', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Conseil</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>25 mars 2026</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>9 min de lecture</span>
      </div>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '20px', letterSpacing: '-0.02em' }}>
        Investissement locatif : comment présenter le dossier aux banques
      </h1>
      <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px' }}>
        L&apos;investissement locatif représente environ 30% des demandes de prêt immobilier. Mais les critères d&apos;acceptation sont plus stricts que pour une résidence principale. Voici comment structurer le dossier pour maximiser les chances d&apos;obtenir le financement.
      </p>

      <div style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          La pondération des revenus locatifs
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Les banques ne prennent pas 100% des futurs revenus locatifs en compte. La plupart appliquent une <strong>pondération de 70%</strong> pour couvrir les risques de vacance locative, d&apos;impayés et de charges. Un loyer attendu de 1 000 €/mois sera donc compté comme 700 € dans le calcul de l&apos;endettement.
        </p>
        <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <p style={{ marginBottom: '8px', fontWeight: 600 }}>Exemple concret :</p>
          <p style={{ marginBottom: '4px' }}>Revenus salariaux : 4 500 €/mois</p>
          <p style={{ marginBottom: '4px' }}>Loyer perçu estimé : 900 €/mois → <strong>630 € retenus</strong> (×70%)</p>
          <p style={{ marginBottom: '4px' }}>Revenus totaux retenus : <strong>5 130 €/mois</strong></p>
          <p>Capacité d&apos;endettement à 35% : <strong>1 795 €/mois</strong> de mensualité max</p>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          L&apos;endettement différentiel : une approche plus favorable
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Certaines banques acceptent de calculer l&apos;endettement en mode <strong>différentiel</strong> plutôt que classique. Au lieu d&apos;additionner toutes les charges et diviser par les revenus, on soustrait les revenus locatifs de la mensualité du prêt locatif. Si le solde est positif (le loyer couvre la mensualité), l&apos;opération est considérée comme neutre sur l&apos;endettement.
        </p>
        <p style={{ marginBottom: '16px' }}>
          Cette méthode est particulièrement avantageuse quand le loyer attendu couvre largement la mensualité du prêt. Elle n&apos;est pas acceptée par toutes les banques — c&apos;est ici que le courtier fait la différence en orientant vers les bons établissements.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Quelles banques acceptent l&apos;investissement locatif ?
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Toutes les banques ne traitent pas l&apos;investissement locatif de la même manière. Voici les principales différences :
        </p>
        <div style={{ padding: '20px 24px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '12px' }}>
          <p><strong style={{ color: '#059669' }}>Acceptent l&apos;investissement locatif :</strong> Crédit Agricole, BNP Paribas, Société Générale, CIC, Crédit Mutuel, LCL, Caisse d&apos;Épargne, Banque Populaire, Boursorama, Fortuneo</p>
        </div>
        <div style={{ padding: '20px 24px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', marginBottom: '24px' }}>
          <p><strong style={{ color: '#dc2626' }}>N&apos;acceptent PAS l&apos;investissement locatif :</strong> La Banque Postale, Hello Bank (résidence principale uniquement)</p>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Les 5 éléments clés du dossier investissement
        </h2>
        <p style={{ marginBottom: '16px' }}>
          <strong>1. L&apos;étude de marché locatif</strong> — Fournissez des comparables de loyers dans le quartier visé. Les banques veulent une preuve que le loyer estimé est réaliste, pas optimiste.
        </p>
        <p style={{ marginBottom: '16px' }}>
          <strong>2. La simulation de rentabilité</strong> — Calculez le rendement brut et net, incluant les charges de copropriété, la taxe foncière, l&apos;assurance PNO et la vacance locative estimée.
        </p>
        <p style={{ marginBottom: '16px' }}>
          <strong>3. L&apos;apport conséquent</strong> — Pour un investissement locatif, les banques exigent souvent un apport plus élevé (15 à 20% contre 10% pour une résidence principale). L&apos;apport couvre au minimum les frais de notaire et d&apos;agence.
        </p>
        <p style={{ marginBottom: '16px' }}>
          <strong>4. L&apos;épargne résiduelle</strong> — Les banques veulent voir que l&apos;investisseur conserve une épargne de sécurité après l&apos;opération. Comptez 6 mois de mensualités en réserve.
        </p>
        <p style={{ marginBottom: '16px' }}>
          <strong>5. La situation professionnelle stable</strong> — Un CDI avec ancienneté reste le standard. Les indépendants doivent présenter 3 bilans positifs minimum.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          CortIA identifie les banques adaptées à l&apos;investissement
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Le scoring CortIA intègre automatiquement la dimension &quot;investissement locatif&quot; dans le matching bancaire. Les banques qui n&apos;acceptent pas ce type de projet sont exclues, et celles qui offrent les meilleures conditions pour l&apos;investissement sont mises en avant avec le taux estimé et les frais de dossier.
        </p>
      </div>

      <div style={{ marginTop: '48px', padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, #0B1D3A, #1e3a5f)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Scoring spécialisé investissement locatif</h3>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>CortIA filtre automatiquement les banques qui acceptent l&apos;investissement locatif.</p>
        <Link href="/register" style={{ display: 'inline-flex', padding: '11px 24px', borderRadius: '10px', background: '#D4A843', color: '#0B1D3A', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Essayer CortIA gratuitement →</Link>
      </div>
    </article>
  )
}
