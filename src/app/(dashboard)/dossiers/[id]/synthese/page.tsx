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
}

interface Emprunteur {
  id: string
  prenom?: string
  nom?: string
  date_naissance?: string
  situation_pro?: string
  situation_familiale?: string
  revenus_nets_mensuels?: number
  charges_mensuelles?: number
  anciennete_emploi?: number
  nom_employeur?: string
}

function formatCurrency(amount?: number): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function getScoreColor(score?: number): string {
  if (!score) return '#64748b'
  if (score >= 75) return '#16a34a'
  if (score >= 55) return '#0ea5e9'
  if (score >= 40) return '#ca8a04'
  return '#dc2626'
}

function getReadinessConfig(score?: number) {
  if (!score || score === 0) return { label: 'Non evalue', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: '-', desc: 'Completez le dossier pour obtenir une evaluation.' }
  if (score >= 70) return { label: 'Pret banque', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: 'OK', desc: 'Dossier solide, presentable aux etablissements bancaires.' }
  if (score >= 55) return { label: 'Presque pret', color: '#0ea5e9', bg: '#f0f9ff', border: '#bae6fd', icon: '!', desc: 'Quelques points a consolider avant soumission.' }
  if (score >= 40) return { label: 'A renforcer', color: '#ca8a04', bg: '#fefce8', border: '#fde68a', icon: '~', desc: 'Corrections necessaires pour ameliorer la bancabilite.' }
  return { label: 'Deconseille', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: 'X', desc: 'Soumission bancaire deconseilee en l etat.' }
}

