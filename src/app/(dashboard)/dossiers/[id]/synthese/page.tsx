'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Dossier {
  id: string
  reference?: string
  nom_client?: string
  statut: string
  score_global?: number
  montant_projet?: number
  apport_personnel?: number
  duree_souhaitee?: number
  type_projet?: string
  taux_endettement?: number
  reste_a_vivre?: number
  mensualite_estimee?: number
  created_at?: string
  notes?: string
}

interface Emprunteur {
  id: string
  prenom?: string
  nom?: string
  date_naissance?: string
  situation_pro?: string
  situation_familiale?: string
  revenus_nets_mensuels?: number
  revenus_bruts_mensuels?: number
  charges_mensuelles?: number
  anciennete_emploi?: number
  nom_employeur?: string
}

function formatCurrency(amount?: number): string {
  if (!amount) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function getScoreColor(score?: number): string {
  if (!score) return '#64748b'
  if (score >= 75) return '#16a34a'
  if (score >= 55) return '#0ea5e9'
  if (score >= 40) return '#ca8a04'
  return '#dc2626'
}

function getReadinessConfig(score?: number): { label: string; color: string; bg: string; border: string; icon: string; desc: string } {
  if (!score || score === 0) return { label: 'Non évalué', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: '—', desc: 'Complétez le dossier pour obtenir une évaluation.' }
  if (score >= 70) return { label: 'Prêt banque', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '\u2705', desc: 'Dossier solide, présentable aux établissements bancaires.' }
  if (score >= 55) return { label: 'Presque prêt', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', icon: '\u26A1', desc: 'Quelques points à consolider avant soumission.' }
  if (score >= 40) return { label: 'À renforcer', color: '#ca8a04', bg: '#fefce8', border: '#fde68a', icon: '\u{1F6E0}', desc: 'Corrections nécessaires pour améliorer la bancabilité.' }
  return { label: 'Déconseillé', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '\u26A0', desc: 'Soumission bancaire déconseillée en l’état.' }
}

function getSituationProLabel(sp?: string): string {
  const m: Record<string, string> = { cdi: 'CDI', cdd: 'CDD', fonctionnaire: 'Fonctionnaire', independant: 'Indépendant / Chef d’entreprise', retraite: 'Retraité', intermittent: 'Intermittent' }
  return m[sp || ''] || sp || '—'
}

export default function SyntheseBanquePage() {
  const params = useParams()
  const dossierId = params.id as string
  const supabase = createClient()
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [emprunteurs, setEmprunteurs] = useState<Emprunteur[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [markedReady, setMarkedReady] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: d } = await supabase.from('dossiers').select('*').eq('id', dossierId).single()
        if (d) setDossier(d)
        const { data: e } = await supabase.from('emprunteurs').select('*').eq('dossier_id', dossierId)
        setEmprunteurs(e || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [dossierId, supabase])

  if (loading) return (
    <div className="loading-container" style={{ paddingTop: '80px' }}>
      <div className="loading-spinner" />
      <p>Génération de la synthèse banque...</p>
    </div>
  )

  if (!dossier) return (
    <div className="empty-state" style={{ paddingTop: '80px' }}>
      <div className="empty-state-icon">\u{1F4C2}</div>
      <div className="empty-state-title">Dossier introuvable</div>
    </div>
  )

  const score = dossier.score_global || 0
  const rc = getReadinessConfig(score)
  const totalRevenus = emprunteurs.reduce((s, e) => s + (e.revenus_nets_mensuels || 0), 0)
  const totalCharges = emprunteurs.reduce((s, e) => s + (e.charges_mensuelles || 0), 0)
  const tauxEndettement = dossier.taux_endettement || (totalRevenus > 0 ? Math.round((totalCharges / totalRevenus) * 100) : 0)
  const resteVivre = dossier.reste_a_vivre || (totalRevenus - totalCharges - (dossier.mensualite_estimee || 0))
  const montantEmprunter = (dossier.montant_projet || 0) - (dossier.apport_personnel || 0)
  const tauxApport = dossier.montant_projet ? Math.round(((dossier.apport_personnel || 0) / dossier.montant_projet) * 100) : 0

  const atouts: string[] = []
  const points_a_expliquer: string[] = []

  emprunteurs.forEach(e => {
    if (e.situation_pro === 'cdi') atouts.push(`Emploi CDI stable (${e.prenom || 'emprunteur'})`)
    if (e.situation_pro === 'fonctionnaire') atouts.push('Statut fonctionnaire — sécurité maximale')
    if ((e.anciennete_emploi || 0) > 36) atouts.push(`Ancienneté employé : ${Math.round((e.anciennete_emploi || 0) / 12)} ans`)
    if (e.situation_pro === 'independant') points_a_expliquer.push(`Revenus indépendants (${e.prenom}) — justifier la stabilité sur 3 ans`)
    if (e.situation_pro === 'cdd') points_a_expliquer.push(`Contrat CDD (${e.prenom}) — préciser la durée et les perspectives`)
  })

  if (tauxApport >= 15) atouts.push(`Apport personnel significatif : ${tauxApport}% du prix`)
  else if (tauxApport > 0) points_a_expliquer.push(`Apport limité (${tauxApport}%) — expliquer la constitution`)

  if (tauxEndettement <= 30) atouts.push(`Taux d’endettement maîtrisé : ${tauxEndettement}%`)
  else if (tauxEndettement > 35) points_a_expliquer.push(`Taux d’endettement élevé (${tauxEndettement}%) — argumenter la capacité de remboursement`)

  if (resteVivre >= 2000) atouts.push(`Reste à vivre confortable : ${formatCurrency(resteVivre)}/mois`)
  else if (resteVivre > 0 && resteVivre < 1200) points_a_expliquer.push(`Reste à vivre tendu (${formatCurrency(resteVivre)}) — détailler le budget`)

  if (totalCharges === 0) atouts.push('Aucune charge existante détectée')
  if (score >= 75) atouts.push('Score de financiabilité excellent')

  const emprunteursNoms = emprunteurs.map(e => [e.prenom, e.nom].filter(Boolean).join(' ')).join(' et ') || 'Client'
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const noteText = `SYNTHESE DE DOSSIER — COURTIER CORTIA
Date : ${today}
Dossier : ${dossier.reference || dossierId.slice(0,8).toUpperCase()}

=============================================
EMPRUNTEUR(S) : ${emprunteursNoms.toUpperCase()}
=============================================

PROFIL PROFESSIONNEL
${emprunteurs.map(e => `- ${[e.prenom, e.nom].filter(Boolean).join(' ') || 'Emprunteur'} : ${getSituationProLabel(e.situation_pro)}${e.nom_employeur ? ' chez ' + e.nom_employeur : ''}${e.anciennete_emploi ? ' (${Math.round(e.anciennete_emploi / 12)} ans d’ancienneté)' : ''}`).join('\n')}

SITUATION FINANCIERE
- Revenus nets mensuels : ${formatCurrency(totalRevenus)}
- Charges mensuelles actuelles : ${formatCurrency(totalCharges)}
- Taux d’endettement actuel : ${tauxEndettement}%
- Reste à vivre estimé : ${formatCurrency(resteVivre)}/mois

PROJET IMMOBILIER
- Type : ${dossier.type_projet || 'à préciser'}
- Prix d’acquisition : ${formatCurrency(dossier.montant_projet)}
- Apport personnel : ${formatCurrency(dossier.apport_personnel)} (${tauxApport}%)
- Besoin de financement : ${formatCurrency(montantEmprunter)}
- Mensualité estimée : ${formatCurrency(dossier.mensualite_estimee)}
- Durée souhaitée : ${dossier.duree_souhaitee ? dossier.duree_souhaitee + ' mois' : 'à préciser'}

EVALUATION DU DOSSIER
- Score de financiabilité CortIA : ${score}/100
- Statut : ${rc.label}

ATOUTS DU DOSSIER
${atouts.map(a => '+ ' + a).join('\n')}

POINTS A DOCUMENTER
${points_a_expliquer.length > 0 ? points_a_expliquer.map(p => '- ' + p).join('\n') : '- Aucun point particulier'}

---
Document généré par CortIA — à valider par le courtier
`

  const handleCopy = () => {
    navigator.clipboard.writeText(noteText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleMarkReady = async () => {
    try {
      await supabase.from('dossiers').update({ statut: 'accorde' }).eq('id', dossierId)
      setMarkedReady(true)
      setDossier(prev => prev ? { ...prev, statut: 'accorde' } : prev)
    } catch {}
  }

  return (
    <div style={{ padding: '28px 32px 64px', maxWidth: '860px' }}>

      {/* Header synthese */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
          Synthèse Banque — CortIA
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Présentation bancaire
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>
          Dossier préparé par votre assistant courtier — {today}
        </p>
      </div>

      {/* Score / Readiness banner */}
      <div style={{ background: rc.bg, border: `1.5px solid ${rc.border}`, borderRadius: '14px', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: rc.color + '20', border: `1.5px solid ${rc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            {rc.icon}
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '2px' }}>Statut bancaire</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: rc.color, letterSpacing: '-0.5px' }}>{rc.label}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{rc.desc}</div>
          </div>
        </div>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: '42px', fontWeight: 900, color: getScoreColor(score), letterSpacing: '-2px', lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>/100</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Score CortIA</div>
        </div>
      </div>

      {/* Actions en haut */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button onClick={handleCopy} className="btn-primary" style={{ gap: '8px' }}>
          {copied ? '\u2713 Copié !' : '\u{1F4CB} Copier la note'}
        </button>
        {!markedReady && dossier.statut !== 'accorde' && (
          <button onClick={handleMarkReady} className="btn-secondary" style={{ gap: '8px', borderColor: '#16a34a', color: '#16a34a' }}>
            \u2713 Marquer Prêt Banque
          </button>
        )}
        {(markedReady || dossier.statut === 'accorde') && (
          <span className="badge badge-success" style={{ fontSize: '12px', padding: '8px 14px' }}>\u2713 Dossier Prêt Banque</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

        {/* Profil emprunteur(s) */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">\u{1F464} Profil emprunteur</h2>
          </div>
          {emprunteurs.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucun emprunteur renseigné.</div>
          ) : (
            emprunteurs.map(e => (
              <div key={e.id} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {[e.prenom, e.nom].filter(Boolean).join(' ') || 'Emprunteur'}
                  {emprunteurs.length > 1 && <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>({e.id === emprunteurs[0].id ? 'principal' : 'co-emprunteur'})</span>}
                </div>
                {[
                  { label: 'Situation pro', value: getSituationProLabel(e.situation_pro) },
                  { label: 'Employeur', value: e.nom_employeur },
                  { label: 'Ancienneté', value: e.anciennete_emploi ? Math.round(e.anciennete_emploi / 12) + ' ans' : undefined },
                  { label: 'Situation familiale', value: e.situation_familiale },
                  { label: 'Revenus nets/mois', value: formatCurrency(e.revenus_nets_mensuels) },
                ].filter(r => r.value).map((row, i) => (
                  <div key={i} className="stat-row">
                    <span className="stat-label">{row.label}</span>
                    <span className="stat-value">{row.value}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Situation financiere */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">\u{1F4CA} Situation financière</h2>
          </div>
          {[
            { label: 'Revenus nets/mois', value: formatCurrency(totalRevenus), color: '#16a34a', bold: true },
            { label: 'Charges actuelles/mois', value: formatCurrency(totalCharges), color: 'var(--text-primary)' },
            { label: "Taux d'endettement", value: tauxEndettement > 0 ? tauxEndettement + '%' : '—', color: tauxEndettement > 35 ? '#dc2626' : tauxEndettement > 30 ? '#ca8a04' : '#16a34a', bold: true },
            { label: 'Reste à vivre', value: formatCurrency(resteVivre), color: resteVivre < 1200 ? '#ca8a04' : 'var(--text-primary)' },
            { label: 'Apport personnel', value: formatCurrency(dossier.apport_personnel), color: '#1e40af', bold: true },
            { label: 'Mensualité estimée', value: formatCurrency(dossier.mensualite_estimee), color: 'var(--text-primary)' },
          ].map((row, i) => (
            <div key={i} className="stat-row">
              <span className="stat-label">{row.label}</span>
              <span className="stat-value" style={{ color: row.color, fontWeight: row.bold ? 700 : 600 }}>{row.value}</span>
            </div>
          ))}
        </div>

      </div>

      {/* Projet immobilier */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header">
          <h2 className="card-title">\u{1F3E0} Présentation du projet</h2>
          <span className="badge badge-brand" style={{ fontSize: '10px' }}>{dossier.type_projet || 'Acquisition'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Prix du bien', value: formatCurrency(dossier.montant_projet), big: true, color: '#1e40af' },
            { label: 'Apport', value: formatCurrency(dossier.apport_personnel), big: false, color: '#16a34a' },
            { label: 'Besoin financement', value: formatCurrency(montantEmprunter), big: true, color: '#7c3aed' },
            { label: 'Mensualité estimée', value: formatCurrency(dossier.mensualite_estimee), big: false, color: 'var(--text-primary)' },
            { label: 'Durée', value: dossier.duree_souhaitee ? Math.round(dossier.duree_souhaitee / 12) + ' ans' : '—', big: false, color: 'var(--text-primary)' },
            { label: 'Taux apport', value: tauxApport > 0 ? tauxApport + '%' : '—', big: false, color: tauxApport >= 15 ? '#16a34a' : '#ca8a04' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'var(--surface-1)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: item.big ? '18px' : '15px', fontWeight: 800, color: item.color, letterSpacing: '-0.3px' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Atouts + Points a expliquer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">\u{1F4AA} Atouts bancaires</h2>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>{atouts.length}</span>
          </div>
          {atouts.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Complétez le dossier pour identifier les atouts.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {atouts.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <span style={{ color: '#16a34a', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>\u2713</span>
                  <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: 500, lineHeight: '1.4' }}>{a}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">\u{1F4AC} Points à anticiper</h2>
            <span className={`badge ${points_a_expliquer.length > 0 ? 'badge-orange' : 'badge-success'}`} style={{ fontSize: '10px' }}>{points_a_expliquer.length}</span>
          </div>
          {points_a_expliquer.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 500 }}>\u2713 Aucun point particulier à documenter.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {points_a_expliquer.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px', background: 'var(--risk-high-bg)', borderRadius: '8px', border: '1px solid var(--risk-high-border)' }}>
                  <span style={{ color: '#ea580c', fontSize: '13px', flexShrink: 0, marginTop: '1px' }}>\u2192</span>
                  <span style={{ fontSize: '12.5px', color: '#7c2d12', fontWeight: 500, lineHeight: '1.4' }}>{p}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note bancaire */}
      <div className="card" style={{ background: '#0f172a', border: '1px solid #1e293b' }}>
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <h2 className="card-title" style={{ color: 'white' }}>
            <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', width: '22px', height: '22px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>\u{1F4CB}</span>
            Note bancaire générée
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
              {copied ? '\u2713 Copié' : '\u{1F4CB} Copier'}
            </button>
          </div>
        </div>
        <pre style={{ fontSize: '12px', lineHeight: '1.7', color: '#e2e8f0', fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {noteText}
        </pre>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center', fontStyle: 'italic' }}>
        Synthèse générée par CortIA — Document préparatoire. À valider par le courtier avant envoi.
      </p>

    </div>
  )
}
