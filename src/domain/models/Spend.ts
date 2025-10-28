/**
 * Modelo de dominio: Spend (Gasto)
 * Representa un gasto registrado por el usuario
 */

import type { Category, PaymentMethod } from '@/config/constants'

export interface Spend {
  id: string
  userId: string
  amountCents: number
  currency: string
  category: Category
  merchant: string | null
  note: string | null
  paidWith: PaymentMethod | null
  timestamp: Date
}

/**
 * Datos necesarios para crear un nuevo gasto
 */
export type CreateSpendData = Omit<Spend, 'id' | 'timestamp'> & {
  timestamp?: Date
}

/**
 * Datos para actualizar un gasto existente (todos opcionales)
 */
export type UpdateSpendData = Partial<Omit<Spend, 'id' | 'userId' | 'timestamp'>>

/**
 * Resultado del parseo de IA
 */
export interface ParsedSpend {
  amountEur: number
  category: Category
  merchant: string
  note: string
  confidence: number // 0..1
}

/**
 * Convierte euros a céntimos
 */
export function eurToCents(eur: number): number {
  return Math.round(eur * 100)
}

/**
 * Convierte céntimos a euros
 */
export function centsToEur(cents: number): number {
  return cents / 100
}

/**
 * Valida que un gasto sea válido
 */
export function isValidSpend(spend: Partial<Spend>): spend is Spend {
  return !!(
    spend.id &&
    spend.userId &&
    typeof spend.amountCents === 'number' &&
    spend.amountCents >= 0 &&
    spend.currency &&
    spend.category &&
    spend.timestamp
  )
}

