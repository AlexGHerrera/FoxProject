/**
 * BudgetBar Component
 * Muestra el progreso del presupuesto mensual con colores dinámicos
 */

import { useMemo } from 'react'
import { centsToEur } from '@/domain/models'

interface BudgetBarProps {
  spent: number // céntimos
  limit: number // céntimos
  percentage: number // 0-100
  status: 'ok' | 'warning' | 'alert'
}

export function BudgetBar({ spent, limit, percentage, status }: BudgetBarProps) {
  const spentEur = useMemo(() => centsToEur(spent), [spent])
  const limitEur = useMemo(() => centsToEur(limit), [limit])

  // Color según status
  const barColor = useMemo(() => {
    switch (status) {
      case 'ok':
        return 'bg-success'
      case 'warning':
        return 'bg-warning'
      case 'alert':
        return 'bg-danger'
    }
  }, [status])

  // Limitar percentage a máximo 100 para el ancho visual
  const visualPercentage = Math.min(percentage, 100)

  return (
    <div className="w-full">
      {/* Header: porcentaje y monto */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted">
          {percentage.toFixed(0)}% del límite
        </span>
        <span className="text-lg font-bold text-text">
          {spentEur.toFixed(2)}€ / {limitEur.toFixed(2)}€
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="relative w-full h-3 bg-divider rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full ${barColor} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${visualPercentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
            aria-label={`Gastado ${percentage.toFixed(0)}% del presupuesto mensual`}
        />
      </div>

      {/* Mensaje de estado */}
      {status === 'warning' && (
        <p className="text-xs text-warning mt-2">
          ⚠️ Estás cerca del límite mensual
        </p>
      )}
      {status === 'alert' && (
        <p className="text-xs text-danger mt-2">
          🚨 Has alcanzado o superado el límite mensual
        </p>
      )}
    </div>
  )
}

