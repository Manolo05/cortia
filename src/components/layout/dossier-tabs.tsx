'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DossierTabsProps {
  dossierId: string
}

const tabs = [
  { name: 'Résumé', href: '' },
  { name: 'Emprunteurs', href: '/emprunteurs' },
  { name: 'Projet', href: '/projet' },
  { name: 'Documents', href: '/documents' },
  { name: 'Analyse', href: '/analyse' },
  { name: 'Synthèse', href: '/synthese' },
]

export function DossierTabs({ dossierId }: DossierTabsProps) {
  const pathname = usePathname()
  const basePath = `/dossiers/${dossierId}`

  return (
    <div className="border-b border-gray-200 bg-white">
      <nav className="flex gap-0 px-6 overflow-x-auto" aria-label="Tabs">
        {tabs.map(tab => {
          const href = `${basePath}${tab.href}`
          const isActive = tab.href === '' 
            ? pathname === basePath
            : pathname.startsWith(`${basePath}${tab.href}`)

          return (
            <Link
              key={tab.name}
              href={href}
              className={`relative flex-shrink-0 py-4 px-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
