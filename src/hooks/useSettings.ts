/**
 * useSettings Hook
 * Carga y actualiza configuración del usuario desde Supabase
 * Usa Zustand store para estado global
 */

import { useState, useEffect, useCallback } from 'react'
import { SupabaseSettingsRepository } from '../adapters/db/SupabaseSettingsRepository'
import { supabase } from '../config/supabase'
import { useUIStore } from '../stores/useUIStore'
import { useSettingsStore } from '../stores/useSettingsStore'
import { DEMO_USER_ID } from '../config/constants'
import { updateSettings } from '../application/updateSettings'
import type { UpdateSettingsData } from '../domain/models'

const settingsRepository = new SupabaseSettingsRepository(supabase)

export function useSettings() {
  const [error, setError] = useState<string | null>(null)
  const { showSuccess, showError } = useUIStore()
  
  // Usar store global de Zustand
  const { settings, isLoading, setSettings, setLoading } = useSettingsStore()

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
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
      setLoading(false)
    }
  }, [showError, setSettings, setLoading])

  const updateSettingsData = useCallback(
    async (data: UpdateSettingsData) => {
      try {
        setLoading(true)
        setError(null)

        // TODO: obtener userId real de auth cuando implementemos login
        const userId = DEMO_USER_ID

        const updated = await updateSettings(userId, data, settingsRepository)
        setSettings(updated) // Actualiza el store global
        showSuccess('Configuración guardada correctamente')
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Error al guardar configuración'
        console.error('[useSettings] Error:', errorMessage)
        setError(errorMessage)
        showError(errorMessage)
        throw err // Re-throw para que el componente pueda manejar el error
      } finally {
        setLoading(false)
      }
    },
    [showSuccess, showError, setSettings, setLoading]
  )

  useEffect(() => {
    // Cargar settings al montar si no están ya cargados
    if (!settings) {
      loadSettings()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    settings,
    isLoading,
    error,
    loadSettings,
    updateSettings: updateSettingsData,
  }
}

