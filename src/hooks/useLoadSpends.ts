/**
 * useLoadSpends Hook
 * Carga gastos desde Supabase al montar el componente
 */

import { useEffect } from 'react'
import { useSpendStore } from '../stores/useSpendStore'
import { SupabaseSpendRepository } from '../adapters/db/SupabaseSpendRepository'
import { supabase } from '../config/supabase'
import { useUIStore } from '../stores/useUIStore'

const spendRepository = new SupabaseSpendRepository(supabase)

export function useLoadSpends() {
  const { setSpends, setIsLoading, setError } = useSpendStore()
  const { showError } = useUIStore()

  useEffect(() => {
    const loadSpends = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // TODO: obtener userId real de auth cuando implementemos login
        const userId = '00000000-0000-0000-0000-000000000001'

        // Cargar últimos 100 gastos
        const spends = await spendRepository.list(userId)

        setSpends(spends)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error al cargar gastos'
        console.error('[useLoadSpends] Error:', errorMessage)
        setError(errorMessage)
        showError('No se pudieron cargar los gastos')
      } finally {
        setIsLoading(false)
      }
    }

    loadSpends()
  }, [setSpends, setIsLoading, setError, showError])
}

