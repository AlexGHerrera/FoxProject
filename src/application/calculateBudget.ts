/**
 * Caso de uso: Calculate Budget
 * Calcula el estado del presupuesto del usuario
 */

import type { ISpendRepository } from '@/adapters/db/ISpendRepository'
import type { ISettingsRepository } from '@/adapters/db/ISettingsRepository'
import { calculateBudgetStatus, type BudgetStatus } from '@/domain/rules/budgetCalculator'
import { startOfMonth, endOfMonth } from 'date-fns'

/**
 * Calcula el presupuesto del mes actual
 */
export async function calculateCurrentMonthBudget(
  userId: string,
  spendRepository: ISpendRepository,
  settingsRepository: ISettingsRepository
): Promise<BudgetStatus> {
  // Obtener configuración del usuario
  const settings = await settingsRepository.get(userId)
  if (!settings) {
    throw new Error('Usuario sin configuración de presupuesto')
  }

  // Calcular rango del mes actual
  const now = new Date()
  const startDate = startOfMonth(now)
  const endDate = endOfMonth(now)

  // Obtener total de gastos del mes
  const totalSpentCents = await spendRepository.getTotalInRange(
    userId,
    startDate,
    endDate
  )

  // Calcular estado del presupuesto
  return calculateBudgetStatus(totalSpentCents, settings.monthlyLimitCents)
}

/**
 * Calcula el presupuesto de un mes específico
 */
export async function calculateMonthBudget(
  userId: string,
  year: number,
  month: number, // 0-11 (enero = 0)
  spendRepository: ISpendRepository,
  settingsRepository: ISettingsRepository
): Promise<BudgetStatus> {
  const settings = await settingsRepository.get(userId)
  if (!settings) {
    throw new Error('Usuario sin configuración de presupuesto')
  }

  const startDate = new Date(year, month, 1)
  const endDate = endOfMonth(startDate)

  const totalSpentCents = await spendRepository.getTotalInRange(
    userId,
    startDate,
    endDate
  )

  return calculateBudgetStatus(totalSpentCents, settings.monthlyLimitCents)
}

