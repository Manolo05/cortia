'use client'

import { useState } from 'react'
import {
  FileText,
  FileImage,
  File,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  Brain,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import type { Document } from '@/lib/types'

interface DocumentCardProps {
  document: Document
  onDelete?: (id: string) => void
  onExtract?: (id: string) => void
  onPreview?: (document: Document) => void
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType === 'application/pdf') return FileText
  return File
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const STATUT_CONFIG = {
  en_attente: { label: 'En attente', color: 'text-yellow-600 bg-yellow-50', icon: Clock },
  valide: { label: 'Validé', color: 'text-green-600 bg-green-50', icon: CheckCircle2 },
  rejete: { label: 'Rejeté', color: 'text-red-600 bg-red-50', icon: AlertCircle },
  analyse: { label: 'Analysé', color: 'text-blue-600 bg-blue-50', icon: Brain },
}

export function DocumentCard({
  document,
  onDelete,
  onExtract,
  onPreview,
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)

  const FileIcon = getFileIcon(document.type_mime || '')
  const statut = STATUT_CONFIG[document.statut as keyof typeof STATUT_CONFIG] || STATUT_CONFIG.en_attente
  const StatusIcon = statut.icon

  const handleExtract = async () => {
    if (!onExtract) return
    setIsExtracting(true)
    setShowMenu(false)
    try {
      await onExtract(document.id)
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all group">
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="p-2.5 bg-gray-100 rounded-lg flex-shrink-0">
          <FileIcon className="h-5 w-5 text-gray-600" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {document.nom}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-400">
                  {formatDate(document.created_at)}
                </span>
                {document.taille_octets && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-400">
                      {formatFileSize(document.taille_octets)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status badge */}
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statut.color}`}>
              <StatusIcon className="h-3 w-3" />
              {statut.label}
            </span>
          </div>

          {/* Category */}
          {document.categorie && (
            <span className="inline-block mt-1.5 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
              {document.categorie}
            </span>
          )}

          {/* IA Extract result preview */}
          {document.donnees_extraites && (
            <div className="mt-2 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 font-medium flex items-center gap-1">
                <Brain className="h-3 w-3" />
                Données IA extraites
              </p>
            </div>
          )}
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-44 overflow-hidden">
                {onPreview && (
                  <button
                    onClick={() => { onPreview(document); setShowMenu(false) }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                    Aperçu
                  </button>
                )}
                {document.url_fichier && (
                  <a
                    href={document.url_fichier}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowMenu(false)}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-4 w-4 text-gray-400" />
                    Télécharger
                  </a>
                )}
                {onExtract && (
                  <button
                    onClick={handleExtract}
                    disabled={isExtracting}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Brain className="h-4 w-4 text-purple-500" />
                    {isExtracting ? 'Analyse...' : 'Analyser (IA)'}
                  </button>
                )}
                {onDelete && (
                  <>
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={() => { onDelete(document.id); setShowMenu(false) }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
