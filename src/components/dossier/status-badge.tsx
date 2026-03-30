import type { StatutDossier } from '@/lib/types'
import { couleurStatut, libelleStatut } from '@/lib/utils/format'

interface StatusBadgeProps {
  statut: StatutDossier
  size?: 'sm' | 'md'
}

export function StatusBadge({ statut, size = 'md' }: StatusBadgeProps) {
  const classes = couleurStatut(statut)
  const label = libelleStatut(statut)
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-0.5 text-xs'

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${classes} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {label}
    </span>
  )
}
