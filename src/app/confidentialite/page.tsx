import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialit\u00e9 \u2014 CortIA',
  description: 'Politique de confidentialit\u00e9 et RGPD du service CortIA.',
}

export default function Confidentialite() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px', fontFamily: "'DM Sans', system-ui, sans-serif", color: '#0B1D3A', lineHeight: 1.8 }}>
      <Link href="/" style={{ color: '#D4A843', textDecoration: 'none', fontSize: 14 }}>{'\u2190'} Retour {'\u00e0'} l&apos;accueil</Link>
      <h1 style={{ fontSize: 32, marginTop: 24, marginBottom: 32 }}>Politique de confidentialit{'\u00e9'}</h1>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>1. Responsable du traitement</h2>
      <p>CortIA SAS (en cours d&apos;immatriculation)<br/>
      Email : contact@cortia.fr<br/>
      DPO : [Nom {'\u00e0'} d{'\u00e9'}signer]</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>2. Donn{'\u00e9'}es collect{'\u00e9'}es</h2>
      <p>Dans le cadre de l&apos;utilisation du service, nous collectons :</p>
      <p><strong>Donn{'\u00e9'}es du compte :</strong> nom, pr{'\u00e9'}nom, email, mot de passe (hash{'\u00e9'})</p>
      <p><strong>Donn{'\u00e9'}es des dossiers :</strong> informations des emprunteurs (nom, revenus, charges, situation professionnelle), donn{'\u00e9'}es du projet immobilier (montant, apport, dur{'\u00e9'}e), documents financiers (bulletins de salaire, avis d&apos;imposition)</p>
      <p><strong>Donn{'\u00e9'}es techniques :</strong> adresse IP, logs de connexion, cookies de session</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>3. Finalit{'\u00e9'}s du traitement</h2>
      <p>Vos donn{'\u00e9'}es sont trait{'\u00e9'}es pour :</p>
      <p>- Fournir le service d&apos;analyse de dossiers de cr{'\u00e9'}dit immobilier<br/>
      - G{'\u00e9'}n{'\u00e9'}rer les scores de risque et recommandations bancaires via IA<br/>
      - Extraire les informations des documents via OCR<br/>
      - Am�'\u00e9'}liorer le service (statistiques anonymis{'\u00e9'}es)<br/>
      - Respecter nos obligations l{'\u00e9'}gales</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>4. Base l{'\u00e9'}gale</h2>
      <p>Le traitement de vos donn{'\u00e9'}es repose sur :</p>
      <p>- L&apos;ex{'\u00e9'}cution du contrat (fourniture du service)<br/>
      - Votre consentement (cookies non essentiels, si applicable)<br/>
      - Notre int{'\u00e9'}r{'\u00ea'}t l{'\u00e9'}gitime (am{'\u00e9'}lioration du service, s{'\u00e9'}curit{'\u00e9'})</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>5. Sous-traitants et transferts</h2>
      <p>Vos donn{'\u00e9'}es peuvent {'\u00ea'}tre trait{'\u00e9'}es par :</p>
      <p>- <strong>Supabase</strong> (h{'\u00e9'}bergement base de donn{'\u00e9'}es) {'\u2014'} Donn{'\u00e9'}es stock{'\u00e9'}es en UE<br/>
      - <strong>Vercel</strong> (h{'\u00e9'}bergement application) {'\u2014'} CDN mondial, serveurs EU disponibles<br/>
      - <strong>Anthropic</strong> (intelligence artificielle) {'\u2014'} Les donn{'\u00e9'}es des dossiers sont envoy{'\u00e9'}es {'\u00e0'} l&apos;API Claude pour analyse. Anthropic ne conserve pas les donn{'\u00e9'}es au-del{'\u00e0'} de 30 jours et ne les utilise pas pour entra{'\u00ee'}ner ses mod{'\u00e8'}les.</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>6. Dur{'\u00e9'}e de conservation</h2>
      <p>- Donn{'\u00e9'}es du compte : dur{'\u00e9'}e de la relation contractuelle + 3 ans<br/>
      - Donn{'\u00e9'}es des dossiers : 5 ans (obligation l{'\u00e9'}gale courtage)<br/>
      - Logs techniques : 12 mois<br/>
      - Apr{'\u00e8'}s suppression du compte : 30 jours maximum</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>7. Vos droits (RGPD)</h2>
      <p>Conform�'\u00e9'}ment au RGPD, vous disposez des droits suivants :</p>
      <p>- <strong>Droit d&apos;acc{'\u00e8'}s :</strong> obtenir une copie de vos donn{'\u00e9'}es<br/>
      - <strong>Droit de rectification :</strong> corriger des donn{'\u00e9'}es inexactes<br/>
      - <strong>Droit {'\u00e0'} l&apos;effacement :</strong> demander la suppression de vos donn{'\u00e9'}es<br/>
      - <strong>Droit {'\u00e0'} la portabilit{'\u00e9'} :</strong> r{'\u00e9'}cup{'\u00e9'}rer vos donn{'\u00e9'}es dans un format structur{'\u00e9'}<br/>
      - <strong>Droit d&apos;opposition :</strong> vous opposer au traitement<br/>
      - <strong>Droit {'\u00e0'} la limitation :</strong> restreindre le traitement</p>
      <p>Pour exercer vos droits : <strong>contact@cortia.fr</strong></p>
      <p>D{'\u00e9'}lai de r{'\u00e9'}ponse : 30 jours maximum.</p>
      <p>Vous pouvez {'\u00e9'}galement introduire une r{'\u00e9'}clamation aupr{'\u00e8'}s de la CNIL (www.cnil.fr).</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>8. S{'\u00e9'}curit{'\u00e9'}</h2>
      <p>Nous mettons en oeuvre les mesures de s{'\u00e9'}curit{'\u00e9'} suivantes :</p>
      <p>- Chiffrement HTTPS (TLS 1.3) pour toutes les communications<br/>
      - Authentification s{'\u00e9'}curis{'\u00e9'}e via Supabase Auth<br/>
      - Stockage des mots de passe hash{'\u00e9'}s (bcrypt)<br/>
      - Contr{'\u00f4'}le d&apos;acc{'\u00e8'}s par Row Level Security (RLS)<br/>
      - Headers de s{'\u00e9'}curit{'\u00e9'} (CSP, HSTS, X-Frame-Options)<br/>
      - Rate limiting sur les API sensibles</p>

      <h2 style={{ fontSize: 20, marginTop: 32, marginBottom: 12 }}>9. Cookies</h2>
      <p>CortIA utilise uniquement des cookies strictement n{'\u00e9'}cessaires :</p>
      <p>- <strong>sb-access-token / sb-refresh-token :</strong> authentification Supabase (session)<br/>
      - Aucun cookie publicitaire, analytique ou de tra{'\u00e7'}age</p>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid rgba(11,29,58,0.1)', fontSize: 13, color: '#8A97A8' }}>
        Derni{'\u00e8'}re mise {'\u00e0'} jour : 18 avril 2026
      </div>
    </div>
  )
}
