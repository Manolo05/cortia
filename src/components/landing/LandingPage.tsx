'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('lp-visible'); obs.unobserve(el); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useReveal();
  return <div ref={ref} className={`lp-reveal ${className}`} style={style}>{children}</div>;
}

const features = [
  { icon: '🧠', cls: 'bg-[#0B1D3A] text-[#D4A843]', title: 'Score de risque IA', desc: "Chaque dossier est analysé automatiquement : taux d'endettement, reste à vivre, stabilité des revenus. Score de 0 à 100 en temps réel." },
  { icon: '🏦', cls: 'bg-[rgba(212,168,67,0.15)] text-[#D4A843]', title: 'Recommandation bancaire', desc: "L'IA croise le profil emprunteur avec les critères d'acceptation de chaque banque et recommande les meilleures options." },
  { icon: '📄', cls: 'bg-[rgba(55,138,221,0.1)] text-[#378ADD]', title: 'OCR documents', desc: "Uploadez bulletins de salaire, avis d'imposition et relevés bancaires. L'IA extrait automatiquement les données." },
  { icon: '📊', cls: 'bg-[rgba(212,168,67,0.15)] text-[#D4A843]', title: 'Tableau de bord intelligent', desc: "Visualisez en un coup d'\u0153il tous vos dossiers en cours, statuts, relances et KPIs de performance." },
  { icon: '💬', cls: 'bg-[#0B1D3A] text-[#D4A843]', title: 'Assistant conversationnel', desc: 'Posez vos questions \u00e0 l\'IA : "Ce dossier passe-t-il au Cr\u00e9dit Agricole ?", "Quels documents manquent ?"' },
  { icon: '🔒', cls: 'bg-[rgba(55,138,221,0.1)] text-[#378ADD]', title: 'Conformité RGPD & IOBSP', desc: 'Données hébergées en France, conformité RGPD et AI Act intégrée. Traçabilité complète.' },
];

const testimonials = [
  { text: "Avant CortIA, je passais 45 minutes par dossier \u00e0 \u00e9valuer la faisabilit\u00e9. Maintenant c'est fait en 2 minutes.", name: 'Sophie Lemaire', role: 'Courti\u00e8re ind\u00e9pendante \u2014 Lyon', initials: 'SL' },
  { text: "La recommandation bancaire m'a permis de d\u00e9couvrir que certains dossiers passaient mieux au CIC. Mon taux d'acceptation a bondi de 20%.", name: 'Marc Rousseau', role: 'Cabinet MR Courtage \u2014 Paris', initials: 'MR' },
  { text: "L'OCR est bluffant. Je prends en photo les bulletins de salaire et tout est extrait. Mes collaborateurs ont adopt\u00e9 CortIA en une demi-journ\u00e9e.", name: 'Amira Khoury', role: 'Directrice \u2014 Immo Finances Toulouse', initials: 'AK' },
];

