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
  taux_endettement?: number
  reste_a_vivre?: number
  apport?: number
  saut_de_charge?: number
  type_projet?: string
  notes?: string
}

interface Document {
  id: string
  nom: string
  statut: string
}

function formatCurrency(amount?: number): string {
  if (!amount) return '-'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount)
}

function getScoreLabel(score?: number): string {
  if (!score) return 'Non evalue'
  if (score >= 75) return 'Excellent - Recommande'
  if (score >= 60) return 'Bon - Presentable'
  if (score >= 45) return 'Moyen - A renforcer'
  return 'Insuffisant'
}

function getBanqueReadyStatus(score?: number): { label: string; color: string; bg: string } {
  if (!score || score < 45) return { label: 'Non', color: '#dc2626', bg: '#fef2f2' }
  if (score < 65) return { label: 'Presque', color: '#ca8a04', bg: '#fefce8' }
  return { label: 'Oui', color: '#16a34a', bg: '#f0fdf4' }
}

export default function SyntheseBanquePage() {
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const [dossier, setDossier] = useState<Dossier | null>(null)
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const { data: d } = await supabase.from('dossiers').select('*').eq('id', id).single()
        setDossier(d)
        const { data: docData } = await supabase.from('documents').select('id, nom, statut').eq('dossier_id', id)
        setDocs(docData || [])
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Chargement de la synthese...</p>
      </div>
    )
  }

  if (!dossier) {
    return (
      <div className="empty-state">
        <div className="empty-state-title">Dossier introuvable</div>
      </div>
    )
  }

  const score = dossier.score_global || 0
  const banqueReady = getBanqueReadyStatus(score)
  const docsValides = docs.filter(d => d.statut === 'valide').length
  const docsTotal = docs.length

  const atouts: string[] = []
  const pointsExpliquer: string[] = []

  if ((dossier.taux_endettement || 0) > 0 && (dossier.taux_endettement || 0) <= 33) atouts.push('Taux d endettement maitrise : ' + dossier.taux_endettement + '% (norme bancaire < 35%)')
  if ((dossier.taux_endettement || 0) > 33) pointsExpliquer.push('Taux d endettement a ' + dossier.taux_endettement + '% : justifier la capacite de remboursement')
  if ((dossier.reste_a_vivre || 0) > 1500) atouts.push('Reste a vivre confortable : ' + formatCurrency(dossier.reste_a_vivre) + ' par mois')
  if ((dossier.reste_a_vivre || 0) > 0 && (dossier.reste_a_vivre || 0) < 800) pointsExpliquer.push('Reste a vivre limite : ' + formatCurrency(dossier.reste_a_vivre) + ' - prevoir justificatifs de charges')
  if ((dossier.apport || 0) > 0) atouts.push('Apport personnel : ' + formatCurrency(dossier.apport))
  if (docsValides === docsTotal && docsTotal > 0) atouts.push('Dossier documentaire complet (' + docsTotal + ' pieces validees)')
  if (docsValides < docsTotal && docsTotal > 0) pointsExpliquer.push((docsTotal - docsValides) + ' document(s) manquant(s) a completer')
  if ((dossier.saut_de_charge || 0) > 500) pointsExpliquer.push('Saut de charge de ' + formatCurrency(dossier.saut_de_charge) + ' - a anticiper et argumenter')
  if (score >= 70) atouts.push('Score de financiabilite solide : ' + score + '/100')

  const noteBancaire = 'PRESENTATION DOSSIER - ' + (dossier.nom_client || 'Emprunteur') + '
' +
    '='.repeat(60) + '

' +
    'EMPRUNTEUR : ' + (dossier.nom_client || 'Non renseigne') + '
