import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mentions l\u00e9gales \u2014 CortIA',
  description: 'Mentions l\u00e9gales du service CortIA, logiciel IA pour courtiers en cr\u00e9dit immobilier.',
}

export default function MentionsLegales() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#0B1D3A', lineHeight: 1.8 }}>
      <Link href="/" style={{ color: '#D4A843', textDecoration: 'none', fontSize: 14 }}>{'\u2190'} Retour {'\u00e0'} l&apos;accueil</Link>
      <h1 style={{ fontSize: 32, marginTop: 24, marginBottom: 32 }}>Mentions l{'\u00e9'}gales</h1>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>{'\u00c9'}diteur du site</h2>
      <p>Le site cortia-kappa.vercel.app est {'\u00e9'}dit{'\u00e9'} par :</p>
      <p>CortIA SAS (en cours d&apos;immatriculation)<br/>
      Si{'\u00e8'}ge social : [Adresse {'\u00e0'} compl{'\u00e9'}ter]<br/>
      Email : contact@cortia.fr<br/>
      Directeur de la publication : [Nom du dirigeant]</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>H{'\u00e9'}bergement</h2>
      <p>Le site est h{'\u00e9'}berg{'\u00e9'} par :</p>
      <p>Vercel Inc.<br/>
      340 S Lemon Ave #4133, Walnut, CA 91789, USA<br/>
      https://vercel.com</p>
      <p>Les donn{'\u00e9'}es sont stock{'\u00e9'}es par :</p>
      <p>Supabase Inc.<br/>
      970 Toa Payoh North #07-04, Singapore 318992<br/>
      https://supabase.com</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>Propri{'\u00e9'}t{'\u00e9'} intellectuelle</h2>
      <p>L&apos;ensemble du contenu du site CortIA (textes, images, logos, logiciels) est prot{'\u00e9'}g{'\u00e9'} par le droit d&apos;auteur. Toute reproduction sans autorisation pr{'\u00e9'}alable est interdite.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>Donn{'\u00e9'}es personnelles</h2>
      <p>Les donn{'\u00e9'}es collect{'\u00e9'}es via CortIA sont trait{'\u00e9'}es conform{'\u00e9'}ment au R{'\u00e8'}glement G{'\u00e9'}n{'\u00e9'}ral sur la Protection des Donn{'\u00e9'}es (RGPD). Pour plus d&apos;informations, consultez notre <Link href="/confidentialite" style={{ color: '#D4A843' }}>politique de confidentialit{'\u00e9'}</Link>.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>Cookies</h2>
      <p>Le site utilise des cookies strictement n{'\u00e9'}cessaires au fonctionnement du service (authentification, session). Aucun cookie publicitaire ou de tra{'\u00e7'}age n&apos;est utilis{'\u00e9'}.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>Limitation de responsabilit{'\u00e9'}</h2>
      <p>CortIA fournit des analyses et recommandations {'\u00e0'} titre indicatif. Les scores et recommandations bancaires ne constituent en aucun cas une garantie d&apos;acceptation de pr{'\u00ea'}t. Le courtier reste seul responsable de ses d{'\u00e9'}cisions professionnelles.</p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(11,29,58,0.1)', fontSize: 13, color: '#8A97A8' }}>
        Derni{'\u00e8'}re mise {'\u00e0'} jour : 18 avril 2026
      </div>
    </div>
  )
}
