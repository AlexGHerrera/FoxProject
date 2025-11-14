/**
 * useFeedback Hook
 * Hook para operaciones de feedback
 */

import { useState, useCallback } from 'react'
import { SupabaseFeedbackRepository } from '@/adapters/db/SupabaseFeedbackRepository'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { submitFeedback } from '@/application/submitFeedback'
import type { CreateFeedbackData } from '@/adapters/db/IFeedbackRepository'

const feedbackRepository = new SupabaseFeedbackRepository(supabase)

export function useFeedback() {
  const { user } = useAuthStore()
  const { showSuccess, showError } = useUIStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(
    async (data: Omit<CreateFeedbackData, 'user_id'>) => {
      if (!user?.id) {
        showError('Debes estar autenticado para enviar feedback')
        return { success: false }
      }

      try {
        setIsSubmitting(true)

        await submitFeedback(
          {
            ...data,
            user_id: user.id,
          },
          feedbackRepository
        )

        showSuccess('Feedback enviado correctamente. ¡Gracias!')
        return { success: true }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al enviar feedback'
        showError(message)
        return { success: false, error }
      } finally {
        setIsSubmitting(false)
      }
    },
    [user, showSuccess, showError]
  )

  return {
    submit,
    isSubmitting,
  }
}