' +
    (dossier.reference ? 'REFERENCE : ' + dossier.reference + '
' : '') +
    '
' +
    'PROJET IMMOBILIER
' +
    '-'.repeat(40) + '
' +
    'Type de projet : ' + (dossier.type_projet || 'Acquisition immobiliere') + '
' +
    'Montant du projet : ' + formatCurrency(dossier.montant_projet) + '
' +
    (dossier.apport ? 'Apport personnel : ' + formatCurrency(dossier.apport) + '
' : '') +
    '
' +
    'SITUATION FINANCIERE
' +
    '-'.repeat(40) + '
' +
    (dossier.taux_endettement ? 'Taux d endettement : ' + dossier.taux_endettement + '%
' : '') +
    (dossier.reste_a_vivre ? 'Reste a vivre mensuel : ' + formatCurrency(dossier.reste_a_vivre) + '
' : '') +
    '
' +
    'EVALUATION
' +
    '-'.repeat(40) + '
' +
    'Score de financiabilite : ' + (score > 0 ? score + '/100' : 'Non evalue') + '
' +
    'Appreciation : ' + getScoreLabel(score) + '
' +
    'Statut banque-ready : ' + banqueReady.label + '
' +
    '
' +
    'ATOUTS DU DOSSIER
' +
    '-'.repeat(40) + '
' +
    (atouts.length > 0 ? atouts.map(a => '+ ' + a).join('
') : 'A completer apres analyse') + '
' +
    '
' +
    (pointsExpliquer.length > 0 ? 'POINTS A EXPLIQUER
' + '-'.repeat(40) + '
' + pointsExpliquer.map(p => '! ' + p).join('
') + '

' : '') +
    'Document genere par CortIA - ' + new Date().toLocaleDateString('fr-FR')

  const handleCopy = () => {
    navigator.clipboard.writeText(noteBancaire)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #1e3a5f, #1e40af)', color: 'white', padding: '28px 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'center', minWidth: '100px' }}>
              <div style={{ fontSize: '48px', fontWeight: 900, color: banqueReady.color === '#16a34a' ? '#86efac' : banqueReady.color === '#ca8a04' ? '#fde68a' : '#fca5a5', lineHeight: 1 }}>
                {score > 0 ? score : '-'}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>/100</div>
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px', color: 'white' }}>
                {dossier.nom_client || 'Dossier emprunteur'}
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                {dossier.reference ? 'Ref. ' + dossier.reference + ' - ' : ''}{dossier.type_projet || 'Acquisition immobiliere'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>Banque-ready :</span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: banqueReady.color === '#16a34a' ? '#86efac' : banqueReady.color === '#ca8a04' ? '#fde68a' : '#fca5a5' }}>
                  {banqueReady.label}
                </span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>{getScoreLabel(score)}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'white' }}>{formatCurrency(dossier.montant_projet)}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>Montant du projet</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={handleCopy} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            {copied ? 'Copie !' : 'Copier la note'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Profil emprunteur</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Nom', value: dossier.nom_client || '-' },
              { label: 'Reference', value: dossier.reference || '-' },
              { label: 'Type de projet', value: dossier.type_projet || 'Acquisition immobiliere' },
              { label: 'Documents', value: docsTotal > 0 ? docsValides + '/' + docsTotal + ' valides' : 'Aucun' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '16px' }}>Situation financiere</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Montant projet', value: formatCurrency(dossier.montant_projet) },
              { label: 'Apport', value: formatCurrency(dossier.apport) },
              { label: 'Taux endettement', value: dossier.taux_endettement ? dossier.taux_endettement + '%' : '-', alert: (dossier.taux_endettement || 0) > 33 },
              { label: 'Reste a vivre', value: formatCurrency(dossier.reste_a_vivre), alert: (dossier.reste_a_vivre || 0) > 0 && (dossier.reste_a_vivre || 0) < 800 },
              { label: 'Saut de charge', value: formatCurrency(dossier.saut_de_charge), alert: (dossier.saut_de_charge || 0) > 500 },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: (item as any).alert ? '#ca8a04' : 'var(--text-primary)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '12px', color: '#16a34a' }}>Atouts bancaires</h2>
          {atouts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>A identifier apres analyse complete</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {atouts.map((a, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#16a34a', display: 'flex', gap: '8px', padding: '8px', background: '#f0fdf4', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                  <span style={{ fontWeight: 800, flexShrink: 0 }}>+</span>{a}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h2 className="card-title" style={{ marginBottom: '12px', color: '#ca8a04' }}>Points a expliquer</h2>
          {pointsExpliquer.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#16a34a' }}>Aucun point critique identifie</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pointsExpliquer.map((p, i) => (
                <li key={i} style={{ fontSize: '13px', color: '#92400e', display: 'flex', gap: '8px', padding: '8px', background: '#fefce8', borderRadius: '6px', border: '1px solid #fde68a' }}>
                  <span style={{ fontWeight: 800, flexShrink: 0 }}>!</span>{p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <h2 className="card-title">Note bancaire generee</h2>
          <button onClick={handleCopy} className="btn-ghost" style={{ fontSize: '12px' }}>
            {copied ? 'Copie !' : 'Copier'}
          </button>
        </div>
        <pre style={{
          background: '#0f172a',
          color: '#e2e8f0',
          padding: '24px',
          borderRadius: '10px',
          fontSize: '12.5px',
          lineHeight: '1.7',
          overflowX: 'auto',
          fontFamily: 'ui-monospace, monospace',
          whiteSpace: 'pre-wrap',
        }}>
          {noteBancaire}
        </pre>
      </div>
    </div>
  )
}
