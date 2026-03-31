'use client'

import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'
import { STATUTS_DOSSIER } from '@/lib/types'

interface PipelineBarProps {
  statutActuel: string
  onChangeStatut?: (statut: string) => void
  readOnly?: boolean
}

const PIPELINE_ORDER = [
  'prospect',
  'en_cours',
  'instruction',
  'accord',
  'signe',
  'debloqueé',
  'archive',
]

export function PipelineBar({
  statutActuel,
  onChangeStatut,
  readOnly = false,
}: PipelineBarProps) {
  const currentIndex = PIPELINE_ORDER.indexOf(statutActuel)

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center min-w-max py-2">
        {PIPELINE_ORDER.map((statut, index) => {
          const config = STATUTS_DOSSIER[statut as keyof typeof STATUTS_DOSSIER]
          if (!config) return null

          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isFuture = index > currentIndex
          const isLast = index === PIPELINE_ORDER.length - 1

          return (
            <div key={statut} className="flex items-center">
              {/* Step */}
              <button
                onClick={() => !readOnly && onChangeStatut?.(statut)}
                disabled={readOnly || isCurrent}
                className={`flex flex-col items-center gap-1.5 px-3 group ${
                  readOnly || isCurrent
                    ? 'cursor-default'
                    : 'cursor-pointer hover:opacity-80'
                }`}
              >
                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600'
                      : isCurrent
                      ? 'bg-white border-blue-600'
                      : 'bg-white border-gray-200 group-hover:border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-300" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'text-blue-700'
                      : isCompleted
                      ? 'text-gray-700'
                      : 'text-gray-400'
                  }`}
                >
                  {config.label}
                </span>
              </button>

              {/* Connector */}
              {!isLast && (
                <div
                  className={`h-0.5 w-8 flex-shrink-0 ${
                    isCompleted ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
