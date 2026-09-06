import { type ReactNode } from 'react'

type Trend = 'up' | 'down' | 'neutral'

interface StatCardProps {
  label: string
  value: string | number
  icon: ReactNode
  iconBg?: string
  trend?: Trend
  trendValue?: string
  trendLabel?: string
  className?: string
}

const trendConfig: Record<Trend, { color: string; icon: string }> = {
  up:      { color: 'text-primary-600', icon: '↑' },
  down:    { color: 'text-error',       icon: '↓' },
  neutral: { color: 'text-text-tertiary', icon: '→' },
}

export function StatCard({ label, value, icon, iconBg = 'bg-primary-50', trend, trendValue, trendLabel, className = '' }: StatCardProps) {
  const trendCfg = trend ? trendConfig[trend] : null

  return (
    <div className={`bg-surface border border-border rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-border-strong transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`} aria-hidden>
          {icon}
        </div>
        {trendCfg && trendValue && (
          <span className={`text-xs font-semibold font-mono ${trendCfg.color} flex items-center gap-0.5`}>
            <span aria-hidden>{trendCfg.icon}</span>
            {trendValue}
          </span>
        )}
      </div>

      <p className="text-3xl font-bold font-display text-text-primary tracking-tight leading-none" aria-label={`${label}: ${value}`}>
        {value}
      </p>
      <p className="text-sm text-text-secondary font-medium mt-1">{label}</p>
      {trendLabel && (
        <p className="text-xs text-text-tertiary mt-1">{trendLabel}</p>
      )}
    </div>
  )
}
