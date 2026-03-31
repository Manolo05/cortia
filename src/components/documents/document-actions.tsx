// @ts-nocheck
'use client'

import { useState } from 'react'
import { Brain, RefreshCw, CheckSquare, AlertTriangle } from 'lucide-react'
import type { Document } from '@/lib/types'

interface DocumentActionsProps {
  documents: Document[]
  dossierId: string
  onExtractAll?: () => Promise<void>
  onRefresh?: () => void
}

export function DocumentActions({
  documents,
  dossierId,
  onExtractAll,
  onRefresh,
}: DocumentActionsProps) {
  const [isExtracting, setIsExtracting] = useState(false)

  const documentsWithExtraction = documents.filter(d => d.donnees_extraites)
  const documentsWithoutExtraction = documents.filter(d => !d.donnees_extraites)

  const handleExtractAll = async () => {
    if (!onExtractAll) return
    setIsExtracting(true)
    try {
      await onExtractAll()
    } finally {
      setIsExtracting(false)
    }
  }

  if (documents.length === 0) return null

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0 mt-0.5">
            <Brain className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Extraction IA</p>
            <p className="text-xs text-gray-600 mt-0.5">
              {documentsWithExtraction.length > 0 ? (
                <>
                  <span className="text-green-600 font-medium">{documentsWithExtraction.length} document{documentsWithExtraction.length > 1 ? 's' : ''} analysé{documentsWithExtraction.length > 1 ? 's' : ''}</span>
                  {documentsWithoutExtraction.length > 0 && (
                    <> · <span className="text-orange-600">{documentsWithoutExtraction.length} restant{documentsWithoutExtraction.length > 1 ? 's' : ''}</span></>
                  )}
                </>
              ) : (
                <>{documents.length} document{documents.length > 1 ? 's' : ''} — aucun analysé</>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {onExtractAll && documentsWithoutExtraction.length > 0 && (
            <button
              onClick={handleExtractAll}
              disabled={isExtracting}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isExtracting ? (
                <>
                  <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Brain className="h-3.5 w-3.5" />
                  Analyser tout ({documentsWithoutExtraction.length})
                </>
              )}
            </button>
          )}
          {documentsWithoutExtraction.length === 0 && documents.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
              <CheckSquare className="h-3.5 w-3.5" />
              Tous analysés
            </div>
          )}
        </div>
      </div>

      {/* Warning if some docs failed */}
      {documents.some(d => d.statut === 'rejete') && (
        <div className="mt-3 flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0" />
          <p className="text-xs text-orange-700">
            Certains documents ont des erreurs d'extraction. Vérifiez leur qualité.
          </p>
        </div>
      )}
    </div>
  )
}
