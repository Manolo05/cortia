import { NavButtons, LogoClick, AnimatedBar, CTAButton, ScrollButton, FooterLinks, PricingCTA } from './ClientInteractions'

const features = [
  { icon: '\u{1F9E0}', cls: 'bg-dark', title: 'Score de risque IA', desc: "Analyse automatique : endettement, reste \u00e0 vivre, stabilit\u00e9 des revenus. Score de 0 \u00e0 100." },
  { icon: '\u{1F3E6}', cls: 'bg-gold', title: 'Recommandation bancaire', desc: "Croisement profil emprunteur et crit\u00e8res d'acceptation de chaque banque." },
  { icon: '\u{1F4C4}', cls: 'bg-blue', title: 'OCR documents', desc: "Upload et extraction automatique des bulletins de salaire et avis d'imposition." },
  { icon: '\u{1F4CA}', cls: 'bg-gold', title: 'Tableau de bord', desc: "Tous vos dossiers, statuts, relances et KPIs en un coup d'oeil." },
  { icon: '\u{1F4AC}', cls: 'bg-dark', title: 'Assistant IA', desc: "Posez vos questions : Ce dossier passe-t-il au Cr\u00e9dit Agricole ? Quels documents manquent ?" },
  { icon: '\u{1F512}', cls: 'bg-blue', title: 'Conformit\u00e9 RGPD', desc: "Donn\u00e9es h\u00e9berg\u00e9es en France, conformit\u00e9 RGPD et AI Act." },
]

const testimonials = [
  { text: "Avant CortIA, 45 min par dossier. Maintenant 2 minutes.", name: 'Sophie Lemaire', role: 'Courti\u00e8re \u2014 Lyon', initials: 'SL' },
  { text: "Mon taux d'acceptation a bondi de 20%.", name: 'Marc Rousseau', role: 'Cabinet MR Courtage \u2014 Paris', initials: 'MR' },
  { text: "L'OCR est bluffant. Adopt\u00e9 en une demi-journ\u00e9e.", name: 'Amira Khoury', role: 'Directrice \u2014 Immo Finances', initials: 'AK' },
]

const pricing = [
  { name: 'Solo', price: '0\u20ac', period: 'gratuit', featured: false, desc: "D\u00e9couvrez CortIA.", feats: ['5 dossiers/mois', 'Score IA', '1 user', 'Support email'], cta: 'Commencer', primary: false },
  { name: 'Pro', price: '49\u20ac', period: '/mois', featured: true, desc: 'Efficacit\u00e9 maximale.', feats: ['Illimit\u00e9', 'IA + OCR', 'Reco bancaire', 'Assistant IA', 'Support prio'], cta: 'Essai gratuit 14j', primary: true },
  { name: 'Cabinet', price: '99\u20ac', period: '/mois 5 users', featured: false, desc: "Toute l'\u00e9quipe.", feats: ['Plan Pro', 'Multi-users', 'Dashboard mgr', 'API', 'Account mgr'], cta: 'Contacter', primary: false },
]

