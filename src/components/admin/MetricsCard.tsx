/**
 * MetricsCard Component
 * Card que muestra una métrica del panel de administración
 */

import { LucideIcon } from 'lucide-react'

interface MetricsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
}

export function MetricsCard({ title, value, icon: Icon, subtitle }: MetricsCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted mb-1">{title}</p>
          <p className="text-2xl font-bold text-text">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-cyan/10 dark:bg-brand-cyan/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-brand-cyan" strokeWidth={2.5} />
        </div>
      </div>
    </div>
  )
}

