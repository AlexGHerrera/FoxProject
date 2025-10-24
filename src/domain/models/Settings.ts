/**
 * Modelo de dominio: Settings (Configuración del usuario)
 */

import type { Plan } from '@/config/constants'

export interface Settings {
  userId: string
  monthlyLimitCents: number
  plan: Plan
  timezone: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Datos para crear/actualizar settings
 */
export type UpdateSettingsData = Partial<
  Pick<Settings, 'monthlyLimitCents' | 'plan' | 'timezone'>
>

/**
 * Valida que el límite mensual sea válido
 */
export function isValidMonthlyLimit(cents: number): boolean {
  return cents >= 0 && cents <= 100000000 // máximo 1M EUR
}

