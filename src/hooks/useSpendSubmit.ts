/**
 * useSpendSubmit Hook
 * Orquesta el flujo completo: transcript → parse → save
 * Conecta: UI → Use Cases (parseSpend, saveSpend) → Adapters
 */

import { useState, useCallback } from 'react'
import { parseSpend } from '../application/parseSpend'
import { saveSpend } from '../application/saveSpend'
import { DeepSeekProvider } from '../adapters/ai/DeepSeekProvider'
import { MockAIProvider } from '../adapters/ai/MockAIProvider'
import { SupabaseSpendRepository } from '../adapters/db/SupabaseSpendRepository'
import { supabase } from '../config/supabase'
import { useSpendStore } from '../stores/useSpendStore'
import { useVoiceStore } from '../stores/useVoiceStore'
import { useUIStore } from '../stores/useUIStore'
import { env } from '../config/env'
import { DEMO_USER_ID } from '../config/constants'
import type { ParsedSpend } from '../adapters/ai/IAIProvider'

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
  const [parsedSpend, setParsedSpend] = useState<ParsedSpend | null>(null)
  
  const { addSpend } = useSpendStore()
  const { setState: setVoiceState, reset: resetVoice } = useVoiceStore()
  const { showSuccess, showError } = useUIStore()

  /**
   * Parse transcript usando IA
   */
  const parseTranscript = useCallback(async (transcript: string) => {
    if (!transcript || transcript.length < 3) {
      showError('El texto es demasiado corto')
      return null
    }

    try {
      setIsSubmitting(true)
      setVoiceState('processing')

      const startTime = performance.now()
      const parsed = await parseSpend(transcript, aiProvider)
      const latency = Math.round(performance.now() - startTime)

      console.log('[useSpendSubmit] Parsed:', {
        parsed,
        latency: `${latency}ms`,
      })

      setParsedSpend(parsed)
      return parsed
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
   * Guardar gasto (después de confirmar)
   */
  const submitSpend = useCallback(
    async (parsed: ParsedSpend) => {
      try {
        setIsSubmitting(true)

        // TODO: obtener userId real de auth cuando implementemos login
        // Por ahora usamos un UUID fijo para testing
        const userId = DEMO_USER_ID

        const spend = await saveSpend(
          userId,
          parsed,
          spendRepository,
          {
            paidWith: null, // TODO: extraer del transcript si se menciona
          }
        )

        // Añadir al store local
        addSpend(spend)

        // Success state
        setVoiceState('success')
        showSuccess('Gasto guardado correctamente')
        
        // Reset después de 2s
        setTimeout(() => {
          resetVoice()
          setParsedSpend(null)
        }, 2000)

        return spend
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error al guardar'
        console.error('[useSpendSubmit] Save error:', errorMessage)
        showError(errorMessage)
        setVoiceState('error')
        return null
      } finally {
        setIsSubmitting(false)
      }
    },
    [addSpend, setVoiceState, showSuccess, showError, resetVoice]
  )

  /**
   * Flujo completo: parse + auto-submit si confidence >= 0.8
   */
  const handleTranscript = useCallback(
    async (transcript: string, autoConfirm = true) => {
      const parsed = await parseTranscript(transcript)
      
      if (!parsed) return null

      // Auto-confirm si confidence >= 0.8
      if (autoConfirm && parsed.confidence >= 0.8) {
        return await submitSpend(parsed)
      }

      // Sino, esperar confirmación manual
      return parsed
    },
    [parseTranscript, submitSpend]
  )

  return {
    isSubmitting,
    parsedSpend,
    parseTranscript,
    submitSpend,
    handleTranscript,
  }
}

