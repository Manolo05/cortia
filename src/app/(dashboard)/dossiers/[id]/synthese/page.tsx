'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface DossierData {
  emprunteurs: any[]
  projet: any
  analyse: any
  charges: any[]
}

const SECTIONS_BANCAIRES = [
  { key: 'presentation_client', titre: '1. Presentation client' },
  { key: 'situation_pro', titre: '2. Situation professionnelle' },
  { key: 'situation_financiere', titre: '3. Situation financiere' },
  { key: 'presentation_projet', titre: '4. Presentation du projet' },
  { key: 'atouts', titre: '5. Atouts du dossier' },
  { key: 'points_vigilance', titre: '6. Points de vigilance' },
  { key: 'conclusion', titre: '7. Conclusion courtier' },
]

function formatMontant(n?: number) {
  if (!n) return '0 EUR'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

export default function SynthesePage() {
  const params = useParams()
  const dossierId = params.id as string

  const [dossierData, setDossierData] = useState<DossierData | null>(null)
  const [synthese, setSynthese] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedSynthese, setSavedSynthese] = useState<string | null>(null)

  useEffect(() => {
    loadDossierData()
  }, [dossierId])

  async function loadDossierData() {
    setLoading(true)
    try {
      const [empRes, projRes, analyseRes, chargesRes, synthRes] = await Promise.all([
        fetch(`/api/dossiers/${dossierId}/emprunteurs`),
        fetch(`/api/dossiers/${dossierId}/projet`),
        fetch(`/api/dossiers/${dossierId}/analyses`),
        fetch(`/api/dossiers/${dossierId}/charges`),
        fetch(`/api/dossiers/${dossierId}/syntheses`),
      ])

      const [emprunteurs, projet, analyse, charges, synthData] = await Promise.all([
        empRes.ok ? empRes.json() : [],
        projRes.ok ? projRes.json() : null,
        analyseRes.ok ? analyseRes.json() : null,
        chargesRes.ok ? chargesRes.json() : [],
        synthRes.ok ? synthRes.json() : null,
      ])

      setDossierData({ emprunteurs, projet, analyse, charges })
      if (synthData?.contenu_ia) {
        setSavedSynthese(synthData.contenu_ia)
        setSynthese(synthData.contenu_ia)
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function generateSynthese() {
    if (!dossierData) return
    setGenerating(true)
    setError(null)

    try {
      const res = await fetch('/api/analyse-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'synthese',
          dossierData,
        }),
      })

      if (!res.ok) throw new Error('Erreur API')

      const data = await res.json()
      const content = data.content || ''
      setSynthese(content)
      setSavedSynthese(content)

      // Save to DB
      await fetch(`/api/dossiers/${dossierId}/syntheses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossier_id: dossierId, contenu_ia: content }),
      })
    } catch (err) {
      setError('Erreur lors de la generation. Reessayez dans quelques instants.')
    }
    setGenerating(false)
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  function buildNoteBancaire(): string {
    if (!dossierData) return ''
    const { emprunteurs, projet, analyse, charges } = dossierData
    const empNoms = emprunteurs?.map(e => e.prenom + ' ' + e.nom).join(' et ') || 'N/A'
    const revTotal = emprunteurs?.reduce((s, e) => s + (e.salaire_net_mensuel || 0), 0) || 0
    const typeContrats = [...new Set(emprunteurs?.map(e => e.type_contrat).filter(Boolean))].join(', ') || 'N/A'
    const chargesTotal = charges?.reduce((s: number, c: any) => s + (c.mensualite || 0), 0) || 0

    const lines = [
      'NOTE DE SYNTHESE BANCAIRE - CortIA',
      '='.repeat(50),
      '',
      '1. PRESENTATION CLIENT',
      `Emprunteur(s): ${empNoms}`,
      emprunteurs?.length > 1 ? `Dossier bi-actif (${emprunteurs.length} emprunteurs)` : 'Dossier mono-actif',
      '',
      '2. SITUATION PROFESSIONNELLE',
      `Type de contrat: ${typeContrats}`,
      emprunteurs?.map(e => `${e.prenom} ${e.nom}: ${e.type_contrat || 'N/A'} ${e.employeur ? 'chez ' + e.employeur : ''}`).join('\n') || '',
      '',
      '3. SITUATION FINANCIERE',
      `Revenus nets mensuels: ${formatMontant(revTotal)}`,
      `Charges mensuelles courantes: ${formatMontant(chargesTotal)}`,
      analyse ? `Taux d endettement projet: ${analyse.taux_endettement?.toFixed(1) || 'N/A'}%` : '',
      analyse ? `Reste a vivre: ${formatMontant(analyse.reste_a_vivre)}/mois` : '',
      '',
      '4. PRESENTATION DU PROJET',
      projet ? `Type: ${projet.type_bien} - ${projet.usage || 'Residence principale'}` : 'Projet non renseigne',
      projet ? `Localisation: ${projet.ville || 'N/A'} ${projet.code_postal || ''}` : '',
      projet ? `Prix d achat: ${formatMontant(projet.prix_achat)}` : '',
      projet ? `Apport personnel: ${formatMontant(projet.apport || 0)}` : '',
      analyse ? `Besoin de financement: ${formatMontant(analyse.besoin_financement)}` : '',
      analyse ? `Mensualite estimee: ${formatMontant(analyse.mensualite_estimee)}/mois sur ${(projet?.duree_souhaitee || 240) / 12} ans` : '',
      '',
      '5. ATOUTS DU DOSSIER',
      emprunteurs?.some(e => e.type_contrat === 'CDI' || e.type_contrat === 'Fonctionnaire') ? '- Stabilite professionnelle confirmee (CDI / Fonction publique)' : '',
      (projet?.apport || 0) > 0 ? `- Apport personnel de ${formatMontant(projet?.apport)} (${analyse?.ratio_apport?.toFixed(1) || 'N/A'}% du cout total)` : '',
      analyse && analyse.taux_endettement < 35 ? `- Taux d endettement maitrise (${analyse.taux_endettement?.toFixed(1)}%)` : '',
      analyse && analyse.score_global >= 70 ? `- Score CortIA favorable: ${analyse.score_global}/100` : '',
      '',
      '6. POINTS DE VIGILANCE',
      analyse && analyse.taux_endettement >= 35 ? `- Taux d endettement eleve (${analyse.taux_endettement?.toFixed(1)}%) - argumentation necessaire` : '',
      chargesTotal > 0 ? `- Charges courantes a prendre en compte: ${formatMontant(chargesTotal)}/mois` : '',
      '- Verifier exhaustivite des documents justificatifs',
      '',
      '7. CONCLUSION COURTIER',
      analyse && analyse.score_global >= 70
        ? `Dossier solide (score ${analyse.score_global}/100). Financement envisageable sur ${(projet?.duree_souhaitee || 240) / 12} ans.`
        : analyse && analyse.score_global >= 50
        ? `Dossier acceptable (score ${analyse.score_global}/100). Quelques points d attention a clarifier.`
        : 'Dossier a renforcer. Des ajustements sont recommandes avant presentation aux etablissements bancaires.',
      '',
      '---',
      `Note generee par CortIA - ${new Date().toLocaleDateString('fr-FR')}`,
    ]

    return lines.filter(l => l !== undefined && l !== null).join('\n')
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement de la synthese...</p>
      </div>
    )
  }

  const noteBancaire = buildNoteBancaire()
  const hasData = dossierData && (
    (dossierData.emprunteurs?.length || 0) > 0 || dossierData.projet
  )

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Synthese banque</h2>
          <p className="page-subtitle">Note de synthese bancaire — communication courtier</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {synthese && (
            <button
              onClick={() => copyToClipboard(synthese)}
              className="btn-secondary"
            >
              {copied ? '✅ Copie !' : '📋 Copier la note IA'}
            </button>
          )}
          <button
            onClick={generateSynthese}
            disabled={generating || !hasData}
            className="btn-primary"
            style={{ opacity: generating || !hasData ? 0.6 : 1 }}
          >
            {generating ? 'Generation...' : synthese ? 'Regenerer' : 'Generer avec CortIA'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {!hasData && (
        <div className="card" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: '24px' }}>
          <p style={{ color: '#92400E', fontSize: '14px', margin: 0 }}>
            <strong>Donnees incompletes</strong> — Completez les onglets Emprunteur, Projet et Analyse avant de generer la synthese.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Note bancaire structuree */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 className="card-title">Note structuree CortIA</h3>
            <button
              onClick={() => copyToClipboard(noteBancaire)}
              style={{ fontSize: '12px', color: 'var(--brand-blue)', background: 'none', border: '1px solid var(--brand-blue)', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}
            >
              {copied ? '✅' : '📋 Copier'}
            </button>
          </div>

          <div style={{ fontSize: '13px', fontFamily: 'monospace', lineHeight: 1.6, color: 'var(--gray-700)', whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto' }}>
            {noteBancaire || (
              <span style={{ color: 'var(--gray-400)', fontFamily: 'inherit' }}>
                Completez le dossier pour voir la note structuree...
              </span>
            )}
          </div>
        </div>

        {/* Synthese IA */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Synthese IA CortIA</h3>
            <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
              {synthese ? 'Generee' : 'Non generee'}
            </div>
          </div>

          {generating ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
              <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>Generation en cours...</p>
            </div>
          ) : synthese ? (
            <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--gray-700)', whiteSpace: 'pre-wrap', maxHeight: '500px', overflowY: 'auto' }}>
              {synthese}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '48px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✨</div>
              <h3 style={{ fontSize: '16px' }}>Synthese IA non generee</h3>
              <p style={{ fontSize: '13px' }}>Cliquez sur "Generer avec CortIA" pour obtenir une synthese intelligente</p>
            </div>
          )}
        </div>
      </div>

      {/* Recap donnees dossier */}
      {dossierData && (
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">Donnees utilisees</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <RecapItem label="Emprunteurs" value={String(dossierData.emprunteurs?.length || 0)} ok={dossierData.emprunteurs?.length > 0} />
            <RecapItem label="Projet" value={dossierData.projet?.type_bien || 'Non renseigne'} ok={!!dossierData.projet} />
            <RecapItem label="Analyse" value={dossierData.analyse?.score_global ? dossierData.analyse.score_global + '/100' : 'Non calculee'} ok={!!dossierData.analyse} />
            <RecapItem label="Charges" value={String(dossierData.charges?.length || 0) + ' charge(s)'} ok={true} />
          </div>
        </div>
      )}
    </div>
  )
}

function RecapItem({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
      <span style={{ fontSize: '16px' }}>{ok ? '✅' : '⚠️'}</span>
      <div>
        <div style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: ok ? 'var(--gray-800)' : '#D97706' }}>{value}</div>
      </div>
    </div>
  )
}
