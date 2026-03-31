'use client'

interface ScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
}

const SIZE_CONFIG = {
  sm: { diameter: 80, strokeWidth: 6, fontSize: 'text-lg', labelSize: 'text-xs' },
  md: { diameter: 120, strokeWidth: 8, fontSize: 'text-2xl', labelSize: 'text-sm' },
  lg: { diameter: 160, strokeWidth: 10, fontSize: 'text-3xl', labelSize: 'text-base' },
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e' // green-500
  if (score >= 60) return '#3b82f6' // blue-500
  if (score >= 40) return '#f59e0b' // amber-500
  return '#ef4444' // red-500
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Bon'
  if (score >= 40) return 'Moyen'
  return 'Faible'
}

export function ScoreRing({
  score,
  size = 'md',
  showLabel = true,
  label,
}: ScoreRingProps) {
  const config = SIZE_CONFIG[size]
  const radius = (config.diameter - config.strokeWidth * 2) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color = getScoreColor(score)
  const scoreLabel = label || getScoreLabel(score)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: config.diameter, height: config.diameter }}>
        <svg
          width={config.diameter}
          height={config.diameter}
          className="-rotate-90"
          viewBox={`0 0 ${config.diameter} ${config.diameter}`}
        >
          {/* Background circle */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={config.strokeWidth}
          />
          {/* Score arc */}
          <circle
            cx={config.diameter / 2}
            cy={config.diameter / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={config.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={`font-bold ${config.fontSize}`}
            style={{ color }}
          >
            {score}
          </span>
          <span className="text-xs text-gray-500">/100</span>
        </div>
      </div>
      {showLabel && (
        <span
          className={`font-semibold ${config.labelSize}`}
          style={{ color }}
        >
          {scoreLabel}
        </span>
      )}
    </div>
  )
}
