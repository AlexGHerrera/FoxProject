/**
 * Application: Check Budget Alerts
 * Verifica si deben enviarse alertas de presupuesto (70% o 90%)
 */

import type { ISpendRepository } from '@/adapters/db/ISpendRepository'

export interface BudgetAlertResult {
  shouldSend70: boolean
  shouldSend90: boolean
  currentPercent: number
}

/**
 * Verifica si debe enviarse alerta de presupuesto
 * 
 * @returns Objeto con flags de envío y porcentaje actual
 */
export async function checkBudgetAlert(
  userId: string,
  monthlyLimitCents: number,
  spendRepo: ISpendRepository,
  alertsSentThisMonth: { alert70: boolean; alert90: boolean }
): Promise<BudgetAlertResult> {
  if (monthlyLimitCents <= 0) {
    return { shouldSend70: false, shouldSend90: false, currentPercent: 0 }
  }

  try {
    // Calcular gasto del mes actual
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const spends = await spendRepo.list(userId, { limit: 1000 })
    const monthlySpends = spends.filter((s) => new Date(s.timestamp) >= monthStart)
    const totalSpent = monthlySpends.reduce((sum, s) => sum + s.amountCents, 0)

    const percent = (totalSpent / monthlyLimitCents) * 100

    console.log('[checkBudgetAlert]', {
      totalSpent,
      monthlyLimit: monthlyLimitCents,
      percent: percent.toFixed(1),
      alertsSent: alertsSentThisMonth,
    })

    return {
      shouldSend70: percent >= 70 && !alertsSentThisMonth.alert70,
      shouldSend90: percent >= 90 && !alertsSentThisMonth.alert90,
      currentPercent: percent,
    }
  } catch (error) {
    console.error('[checkBudgetAlert] Error:', error)
    return { shouldSend70: false, shouldSend90: false, currentPercent: 0 }
  }
}

