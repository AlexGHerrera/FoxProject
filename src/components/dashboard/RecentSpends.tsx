/**
 * RecentSpends Component
 * Muestra los últimos gastos registrados
 */

import { useMemo } from 'react'
import type { Spend } from '@/domain/models'
import { centsToEur, getCategoryEmoji } from '@/domain/models'

interface RecentSpendsProps {
  spends: Spend[]
  limit?: number // número de gastos a mostrar
  onViewAll?: () => void
}

export function RecentSpends({ spends, limit = 5, onViewAll }: RecentSpendsProps) {
  // Ordenar por timestamp más reciente y limitar
  const recentSpends = useMemo(() => {
    return [...spends]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }, [spends, limit])

  if (spends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-light dark:text-muted-dark mb-2">
          🎤 Aún no hay gastos registrados
        </p>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Usa el botón de micrófono para empezar
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
          Gastos recientes
        </h2>
        {onViewAll && spends.length > limit && (
          <button
            onClick={onViewAll}
            className="text-sm text-brand-cyan dark:text-brand-cyan-dark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan rounded px-2 py-1"
          >
            Ver todos →
          </button>
        )}
      </div>

      {/* Lista de gastos */}
      <div className="space-y-2">
        {recentSpends.map((spend) => (
          <SpendCard key={spend.id} spend={spend} />
        ))}
      </div>
    </div>
  )
}

/**
 * SpendCard - Tarjeta individual de gasto
 */
interface SpendCardProps {
  spend: Spend
}

function SpendCard({ spend }: SpendCardProps) {
  const amountEur = useMemo(() => centsToEur(spend.amountCents), [spend.amountCents])
  const emoji = getCategoryEmoji(spend.category)

  // Formatear timestamp relativo (ej: "hace 2h")
  const timeAgo = useMemo(() => {
    const now = new Date()
    const diff = now.getTime() - spend.timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days === 1) return 'Ayer'
    return `Hace ${days}d`
  }, [spend.timestamp])

  return (
    <div className="flex items-center gap-3 p-3 bg-surface-light dark:bg-surface-dark rounded-xl hover:bg-chip-bg-light dark:hover:bg-chip-bg-dark transition-colors">
      {/* Emoji de categoría */}
      <div className="text-2xl" aria-hidden="true">
        {emoji}
      </div>

      {/* Info del gasto */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">
          {spend.merchant || spend.category}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark">
          <span>{spend.category}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      </div>

      {/* Monto */}
      <div className="text-right">
        <p className="text-base font-bold text-text-light dark:text-text-dark">
          {amountEur.toFixed(2)}€
        </p>
        {spend.paidWith && (
          <p className="text-xs text-muted-light dark:text-muted-dark">
            {spend.paidWith}
          </p>
        )}
      </div>
    </div>
  )
}

