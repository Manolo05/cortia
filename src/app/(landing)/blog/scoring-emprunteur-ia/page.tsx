import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Comment l\'IA révolutionne le scoring emprunteur en courtage | CortIA',
  description: 'Les algorithmes d\'intelligence artificielle analysent un dossier de prêt en 2 minutes. Découvrez le scoring IA multi-dimensionnel et son impact sur le courtage immobilier.',
  keywords: 'scoring emprunteur, IA courtage, intelligence artificielle crédit immobilier, analyse dossier prêt automatique',
}

export default function ArticleScoringIA() {
  return (
    <article style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <Link href="/blog" style={{ fontSize: '14px', color: '#6366f1', fontWeight: 500, marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>← Retour au blog</Link>

      <div style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: '#7c3aed15', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Innovation</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>8 avril 2026</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>6 min de lecture</span>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '20px', letterSpacing: '-0.02em' }}>
        Comment l&apos;IA révolutionne le scoring emprunteur en courtage
      </h1>

      <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px' }}>
        Un courtier analyse en moyenne 15 dossiers par semaine. Chaque dossier nécessite 1 à 2 heures d&apos;analyse manuelle : vérification des pièces, calcul de l&apos;endettement, estimation de la bancabilité. L&apos;IA réduit ce temps à 2 minutes.
      </p>

      <div style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Le scoring traditionnel vs. le scoring IA
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Le scoring traditionnel repose sur quelques ratios clés : taux d&apos;endettement, reste à vivre, ratio d&apos;apport. Le courtier les calcule manuellement, souvent sur un tableur Excel, et les compare à sa connaissance des critères bancaires.
        </p>
        <p style={{ marginBottom: '16px' }}>
          Le scoring IA va beaucoup plus loin. Il analyse <strong>5 dimensions simultanément</strong> avec des pondérations calibrées sur des milliers de dossiers réels :
        </p>
        <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><strong>Stabilité professionnelle</strong> (15%) — CDI, ancienneté, type de contrat</div>
            <div><strong>Taux d&apos;endettement</strong> (30%) — Ratio charges/revenus post-crédit</div>
            <div><strong>Patrimoine</strong> (20%) — Apport, épargne, investissements</div>
            <div><strong>Reste à vivre</strong> (20%) — Capacité financière résiduelle</div>
            <div><strong>Saut de charge</strong> (15%) — Écart entre loyer actuel et future mensualité</div>
          </div>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Le matching bancaire automatique
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Au-delà du score global, l&apos;IA compare le profil de l&apos;emprunteur aux <strong>critères réels de chaque banque</strong>. Chaque établissement a ses propres seuils : endettement maximum, apport minimum, revenus requis, ancienneté, acceptation des CDD et indépendants.
        </p>
        <p style={{ marginBottom: '16px' }}>
          Le résultat : une liste de banques éligibles classées par pertinence, avec le taux estimé et les frais de dossier. Le courtier sait immédiatement où envoyer le dossier pour maximiser les chances d&apos;acceptation.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          L&apos;OCR : fini la saisie manuelle
        </h2>
        <p style={{ marginBottom: '16px' }}>
          L&apos;OCR (reconnaissance optique de caractères) alimenté par l&apos;IA extrait automatiquement les données des documents uploadés : bulletins de salaire, avis d&apos;imposition, relevés bancaires. Le nom, le salaire net, l&apos;employeur, le type de contrat — tout est extrait et pré-rempli dans le dossier.
        </p>
        <p style={{ marginBottom: '16px' }}>
          Pour un courtier qui traite 60 dossiers par mois, c&apos;est un gain de <strong>30 heures par mois</strong> en saisie manuelle économisée. Soit l&apos;équivalent de 4 jours de travail.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Impact concret sur la productivité
        </h2>
        <div style={{ padding: '20px 24px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '24px' }}>
          <div style={{ marginBottom: '12px' }}><strong>Avant l&apos;IA :</strong> 15 dossiers/semaine, 1h30 par analyse = 22h d&apos;analyse/semaine</div>
          <div style={{ marginBottom: '12px' }}><strong>Avec l&apos;IA :</strong> 15 dossiers/semaine, 5 min par analyse = 1h15 d&apos;analyse/semaine</div>
          <div><strong>Gain :</strong> +20 heures/semaine pour le conseil client et la prospection</div>
        </div>
        <p style={{ marginBottom: '16px' }}>
          Ce temps libéré permet au courtier de se concentrer sur sa valeur ajoutée réelle : le conseil personnalisé, la relation client, et la négociation avec les banques. L&apos;IA ne remplace pas le courtier — elle lui permet de traiter plus de dossiers avec une meilleure qualité d&apos;analyse.
        </p>
      </div>

      <div style={{ marginTop: '48px', padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, #0B1D3A, #1e3a5f)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Testez le scoring IA sur vos dossiers</h3>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>Score en 2 minutes, recommandations bancaires, OCR documents.</p>
        <Link href="/register" style={{ display: 'inline-flex', padding: '11px 24px', borderRadius: '10px', background: '#D4A843', color: '#0B1D3A', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Essayer CortIA gratuitement →</Link>
      </div>
    </article>
  )
}
