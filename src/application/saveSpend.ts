/**
 * Caso de uso: Save Spend
 * Guarda un gasto en la base de datos
 */

import type { ISpendRepository } from '@/adapters/db/ISpendRepository'
import type { Spend, CreateSpendData, ParsedSpend } from '@/domain/models'
import { eurToCents } from '@/domain/models'

/**
 * Guarda un gasto parseado en la base de datos
 */
export async function saveSpend(
  userId: string,
  parsedSpend: ParsedSpend,
  repository: ISpendRepository,
  options: {
    paidWith?: 'efectivo' | 'tarjeta'
    customTimestamp?: Date
  } = {}
): Promise<Spend> {
  const spendData: CreateSpendData = {
    userId,
    amountCents: eurToCents(parsedSpend.amountEur),
    currency: 'EUR',
    category: parsedSpend.category,
    merchant: parsedSpend.merchant || null,
    note: parsedSpend.note || null,
    paidWith: options.paidWith || null,
    timestamp: options.customTimestamp,
  }

  // Validación
  if (spendData.amountCents <= 0) {
    throw new Error('El importe debe ser mayor que 0')
  }

  return await repository.create(spendData)
}

/**
 * Actualiza un gasto existente
 */
export async function updateSpend(
  id: string,
  userId: string,
  updates: Partial<CreateSpendData>,
  repository: ISpendRepository
): Promise<Spend> {
  return await repository.update(id, userId, updates as Partial<Spend>)
}

/**
 * Elimina un gasto (para el "Deshacer")
 */
export async function deleteSpend(
  id: string,
  userId: string,
  repository: ISpendRepository
): Promise<void> {
  return await repository.delete(id, userId)
}

