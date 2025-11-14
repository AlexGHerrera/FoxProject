/**
 * Application: Generate Summary
 * Genera resúmenes semanales/mensuales con top 3 categorías
 */

import type { ISpendRepository } from '@/adapters/db/ISpendRepository'

export interface SummaryData {
  totalSpent: number
  topCategories: Array<{ category: string; amount: number }>
}

/**
 * Genera un resumen semanal de gastos
 * 
 * @returns Datos del resumen con total y top 3 categorías
 */
export async function generateWeeklySummary(
  userId: string,
  spendRepo: ISpendRepository
): Promise<SummaryData> {
  try {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)

    const spends = await spendRepo.list(userId, { limit: 1000 })
    const weeklySpends = spends.filter((s) => new Date(s.timestamp) >= weekStart)

    const totalSpent = weeklySpends.reduce((sum, s) => sum + s.amountCents, 0)

    // Agrupar por categoría
    const categoryMap = new Map<string, number>()
    weeklySpends.forEach((spend) => {
      const current = categoryMap.get(spend.category) || 0
      categoryMap.set(spend.category, current + spend.amountCents)
    })

    // Top 3
    const topCategories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)

    console.log('[generateWeeklySummary]', {
      totalSpent,
      topCategories,
      weeklySpends: weeklySpends.length,
    })

    return { totalSpent, topCategories }
  } catch (error) {
    console.error('[generateWeeklySummary] Error:', error)
    return { totalSpent: 0, topCategories: [] }
  }
}

/**
 * Genera un resumen mensual de gastos
 * 
 * @returns Datos del resumen con total y top 3 categorías
 */
export async function generateMonthlySummary(
  userId: string,
  spendRepo: ISpendRepository
): Promise<SummaryData> {
  try {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const spends = await spendRepo.list(userId, { limit: 1000 })
    const monthlySpends = spends.filter((s) => new Date(s.timestamp) >= monthStart)

    const totalSpent = monthlySpends.reduce((sum, s) => sum + s.amountCents, 0)

    // Agrupar por categoría
    const categoryMap = new Map<string, number>()
    monthlySpends.forEach((spend) => {
      const current = categoryMap.get(spend.category) || 0
      categoryMap.set(spend.category, current + spend.amountCents)
    })

    // Top 3
    const topCategories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)

    console.log('[generateMonthlySummary]', {
      totalSpent,
      topCategories,
      monthlySpends: monthlySpends.length,
    })

    return { totalSpent, topCategories }
  } catch (error) {
    console.error('[generateMonthlySummary] Error:', error)
    return { totalSpent: 0, topCategories: [] }
  }
}

