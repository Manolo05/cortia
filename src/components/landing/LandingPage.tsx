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
  { icon: '🧠', cls: 'bg-[#0B1D3A] text-[#D4A843]', title: 'Score de risque IA', desc: "Analyse automatique : endettement, reste à vivre, stabilité des revenus. Score de 0 à 100." },
  { icon: '🏦', cls: 'bg-[rgba(212,168,67,0.15)] text-[#D4A843]', title: 'Recommandation bancaire', desc: "Croisement profil emprunteur et critères d'acceptation de chaque banque." },
  { icon: '📄', cls: 'bg-[rgba(55,138,221,0.1)] text-[#378ADD]', title: 'OCR documents', desc: "Upload et extraction automatique des bulletins de salaire et avis d'imposition." },
  { icon: '📊', cls: 'bg-[rgba(212,168,67,0.15)] text-[#D4A843]', title: 'Tableau de bord', desc: "Tous vos dossiers, statuts, relances et KPIs en un coup d'oeil." },
  { icon: '💬', cls: 'bg-[#0B1D3A] text-[#D4A843]', title: 'Assistant IA', desc: "Posez vos questions : Ce dossier passe-t-il au Crédit Agricole ? Quels documents manquent ?" },
  { icon: '🔒', cls: 'bg-[rgba(55,138,221,0.1)] text-[#378ADD]', title: 'Conformité RGPD', desc: "Données hébergées en France, conformité RGPD et AI Act." },
];

const testimonials = [
  { text: "Avant CortIA, 45 min par dossier. Maintenant 2 minutes.", name: 'Sophie Lemaire', role: 'Courtière — Lyon', initials: 'SL' },
  { text: "Mon taux d'acceptation a bondi de 20%.", name: 'Marc Rousseau', role: 'Cabinet MR Courtage — Paris', initials: 'MR' },
  { text: "L'OCR est bluffant. Adopté en une demi-journée.", name: 'Amira Khoury', role: 'Directrice — Immo Finances', initials: 'AK' },
];

const pricing = [
  { name: 'Solo', price: '0€', period: 'gratuit', featured: false, desc: "Découvrez CortIA.", feats: ['5 dossiers/mois', 'Score IA', '1 user', 'Support email'], cta: 'Commencer', primary: false },
  { name: 'Pro', price: '49€', period: '/mois', featured: true, desc: 'Efficacité maximale.', feats: ['Illimité', 'IA + OCR', 'Reco bancaire', 'Assistant IA', 'Support prio'], cta: 'Essai gratuit 14j', primary: true },
  { name: 'Cabinet', price: '99€', period: '/mois 5 users', featured: false, desc: "Toute l'équipe.", feats: ['Plan Pro', 'Multi-users', 'Dashboard mgr', 'API', 'Account mgr'], cta: 'Contacter', primary: false },
];

