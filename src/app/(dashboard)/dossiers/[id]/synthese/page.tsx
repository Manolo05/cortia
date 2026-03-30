'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function SynthesePage() {
  const params = useParams()
  const dossierId = params.id as string
  const [synthese, setSynthese] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSynthese()
  }, [dossierId])

  async function fetchSynthese() {
    try {
      const res = await fetch(`/api/synthese/${dossierId}`)
      if (res.ok) {
        const data = await res.json()
        setSynthese(data)
      }
    } catch {
      // Pas de synthèse encore
    } finally {
      setLoading(false)
    }
  }

  async function genererSynthese() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/synthese/${dossierId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSynthese(data.synthese)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération')
    } finally {
      setGenerating(false)
    }
  }

  function copierMarkdown() {
    if (synthese?.contenu_markdown) {
      navigator.clipboard.writeText(synthese.contenu_markdown)
      alert('Synthèse copiée dans le presse-papier')
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Synthèse IA</h2>
        <div className="flex gap-3">
          {synthese && (
            <button onClick={copierMarkdown} className="cortia-button-secondary text-sm">
              📋 Copier
            </button>
          )}
          <button
            onClick={genererSynthese}
            disabled={generating}
            className="cortia-button-primary disabled:opacity-50"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Génération...
              </span>
            ) : synthese ? '↺ Regénérer' : '✨ Générer la synthèse'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!synthese && !error && (
        <div className="cortia-card p-12 text-center">
          <div className="text-5xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Synthèse non générée</h3>
          <p className="text-gray-500 mb-6">
            Une analyse financière est requise avant de générer la synthèse.
            La synthèse sera rédigée automatiquement par notre IA.
          </p>
          <button onClick={genererSynthese} disabled={generating} className="cortia-button-primary">
            Générer la synthèse IA
          </button>
        </div>
      )}

      {synthese && (
        <div className="cortia-card p-6">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
              {synthese.contenu_markdown}
            </pre>
          </div>
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            Synthèse générée le {new Date(synthese.created_at).toLocaleDateString('fr-FR')} par CortIA
          </p>
        </div>
      )}
    </div>
  )
}
