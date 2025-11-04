/**
 * useSettings Hook
 * Carga y actualiza configuración del usuario desde Supabase
 */

import { useState, useEffect, useCallback } from 'react'
import { SupabaseSettingsRepository } from '../adapters/db/SupabaseSettingsRepository'
import { supabase } from '../config/supabase'
import { useUIStore } from '../stores/useUIStore'
import { DEMO_USER_ID } from '../config/constants'
import { updateSettings } from '../application/updateSettings'
import type { Settings, UpdateSettingsData } from '../domain/models'

const settingsRepository = new SupabaseSettingsRepository(supabase)

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { showSuccess, showError } = useUIStore()

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // TODO: obtener userId real de auth cuando implementemos login
      const userId = DEMO_USER_ID

      const loadedSettings = await settingsRepository.get(userId)
      setSettings(loadedSettings)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al cargar configuración'
      console.error('[useSettings] Error:', errorMessage)
      setError(errorMessage)
      showError('No se pudo cargar la configuración')
    } finally {
      setIsLoading(false)
    }
  }, [showError])

  const updateSettingsData = useCallback(
    async (data: UpdateSettingsData) => {
      try {
        setIsLoading(true)
        setError(null)

        // TODO: obtener userId real de auth cuando implementemos login
        const userId = DEMO_USER_ID

        const updated = await updateSettings(userId, data, settingsRepository)
        setSettings(updated)
        showSuccess('Configuración guardada correctamente')
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al guardar configuración'
        console.error('[useSettings] Error:', errorMessage)
        setError(errorMessage)
        showError(errorMessage)
        throw err // Re-throw para que el componente pueda manejar el error
      } finally {
        setIsLoading(false)
      }
    },
    [showSuccess, showError]
  )

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    updateSettings: updateSettingsData,
  }
}

