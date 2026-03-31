'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface Alerte {
  type: 'vigilance' | 'manque' | 'incoherence'
  titre: string
  description: string
  severite: 'haute' | 'moyenne' | 'faible'
}

interface ControleResult {
  score_fiabilite: number
  resume: string
  alertes: Alerte[]
  recommandation: string
}

function ScoreCircle({ score }: { score: number }) {
  const color = score >= 75 ? '#059669' : score >= 50 ? '#D97706' : '#DC2626'
  const label = score >= 75 ? 'Fiabilite elevee' : score >= 50 ? 'Quelques anomalies' : 'Anomalies importantes'

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{
        width: '120px', height: '120px', borderRadius: '50%',
        border: `8px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
        background: 'white',
      }}>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 800, color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '11px', color: 'var(--gray-400)', fontWeight: 500 }}>/100</div>
        </div>
      </div>
      <div style={{ fontSize: '14px', fontWeight: 600, color }}>
        {score >= 75 ? 'OK' : score >= 50 ? 'OK' : 'NON OK'}
      </div>
      <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '4px' }}>{label}</div>
    </div>
  )
}

function AlerteCard({ alerte }: { alerte: Alerte }) {
  const colors = {
    haute: { bg: '#FEF2F2', border: '#FECACA', text: '#DC2626', icon: 'Alerte haute' },
    moyenne: { bg: '#FFFBEB', border: '#FDE68A', text: '#D97706', icon: 'Alerte moyenne' },
    faible: { bg: '#F0FDF4', border: '#BBF7D0', text: '#059669', icon: 'Note' },
  }
  const typeIcons = {
    vigilance: 'Signal de vigilance',
    manque: 'Document manquant',
    incoherence: 'Incoherence potentielle',
  }

  const c = colors[alerte.severite]
  const typeLabel = typeIcons[alerte.type] || alerte.type

  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: '8px', padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: c.text }}>{alerte.titre}</span>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
            background: c.border, color: c.text, fontWeight: 600
          }}>
            {typeLabel}
          </span>
          <span style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
            background: 'white', color: c.text, fontWeight: 600, border: `1px solid ${c.border}`
          }}>
            {alerte.severite === 'haute' ? 'Prioritaire' : alerte.severite === 'moyenne' ? 'Moyen' : 'Faible'}
          </span>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-700)', lineHeight: 1.5 }}>
        {alerte.description}
      </p>
    </div>
  )
}

export default function ControleDocsPage() {
  const params = useParams()
  const dossierId = params.id as string

  const [result, setResult] = useState<ControleResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [analysing, setAnalysing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dossierData, setDossierData] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [dossierId])

  async function loadData() {
    setLoading(true)
    try {
      const [empRes, projRes, docsRes, controleRes] = await Promise.all([
        fetch(`/api/dossiers/${dossierId}/emprunteurs`),
        fetch(`/api/dossiers/${dossierId}/projet`),
        fetch(`/api/dossiers/${dossierId}/documents`),
        fetch(`/api/dossiers/${dossierId}/controles-docs`),
      ])

      const [emprunteurs, projet, documents, savedControle] = await Promise.all([
        empRes.ok ? empRes.json() : [],
        projRes.ok ? projRes.json() : null,
        docsRes.ok ? docsRes.json() : [],
        controleRes.ok ? controleRes.json() : null,
      ])

      setDossierData({ emprunteurs, projet, documents })

      if (savedControle && savedControle.score_fiabilite !== undefined) {
        setResult({
          score_fiabilite: savedControle.score_fiabilite,
          resume: savedControle.resume_ia || '',
          alertes: savedControle.alertes || [],
          recommandation: savedControle.recommandation || '',
        })
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  async function runAnalyse() {
    if (!dossierData) return
    setAnalysing(true)
    setError(null)

    try {
      const res = await fetch('/api/analyse-ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'controle_docs',
          dossierData,
        }),
      })

      if (!res.ok) throw new Error('Erreur API')

      const data = await res.json()
      let parsed: ControleResult

      try {
        parsed = JSON.parse(data.content)
      } catch {
        parsed = {
          score_fiabilite: 65,
          resume: data.content || 'Analyse effectuee.',
          alertes: [],
          recommandation: 'Verifiez manuellement la coherence des documents.',
        }
      }

      setResult(parsed)

      // Save to DB
      await fetch(`/api/dossiers/${dossierId}/controles-docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dossier_id: dossierId,
          score_fiabilite: parsed.score_fiabilite,
          resume_ia: parsed.resume,
          alertes: parsed.alertes,
          recommandation: parsed.recommandation,
        }),
      })
    } catch (err) {
      setError('Erreur lors de l analyse. Reessayez dans quelques instants.')
    }

    setAnalysing(false)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement du controle documentaire...</p>
      </div>
    )
  }

  const alertesHautes = result?.alertes?.filter(a => a.severite === 'haute') || []
  const alertesMoyennes = result?.alertes?.filter(a => a.severite === 'moyenne') || []
  const alertesFaibles = result?.alertes?.filter(a => a.severite === 'faible') || []

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Controle Documentaire IA</h2>
          <p className="page-subtitle">
            Detection d anomalies, incoherences et signaux de vigilance
          </p>
        </div>
        <button
          onClick={runAnalyse}
          disabled={analysing}
          className="btn-primary"
          style={{ opacity: analysing ? 0.6 : 1 }}
        >
          {analysing ? 'Analyse en cours...' : result ? 'Relancer l analyse' : 'Lancer le controle IA'}
        </button>
      </div>

      {/* Disclaimer legal */}
      <div style={{
        background: '#EFF6FF', border: '1px solid #BFDBFE',
        borderRadius: '8px', padding: '12px 16px', marginBottom: '24px',
        fontSize: '13px', color: '#1E40AF'
      }}>
        <strong>Note importante</strong> — Ce module detecte des anomalies potentielles et signaux de vigilance.
        Il ne constitue pas une certification documentaire. Toute anomalie detectee requiert une verification humaine.
        Les termes utilises sont: anomalie detectee, incoherence potentielle, signal de vigilance.
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '12px 16px', color: '#DC2626', fontSize: '14px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {analysing && (
        <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 16px' }}></div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--gray-700)' }}>Analyse documentaire en cours...</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>CortIA analyse la coherence de votre dossier</p>
        </div>
      )}

      {!analysing && result && (
        <>
          {/* Score + Resume */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', marginBottom: '16px' }}>
            <div className="card">
              <ScoreCircle score={result.score_fiabilite} />
            </div>
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Resume documentaire IA</h3>
              </div>
              <p style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--gray-700)', margin: 0 }}>
                {result.resume}
              </p>
              {result.recommandation && (
                <div style={{
                  marginTop: '16px', padding: '12px 16px',
                  background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Recommandation CortIA
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--gray-700)', lineHeight: 1.5 }}>
                    {result.recommandation}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alertes */}
          {result.alertes && result.alertes.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Points detectes</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {alertesHautes.length > 0 && (
                    <span className="badge badge-danger">{alertesHautes.length} prioritaire{alertesHautes.length > 1 ? 's' : ''}</span>
                  )}
                  {alertesMoyennes.length > 0 && (
                    <span className="badge badge-warning">{alertesMoyennes.length} moyen{alertesMoyennes.length > 1 ? 's' : ''}</span>
                  )}
                  {alertesFaibles.length > 0 && (
                    <span className="badge badge-success">{alertesFaibles.length} faible{alertesFaibles.length > 1 ? 's' : ''}</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alertesHautes.map((a, i) => <AlerteCard key={`h${i}`} alerte={a} />)}
                {alertesMoyennes.map((a, i) => <AlerteCard key={`m${i}`} alerte={a} />)}
                {alertesFaibles.map((a, i) => <AlerteCard key={`f${i}`} alerte={a} />)}
              </div>
            </div>
          )}

          {result.alertes && result.alertes.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
              <h3 style={{ fontSize: '16px', color: '#059669' }}>Aucune anomalie detectee</h3>
              <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
                Le dossier presente une coherence documentaire satisfaisante.
              </p>
            </div>
          )}
        </>
      )}

      {!analysing && !result && (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
          <h3>Controle non effectue</h3>
          <p>Lancez le controle IA pour analyser la coherence documentaire du dossier</p>
          <button onClick={runAnalyse} className="btn-primary" style={{ marginTop: '16px' }}>
            Lancer le controle IA
          </button>
        </div>
      )}

      {/* Documents charges */}
      {dossierData?.documents?.length > 0 && (
        <div className="card" style={{ marginTop: '16px' }}>
          <div className="card-header">
            <h3 className="card-title">Documents du dossier ({dossierData.documents.length})</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {dossierData.documents.map((doc: any) => (
              <span key={doc.id} style={{
                padding: '4px 12px', borderRadius: '20px', fontSize: '13px',
                background: 'var(--gray-100)', color: 'var(--gray-700)',
                border: '1px solid var(--gray-200)',
              }}>
                {doc.nom}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
