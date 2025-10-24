/**
 * Reglas de negocio: Cálculo de presupuesto
 * Lógica pura sin dependencias externas
 */

import { BUDGET_THRESHOLDS } from '@/config/constants'

export interface BudgetStatus {
  totalSpentCents: number
  limitCents: number
  remainingCents: number
  percentageUsed: number
  status: 'ok' | 'warning' | 'alert'
}

/**
 * Calcula el estado del presupuesto mensual
 */
export function calculateBudgetStatus(
  totalSpentCents: number,
  limitCents: number
): BudgetStatus {
  const remainingCents = Math.max(0, limitCents - totalSpentCents)
  const percentageUsed = limitCents > 0 ? totalSpentCents / limitCents : 0

  let status: BudgetStatus['status'] = 'ok'
  if (percentageUsed >= BUDGET_THRESHOLDS.WARNING) {
    status = 'alert'
  } else if (percentageUsed >= BUDGET_THRESHOLDS.OK) {
    status = 'warning'
  }

  return {
    totalSpentCents,
    limitCents,
    remainingCents,
    percentageUsed,
    status,
  }
}

/**
 * Determina si se puede permitir un gasto adicional
 */
export function canAffordSpend(
  currentTotalCents: number,
  limitCents: number,
  newSpendCents: number
): boolean {
  if (limitCents === 0) return true // sin límite configurado
  return currentTotalCents + newSpendCents <= limitCents
}

/**
 * Calcula el gasto promedio diario del mes
 */
export function calculateDailyAverage(totalCents: number, daysInMonth: number): number {
  if (daysInMonth === 0) return 0
  return totalCents / daysInMonth
}

/**
 * Proyecta el gasto total del mes basado en los días transcurridos
 */
export function projectMonthlyTotal(
  currentTotalCents: number,
  daysPassed: number,
  daysInMonth: number
): number {
  if (daysPassed === 0 || daysInMonth === 0) return currentTotalCents
  const dailyAvg = currentTotalCents / daysPassed
  return Math.round(dailyAvg * daysInMonth)
}

