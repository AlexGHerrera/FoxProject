/**
 * Interface: Settings Repository
 * Contrato para persistencia de configuración de usuario
 */

import type { Settings, UpdateSettingsData } from '@/domain/models'

export interface ISettingsRepository {
  /**
   * Obtiene la configuración del usuario
   */
  get(userId: string): Promise<Settings | null>

  /**
   * Crea o actualiza la configuración del usuario
   */
  upsert(userId: string, data: UpdateSettingsData): Promise<Settings>

  /**
   * Elimina la configuración del usuario
   */
  delete(userId: string): Promise<void>
}

