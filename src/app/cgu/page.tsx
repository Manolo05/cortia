import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Conditions G\u00e9n\u00e9rales d\u2019Utilisation \u2014 CortIA',
  description: 'CGU du service CortIA, logiciel IA pour courtiers en cr\u00e9dit immobilier IOBSP.',
}

export default function CGU() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#0B1D3A', lineHeight: 1.8 }}>
      <Link href="/" style={{ color: '#D4A843', textDecoration: 'none', fontSize: 14 }}>{'\u2190'} Retour {'\u00e0'} l&apos;accueil</Link>
      <h1 style={{ fontSize: 32, marginTop: 24, marginBottom: 32 }}>Conditions g{'\u00e9'}n{'\u00e9'}rales d&apos;utilisation</h1>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>1. Objet</h2>
      <p>Les pr{'\u00e9'}sentes CGU r{'\u00e9'}gissent l&apos;acc{'\u00e8'}s et l&apos;utilisation du service CortIA, plateforme d&apos;analyse de dossiers de cr{'\u00e9'}dit immobilier assist{'\u00e9'}e par intelligence artificielle, destin{'\u00e9'}e aux courtiers en cr{'\u00e9'}dit immobilier (IOBSP).</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>2. Acc{'\u00e8'}s au service</h2>
      <p>L&apos;acc{'\u00e8'}s au service n{'\u00e9'}cessite la cr{'\u00e9'}ation d&apos;un compte. L&apos;utilisateur s&apos;engage {'\u00e0'} fournir des informations exactes et {'\u00e0'} maintenir la confidentialit{'\u00e9'} de ses identifiants.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>3. Description du service</h2>
      <p>CortIA propose les fonctionnalit{'\u00e9'}s suivantes :</p>
      <p>- Extraction automatique de documents via OCR (bulletins de salaire, avis d&apos;imposition)<br/>
      - Scoring de risque par intelligence artificielle (score de 0 {'\u00e0'} 100)<br/>
      - Recommandation bancaire automatis{'\u00e9'}e (comparaison de 12 banques)<br/>
      - Assistant IA conversationnel contextuel<br/>
      - Synth{'\u00e8'}se bancaire et argumentaire</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>4. Formules et tarifs</h2>
      <p>- Plan Solo (gratuit) : 5 dossiers/mois, score IA, 1 utilisateur<br/>
      - Plan Pro (49{'\u20ac'}/mois) : dossiers illimit{'\u00e9'}s, OCR, recommandation bancaire, assistant IA<br/>
      - Plan Cabinet (99{'\u20ac'}/mois) : jusqu&apos;{'\u00e0'} 5 utilisateurs, dashboard manager, API</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>5. Responsabilit{'\u00e9'}s</h2>
      <p>CortIA fournit des analyses et recommandations {'\u00e0'} titre indicatif bas{'\u00e9'}es sur les donn{'\u00e9'}es saisies par l&apos;utilisateur. Les r{'\u00e9'}sultats ne constituent ni un conseil financier, ni une garantie d&apos;obtention de pr{'\u00ea'}t. L&apos;utilisateur reste seul responsable de l&apos;utilisation des r{'\u00e9'}sultats dans le cadre de son activit{'\u00e9'} professionnelle.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>6. Intelligence artificielle</h2>
      <p>CortIA utilise des mod{'\u00e8'}les d&apos;IA (Claude par Anthropic) pour l&apos;analyse des dossiers. Conform{'\u00e9'}ment {'\u00e0'} l&apos;AI Act europ{'\u00e9'}en, nous informons l&apos;utilisateur que les r{'\u00e9'}sultats sont g{'\u00e9'}n{'\u00e9'}r{'\u00e9'}s par intelligence artificielle et doivent {'\u00ea'}tre v{'\u00e9'}rifi{'\u00e9'}s par un professionnel qualifi{'\u00e9'}.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>7. Donn{'\u00e9'}es personnelles</h2>
      <p>Le traitement des donn{'\u00e9'}es personnelles est d{'\u00e9'}taill{'\u00e9'} dans notre <Link href="/confidentialite" style={{ color: '#D4A843' }}>politique de confidentialit{'\u00e9'}</Link>.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>8. Propri{'\u00e9'}t{'\u00e9'} intellectuelle</h2>
      <p>Le service CortIA, son code source, son design, ses algorithmes et ses bases de donn{'\u00e9'}es de crit{'\u00e8'}res bancaires sont la propri{'\u00e9'}t{'\u00e9'} exclusive de CortIA SAS.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>9. R{'\u00e9'}siliation</h2>
      <p>L&apos;utilisateur peut r{'\u00e9'}silier son compte {'\u00e0'} tout moment. Les donn{'\u00e9'}es seront supprim{'\u00e9'}es dans un d{'\u00e9'}lai de 30 jours, sauf obligation l{'\u00e9'}gale de conservation.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>10. Droit applicable</h2>
      <p>Les pr{'\u00e9'}sentes CGU sont r{'\u00e9'}gies par le droit fran{'\u00e7'}ais. En cas de litige, les tribunaux de Paris sont seuls comp{'\u00e9'}tents.</p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(11,29,58,0.1)', fontSize: 13, color: '#8A97A8' }}>
        Derni{'\u00e8'}re mise {'\u00e0'} jour : 18 avril 2026
      </div>
    </div>
  )
}
