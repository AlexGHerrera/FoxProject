/**
 * useAdminData Hook
 * Hook para cargar datos del panel de administración
 */

import { useState, useEffect, useCallback } from 'react'
import { SupabaseAdminRepository } from '@/adapters/db/SupabaseAdminRepository'
import { supabase } from '@/config/supabase'
import type { AdminMetrics, AdminError, AdminFeedback, AdminUser } from '@/adapters/db/IAdminRepository'

const adminRepository = new SupabaseAdminRepository(supabase)

export function useAdminData() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [errors, setErrors] = useState<AdminError[]>([])
  const [feedback, setFeedback] = useState<AdminFeedback[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMetrics = useCallback(async () => {
    try {
      const data = await adminRepository.getMetrics()
      setMetrics(data)
    } catch (err) {
      console.error('[useAdminData] Error loading metrics:', err)
      setError('Error al cargar métricas')
    }
  }, [])

  const loadErrors = useCallback(async () => {
    try {
      const data = await adminRepository.getRecentErrors(50)
      setErrors(data)
    } catch (err) {
      console.error('[useAdminData] Error loading errors:', err)
    }
  }, [])

  const loadFeedback = useCallback(async () => {
    try {
      const data = await adminRepository.getPendingFeedback()
      setFeedback(data)
    } catch (err) {
      console.error('[useAdminData] Error loading feedback:', err)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      const data = await adminRepository.getActiveUsers(30)
      setUsers(data)
    } catch (err) {
      console.error('[useAdminData] Error loading users:', err)
    }
  }, [])

  const updateFeedbackStatus = useCallback(
    async (id: string, status: 'pending' | 'reviewed' | 'resolved', adminNotes?: string) => {
      try {
        await adminRepository.updateFeedbackStatus(id, status, adminNotes)
        await loadFeedback() // Recargar feedback
      } catch (err) {
        console.error('[useAdminData] Error updating feedback:', err)
        throw err
      }
    },
    [loadFeedback]
  )

  const loadAll = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    await Promise.all([loadMetrics(), loadErrors(), loadFeedback(), loadUsers()])
    setIsLoading(false)
  }, [loadMetrics, loadErrors, loadFeedback, loadUsers])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  return {
    metrics,
    errors,
    feedback,
    users,
    isLoading,
    error,
    refresh: loadAll,
    updateFeedbackStatus,
  }
}