const pricing = [
  { name: 'Solo', price: '0\u20ac', period: 'pour toujours', featured: false, desc: "Id\u00e9al pour d\u00e9couvrir CortIA et tester l'IA.", features: ['5 dossiers par mois', 'Score de risque IA', '1 utilisateur', 'Support par email'], cta: 'Commencer gratuitement', primary: false },
  { name: 'Pro', price: '49\u20ac', period: 'par mois / utilisateur', featured: true, desc: 'Pour maximiser votre efficacit\u00e9 au quotidien.', features: ['Dossiers illimit\u00e9s', 'IA compl\u00e8te + OCR', 'Recommandation bancaire', 'Assistant conversationnel', 'Support prioritaire'], cta: 'Essai gratuit 14 jours', primary: true },
  { name: 'Cabinet', price: '99\u20ac', period: 'par mois / 5 utilisateurs', featured: false, desc: "Pour \u00e9quiper toute l'\u00e9quipe.", features: ['Tout le plan Pro', 'Multi-utilisateurs', 'Tableau de bord manager', 'API & int\u00e9grations', 'Account manager d\u00e9di\u00e9'], cta: "Contacter l'\u00e9quipe", primary: false },
];
export default function LandingPage() {
  const router = useRouter();
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBarWidth(87), 800); return () => clearTimeout(t); }, []);
  const goApp = () => router.push('/login');
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');
        .lp-root { font-family: 'DM Sans', system-ui, sans-serif; }
        .lp-serif { font-family: 'DM Serif Display', serif; }
        .lp-reveal { opacity: 0; transform: translateY(30px); transition: opacity 0.7s ease-out, transform 0.7s ease-out; }
        .lp-visible { opacity: 1; transform: translateY(0); }
        @keyframes lp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes lp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .lp-float { animation: lp-float 3s ease-in-out infinite; }
        .lp-float-delay { animation: lp-float 3s ease-in-out infinite 1.5s; }
        .lp-check::before { content:''; width:18px; height:18px; border-radius:50%; background:rgba(29,158,117,0.1); flex-shrink:0; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%231D9E75' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:center; background-size:10px; }
      `}</style>
      <div className="lp-root bg-[#F7F4EE] text-[#0B1D3A] overflow-x-hidden">
        {/* NAV */}
        <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#F7F4EE]/85 border-b border-[#0B1D3A]/5">
          <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[68px]">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-[38px] h-[38px] bg-[#0B1D3A] rounded-[10px] flex items-center justify-center text-[#D4A843] font-bold lp-serif">C</div>
              <span className="lp-serif text-2xl">CortIA</span>
            </div>
            <ul className="hidden md:flex gap-8 text-sm font-medium text-[#5A6B80]">
              <li><button onClick={() => scrollTo('features')} className="hover:text-[#0B1D3A] transition-colors">Fonctionnalit\u00e9s</button></li>
              <li><button onClick={() => scrollTo('how')} className="hover:text-[#0B1D3A] transition-colors">Comment \u00e7a marche</button></li>
              <li><button onClick={() => scrollTo('pricing')} className="hover:text-[#0B1D3A] transition-colors">Tarifs</button></li>
              <li><button onClick={() => scrollTo('testimonials')} className="hover:text-[#0B1D3A] transition-colors">T\u00e9moignages</button></li>
            </ul>
            <button onClick={goApp} className="bg-[#0B1D3A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#122A52] transition-all hover:-translate-y-0.5">
              Acc\u00e9der \u00e0 l&apos;app \u2192
            </button>
          </div>
        </nav>
        {/* HERO */}
        <section className="pt-[140px] pb-20 relative overflow-hidden">
          <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,168,67,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.15)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-6 border border-[rgba(212,168,67,0.2)]">
                <span className="w-1.5 h-1.5 bg-[#D4A843] rounded-full" style={{ animation: 'lp-pulse 2s infinite' }} />
                Nouveau \u2014 IA pour courtiers IOBSP
              </div>
              <h1 className="lp-serif text-[42px] md:text-[52px] leading-[1.1] tracking-tight mb-5">
                Analysez vos dossiers de pr\u00eat <span className="text-[#D4A843]">3x plus vite</span> gr\u00e2ce \u00e0 l&apos;IA
              </h1>
              <p className="text-lg text-[#5A6B80] leading-relaxed mb-9 max-w-[480px]">
                CortIA est l&apos;assistant intelligent qui score vos dossiers, d\u00e9tecte les risques et recommande les meilleures banques. Con\u00e7u par des courtiers, pour des courtiers.
              </p>
              <div className="flex flex-wrap gap-4">
                <button onClick={goApp} className="bg-[#0B1D3A] text-white px-8 py-4 rounded-[10px] text-[15px] font-semibold hover:bg-[#122A52] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(11,29,58,0.2)]">D\u00e9marrer gratuitement \u2192</button>
                <button onClick={() => scrollTo('how')} className="bg-transparent text-[#0B1D3A] px-8 py-4 rounded-[10px] text-[15px] font-semibold border-[1.5px] border-[rgba(11,29,58,0.15)] hover:border-[#0B1D3A] transition-all hover:-translate-y-0.5">Voir la d\u00e9mo</button>
              </div>
            </div>
            <div className="relative hidden md:block">
              <div className="lp-float absolute -top-2.5 -right-5 bg-white px-4 py-2.5 rounded-[10px] shadow-[0_8px_32px_rgba(11,29,58,0.1)] text-[13px] font-semibold flex items-center gap-2 z-10">
                <span className="text-[#1D9E75]">\u2713</span> Dossier Dupont \u2014 Score 87/100
              </div>
              <div className="bg-white rounded-[20px] p-7 shadow-[0_24px_80px_rgba(11,29,58,0.08)] border border-[rgba(11,29,58,0.04)]">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold text-sm">Dossier #2024-0847 \u2014 Famille Martin</span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(29,158,117,0.1)] text-[#1D9E75]">\u00c9ligible</span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-[#F7F4EE] rounded-[10px] p-3.5"><div className="text-[11px] text-[#8A97A8] uppercase tracking-wider mb-1">Score IA</div><div className="text-[22px] font-bold text-[#1D9E75]">87/100</div></div>
                  <div className="bg-[#F7F4EE] rounded-[10px] p-3.5"><div className="text-[11px] text-[#8A97A8] uppercase tracking-wider mb-1">Endettement</div><div className="text-[22px] font-bold text-[#D4A843]">31,2%</div></div>
                  <div className="bg-[#F7F4EE] rounded-[10px] p-3.5"><div className="text-[11px] text-[#8A97A8] uppercase tracking-wider mb-1">Montant</div><div className="text-[22px] font-bold text-[#378ADD]">285 000 \u20ac</div></div>
                </div>
                <div>
                  <p className="text-xs text-[#5A6B80] font-medium mb-2">Probabilit\u00e9 d&apos;acceptation bancaire</p>
                  <div className="h-2 bg-[rgba(11,29,58,0.06)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#2CC98F] transition-all duration-[2s] ease-out" style={{ width: `${barWidth}%` }} />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-[#5A6B80] font-medium mb-2">Banques recommand\u00e9es</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(212,168,67,0.15)] border border-[rgba(212,168,67,0.2)] text-[#D4A843]">Cr\u00e9dit Agricole \u2605</span>
                    <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F4EE] border border-[rgba(11,29,58,0.06)]">BNP Paribas</span>
                    <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F4EE] border border-[rgba(11,29,58,0.06)]">CIC</span>
                    <span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F4EE] border border-[rgba(11,29,58,0.06)] opacity-50">LCL</span>
                  </div>
                </div>
              </div>
              <div className="lp-float-delay absolute bottom-7 -left-7 bg-white px-4 py-2.5 rounded-[10px] shadow-[0_8px_32px_rgba(11,29,58,0.1)] text-[13px] font-semibold flex items-center gap-2 z-10">
                <span className="text-[#D4A843]">\u26a1</span> 2 min d&apos;analyse
              </div>
            </div>
          </div>
        </section>
        {/* STATS */}
        <Reveal>
          <section className="py-16 border-t border-[#0B1D3A]/5">
            <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
              {[['3x', "Plus rapide qu'une analyse manuelle"], ['87%', "Taux de pr\u00e9diction d'acceptation"], ['2 min', 'Pour scorer un dossier complet'], ['35k+', 'Courtiers IOBSP en France']].map(([v, l]) => (
                <div key={v as string}><div className="lp-serif text-4xl text-[#0B1D3A]">{v}</div><div className="text-sm text-[#5A6B80] mt-1">{l}</div></div>
              ))}
            </div>
          </section>
        </Reveal>
        {/* FEATURES */}
        <section id="features" className="py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.15)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4 border border-[rgba(212,168,67,0.15)]">Fonctionnalit\u00e9s</div>
              <h2 className="lp-serif text-[32px] md:text-[40px] leading-tight mb-4 max-w-[600px]">Tout ce dont un courtier a besoin, augment\u00e9 par l&apos;IA</h2>
              <p className="text-[17px] text-[#5A6B80] leading-relaxed max-w-[520px] mb-16">Plus besoin de jongler entre Excel, emails et intuition. CortIA centralise et automatise votre m\u00e9tier.</p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <Reveal key={i} style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="bg-white rounded-[20px] p-8 border border-[rgba(11,29,58,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(11,29,58,0.06)] transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-xl ${f.cls}`}>{f.icon}</div>
                    <h3 className="text-[17px] font-semibold mb-2.5">{f.title}</h3>
                    <p className="text-sm text-[#5A6B80] leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        {/* HOW IT WORKS */}
        <section id="how" className="py-24 bg-[#0B1D3A] text-white relative overflow-hidden">
          <div className="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(212,168,67,0.08)_0%,transparent_70%)]" />
          <div className="max-w-[1200px] mx-auto px-6">
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.1)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4 border border-[rgba(212,168,67,0.15)]">Comment \u00e7a marche</div>
              <h2 className="lp-serif text-[32px] md:text-[40px] leading-tight mb-4 max-w-[600px]">De la saisie \u00e0 la recommandation bancaire en 3 \u00e9tapes</h2>
              <p className="text-[17px] text-white/60 leading-relaxed max-w-[520px] mb-16">Un processus simple et automatis\u00e9 pour vous concentrer sur ce qui compte : le conseil client.</p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              {[['01', 'Cr\u00e9ez le dossier', "Saisissez les informations client ou uploadez les pi\u00e8ces justificatives. L'OCR extrait les donn\u00e9es automatiquement."],
                ['02', "L'IA analyse", "En 2 minutes, CortIA calcule le score de risque, d\u00e9tecte les points de vigilance et \u00e9value la capacit\u00e9 d'emprunt r\u00e9elle."],
                ['03', 'Soumettez avec confiance', "Recevez la liste des banques les plus susceptibles d'accepter le dossier, avec les arguments cl\u00e9s."]
              ].map(([num, title, desc], i) => (
                <Reveal key={num as string} style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className="p-8 rounded-[20px] bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all">
                    <div className="lp-serif text-5xl text-[#D4A843] opacity-30 mb-4">{num}</div>
                    <h3 className="text-lg font-semibold mb-2.5">{title}</h3>
                    <p className="text-sm text-white/60 leading-relaxed">{desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        {/* TESTIMONIALS */}
        <section id="testimonials" className="py-24">
          <div className="max-w-[1200px] mx-auto px-6">
            <Reveal>
              <div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.15)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4 border border-[rgba(212,168,67,0.15)]">T\u00e9moignages</div>
              <h2 className="lp-serif text-[32px] md:text-[40px] leading-tight mb-4 max-w-[600px]">Ils ont adopt\u00e9 CortIA</h2>
              <p className="text-[17px] text-[#5A6B80] leading-relaxed max-w-[520px] mb-16">Des courtiers qui gagnent du temps et convertissent plus de dossiers.</p>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5 mt-16">
              {testimonials.map((t, i) => (
                <Reveal key={i} style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className="bg-white rounded-[20px] p-7 border border-[rgba(11,29,58,0.04)]">
                    <div className="text-[#D4A843] text-sm tracking-widest mb-3">\u2605\u2605\u2605\u2605\u2605</div>
                    <p className="text-[15px] leading-[1.7] mb-5 italic">&ldquo;{t.text}&rdquo;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#0B1D3A] flex items-center justify-center text-[#D4A843] font-bold text-sm">{t.initials}</div>
                      <div><div className="font-semibold text-sm">{t.name}</div><div className="text-xs text-[#8A97A8]">{t.role}</div></div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        {/* PRICING */}
        <section id="pricing" className="py-24 bg-[#F7F4EE]">
          <div className="max-w-[1200px] mx-auto px-6">
            <Reveal>
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.15)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4 border border-[rgba(212,168,67,0.15)]">Tarifs</div>
                <h2 className="lp-serif text-[32px] md:text-[40px] leading-tight mb-4 mx-auto">Simple, transparent, sans engagement</h2>
                <p className="text-[17px] text-[#5A6B80] leading-relaxed max-w-[520px] mx-auto mb-16">Commencez gratuitement. Passez \u00e0 Pro quand vous \u00eates convaincu.</p>
              </div>
            </Reveal>
            <div className="grid md:grid-cols-3 gap-5 mt-16">
              {pricing.map((p, i) => (
                <Reveal key={i} style={{ transitionDelay: `${i * 100}ms` }}>
                  <div className={`bg-white rounded-[20px] p-8 relative ${p.featured ? 'border-2 border-[#D4A843] shadow-[0_16px_48px_rgba(212,168,67,0.12)]' : 'border border-[rgba(11,29,58,0.04)]'}`}>
                    {p.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4A843] text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">Le plus populaire</div>}
                    <div className="text-sm text-[#5A6B80] font-semibold uppercase tracking-wider">{p.name}</div>
                    <div className="lp-serif text-5xl my-3">{p.price}</div>
                    <div className="text-[13px] text-[#8A97A8]">{p.period}</div>
                    <p className="text-sm text-[#5A6B80] my-4 leading-relaxed">{p.desc}</p>
                    <ul className="mb-7 space-y-0">
                      {p.features.map((f, fi) => (<li key={fi} className="py-2 text-sm text-[#5A6B80] flex items-center gap-2.5 border-b border-[rgba(11,29,58,0.04)] lp-check">{f}</li>))}
                    </ul>
                    <button onClick={goApp} className={`w-full py-4 rounded-[10px] text-[15px] font-semibold transition-all hover:-translate-y-0.5 ${p.primary ? 'bg-[#0B1D3A] text-white hover:bg-[#122A52]' : 'bg-transparent text-[#0B1D3A] border-[1.5px] border-[rgba(11,29,58,0.15)] hover:border-[#0B1D3A]'}`}>{p.cta}</button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
        {/* CTA */}
        <Reveal>
          <section className="py-24">
            <div className="max-w-[1200px] mx-auto px-6">
              <div className="bg-[#0B1D3A] rounded-3xl py-20 px-8 md:px-16 text-center relative overflow-hidden">
                <div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(212,168,67,0.1)_0%,transparent_70%)]" />
                <h2 className="lp-serif text-[28px] md:text-[40px] text-white mb-4 relative">Pr\u00eat \u00e0 transformer votre pratique du courtage ?</h2>
                <p className="text-[17px] text-white/60 mb-10 max-w-[500px] mx-auto relative">Rejoignez les courtiers qui gagnent du temps et convertissent plus de dossiers gr\u00e2ce \u00e0 l&apos;IA.</p>
                <button onClick={goApp} className="bg-[#D4A843] text-[#0B1D3A] px-10 py-[18px] rounded-[10px] text-base font-semibold hover:bg-[#E8C97A] transition-all hover:-translate-y-0.5 relative">D\u00e9marrer mon essai gratuit \u2192</button>
              </div>
            </div>
          </section>
        </Reveal>
        {/* FOOTER */}
        <footer className="pt-16 pb-10 border-t border-[#0B1D3A]/5">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10">
              <div>
                <div className="lp-serif text-xl flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-[#0B1D3A] rounded-[7px] flex items-center justify-center text-[#D4A843] font-bold text-xs lp-serif">C</div>CortIA
                </div>
                <p className="text-sm text-[#5A6B80] leading-relaxed max-w-[300px]">L&apos;assistant IA du courtier en cr\u00e9dit immobilier. Con\u00e7u en France, h\u00e9berg\u00e9 en France.</p>
              </div>
              <div><h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#8A97A8] mb-4">Produit</h4><ul className="space-y-2.5 text-sm text-[#5A6B80]"><li><button onClick={() => scrollTo('features')} className="hover:text-[#0B1D3A]">Fonctionnalit\u00e9s</button></li><li><button onClick={() => scrollTo('pricing')} className="hover:text-[#0B1D3A]">Tarifs</button></li><li><span className="opacity-50">Roadmap</span></li><li><span className="opacity-50">Changelog</span></li></ul></div>
              <div><h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#8A97A8] mb-4">Ressources</h4><ul className="space-y-2.5 text-sm text-[#5A6B80]"><li><span className="opacity-50">Blog</span></li><li><span className="opacity-50">Guide IA</span></li><li><span className="opacity-50">Webinaires</span></li><li><span className="opacity-50">API Docs</span></li></ul></div>
              <div><h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#8A97A8] mb-4">Entreprise</h4><ul className="space-y-2.5 text-sm text-[#5A6B80]"><li><span className="opacity-50">\u00c0 propos</span></li><li><span className="opacity-50">Contact</span></li><li><span className="opacity-50">CGU</span></li><li><span className="opacity-50">Confidentialit\u00e9</span></li></ul></div>
            </div>
            <div className="border-t border-[#0B1D3A]/5 pt-6 flex flex-col md:flex-row justify-between text-[13px] text-[#8A97A8]">
              <span>\u00a9 2026 CortIA. Tous droits r\u00e9serv\u00e9s.</span>
              <span>H\u00e9berg\u00e9 en France \ud83c\uddeb\ud83c\uddf7 \u2014 Conforme RGPD</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