export default function LandingPage() {
  return (
    <div style={{ background: '#F7F4EE', color: '#0B1D3A', fontFamily: "'DM Sans', system-ui, sans-serif", minHeight: '100vh' }}>
      <style>{`.lp-serif{font-family:'DM Serif Display',serif}@keyframes lp-pulse{0%,100%{opacity:1}50%{opacity:.4}}@keyframes lp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}.lp-float{animation:lp-float 3s ease-in-out infinite}.lp-float2{animation:lp-float 3s ease-in-out infinite 1.5s}`}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backdropFilter: 'blur(20px)', background: 'rgba(247,244,238,0.85)', borderBottom: '1px solid rgba(11,29,58,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          <LogoClick>
            <div style={{ width: 38, height: 38, background: '#0B1D3A', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 700 }} className="lp-serif">C</div>
            <span className="lp-serif" style={{ fontSize: 24 }}>CortIA</span>
          </LogoClick>
          <NavButtons />
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 140, paddingBottom: 80, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, right: -200, width: 600, height: 600, background: 'radial-gradient(circle, rgba(212,168,67,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,67,0.15)', color: '#D4A843', padding: '6px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, marginBottom: 24, border: '1px solid rgba(212,168,67,0.2)' }}>
              <span style={{ width: 6, height: 6, background: '#D4A843', borderRadius: '50%', animation: 'lp-pulse 2s infinite' }} />
              Nouveau &mdash; IA pour courtiers IOBSP
            </div>
            <h1 className="lp-serif" style={{ fontSize: 52, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 20 }}>
              Analysez vos dossiers <span style={{ color: '#D4A843' }}>3x plus vite</span> avec l&apos;IA
            </h1>
            <p style={{ fontSize: 18, color: '#5A6B80', lineHeight: 1.6, marginBottom: 36, maxWidth: 480 }}>CortIA score vos dossiers, d&eacute;tecte les risques et recommande les meilleures banques.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <CTAButton variant="primary">D&eacute;marrer gratuitement &rarr;</CTAButton>
              <ScrollButton targetId="features" style={{ background: 'transparent', color: '#0B1D3A', padding: '16px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600, border: '1.5px solid rgba(11,29,58,0.15)', cursor: 'pointer' }}>Voir les fonctionnalit&eacute;s</ScrollButton>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div className="lp-float" style={{ position: 'absolute', top: -10, right: 10, background: '#fff', padding: '10px 16px', borderRadius: 10, boxShadow: '0 8px 32px rgba(11,29,58,0.1)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}><span style={{ color: '#1D9E75' }}>{'\u2713'}</span> Score 87/100</div>
            <div style={{ background: '#fff', borderRadius: 20, padding: 28, boxShadow: '0 24px 80px rgba(11,29,58,0.08)', border: '1px solid rgba(11,29,58,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}><span style={{ fontWeight: 600, fontSize: 14 }}>Dossier #2024-0847</span><span style={{ padding: '4px 12px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: 'rgba(29,158,117,0.1)', color: '#1D9E75' }}>{'\u00c9'}ligible</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                <div style={{ background: '#F7F4EE', borderRadius: 10, padding: 14 }}><div style={{ fontSize: 11, color: '#8A97A8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Score</div><div style={{ fontSize: 22, fontWeight: 700, color: '#1D9E75' }}>87/100</div></div>
                <div style={{ background: '#F7F4EE', borderRadius: 10, padding: 14 }}><div style={{ fontSize: 11, color: '#8A97A8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Endettement</div><div style={{ fontSize: 22, fontWeight: 700, color: '#D4A843' }}>31,2%</div></div>
                <div style={{ background: '#F7F4EE', borderRadius: 10, padding: 14 }}><div style={{ fontSize: 11, color: '#8A97A8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Montant</div><div style={{ fontSize: 22, fontWeight: 700, color: '#378ADD' }}>285 000 {'\u20ac'}</div></div>
              </div>
              <div><p style={{ fontSize: 12, color: '#5A6B80', fontWeight: 500, marginBottom: 8 }}>Probabilit&eacute; d&apos;acceptation</p><AnimatedBar /></div>
              <div style={{ marginTop: 16 }}><p style={{ fontSize: 12, color: '#5A6B80', fontWeight: 500, marginBottom: 8 }}>Banques recommand&eacute;es</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}><span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: 'rgba(212,168,67,0.15)', border: '1px solid rgba(212,168,67,0.2)', color: '#D4A843' }}>Cr&eacute;dit Agricole {'\u2605'}</span><span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#F7F4EE', border: '1px solid rgba(11,29,58,0.06)' }}>BNP</span><span style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: '#F7F4EE', border: '1px solid rgba(11,29,58,0.06)' }}>CIC</span></div></div>
            </div>
            <div className="lp-float2" style={{ position: 'absolute', bottom: 28, left: 0, background: '#fff', padding: '10px 16px', borderRadius: 10, boxShadow: '0 8px 32px rgba(11,29,58,0.1)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, zIndex: 10 }}><span style={{ color: '#D4A843' }}>{'\u26a1'}</span> 2 min</div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: '64px 0', borderTop: '1px solid rgba(11,29,58,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, textAlign: 'center' }}>
          {[['3x','Plus rapide'],['12','Banques analys\u00e9es'],['2 min','Par dossier'],['100%','Gratuit au d\u00e9marrage']].map(([v,l])=>(<div key={v as string}><div className="lp-serif" style={{ fontSize: 36, color: '#0B1D3A' }}>{v}</div><div style={{ fontSize: 14, color: '#5A6B80', marginTop: 4 }}>{l}</div></div>))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '96px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,67,0.15)', color: '#D4A843', padding: '6px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, marginBottom: 16, border: '1px solid rgba(212,168,67,0.15)' }}>Fonctionnalit&eacute;s</div>
          <h2 className="lp-serif" style={{ fontSize: 40, lineHeight: 1.15, marginBottom: 16, maxWidth: 600 }}>Tout ce dont un courtier a besoin, augment&eacute; par l&apos;IA</h2>
          <p style={{ fontSize: 17, color: '#5A6B80', lineHeight: 1.6, maxWidth: 520, marginBottom: 64 }}>CortIA centralise et automatise votre m&eacute;tier.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {features.map((f,i)=>(<div key={i} style={{ background: '#fff', borderRadius: 20, padding: 32, border: '1px solid rgba(11,29,58,0.04)' }}><div style={{ width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, fontSize: 20, background: f.cls === 'bg-dark' ? '#0B1D3A' : f.cls === 'bg-blue' ? 'rgba(55,138,221,0.1)' : 'rgba(212,168,67,0.15)', color: f.cls === 'bg-blue' ? '#378ADD' : '#D4A843' }}>{f.icon}</div><h3 style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{f.title}</h3><p style={{ fontSize: 14, color: '#5A6B80', lineHeight: 1.6 }}>{f.desc}</p></div>))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '96px 0', background: '#0B1D3A', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -100, left: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(212,168,67,0.08) 0%, transparent 70%)' }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,67,0.1)', color: '#D4A843', padding: '6px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, marginBottom: 16, border: '1px solid rgba(212,168,67,0.15)' }}>Comment &ccedil;a marche</div>
          <h2 className="lp-serif" style={{ fontSize: 40, lineHeight: 1.15, marginBottom: 16, maxWidth: 600 }}>3 &eacute;tapes simples</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, maxWidth: 520, marginBottom: 64 }}>Concentrez-vous sur le conseil client.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, marginTop: 64 }}>
            {[['01','Cr\u00e9ez le dossier',"Saisissez les infos ou uploadez les pi\u00e8ces. L'OCR extrait tout."],['02',"L'IA analyse","Score, vigilance, capacit\u00e9 d'emprunt en 2 min."],['03','Soumettez',"Banques class\u00e9es par probabilit\u00e9 d'acceptation."]].map(([n,t,d])=>(<div key={n as string} style={{ padding: 32, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}><div className="lp-serif" style={{ fontSize: 48, color: '#D4A843', opacity: 0.3, marginBottom: 16 }}>{n}</div><h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10 }}>{t}</h3><p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{d}</p></div>))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '96px 0', background: '#F7F4EE' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,67,0.15)', color: '#D4A843', padding: '6px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, marginBottom: 16, border: '1px solid rgba(212,168,67,0.15)' }}>Retours beta-testeurs</div>
          <h2 className="lp-serif" style={{ fontSize: 40, lineHeight: 1.15, marginBottom: 16 }}>Premiers retours</h2>
          <p style={{ fontSize: 14, color: '#8A97A8', marginBottom: 48 }}>Retours de nos premiers utilisateurs en phase beta.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 64 }}>
            {testimonials.map((t,i)=>(<div key={i} style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid rgba(11,29,58,0.04)' }}><div style={{ color: '#D4A843', fontSize: 14, letterSpacing: '0.1em', marginBottom: 12 }}>{'\u2605\u2605\u2605\u2605\u2605'}</div><p style={{ fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>{`"${t.text}"`}</p><div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0B1D3A', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 700, fontSize: 14 }}>{t.initials}</div><div><div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div><div style={{ fontSize: 12, color: '#8A97A8' }}>{t.role}</div></div></div></div>))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{ padding: '96px 0', background: '#F7F4EE' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(212,168,67,0.15)', color: '#D4A843', padding: '6px 16px', borderRadius: 9999, fontSize: 13, fontWeight: 600, marginBottom: 16, border: '1px solid rgba(212,168,67,0.15)' }}>Tarifs</div>
          <h2 className="lp-serif" style={{ fontSize: 40, lineHeight: 1.15, marginBottom: 16 }}>Simple et transparent</h2>
          <p style={{ fontSize: 17, color: '#5A6B80', maxWidth: 520, margin: '0 auto 64px' }}>Commencez gratuitement.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, textAlign: 'left' }}>
            {pricing.map((p,i)=>(<div key={i} style={{ background: '#fff', borderRadius: 20, padding: 32, position: 'relative', border: p.featured ? '2px solid #D4A843' : '1px solid rgba(11,29,58,0.04)', boxShadow: p.featured ? '0 16px 48px rgba(212,168,67,0.12)' : 'none' }}>{p.featured&&<div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#D4A843', color: '#fff', padding: '4px 16px', borderRadius: 9999, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>Le plus populaire</div>}<div style={{ fontSize: 14, color: '#5A6B80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.name}</div><div className="lp-serif" style={{ fontSize: 48, margin: '12px 0' }}>{p.price}</div><div style={{ fontSize: 13, color: '#8A97A8' }}>{p.period}</div><p style={{ fontSize: 14, color: '#5A6B80', margin: '16px 0' }}>{p.desc}</p><ul style={{ marginBottom: 28, listStyle: 'none', padding: 0 }}>{p.feats.map((f,fi)=>(<li key={fi} style={{ padding: '8px 0', fontSize: 14, color: '#5A6B80', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(11,29,58,0.04)' }}><span style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(29,158,117,0.1)', flexShrink: 0, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D9E75' }}>{'\u2713'}</span>{f}</li>))}</ul><PricingCTA label={p.cta} primary={p.primary} /></div>))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ background: '#0B1D3A', borderRadius: 24, padding: '80px 64px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(212,168,67,0.1) 0%, transparent 70%)' }} />
            <h2 className="lp-serif" style={{ fontSize: 40, color: '#fff', marginBottom: 16, position: 'relative' }}>Pr&ecirc;t &agrave; transformer votre courtage ?</h2>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px', position: 'relative' }}>Rejoignez les courtiers qui convertissent plus.</p>
            <CTAButton variant="gold">D&eacute;marrer mon essai gratuit &rarr;</CTAButton>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ paddingTop: 64, paddingBottom: 40, borderTop: '1px solid rgba(11,29,58,0.05)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
            <div>
              <div className="lp-serif" style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: '#0B1D3A', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D4A843', fontWeight: 700, fontSize: 12 }} className="lp-serif">C</div>CortIA
              </div>
              <p style={{ fontSize: 14, color: '#5A6B80', lineHeight: 1.6, maxWidth: 300 }}>L&apos;assistant IA du courtier en cr&eacute;dit immobilier.</p>
            </div>
            <div><h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8A97A8', marginBottom: 16 }}>Produit</h4><FooterLinks /></div>
            <div><h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8A97A8', marginBottom: 16 }}>Ressources</h4><div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#5A6B80' }}><span style={{ opacity: 0.5 }}>Blog</span><span style={{ opacity: 0.5 }}>API</span></div></div>
            <div><h4 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#8A97A8', marginBottom: 16 }}>Entreprise</h4><div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, color: '#5A6B80' }}><span style={{ opacity: 0.5 }}>Contact</span><span style={{ opacity: 0.5 }}>CGU</span></div></div>
          </div>
          <div style={{ borderTop: '1px solid rgba(11,29,58,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#8A97A8' }}>
            <span>&copy; 2026 CortIA</span>
            <span>H&eacute;berg&eacute; en France &mdash; RGPD</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
