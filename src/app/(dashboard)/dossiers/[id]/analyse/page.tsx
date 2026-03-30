'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { formatMontant, formatPourcentage } from '@/lib/utils/format'

interface Analyse {
  score_global: number
  score_revenus: number
  score_stabilite: number
  score_endettement: number
  score_apport: number
  score_patrimoine: number
  revenus_nets_mensuels_total: number
  charges_mensuelles_total: number
  reste_a_vivre: number
  taux_endettement_actuel: number
  taux_endettement_projet: number
  capacite_emprunt_max: number
  mensualite_estimee: number
  taux_apport: number
  points_forts: string[]
  points_vigilance: string[]
  recommandations: string[]
  genere_par_ia: boolean
}

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const color = score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'
  const bg = score >= 70 ? 'bg-green-100' : score >= 50 ? 'bg-yellow-100' : 'bg-red-100'
  
  return (
    <div className="text-center">
      <div className={`w-16 h-16 rounded-full ${bg} flex items-center justify-center mx-auto mb-2`}>
        <span className={`text-xl font-bold ${color}`}>{score}</span>
      </div>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

export default function AnalysePage() {
  const params = useParams()
  const dossierId = params.id as string
  const [analyse, setAnalyse] = useState<Analyse | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAnalyse()
  }, [dossierId])

  async function fetchAnalyse() {
    try {
      const res = await fetch(`/api/analyse/${dossierId}`)
      if (res.ok) {
        const data = await res.json()
        setAnalyse(data)
      }
    } catch {
      // Pas d'analyse encore
    } finally {
      setLoading(false)
    }
  }

  async function lancerAnalyse() {
    setAnalyzing(true)
    setError('')
    try {
      const res = await fetch(`/api/analyse/${dossierId}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAnalyse(data.analyse)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'analyse')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Chargement...</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Analyse Financière IA</h2>
        <button
          onClick={lancerAnalyse}
          disabled={analyzing}
          className="cortia-button-primary disabled:opacity-50"
        >
          {analyzing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analyse en cours...
            </span>
          ) : analyse ? '↺ Relancer l\'analyse' : '⚡ Lancer l\'analyse IA'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {!analyse && !error && (
        <div className="cortia-card p-12 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyse non effectuée</h3>
          <p className="text-gray-500 mb-6">
            Assurez-vous d'avoir renseigné les emprunteurs et le projet avant de lancer l'analyse.
          </p>
          <button onClick={lancerAnalyse} disabled={analyzing} className="cortia-button-primary">
            Lancer l'analyse IA
          </button>
        </div>
      )}

      {analyse && (
        <>
          {/* Score global */}
          <div className="cortia-card p-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  analyse.score_global >= 70 ? 'bg-green-100' : analyse.score_global >= 50 ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <span className={`text-3xl font-bold ${
                    analyse.score_global >= 70 ? 'text-green-700' : analyse.score_global >= 50 ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {analyse.score_global}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-700 mt-2">Score global</p>
                <p className="text-xs text-gray-400">/100</p>
              </div>
              
              <div className="flex-1 grid grid-cols-5 gap-4">
                <ScoreGauge score={analyse.score_revenus} label="Revenus" />
                <ScoreGauge score={analyse.score_stabilite} label="Stabilité" />
                <ScoreGauge score={analyse.score_endettement} label="Endettement" />
                <ScoreGauge score={analyse.score_apport} label="Apport" />
                <ScoreGauge score={analyse.score_patrimoine} label="Patrimoine" />
              </div>
            </div>
          </div>

          {/* KPIs financiers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Revenus nets/mois', value: formatMontant(analyse.revenus_nets_mensuels_total) },
              { label: 'Mensualité estimée', value: formatMontant(analyse.mensualite_estimee) },
              { label: 'Taux endettement', value: `${analyse.taux_endettement_projet.toFixed(1)}%`, warning: analyse.taux_endettement_projet > 35 },
              { label: 'Reste à vivre', value: formatMontant(analyse.reste_a_vivre) },
            ].map(kpi => (
              <div key={kpi.label} className={`cortia-card p-4 ${kpi.warning ? 'border-orange-200' : ''}`}>
                <p className="text-xs text-gray-500 mb-1">{kpi.label}</p>
                <p className={`text-xl font-bold ${kpi.warning ? 'text-orange-600' : 'text-gray-900'}`}>
                  {kpi.value}
                </p>
              </div>
            ))}
          </div>

          {/* Points forts & vigilance */}
          <div className="grid md:grid-cols-2 gap-6">
            {analyse.points_forts?.length > 0 && (
              <div className="cortia-card p-5">
                <h3 className="font-semibold text-green-700 mb-3">✅ Points forts</h3>
                <ul className="space-y-2">
                  {analyse.points_forts.map((p, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {analyse.points_vigilance?.length > 0 && (
              <div className="cortia-card p-5">
                <h3 className="font-semibold text-orange-700 mb-3">⚠️ Points de vigilance</h3>
                <ul className="space-y-2">
                  {analyse.points_vigilance.map((p, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-orange-500 mt-0.5">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Recommandations */}
          {analyse.recommandations?.length > 0 && (
            <div className="cortia-card p-5">
              <h3 className="font-semibold text-blue-700 mb-3">💡 Recommandations</h3>
              <ul className="space-y-2">
                {analyse.recommandations.map((r, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">→</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  )
}
