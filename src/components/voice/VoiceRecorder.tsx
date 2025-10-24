/**
 * VoiceRecorder Component
 * Componente principal que orquesta el flujo completo de voz
 * Integra: MicButton, TranscriptDisplay, ConfirmModal
 */

import { useEffect, useState } from 'react'
import { useVoiceStore } from '../../stores/useVoiceStore'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpendSubmit } from '../../hooks/useSpendSubmit'
import { useUIStore } from '../../stores/useUIStore'
import { env } from '../../config/env'
import { MicButton } from './MicButton'
import { TranscriptDisplay } from './TranscriptDisplay'
import { ConfirmModal } from './ConfirmModal'
import type { ParsedSpend } from '../../adapters/ai/IAIProvider'

interface VoiceRecorderProps {
  onClose?: () => void
}

export function VoiceRecorder({ onClose }: VoiceRecorderProps = {}) {
  const { transcript, state } = useVoiceStore()
  const { isRecording } = useSpeechRecognition()
  const { parseTranscript, submitSpend, parsedSpend } = useSpendSubmit()
  const { addToast, removeToast } = useUIStore()
  
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingSpend, setPendingSpend] = useState<ParsedSpend | null>(null)
  const [lastSavedSpendId, setLastSavedSpendId] = useState<string | null>(null)
  
  const isUsingMock = !env.deepseek?.apiKey || env.deepseek.apiKey.length === 0

  // Auto-parse cuando el estado cambia a 'processing'
  useEffect(() => {
    if (state === 'processing' && transcript && transcript.length > 3) {
      console.log('[VoiceRecorder] Auto-parsing transcript (state=processing):', transcript)
      handleParse()
    }
  }, [state, transcript])

  const handleParse = async () => {
    if (!transcript) {
      console.warn('[VoiceRecorder] handleParse called without transcript')
      return
    }

    console.log('[VoiceRecorder] Starting parse for:', transcript)

    try {
      const parsed = await parseTranscript(transcript)
      
      console.log('[VoiceRecorder] Parse result:', parsed)
      
      if (!parsed) {
        console.warn('[VoiceRecorder] Parse returned null')
        return
      }

      // Auto-confirm si confidence >= 0.8
      if (parsed.confidence >= 0.8) {
        console.log('[VoiceRecorder] Auto-confirming (confidence >= 0.8)')
        const spend = await submitSpend(parsed)
        if (spend) {
          setLastSavedSpendId(spend.id)
          showUndoToast(spend.id)
        }
      } else {
        // Mostrar modal de confirmación
        console.log('[VoiceRecorder] Showing confirm modal (confidence < 0.8)')
        setPendingSpend(parsed)
        setShowConfirmModal(true)
      }
    } catch (error) {
      console.error('[VoiceRecorder] Error in handleParse:', error)
    }
  }

  const handleConfirm = async (spend: ParsedSpend) => {
    const savedSpend = await submitSpend(spend)
    if (savedSpend) {
      setLastSavedSpendId(savedSpend.id)
      showUndoToast(savedSpend.id)
    }
    setShowConfirmModal(false)
    setPendingSpend(null)
    
    // Cerrar el modal principal si está disponible
    if (onClose) {
      setTimeout(() => onClose(), 500) // Pequeño delay para que se vea el toast
    }
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setPendingSpend(null)
  }

  const showUndoToast = (spendId: string) => {
    addToast({
      type: 'success',
      message: 'Gasto guardado correctamente',
      duration: 5000,
      action: {
        label: 'Deshacer',
        onClick: () => handleUndo(spendId),
      },
    })
  }

  const handleUndo = async (spendId: string) => {
    // TODO: Implementar lógica de deshacer (deleteSpend)
    console.log('[VoiceRecorder] Undo spend:', spendId)
    // Por ahora, solo mostrar feedback
    addToast({
      type: 'info',
      message: 'Gasto eliminado',
      duration: 3000,
    })
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Demo Mode Banner */}
      {isUsingMock && (
        <div className="p-4 bg-brand-cyan/10 dark:bg-brand-cyan/20 border-2 border-brand-cyan/30 dark:border-brand-cyan/40 rounded-lg">
          <p className="text-sm text-neutral-900 dark:text-neutral-100 leading-relaxed">
            <strong className="text-brand-cyan dark:text-brand-cyan-dark font-bold">🧪 Modo Demo:</strong>{' '}
            <span className="font-medium">Usando parser básico (regex).</span> El reconocimiento de voz funciona con tu navegador, pero el análisis es simplificado. Para análisis con IA real, agrega una API key de DeepSeek en{' '}
            <code className="px-1.5 py-0.5 bg-brand-cyan/20 dark:bg-brand-cyan/30 text-brand-cyan dark:text-brand-cyan-dark rounded font-mono text-xs font-semibold">.env.local</code>
          </p>
        </div>
      )}

      {/* Transcript Display */}
      <TranscriptDisplay />

      {/* Mic Button (centered) */}
      <div className="flex justify-center pt-4">
        <MicButton />
      </div>

      {/* Status hints */}
      <div className="text-center">
        {state === 'idle' && (
          <p className="text-sm text-muted-light dark:text-muted-dark">
            Presiona el micrófono para empezar
          </p>
        )}
        {state === 'listening' && (
          <p className="text-sm text-brand-cyan dark:text-brand-cyan-dark animate-pulse">
            Escuchando... di tu gasto
          </p>
        )}
        {state === 'processing' && (
          <p className="text-sm text-warning animate-pulse">
            Analizando con IA...
          </p>
        )}
        {state === 'success' && (
          <p className="text-sm text-success">
            ¡Listo! Gasto guardado correctamente
          </p>
        )}
        {state === 'error' && (
          <p className="text-sm text-danger">
            Error al procesar. Intenta de nuevo
          </p>
        )}
      </div>

      {/* Confirm Modal */}
      {pendingSpend && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          parsedSpend={pendingSpend}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {/* Tips */}
      <div className="mt-8 p-4 bg-chip-bg-light dark:bg-chip-bg-dark rounded-lg">
        <h3 className="text-sm font-semibold text-text-light dark:text-text-dark mb-2">
          💡 Ejemplos de frases:
        </h3>
        <ul className="text-xs text-muted-light dark:text-muted-dark space-y-1">
          <li>"5 euros de café en Starbucks"</li>
          <li>"10 con 50 de coca cola"</li>
          <li>"Parking 3 horas, 2 euros"</li>
          <li>"15 de comida en el Corte Inglés"</li>
        </ul>
      </div>
    </div>
  )
}

