import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Critères d\'acceptation des banques en 2026 : comparatif complet | CortIA',
  description: 'Comparatif des critères d\'acceptation de 12 banques françaises en 2026. Endettement max, apport minimum, taux, durée, CDD, indépendants — tout pour orienter vos clients.',
  keywords: 'critères banques 2026, comparatif banques crédit immobilier, taux crédit immobilier, apport minimum banque',
}

const banques = [
  { nom: 'CIC', endett: '35%', apport: '8%', taux: '3.35%', duree: '25 ans', cdd: 'Oui', indep: 'Oui', delai: '5j', frais: '750€', atout: 'Apport bas, réponse rapide' },
  { nom: 'Crédit Mutuel', endett: '35%', apport: '10%', taux: '3.30%', duree: '25 ans', cdd: 'Non', indep: 'Oui', delai: '7j', frais: '600€', atout: 'Meilleurs taux, frais bas' },
  { nom: 'Crédit Agricole', endett: '35%', apport: '10%', taux: '3.45%', duree: '25 ans', cdd: 'Non', indep: 'Oui', delai: '10j', frais: '1000€', atout: 'Réseau dense, souple apport' },
  { nom: 'BNP Paribas', endett: '35%', apport: '10%', taux: '3.40%', duree: '25 ans', cdd: 'Non', indep: 'Oui', delai: '7j', frais: '850€', atout: 'Rapide, expert investissement' },
  { nom: 'Boursorama', endett: '33%', apport: '15%', taux: '3.20%', duree: '20 ans', cdd: 'Non', indep: 'Non', delai: '3j', frais: '0€', atout: '0€ frais, meilleur taux online' },
  { nom: 'Fortuneo', endett: '33%', apport: '15%', taux: '3.15%', duree: '25 ans', cdd: 'Non', indep: 'Non', delai: '4j', frais: '0€', atout: 'Meilleur taux global, 0€ frais' },
  { nom: 'Caisse d\'Épargne', endett: '35%', apport: '5%', taux: '3.40%', duree: '25 ans', cdd: 'Non', indep: 'Oui', delai: '8j', frais: '700€', atout: 'Apport 5%, primo-accédants' },
  { nom: 'La Banque Postale', endett: '35%', apport: '5%', taux: '3.55%', duree: '25 ans', cdd: 'Oui', indep: 'Non', delai: '12j', frais: '500€', atout: 'Accessibilité, accepte CDD' },
]

export default function ArticleCriteresbanques() {
  return (
    <article style={{ maxWidth: '900px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <Link href="/blog" style={{ fontSize: '14px', color: '#6366f1', fontWeight: 500, marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>← Retour au blog</Link>

      <div style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: '#05966915', color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marché</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>1 avril 2026</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>10 min de lecture</span>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '20px', letterSpacing: '-0.02em' }}>
        Critères d&apos;acceptation des banques en 2026 : comparatif complet
      </h1>

      <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px' }}>
        Chaque banque a ses propres critères d&apos;acceptation, ses points forts et ses limites. Ce comparatif vous aide à orienter chaque dossier vers l&apos;établissement le plus adapté au profil de votre client.
      </p>

      <div style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Tableau comparatif des 8 principales banques
        </h2>

        <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Banque', 'Endett. max', 'Apport min', 'Taux moy.', 'Durée max', 'CDD', 'Indép.', 'Délai', 'Frais', 'Atout clé'].map(h => (
                  <th key={h} style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 600, color: '#64748b', borderBottom: '2px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {banques.map((b, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: '#0f172a' }}>{b.nom}</td>
                  <td style={{ padding: '10px 8px' }}>{b.endett}</td>
                  <td style={{ padding: '10px 8px' }}>{b.apport}</td>
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: '#059669' }}>{b.taux}</td>
                  <td style={{ padding: '10px 8px' }}>{b.duree}</td>
                  <td style={{ padding: '10px 8px', color: b.cdd === 'Oui' ? '#059669' : '#dc2626' }}>{b.cdd}</td>
                  <td style={{ padding: '10px 8px', color: b.indep === 'Oui' ? '#059669' : '#dc2626' }}>{b.indep}</td>
                  <td style={{ padding: '10px 8px' }}>{b.delai}</td>
                  <td style={{ padding: '10px 8px' }}>{b.frais}</td>
                  <td style={{ padding: '10px 8px', fontSize: '12px', color: '#64748b' }}>{b.atout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Les banques en ligne : meilleur taux, plus exigeantes
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Boursorama et Fortuneo offrent les meilleurs taux du marché (3.15% à 3.20%) avec zéro frais de dossier. Mais leurs critères sont plus stricts : apport minimum de 15%, revenus élevés (3 500 à 4 000€), et ancienneté de 2 ans minimum. Elles n&apos;acceptent ni les CDD ni les indépendants.
        </p>
        <p style={{ marginBottom: '16px' }}>
          <strong>Profil idéal :</strong> Cadre en CDI depuis 2+ ans, revenus confortables, bon apport. Pour ces profils, les banques en ligne sont imbattables.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Les banques les plus accessibles
        </h2>
        <p style={{ marginBottom: '16px' }}>
          La Caisse d&apos;Épargne et La Banque Postale sont les plus accessibles avec un apport minimum de 5% seulement. La Banque Postale accepte même les CDD. En contrepartie, les taux sont légèrement plus élevés (3.40% à 3.55%).
        </p>
        <p style={{ marginBottom: '16px' }}>
          Le CIC se distingue par sa réactivité (5 jours de délai) et son apport minimum bas (8%), tout en acceptant les CDD sous conditions.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Comment choisir la bonne banque pour chaque dossier
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Le choix de la banque dépend du profil de l&apos;emprunteur. Voici les critères de décision clés : le taux d&apos;endettement (33% ou 35% selon la banque), le type de contrat (CDI, CDD, indépendant), le montant de l&apos;apport, le type de projet (résidence principale ou investissement locatif), et l&apos;urgence du dossier (délai de réponse).
        </p>
        <p style={{ marginBottom: '16px' }}>
          CortIA automatise cette analyse en comparant le profil de chaque emprunteur aux critères réels des 12 banques de sa base et en recommandant les établissements les plus adaptés.
        </p>
      </div>

      <div style={{ marginTop: '48px', padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, #0B1D3A, #1e3a5f)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Matching bancaire automatique</h3>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>CortIA compare chaque dossier aux critères de 12 banques et recommande les meilleures options.</p>
        <Link href="/register" style={{ display: 'inline-flex', padding: '11px 24px', borderRadius: '10px', background: '#D4A843', color: '#0B1D3A', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Essayer CortIA gratuitement →</Link>
      </div>
    </article>
  )
}
