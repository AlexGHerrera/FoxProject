/**
 * Caso de uso: Actualizar configuración del usuario
 * 
 * @param userId - ID del usuario propietario
 * @param data - Datos parciales a actualizar
 * @param repository - Repositorio de settings
 * @returns Settings actualizado
 */

import type { Settings, UpdateSettingsData } from '@/domain/models'
import { isValidMonthlyLimit } from '@/domain/models'
import type { ISettingsRepository } from '@/adapters/db/ISettingsRepository'

export async function updateSettings(
  userId: string,
  data: UpdateSettingsData,
  repository: ISettingsRepository
): Promise<Settings> {
  try {
    // Validar que hay datos para actualizar
    if (Object.keys(data).length === 0) {
      throw new Error('No data to update')
    }

    // Validar monthlyLimitCents si está presente
    if (data.monthlyLimitCents !== undefined) {
      if (!isValidMonthlyLimit(data.monthlyLimitCents)) {
        throw new Error('Invalid monthly limit. Must be between 0 and 1,000,000 EUR')
      }
    }

    // Actualizar en el repositorio
    const updated = await repository.upsert(userId, data)

    return updated
  } catch (error) {
    throw error
  }
}

