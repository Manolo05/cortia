'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { STATUTS_DOSSIER } from '@/lib/types'

interface DossierFiltersProps {
  onSearch: (query: string) => void
  onFilterStatut: (statut: string) => void
  searchQuery: string
  selectedStatut: string
}

export function DossierFilters({
  onSearch,
  onFilterStatut,
  searchQuery,
  selectedStatut,
}: DossierFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const statutOptions = [
    { value: '', label: 'Tous les statuts' },
    ...Object.entries(STATUTS_DOSSIER).map(([key, config]) => ({
      value: key,
      label: config.label,
    })),
  ]

  const hasActiveFilters = selectedStatut !== ''

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un dossier, emprunteur..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm font-medium transition-colors ${
            hasActiveFilters || showFilters
              ? 'border-blue-500 text-blue-600 bg-blue-50'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filtres
          {hasActiveFilters && (
            <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              1
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Filtres</h3>
            {hasActiveFilters && (
              <button
                onClick={() => onFilterStatut('')}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Réinitialiser
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Statut du dossier
            </label>
            <div className="flex flex-wrap gap-2">
              {statutOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onFilterStatut(option.value)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    selectedStatut === option.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