function getSituationProLabel(sp?: string): string {
  const m: Record<string, string> = { cdi: 'CDI', cdd: 'CDD', fonctionnaire: 'Fonctionnaire', independant: 'Independant', retraite: 'Retraite', intermittent: 'Intermittent' }
  return m[sp || ''] || sp || '-'
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
      <p>Generation de la synthese banque...</p>
    </div>
  )

  if (!dossier) return (
    <div className="empty-state" style={{ paddingTop: '80px' }}>
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
  const pointsExpliquer: string[] = []

  emprunteurs.forEach(e => {
    if (e.situation_pro === 'cdi') atouts.push('Emploi CDI stable (' + (e.prenom || 'emprunteur') + ')')
    if (e.situation_pro === 'fonctionnaire') atouts.push('Statut fonctionnaire - securite maximale')
    if ((e.anciennete_emploi || 0) > 36) atouts.push('Anciennete : ' + Math.round((e.anciennete_emploi || 0) / 12) + ' ans')
    if (e.situation_pro === 'independant') pointsExpliquer.push('Revenus independants (' + (e.prenom || '') + ') - justifier la stabilite sur 3 ans')
    if (e.situation_pro === 'cdd') pointsExpliquer.push('Contrat CDD (' + (e.prenom || '') + ') - preciser la duree et les perspectives')
  })

  if (tauxApport >= 15) atouts.push('Apport personnel significatif : ' + tauxApport + '% du prix')
  else if (tauxApport > 0) pointsExpliquer.push('Apport limite (' + tauxApport + '%) - expliquer la constitution')

  if (tauxEndettement <= 30) atouts.push("Taux d'endettement maitrise : " + tauxEndettement + '%')
  else if (tauxEndettement > 35) pointsExpliquer.push("Taux d'endettement eleve (" + tauxEndettement + '%) - argumenter la capacite de remboursement')

  if (resteVivre >= 2000) atouts.push('Reste a vivre confortable : ' + formatCurrency(resteVivre) + '/mois')
  else if (resteVivre > 0 && resteVivre < 1200) pointsExpliquer.push('Reste a vivre tendu (' + formatCurrency(resteVivre) + ') - detailler le budget')

  if (totalCharges === 0) atouts.push('Aucune charge existante detectee')
  if (score >= 75) atouts.push('Score de financiabilite excellent')

  const emprunteursNoms = emprunteurs.map(e => [e.prenom, e.nom].filter(Boolean).join(' ')).join(' et ') || 'Client'
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const noteText = [
    'SYNTHESE DE DOSSIER - COURTIER CORTIA',
    'Date : ' + today,
    'Dossier : ' + (dossier.reference || dossierId.slice(0,8).toUpperCase()),
    '',
    '=============================================',
    'EMPRUNTEUR(S) : ' + emprunteursNoms.toUpperCase(),
    '=============================================',
    '',
    'PROFIL PROFESSIONNEL',
    ...emprunteurs.map(e => '- ' + ([e.prenom, e.nom].filter(Boolean).join(' ') || 'Emprunteur') + ' : ' + getSituationProLabel(e.situation_pro) + (e.nom_employeur ? ' chez ' + e.nom_employeur : '')),
    '',
    'SITUATION FINANCIERE',
    '- Revenus nets mensuels : ' + formatCurrency(totalRevenus),
    '- Charges mensuelles actuelles : ' + formatCurrency(totalCharges),
    "- Taux d'endettement actuel : " + tauxEndettement + '%',
    '- Reste a vivre estime : ' + formatCurrency(resteVivre) + '/mois',
    '',
    'PROJET IMMOBILIER',
    '- Type : ' + (dossier.type_projet || 'a preciser'),
    "- Prix d'acquisition : " + formatCurrency(dossier.montant_projet),
    '- Apport personnel : ' + formatCurrency(dossier.apport_personnel) + ' (' + tauxApport + '%)',
    '- Besoin de financement : ' + formatCurrency(montantEmprunter),
    '- Mensualite estimee : ' + formatCurrency(dossier.mensualite_estimee),
    '- Duree souhaitee : ' + (dossier.duree_souhaitee ? dossier.duree_souhaitee + ' mois' : 'a preciser'),
    '',
    'EVALUATION DU DOSSIER',
    '- Score de financiabilite CortIA : ' + score + '/100',
    '- Statut : ' + rc.label,
    '',
    'ATOUTS DU DOSSIER',
    ...atouts.map(a => '+ ' + a),
    '',
    'POINTS A DOCUMENTER',
    ...(pointsExpliquer.length > 0 ? pointsExpliquer.map(p => '- ' + p) : ['- Aucun point particulier']),
    '',
    '---',
    'Document genere par CortIA - a valider par le courtier',
  ].join('
')

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
    <div style={{ padding: '28px 0 64px', maxWidth: '860px' }}>

      {/* Header */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Synthese Banque - CortIA</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '4px' }}>Presentation bancaire</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-tertiary)' }}>Dossier prepare par votre assistant courtier - {today}</p>
      </div>

      {/* Score banner */}
      <div style={{ background: rc.bg, border: '1.5px solid ' + rc.border, borderRadius: '14px', padding: '20px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: rc.color + '20', border: '1.5px solid ' + rc.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: rc.color }}>
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

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button onClick={handleCopy} className="btn-primary">{copied ? 'Copie !' : 'Copier la note'}</button>
        {!markedReady && dossier.statut !== 'accorde' && (
          <button onClick={handleMarkReady} className="btn-secondary" style={{ borderColor: '#16a34a', color: '#16a34a' }}>Marquer Pret Banque</button>
        )}
        {(markedReady || dossier.statut === 'accorde') && (
          <span className="badge badge-success" style={{ fontSize: '12px', padding: '8px 14px' }}>Dossier Pret Banque</span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card">
          <div className="card-header"><h2 className="card-title">Profil emprunteur</h2></div>
          {emprunteurs.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Aucun emprunteur renseigne.</div>
          ) : emprunteurs.map(e => (
            <div key={e.id} style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>
                {[e.prenom, e.nom].filter(Boolean).join(' ') || 'Emprunteur'}
              </div>
              {[
                { label: 'Situation pro', value: getSituationProLabel(e.situation_pro) },
                { label: 'Employeur', value: e.nom_employeur },
                { label: 'Anciennete', value: e.anciennete_emploi ? Math.round(e.anciennete_emploi / 12) + ' ans' : undefined },
                { label: 'Revenus nets/mois', value: formatCurrency(e.revenus_nets_mensuels) },
              ].filter(r => r.value).map((row, i) => (
                <div key={i} className="stat-row">
                  <span className="stat-label">{row.label}</span>
                  <span className="stat-value">{row.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h2 className="card-title">Situation financiere</h2></div>
          {[
            { label: 'Revenus nets/mois', value: formatCurrency(totalRevenus), color: '#16a34a', bold: true },
            { label: 'Charges actuelles/mois', value: formatCurrency(totalCharges), color: 'var(--text-primary)' },
            { label: "Taux d'endettement", value: tauxEndettement > 0 ? tauxEndettement + '%' : '-', color: tauxEndettement > 35 ? '#dc2626' : tauxEndettement > 30 ? '#ca8a04' : '#16a34a', bold: true },
            { label: 'Reste a vivre', value: formatCurrency(resteVivre), color: resteVivre < 1200 ? '#ca8a04' : 'var(--text-primary)' },
            { label: 'Apport personnel', value: formatCurrency(dossier.apport_personnel), color: '#1e40af', bold: true },
            { label: 'Mensualite estimee', value: formatCurrency(dossier.mensualite_estimee), color: 'var(--text-primary)' },
          ].map((row, i) => (
            <div key={i} className="stat-row">
              <span className="stat-label">{row.label}</span>
              <span className="stat-value" style={{ color: row.color, fontWeight: row.bold ? 700 : 600 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Projet */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header">
          <h2 className="card-title">Presentation du projet</h2>
          <span className="badge badge-brand" style={{ fontSize: '10px' }}>{dossier.type_projet || 'Acquisition'}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Prix du bien', value: formatCurrency(dossier.montant_projet), color: '#1e40af' },
            { label: 'Apport', value: formatCurrency(dossier.apport_personnel), color: '#16a34a' },
            { label: 'Besoin financement', value: formatCurrency(montantEmprunter), color: '#7c3aed' },
            { label: 'Mensualite estimee', value: formatCurrency(dossier.mensualite_estimee), color: 'var(--text-primary)' },
            { label: 'Duree', value: dossier.duree_souhaitee ? Math.round(dossier.duree_souhaitee / 12) + ' ans' : '-', color: 'var(--text-primary)' },
            { label: 'Taux apport', value: tauxApport > 0 ? tauxApport + '%' : '-', color: tauxApport >= 15 ? '#16a34a' : '#ca8a04' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'var(--surface-1)', borderRadius: '10px', padding: '12px 14px', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{item.label}</div>
              <div style={{ fontSize: '17px', fontWeight: 800, color: item.color, letterSpacing: '-0.3px' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Atouts + Points a expliquer */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Atouts bancaires</h2>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>{atouts.length}</span>
          </div>
          {atouts.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>Completez le dossier pour identifier les atouts.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {atouts.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                  <span style={{ color: '#16a34a', fontSize: '13px', flexShrink: 0 }}>+</span>
                  <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: 500, lineHeight: '1.4' }}>{a}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Points a anticiper</h2>
            <span className={'badge ' + (pointsExpliquer.length > 0 ? 'badge-orange' : 'badge-success')} style={{ fontSize: '10px' }}>{pointsExpliquer.length}</span>
          </div>
          {pointsExpliquer.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#16a34a', fontWeight: 500 }}>Aucun point particulier a documenter.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pointsExpliquer.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px', background: 'var(--risk-high-bg)', borderRadius: '8px', border: '1px solid var(--risk-high-border)' }}>
                  <span style={{ color: '#ea580c', fontSize: '13px', flexShrink: 0 }}>-</span>
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
          <h2 className="card-title" style={{ color: 'white' }}>Note bancaire generee</h2>
          <button onClick={handleCopy} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500 }}>
            {copied ? 'Copie' : 'Copier'}
          </button>
        </div>
        <pre style={{ fontSize: '12px', lineHeight: '1.7', color: '#e2e8f0', fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {noteText}
        </pre>
      </div>

      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center', fontStyle: 'italic' }}>
        Synthese generee par CortIA - Document preparatoire. A valider par le courtier avant envoi.
      </p>
    </div>
  )
}
