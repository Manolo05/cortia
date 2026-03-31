'use client'

import { useState } from 'react'
import { FileText, Download, Copy, Check, RefreshCw, Brain, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import type { SyntheseComplete } from '@/lib/ia/types-synthese'

interface SyntheseClientProps {
  dossierId: string
  synthese: SyntheseComplete | null
  isLoading?: boolean
  onGenerate: () => Promise<void>
  onDownloadPDF?: () => Promise<void>
}

function SectionCard({
  title,
  emoji,
  children,
  defaultOpen = true,
}: {
  title: string
  emoji: string
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  )
}

function TextBlock({ text }: { text: string }) {
  return (
    <div className="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
      {text}
    </div>
  )
}

function PointsList({ points, type }: { points: string[]; type: 'positive' | 'risk' | 'neutral' }) {
  const styles = {
    positive: { dot: 'bg-green-500', text: 'text-green-700' },
    risk: { dot: 'bg-red-500', text: 'text-red-700' },
    neutral: { dot: 'bg-blue-500', text: 'text-blue-700' },
  }
  const style = styles[type]

  if (points.length === 0) return null

  return (
    <ul className="mt-2 space-y-1.5">
      {points.map((point, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <div className={`w-1.5 h-1.5 rounded-full ${style.dot} mt-1.5 flex-shrink-0`} />
          <span className="text-gray-700">{point}</span>
        </li>
      ))}
    </ul>
  )
}

export function SyntheseClient({
  dossierId,
  synthese,
  isLoading,
  onGenerate,
  onDownloadPDF,
}: SyntheseClientProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!synthese) return
    const text = `SYNTHÈSE DOSSIER\n\n${synthese.resume_executif}\n\n[Généré par CortIA]`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
          <Brain className="absolute inset-0 m-auto h-5 w-5 text-purple-600" />
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-800">Génération en cours...</p>
          <p className="text-sm text-gray-500 mt-1">L'IA analyse le dossier complet</p>
        </div>
      </div>
    )
  }

  if (!synthese) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-5">
        <div className="p-4 bg-purple-100 rounded-2xl">
          <Sparkles className="h-8 w-8 text-purple-600" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Aucune synthèse générée</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            Générez une synthèse IA complète du dossier incluant l'analyse financière et les recommandations.
          </p>
        </div>
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
        >
          <Brain className="h-4 w-4" />
          Générer la synthèse
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Généré le {new Date(synthese.date_generation).toLocaleDateString('fr-FR', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {copied ? (
              <><Check className="h-3.5 w-3.5 text-green-500" /> Copié</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copier</>
            )}
          </button>
          {onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </button>
          )}
          <button
            onClick={onGenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Régénérer
          </button>
        </div>
      </div>

      {/* Resume executif */}
      <SectionCard title="Résumé exécutif" emoji="📋">
        <TextBlock text={synthese.resume_executif} />
      </SectionCard>

      {/* Profile emprunteur */}
      {synthese.profil_emprunteur && (
        <SectionCard title="Profil emprunteur" emoji="👤">
          <TextBlock text={synthese.profil_emprunteur.description} />
          {synthese.profil_emprunteur.points_forts?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Points forts</p>
              <PointsList points={synthese.profil_emprunteur.points_forts} type="positive" />
            </div>
          )}
          {synthese.profil_emprunteur.points_attention?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Points d'attention</p>
              <PointsList points={synthese.profil_emprunteur.points_attention} type="risk" />
            </div>
          )}
        </SectionCard>
      )}

      {/* Analyse projet */}
      {synthese.analyse_projet && (
        <SectionCard title="Analyse du projet" emoji="🏠">
          <TextBlock text={synthese.analyse_projet.description} />
          {synthese.analyse_projet.coherence_prix && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-medium text-blue-700">Cohérence du prix</p>
              <p className="text-sm text-blue-900 mt-1">{synthese.analyse_projet.coherence_prix}</p>
            </div>
          )}
        </SectionCard>
      )}

      {/* Analyse financiere */}
      {synthese.analyse_financiere && (
        <SectionCard title="Analyse financière" emoji="📊">
          <TextBlock text={synthese.analyse_financiere.description} />
          {synthese.analyse_financiere.indicateurs && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {Object.entries(synthese.analyse_financiere.indicateurs).map(([key, value]) => (
                <div key={key} className="p-2.5 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-semibold text-gray-800 mt-0.5">{String(value)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Recommandations */}
      {synthese.recommandations && (
        <SectionCard title="Recommandations" emoji="💡">
          {synthese.recommandations.banques_cibles?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Établissements cibles</p>
              <div className="flex flex-wrap gap-2">
                {synthese.recommandations.banques_cibles.map((banque, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    {banque}
                  </span>
                ))}
              </div>
            </div>
          )}
          {synthese.recommandations.actions_requises?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Actions requises</p>
              <PointsList points={synthese.recommandations.actions_requises} type="neutral" />
            </div>
          )}
          {synthese.recommandations.texte && (
            <TextBlock text={synthese.recommandations.texte} />
          )}
        </SectionCard>
      )}

      {/* Note bancaire */}
      {synthese.note_bancaire && (
        <SectionCard title="Note bancaire" emoji="🏦" defaultOpen={false}>
          <div className="mt-3 prose prose-sm max-w-none text-gray-700">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-gray-50 p-4 rounded-lg">
              {synthese.note_bancaire}
            </pre>
          </div>
        </SectionCard>
      )}
    </div>
  )
}