export default function LandingPage() {
  const router = useRouter();
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setBarWidth(87), 800); return () => clearTimeout(t); }, []);
  const goApp = () => router.push('/login');
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="bg-[#F7F4EE] text-[#0B1D3A] overflow-x-hidden" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Serif+Display&display=swap');
        .lp-serif{font-family:'DM Serif Display',serif}
        .lp-reveal{opacity:0;transform:translateY(30px);transition:opacity .7s ease-out,transform .7s ease-out}
        .lp-visible{opacity:1;transform:translateY(0)}
        @keyframes lp-pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes lp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .lp-float{animation:lp-float 3s ease-in-out infinite}
        .lp-float2{animation:lp-float 3s ease-in-out infinite 1.5s}
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#F7F4EE]/85 border-b border-[#0B1D3A]/5">
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between h-[68px]">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-[38px] h-[38px] bg-[#0B1D3A] rounded-[10px] flex items-center justify-center text-[#D4A843] font-bold lp-serif">C</div>
            <span className="lp-serif text-2xl">CortIA</span>
          </div>
          <ul className="hidden md:flex gap-8 text-sm font-medium text-[#5A6B80]">
            <li><button onClick={() => scrollTo('features')} className="hover:text-[#0B1D3A] transition-colors">Fonctionnalités</button></li>
            <li><button onClick={() => scrollTo('how')} className="hover:text-[#0B1D3A] transition-colors">Comment ça marche</button></li>
            <li><button onClick={() => scrollTo('pricing')} className="hover:text-[#0B1D3A] transition-colors">Tarifs</button></li>
          </ul>
          <button onClick={goApp} className="bg-[#0B1D3A] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#122A52] transition-all">{"Accéder à l'app"}</button>
        </div>
      </nav>

      <section className="pt-[140px] pb-20 relative overflow-hidden">
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(212,168,67,0.15)_0%,transparent_70%)] pointer-events-none" />
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.15)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-6 border border-[rgba(212,168,67,0.2)]">
              <span className="w-1.5 h-1.5 bg-[#D4A843] rounded-full" style={{ animation: 'lp-pulse 2s infinite' }} />
              {"Nouveau — IA pour courtiers IOBSP"}
            </div>
            <h1 className="lp-serif text-[42px] md:text-[52px] leading-[1.1] tracking-tight mb-5">
              {"Analysez vos dossiers "}<span className="text-[#D4A843]">3x plus vite</span>{" avec l'IA"}
            </h1>
            <p className="text-lg text-[#5A6B80] leading-relaxed mb-9 max-w-[480px]">{"CortIA score vos dossiers, détecte les risques et recommande les meilleures banques."}</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={goApp} className="bg-[#0B1D3A] text-white px-8 py-4 rounded-[10px] text-[15px] font-semibold hover:bg-[#122A52] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(11,29,58,0.2)]">{"Démarrer gratuitement →"}</button>
              <button onClick={() => scrollTo('how')} className="bg-transparent text-[#0B1D3A] px-8 py-4 rounded-[10px] text-[15px] font-semibold border-[1.5px] border-[rgba(11,29,58,0.15)] hover:border-[#0B1D3A] transition-all hover:-translate-y-0.5">{"Voir la démo"}</button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="lp-float absolute -top-2.5 -right-5 bg-white px-4 py-2.5 rounded-[10px] shadow-[0_8px_32px_rgba(11,29,58,0.1)] text-[13px] font-semibold flex items-center gap-2 z-10"><span className="text-[#1D9E75]">✓</span> Score 87/100</div>
            <div className="bg-white rounded-[20px] p-7 shadow-[0_24px_80px_rgba(11,29,58,0.08)] border border-[rgba(11,29,58,0.04)]">
              <div className="flex items-center justify-between mb-5"><span className="font-semibold text-sm">Dossier #2024-0847</span><span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(29,158,117,0.1)] text-[#1D9E75]">{"Éligible"}</span></div>
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-[#F7F4EE] rounded-[10px] p-3.5"><div className="text-[11px] text-[#8A97A8] uppercase tracking-wider mb-1">Score</div><div className="text-[22px] font-bold text-[#1D9E75]">87/100</div></div>
                <div className="bg-[#F7F4EE] rounded-[10px] p-3.5"><div className="text-[11px] text-[#8A97A8] uppercase tracking-wider mb-1">Endettement</div><div className="text-[22px] font-bold text-[#D4A843]">31,2%</div></div>
                <div className="bg-[#F7F4EE] rounded-[10px] p-3.5"><div className="text-[11px] text-[#8A97A8] uppercase tracking-wider mb-1">Montant</div><div className="text-[22px] font-bold text-[#378ADD]">{"285 000 €"}</div></div>
              </div>
              <div><p className="text-xs text-[#5A6B80] font-medium mb-2">{"Probabilité d'acceptation"}</p><div className="h-2 bg-[rgba(11,29,58,0.06)] rounded-full overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-[#1D9E75] to-[#2CC98F] transition-all duration-[2s] ease-out" style={{ width: `${barWidth}%` }} /></div></div>
              <div className="mt-4"><p className="text-xs text-[#5A6B80] font-medium mb-2">{"Banques recommandées"}</p><div className="flex flex-wrap gap-2"><span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[rgba(212,168,67,0.15)] border border-[rgba(212,168,67,0.2)] text-[#D4A843]">{"Crédit Agricole ★"}</span><span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F4EE] border border-[rgba(11,29,58,0.06)]">BNP</span><span className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#F7F4EE] border border-[rgba(11,29,58,0.06)]">CIC</span></div></div>
            </div>
            <div className="lp-float2 absolute bottom-7 -left-7 bg-white px-4 py-2.5 rounded-[10px] shadow-[0_8px_32px_rgba(11,29,58,0.1)] text-[13px] font-semibold flex items-center gap-2 z-10"><span className="text-[#D4A843]">⚡</span> 2 min</div>
          </div>
        </div>
      </section>

      <Reveal><section className="py-16 border-t border-[#0B1D3A]/5"><div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">{[['3x','Plus rapide'],['87%','Prédiction'],['2 min','Par dossier'],['35k+','Courtiers IOBSP']].map(([v,l])=>(<div key={v as string}><div className="lp-serif text-4xl text-[#0B1D3A]">{v}</div><div className="text-sm text-[#5A6B80] mt-1">{l}</div></div>))}</div></section></Reveal>

      <section id="features" className="py-24"><div className="max-w-[1200px] mx-auto px-6">
        <Reveal><div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.15)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4 border border-[rgba(212,168,67,0.15)]">{"Fonctionnalités"}</div>
          <h2 className="lp-serif text-[32px] md:text-[40px] leading-tight mb-4 max-w-[600px]">{"Tout ce dont un courtier a besoin, augmenté par l'IA"}</h2>
          <p className="text-[17px] text-[#5A6B80] leading-relaxed max-w-[520px] mb-16">{"CortIA centralise et automatise votre métier."}</p></Reveal>
        <div className="grid md:grid-cols-3 gap-5">{features.map((f,i)=>(<Reveal key={i} style={{transitionDelay:`${i*100}ms`}}><div className="bg-white rounded-[20px] p-8 border border-[rgba(11,29,58,0.04)] hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(11,29,58,0.06)] transition-all"><div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 text-xl ${f.cls}`}>{f.icon}</div><h3 className="text-[17px] font-semibold mb-2.5">{f.title}</h3><p className="text-sm text-[#5A6B80] leading-relaxed">{f.desc}</p></div></Reveal>))}</div>
      </div></section>

      <section id="how" className="py-24 bg-[#0B1D3A] text-white relative overflow-hidden">
        <div className="absolute -bottom-[100px] -left-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(212,168,67,0.08)_0%,transparent_70%)]" />
        <div className="max-w-[1200px] mx-auto px-6">
          <Reveal><div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.1)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4 border border-[rgba(212,168,67,0.15)]">{"Comment ça marche"}</div>
            <h2 className="lp-serif text-[32px] md:text-[40px] leading-tight mb-4 max-w-[600px]">{"3 étapes simples"}</h2>
            <p className="text-[17px] text-white/60 leading-relaxed max-w-[520px] mb-16">Concentrez-vous sur le conseil client.</p></Reveal>
          <div className="grid md:grid-cols-3 gap-8 mt-16">{[['01','Créez le dossier',"Saisissez les infos ou uploadez les pièces. L'OCR extrait tout."],['02',"L'IA analyse","Score, vigilance, capacité d'emprunt en 2 min."],['03','Soumettez',"Banques classées par probabilité d'acceptation."]].map(([n,t,d],i)=>(<Reveal key={n as string} style={{transitionDelay:`${i*150}ms`}}><div className="p-8 rounded-[20px] bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-all"><div className="lp-serif text-5xl text-[#D4A843] opacity-30 mb-4">{n}</div><h3 className="text-lg font-semibold mb-2.5">{t}</h3><p className="text-sm text-white/60 leading-relaxed">{d}</p></div></Reveal>))}</div>
        </div>
      </section>

      <section className="py-24"><div className="max-w-[1200px] mx-auto px-6">
        <Reveal><div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.15)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4 border border-[rgba(212,168,67,0.15)]">{"Témoignages"}</div>
          <h2 className="lp-serif text-[32px] md:text-[40px] leading-tight mb-4">{"Ils ont adopté CortIA"}</h2></Reveal>
        <div className="grid md:grid-cols-3 gap-5 mt-16">{testimonials.map((t,i)=>(<Reveal key={i} style={{transitionDelay:`${i*100}ms`}}><div className="bg-white rounded-[20px] p-7 border border-[rgba(11,29,58,0.04)]"><div className="text-[#D4A843] text-sm tracking-widest mb-3">{"★★★★★"}</div><p className="text-[15px] leading-[1.7] mb-5 italic">{`"${t.text}"`}</p><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-[#0B1D3A] flex items-center justify-center text-[#D4A843] font-bold text-sm">{t.initials}</div><div><div className="font-semibold text-sm">{t.name}</div><div className="text-xs text-[#8A97A8]">{t.role}</div></div></div></div></Reveal>))}</div>
      </div></section>

      <section id="pricing" className="py-24 bg-[#F7F4EE]"><div className="max-w-[1200px] mx-auto px-6">
        <Reveal><div className="text-center"><div className="inline-flex items-center gap-2 bg-[rgba(212,168,67,0.15)] text-[#D4A843] px-4 py-1.5 rounded-full text-[13px] font-semibold mb-4 border border-[rgba(212,168,67,0.15)]">Tarifs</div><h2 className="lp-serif text-[32px] md:text-[40px] leading-tight mb-4">Simple et transparent</h2><p className="text-[17px] text-[#5A6B80] max-w-[520px] mx-auto mb-16">Commencez gratuitement.</p></div></Reveal>
        <div className="grid md:grid-cols-3 gap-5 mt-16">{pricing.map((p,i)=>(<Reveal key={i} style={{transitionDelay:`${i*100}ms`}}><div className={`bg-white rounded-[20px] p-8 relative ${p.featured?'border-2 border-[#D4A843] shadow-[0_16px_48px_rgba(212,168,67,0.12)]':'border border-[rgba(11,29,58,0.04)]'}`}>{p.featured&&<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4A843] text-white px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">Le plus populaire</div>}<div className="text-sm text-[#5A6B80] font-semibold uppercase tracking-wider">{p.name}</div><div className="lp-serif text-5xl my-3">{p.price}</div><div className="text-[13px] text-[#8A97A8]">{p.period}</div><p className="text-sm text-[#5A6B80] my-4">{p.desc}</p><ul className="mb-7">{p.feats.map((f,fi)=>(<li key={fi} className="py-2 text-sm text-[#5A6B80] flex items-center gap-2.5 border-b border-[rgba(11,29,58,0.04)]"><span className="w-4 h-4 rounded-full bg-[rgba(29,158,117,0.1)] flex-shrink-0 text-[10px] flex items-center justify-center text-[#1D9E75]">✓</span>{f}</li>))}</ul><button onClick={goApp} className={`w-full py-4 rounded-[10px] text-[15px] font-semibold transition-all hover:-translate-y-0.5 ${p.primary?'bg-[#0B1D3A] text-white hover:bg-[#122A52]':'bg-transparent text-[#0B1D3A] border-[1.5px] border-[rgba(11,29,58,0.15)] hover:border-[#0B1D3A]'}`}>{p.cta}</button></div></Reveal>))}</div>
      </div></section>

      <Reveal><section className="py-24"><div className="max-w-[1200px] mx-auto px-6"><div className="bg-[#0B1D3A] rounded-3xl py-20 px-8 md:px-16 text-center relative overflow-hidden"><div className="absolute -top-[100px] -right-[100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(212,168,67,0.1)_0%,transparent_70%)]" /><h2 className="lp-serif text-[28px] md:text-[40px] text-white mb-4 relative">{"Prêt à transformer votre courtage ?"}</h2><p className="text-[17px] text-white/60 mb-10 max-w-[500px] mx-auto relative">{"Rejoignez les courtiers qui convertissent plus."}</p><button onClick={goApp} className="bg-[#D4A843] text-[#0B1D3A] px-10 py-[18px] rounded-[10px] text-base font-semibold hover:bg-[#E8C97A] transition-all hover:-translate-y-0.5 relative">{"Démarrer mon essai gratuit →"}</button></div></div></section></Reveal>

      <footer className="pt-16 pb-10 border-t border-[#0B1D3A]/5"><div className="max-w-[1200px] mx-auto px-6"><div className="grid md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-10"><div><div className="lp-serif text-xl flex items-center gap-2 mb-3"><div className="w-7 h-7 bg-[#0B1D3A] rounded-[7px] flex items-center justify-center text-[#D4A843] font-bold text-xs lp-serif">C</div>CortIA</div><p className="text-sm text-[#5A6B80] leading-relaxed max-w-[300px]">{"L'assistant IA du courtier en crédit immobilier."}</p></div><div><h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#8A97A8] mb-4">Produit</h4><ul className="space-y-2.5 text-sm text-[#5A6B80]"><li><button onClick={()=>scrollTo('features')}>{"Fonctionnalités"}</button></li><li><button onClick={()=>scrollTo('pricing')}>Tarifs</button></li></ul></div><div><h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#8A97A8] mb-4">Ressources</h4><ul className="space-y-2.5 text-sm text-[#5A6B80]"><li><span className="opacity-50">Blog</span></li><li><span className="opacity-50">API</span></li></ul></div><div><h4 className="text-[13px] font-semibold uppercase tracking-wider text-[#8A97A8] mb-4">Entreprise</h4><ul className="space-y-2.5 text-sm text-[#5A6B80]"><li><span className="opacity-50">Contact</span></li><li><span className="opacity-50">CGU</span></li></ul></div></div><div className="border-t border-[#0B1D3A]/5 pt-6 flex flex-col md:flex-row justify-between text-[13px] text-[#8A97A8]"><span>{"© 2026 CortIA"}</span><span>{"Hébergé en France — RGPD"}</span></div></div></footer>
    </div>
  );
}
