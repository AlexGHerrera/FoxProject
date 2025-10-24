/**
 * useBudgetProgress Hook
 * Calcula el progreso del presupuesto mensual
 * Usa: domain/rules/budgetCalculator
 */

import { useMemo } from 'react'
import { useSpendStore } from '../stores/useSpendStore'
import { calculateBudgetProgress, getRemainingBudget } from '../domain/rules/budgetCalculator'

interface BudgetProgress {
  spent: number // céntimos
  limit: number // céntimos
  percentage: number // 0-100
  remaining: number // céntimos
  status: 'ok' | 'warning' | 'alert' // <70%, 70-90%, >90%
  daysLeft: number
  daysInMonth: number
  averageDaily: number // gasto promedio diario
  recommendedDaily: number // gasto diario recomendado para no pasarse
}

export function useBudgetProgress(monthlyLimitCents: number): BudgetProgress {
  const { spends } = useSpendStore()

  return useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()

    // Calcular días del mes
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const currentDay = now.getDate()
    const daysLeft = daysInMonth - currentDay

    // Filtrar gastos del mes actual
    const monthStart = new Date(year, month, 1)
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59)

    const monthSpends = spends.filter((spend) => {
      const spendDate = new Date(spend.ts)
      return spendDate >= monthStart && spendDate <= monthEnd
    })

    // Calcular totales
    const totalSpent = monthSpends.reduce((acc, s) => acc + s.amount_cents, 0)
    const progress = calculateBudgetProgress(totalSpent, monthlyLimitCents)
    const remaining = getRemainingBudget(totalSpent, monthlyLimitCents)

    // Status según porcentaje
    let status: BudgetProgress['status'] = 'ok'
    if (progress >= 90) {
      status = 'alert'
    } else if (progress >= 70) {
      status = 'warning'
    }

    // Promedios
    const averageDaily = currentDay > 0 ? totalSpent / currentDay : 0
    const recommendedDaily = daysLeft > 0 ? remaining / daysLeft : 0

    return {
      spent: totalSpent,
      limit: monthlyLimitCents,
      percentage: progress,
      remaining,
      status,
      daysLeft,
      daysInMonth,
      averageDaily,
      recommendedDaily: Math.max(0, recommendedDaily),
    }
  }, [spends, monthlyLimitCents])
}

