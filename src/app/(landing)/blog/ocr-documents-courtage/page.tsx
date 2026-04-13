import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OCR et extraction automatique de documents pour courtiers | CortIA',
  description: 'L\'OCR intelligent extrait automatiquement les revenus depuis les bulletins de salaire et avis d\'imposition. Gain de 30h/mois pour les courtiers IOBSP.',
  keywords: 'OCR courtage, extraction automatique documents, bulletin salaire OCR, avis imposition automatique',
}

export default function ArticleOCR() {
  return (
    <article style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 80px' }}>
      <Link href="/blog" style={{ fontSize: '14px', color: '#6366f1', fontWeight: 500, marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>← Retour au blog</Link>

      <div style={{ marginBottom: '8px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '99px', background: '#2563eb15', color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Technologie</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>5 avril 2026</span>
        <span style={{ fontSize: '13px', color: '#94a3b8' }}>5 min de lecture</span>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', lineHeight: 1.25, marginBottom: '20px', letterSpacing: '-0.02em' }}>
        OCR et extraction automatique : fini la saisie manuelle des bulletins de salaire
      </h1>

      <p style={{ fontSize: '18px', color: '#64748b', lineHeight: 1.7, marginBottom: '40px' }}>
        La saisie manuelle des données financières est la tâche la plus chronophage du courtier. Un bulletin de salaire contient 15 à 20 informations utiles. Un avis d&apos;imposition, encore plus. L&apos;OCR alimenté par l&apos;IA change la donne.
      </p>

      <div style={{ fontSize: '16px', color: '#334155', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Le problème : 30 minutes de saisie par dossier
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Pour chaque dossier, le courtier doit extraire et saisir manuellement : le nom et prénom de l&apos;emprunteur, l&apos;employeur, le type de contrat, le salaire net mensuel, le salaire brut, l&apos;ancienneté, l&apos;adresse, le revenu fiscal de référence, le nombre de parts fiscales, les revenus locatifs éventuels.
        </p>
        <p style={{ marginBottom: '16px' }}>
          Avec 15 dossiers par semaine et 3 à 5 documents par dossier, le courtier passe environ <strong>7 à 10 heures par semaine</strong> sur la saisie de données. C&apos;est du temps qui ne génère aucune valeur ajoutée.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Comment fonctionne l&apos;OCR IA
        </h2>
        <p style={{ marginBottom: '16px' }}>
          L&apos;OCR (Optical Character Recognition) traditionnel se contente de transformer une image en texte brut. L&apos;OCR alimenté par l&apos;IA va beaucoup plus loin : il <strong>comprend la structure du document</strong> et identifie automatiquement les champs importants.
        </p>
        <p style={{ marginBottom: '16px' }}>
          Concrètement, quand vous uploadez un bulletin de salaire dans CortIA, l&apos;IA analyse le document et extrait :
        </p>
        <div style={{ padding: '20px 24px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px' }}>
            <div>• Nom et prénom</div>
            <div>• Employeur</div>
            <div>• Type de contrat (CDI, CDD...)</div>
            <div>• Salaire net mensuel</div>
            <div>• Salaire brut mensuel</div>
            <div>• Date du document</div>
            <div>• Ancienneté (date d&apos;entrée)</div>
            <div>• Adresse</div>
          </div>
        </div>
        <p style={{ marginBottom: '16px' }}>
          Pour un avis d&apos;imposition, l&apos;IA extrait le revenu fiscal de référence, le nombre de parts, les revenus fonciers et le numéro fiscal.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Auto-remplissage du dossier
        </h2>
        <p style={{ marginBottom: '16px' }}>
          Les données extraites ne restent pas dans le vide. CortIA les injecte automatiquement dans les champs du dossier emprunteur : le salaire net, le type de contrat, l&apos;employeur. Le courtier n&apos;a plus qu&apos;à vérifier et valider — pas besoin de retaper les informations.
        </p>
        <p style={{ marginBottom: '16px' }}>
          Le document est automatiquement marqué comme &quot;vérifié&quot; une fois l&apos;extraction réussie. Le courtier voit en un coup d&apos;oeil quels documents ont été traités et lesquels restent à analyser.
        </p>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '40px', marginBottom: '16px' }}>
          Impact sur la productivité
        </h2>
        <div style={{ padding: '20px 24px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', marginBottom: '24px' }}>
          <div style={{ marginBottom: '8px' }}><strong>60 dossiers/mois × 30 min de saisie = 30 heures/mois</strong></div>
          <div style={{ marginBottom: '8px' }}>Avec l&apos;OCR : 60 dossiers × 2 min de vérification = <strong>2 heures/mois</strong></div>
          <div><strong>Gain : 28 heures/mois</strong> soit 3,5 jours de travail récupérés</div>
        </div>
        <p style={{ marginBottom: '16px' }}>
          Ces heures récupérées permettent de traiter davantage de dossiers ou d&apos;investir dans la prospection et le conseil client — les activités qui génèrent réellement du revenu.
        </p>
      </div>

      <div style={{ marginTop: '48px', padding: '32px', borderRadius: '16px', background: 'linear-gradient(135deg, #0B1D3A, #1e3a5f)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Libérez-vous de la saisie manuelle</h3>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>OCR intelligent, auto-remplissage, vérification instantanée.</p>
        <Link href="/register" style={{ display: 'inline-flex', padding: '11px 24px', borderRadius: '10px', background: '#D4A843', color: '#0B1D3A', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>Essayer CortIA gratuitement →</Link>
      </div>
    </article>
  )
}
