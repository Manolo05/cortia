'use client'

import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

type KpiStatus = 'good' | 'warning' | 'danger' | 'neutral'
type KpiTrend = 'up' | 'down' | 'stable'

interface KpiCardProps {
  label: string
  value: string | number
  unit?: string
  status?: KpiStatus
  trend?: KpiTrend
  trendValue?: string
  description?: string
  icon?: LucideIcon
  threshold?: {
    good: number
    warning: number
  }
}

const STATUS_STYLES: Record<KpiStatus, { bg: string; text: string; border: string; badge: string }> = {
  good: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    badge: 'bg-green-100 text-green-700',
  },
  warning: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-700',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-700',
  },
  neutral: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    badge: 'bg-gray-100 text-gray-600',
  },
}

const STATUS_LABELS: Record<KpiStatus, string> = {
  good: 'Favorable',
  warning: 'À surveiller',
  danger: 'Risqué',
  neutral: 'Neutre',
}

export function KpiCard({
  label,
  value,
  unit,
  status = 'neutral',
  trend,
  trendValue,
  description,
  icon: Icon,
}: KpiCardProps) {
  const styles = STATUS_STYLES[status]

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400'

  return (
    <div className={`rounded-xl border p-5 ${styles.bg} ${styles.border}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className={`p-1.5 rounded-lg ${styles.badge}`}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${styles.badge}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className={`text-2xl font-bold ${styles.text}`}>
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </span>
        {unit && (
          <span className={`text-sm font-medium ${styles.text}`}>{unit}</span>
        )}
      </div>

      {(trend || description) && (
        <div className="mt-2 flex items-center gap-2">
          {trend && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-3.5 w-3.5" />
              {trendValue && (
                <span className="text-xs font-medium">{trendValue}</span>
              )}
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
      )}
    </div>
  )
}
