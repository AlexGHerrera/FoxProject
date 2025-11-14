/**
 * useSpendSubmit Hook
 * Orquesta el flujo completo: transcript → parse → save
 * Conecta: UI → Use Cases (parseSpend, saveSpend) → Adapters
 */

import { useState, useCallback } from 'react'
import { parseSpend } from '../application/parseSpend'
import { saveSpend } from '../application/saveSpend'
import { parseDateExpression } from '../application/parseDateExpression'
import { DeepSeekProvider } from '../adapters/ai/DeepSeekProvider'
import { MockAIProvider } from '../adapters/ai/MockAIProvider'
import { SupabaseSpendRepository } from '../adapters/db/SupabaseSpendRepository'
import { supabase } from '../config/supabase'
import { useSpendStore } from '../stores/useSpendStore'
import { useVoiceStore } from '../stores/useVoiceStore'
import { useUIStore } from '../stores/useUIStore'
import { useAuthStore } from '../stores/useAuthStore'
import { env } from '../config/env'
import type { ParsedSpend, ParsedSpendResult } from '../domain/models'

// Initialize providers (only once)
// Si no hay API key de DeepSeek, usar MockAIProvider
const hasDeepSeekKey = env.deepseek?.apiKey && env.deepseek.apiKey.length > 0
const aiProvider = hasDeepSeekKey
  ? new DeepSeekProvider({ apiKey: env.deepseek.apiKey })
  : new MockAIProvider()

const spendRepository = new SupabaseSpendRepository(supabase)

// Log provider usado
console.log('[useSpendSubmit] AI Provider:', hasDeepSeekKey ? 'DeepSeek' : 'Mock (demo mode)')

export function useSpendSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [parsedResult, setParsedResult] = useState<ParsedSpendResult | null>(null)
  
  const { addSpend } = useSpendStore()
  const { setState: setVoiceState, reset: resetVoice } = useVoiceStore()
  const { showSuccess, showError } = useUIStore()
  const { user } = useAuthStore()

  /**
   * Parse transcript usando IA con fallback automático
   * RETORNA: ParsedSpendResult con array de 1 o más gastos
   */
  const parseTranscript = useCallback(async (transcript: string): Promise<ParsedSpendResult | null> => {
    if (!transcript || transcript.length < 3) {
      showError('El texto es demasiado corto')
      return null
    }

    try {
      setIsSubmitting(true)
      setVoiceState('processing')

      const startTime = performance.now()
      
      // Intentar con el provider principal
      let result: ParsedSpendResult | null = null
      try {
        result = await parseSpend(transcript, aiProvider)
      } catch (primaryError) {
        console.warn('[useSpendSubmit] Primary AI provider failed, trying fallback...', primaryError)
        
        // Si DeepSeek falla, usar MockAIProvider como fallback
        if (hasDeepSeekKey) {
          const fallbackProvider = new MockAIProvider()
          result = await parseSpend(transcript, fallbackProvider)
          showError('DeepSeek falló, usando parser local básico')
        } else {
          throw primaryError
        }
      }
      
      const latency = Math.round(performance.now() - startTime)

      console.log('[useSpendSubmit] Parsed:', {
        spendCount: result.spends.length,
        totalConfidence: result.totalConfidence,
        latency: `${latency}ms`,
        result,
      })

      setParsedResult(result)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al procesar'
      console.error('[useSpendSubmit] Parse error:', errorMessage)
      showError(errorMessage)
      setVoiceState('error')
      return null
    } finally {
      setIsSubmitting(false)
    }
  }, [setVoiceState, showError])

  /**
   * Guardar UN gasto (después de confirmar)
   */
  const submitSpend = useCallback(
    async (parsed: ParsedSpend) => {
      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }

      try {
        setIsSubmitting(true)

        // Parsear fecha si existe
        const timestamp = parsed.date
          ? parseDateExpression(parsed.date) || new Date()
          : new Date()

        const spend = await saveSpend(
          user.id,
          parsed,
          spendRepository,
          {
            paidWith: parsed.paidWith,
            timestamp,
          }
        )

        // Añadir al store local
        addSpend(spend)

        return spend
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al guardar'
        console.error('[useSpendSubmit] Save error:', errorMessage)
        showError(errorMessage)
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [user, addSpend, showError]
  )

  /**
   * Guardar MÚLTIPLES gastos
   */
  const submitMultipleSpends = useCallback(
    async (spends: ParsedSpend[]) => {
      try {
        setIsSubmitting(true)

        const savedSpends = await Promise.all(
          spends.map(spend => submitSpend(spend))
        )

        // Success state
        setVoiceState('success')
        const count = savedSpends.length
        showSuccess(`${count} gasto${count > 1 ? 's' : ''} guardado${count > 1 ? 's' : ''} correctamente`)
        
        // Reset después de 2s
        setTimeout(() => {
          resetVoice()
          setParsedResult(null)
        }, 2000)

        return savedSpends
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al guardar'
        console.error('[useSpendSubmit] Save multiple error:', errorMessage)
        showError(errorMessage)
        setVoiceState('error')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [submitSpend, setVoiceState, showSuccess, showError, resetVoice]
  )

  /**
   * Flujo completo: parse + auto-submit si confidence alta
   */
  const handleTranscript = useCallback(
    async (transcript: string, autoConfirm = true) => {
      const result = await parseTranscript(transcript)
      
      if (!result || result.spends.length === 0) return null

      // Auto-confirm si confidence >= 0.95 (muy conservador para múltiples gastos)
      const shouldAutoConfirm = autoConfirm && result.totalConfidence >= 0.95
      
      if (shouldAutoConfirm) {
        console.log('[useSpendSubmit] Auto-confirming (high confidence)', {
          count: result.spends.length,
          confidence: result.totalConfidence,
        })
        return await submitMultipleSpends(result.spends)
      }

      // Sino, esperar confirmación manual
      return result
    },
    [parseTranscript, submitMultipleSpends]
  )

  return {
    isSubmitting,
    parsedResult,
    parseTranscript,
    submitSpend,
    submitMultipleSpends,
    handleTranscript,
  }
}

