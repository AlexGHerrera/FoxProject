/**
 * submitFeedback Use Case
 * Caso de uso para enviar feedback
 */

import type { IFeedbackRepository } from '@/adapters/db/IFeedbackRepository'
import type { CreateFeedbackData } from '@/adapters/db/IFeedbackRepository'

export async function submitFeedback(
  data: CreateFeedbackData,
  repository: IFeedbackRepository
) {
  if (!data.message || data.message.trim().length === 0) {
    throw new Error('El mensaje es requerido')
  }

  if (data.message.length > 1000) {
    throw new Error('El mensaje no puede exceder 1000 caracteres')
  }

  return await repository.create(data)
}

