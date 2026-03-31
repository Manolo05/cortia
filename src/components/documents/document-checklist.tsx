'use client'

import { CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface ChecklistItem {
  id: string
  label: string
  description?: string
  required: boolean
  present: boolean
  documentId?: string
}

interface ChecklistCategory {
  id: string
  label: string
  icon?: string
  items: ChecklistItem[]
}

interface DocumentChecklistProps {
  categories: ChecklistCategory[]
  onItemClick?: (item: ChecklistItem) => void
}

const DOCUMENT_CHECKLIST: ChecklistCategory[] = [
  {
    id: 'identite',
    label: 'Pièces d\'identité',
    icon: '🪪',
    items: [
      { id: 'cni', label: 'Carte nationale d\'identité ou passeport', required: true, present: false },
      { id: 'justif_domicile', label: 'Justificatif de domicile < 3 mois', required: true, present: false },
      { id: 'livret_famille', label: 'Livret de famille', required: false, present: false },
    ],
  },
  {
    id: 'revenus',
    label: 'Justificatifs de revenus',
    icon: '💰',
    items: [
      { id: 'bulletins_salaire', label: '3 derniers bulletins de salaire', required: true, present: false },
      { id: 'avis_imposition', label: '2 derniers avis d\'imposition', required: true, present: false },
      { id: 'contrat_travail', label: 'Contrat de travail', required: false, present: false },
      { id: 'releves_bancaires', label: '3 derniers relevés bancaires', required: true, present: false },
    ],
  },
  {
    id: 'patrimoine',
    label: 'Patrimoine et charges',
    icon: '🏠',
    items: [
      { id: 'credits_en_cours', label: 'Tableau amortissement crédits en cours', required: false, present: false },
      { id: 'quittances_loyer', label: 'Quittances de loyer (si locataire)', required: false, present: false },
    ],
  },
  {
    id: 'projet',
    label: 'Documents du projet',
    icon: '📋',
    items: [
      { id: 'compromis', label: 'Compromis / promesse de vente', required: false, present: false },
      { id: 'devis_travaux', label: 'Devis travaux', required: false, present: false },
      { id: 'titre_propriete', label: 'Titre de propriété (si propriétaire)', required: false, present: false },
    ],
  },
]

function CategorySection({
  category,
  onItemClick,
}: {
  category: ChecklistCategory
  onItemClick?: (item: ChecklistItem) => void
}) {
  const [isOpen, setIsOpen] = useState(true)

  const presentCount = category.items.filter(i => i.present).length
  const requiredMissing = category.items.filter(i => i.required && !i.present).length
  const allPresent = presentCount === category.items.length

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {category.icon && <span className="text-lg">{category.icon}</span>}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">{category.label}</p>
            <p className="text-xs text-gray-500">
              {presentCount}/{category.items.length} document{category.items.length > 1 ? 's' : ''}
              {requiredMissing > 0 && (
                <span className="text-red-500 ml-1">
                  ({requiredMissing} obligatoire{requiredMissing > 1 ? 's' : ''} manquant{requiredMissing > 1 ? 's' : ''})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allPresent ? (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Complet</span>
          ) : requiredMissing > 0 ? (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Incomplet</span>
          ) : (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Partiel</span>
          )}
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="divide-y divide-gray-100">
          {category.items.map(item => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={`flex items-center gap-3 px-4 py-3 ${onItemClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            >
              {item.present ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : item.required ? (
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-gray-300 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${item.present ? 'text-gray-700' : item.required ? 'text-gray-800 font-medium' : 'text-gray-600'}`}>
                  {item.label}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                )}
              </div>
              {item.required && (
                <span className="text-xs text-gray-400 flex-shrink-0">Obligatoire</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function DocumentChecklist({ categories, onItemClick }: DocumentChecklistProps) {
  const allItems = categories.flatMap(c => c.items)
  const presentCount = allItems.filter(i => i.present).length
  const requiredMissing = allItems.filter(i => i.required && !i.present).length
  const completionRate = Math.round((presentCount / allItems.length) * 100)

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold text-gray-800">Complétude du dossier</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {presentCount} sur {allItems.length} documents fournis
              {requiredMissing > 0 && (
                <span className="text-red-500"> · {requiredMissing} obligatoire{requiredMissing > 1 ? 's' : ''} manquant{requiredMissing > 1 ? 's' : ''}</span>
              )}
            </p>
          </div>
          <span className={`text-2xl font-bold ${completionRate === 100 ? 'text-green-600' : completionRate > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
            {completionRate}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${completionRate === 100 ? 'bg-green-500' : completionRate > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Categories */}
      {categories.map(category => (
        <CategorySection
          key={category.id}
          category={category}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  )
}

export { DOCUMENT_CHECKLIST }
export type { ChecklistCategory, ChecklistItem }
