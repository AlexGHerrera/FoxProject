/**
 * VoiceRecorder Component
 * Componente principal que orquesta el flujo completo de voz
 * Integra: MicButton, TranscriptDisplay, ConfirmModal
 */

import { useEffect, useState, useCallback } from 'react'
import { useVoiceStore } from '../../stores/useVoiceStore'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import { useSpendSubmit } from '../../hooks/useSpendSubmit'
import { useUIStore } from '../../stores/useUIStore'
import { env } from '../../config/env'
import { MicButton } from './MicButton'
import { TranscriptDisplay } from './TranscriptDisplay'
import { ConfirmModal } from './ConfirmModal'
import type { ParsedSpend, ParsedSpendResult } from '../../domain/models'

interface VoiceRecorderProps {
  onClose?: () => void
}

export function VoiceRecorder({ onClose }: VoiceRecorderProps = {}) {
  const { transcript, state, mode, setTranscript, reset: resetVoice, setMode, setState } = useVoiceStore()
  const { isRecording, startRecording } = useSpeechRecognition()
  const { parseTranscript, submitMultipleSpends, parsedResult } = useSpendSubmit()
  
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingResult, setPendingResult] = useState<ParsedSpendResult | null>(null)
  
  const isUsingMock = !env.deepseek?.apiKey || env.deepseek.apiKey.length === 0
  const isContinuous = mode === 'continuous'

  const handleParse = useCallback(async () => {
    if (!transcript) {
      console.warn('[VoiceRecorder] handleParse called without transcript')
      return
    }

    console.log('[VoiceRecorder] Starting parse for:', transcript)

    try {
      const result = await parseTranscript(transcript)
      
      console.log('[VoiceRecorder] Parse result:', result)
      
      if (!result || result.spends.length === 0) {
        console.warn('[VoiceRecorder] Parse returned no spends')
        return
      }

      // Auto-confirm si confidence >= 0.95 (muy restrictivo para evitar errores)
      if (result.totalConfidence >= 0.95) {
        console.log('[VoiceRecorder] Auto-confirming (confidence >= 0.95)')
        const spends = await submitMultipleSpends(result.spends)
        
        // En modo continuous, continuar grabando después de guardar
        if (isContinuous && spends) {
          console.log('[VoiceRecorder] Continuous mode: auto-confirmed, clearing transcript and continuing')
          setTranscript('') // Limpiar transcript para siguiente segmento
          // Volver a estado 'listening' para continuar grabando
          setState('listening')
          // El reconocimiento sigue activo, solo limpiamos el transcript y resetemos el estado
          return
        }
        
        // Cerrar modal inmediatamente después de guardar (modo normal)
        if (spends && onClose) {
          onClose()
        }
      } else {
        // Mostrar modal de confirmación
        const count = result.spends.length
        console.log(`[VoiceRecorder] Showing confirm modal for ${count} spend(s) (confidence < 0.95)`)
        setPendingResult(result)
        setShowConfirmModal(true)
      }
    } catch (error) {
      console.error('[VoiceRecorder] Error in handleParse:', error)
    }
  }, [transcript, parseTranscript, submitMultipleSpends, onClose, isContinuous, setTranscript])

  // Auto-parse cuando el estado cambia a 'processing'
  useEffect(() => {
    if (state === 'processing' && transcript && transcript.length > 3) {
      console.log('[VoiceRecorder] Auto-parsing transcript (state=processing):', transcript)
      handleParse()
    }
  }, [state, transcript, handleParse])

  const handleConfirm = async (spends: ParsedSpend[]) => {
    const savedSpends = await submitMultipleSpends(spends)
    setShowConfirmModal(false)
    setPendingResult(null)
    
    // En modo continuous, continuar grabando después de guardar
    if (isContinuous && savedSpends) {
      console.log('[VoiceRecorder] Continuous mode: clearing transcript and continuing')
      setTranscript('') // Limpiar transcript para siguiente segmento
      // Volver a estado 'listening' para continuar grabando
      setState('listening')
      // El reconocimiento sigue activo, solo limpiamos el transcript y resetemos el estado
      return
    }
    
    // Cerrar el modal principal inmediatamente (modo normal)
    if (onClose && savedSpends) {
      onClose()
    }
  }

  const handleCancel = () => {
    setShowConfirmModal(false)
    setPendingResult(null)
  }

  // Toggle de modo de grabación
  const handleModeChange = (newMode: 'ptt' | 'toggle' | 'continuous') => {
    // Solo cambiar modo si no está grabando
    if (!isRecording) {
      setMode(newMode)
    }
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

      {/* Transcript Display - Editable */}
      <TranscriptDisplay editable={true} />

      {/* Mode Selector */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => handleModeChange('toggle')}
          disabled={isRecording}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            mode === 'toggle'
              ? 'bg-brand-cyan text-white font-semibold'
              : 'bg-chip-bg-light dark:bg-chip-bg-dark text-text-light dark:text-text-dark hover:bg-chip-hover-light dark:hover:bg-chip-hover-dark'
          } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Toggle
        </button>
        <button
          onClick={() => handleModeChange('ptt')}
          disabled={isRecording}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            mode === 'ptt'
              ? 'bg-brand-cyan text-white font-semibold'
              : 'bg-chip-bg-light dark:bg-chip-bg-dark text-text-light dark:text-text-dark hover:bg-chip-hover-light dark:hover:bg-chip-hover-dark'
          } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          PTT
        </button>
        <button
          onClick={() => handleModeChange('continuous')}
          disabled={isRecording}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            mode === 'continuous'
              ? 'bg-brand-cyan text-white font-semibold'
              : 'bg-chip-bg-light dark:bg-chip-bg-dark text-text-light dark:text-text-dark hover:bg-chip-hover-light dark:hover:bg-chip-hover-dark'
          } ${isRecording ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Continuo
        </button>
      </div>

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
            {isContinuous ? 'Escuchando continuamente... habla pausado entre gastos' : 'Escuchando... di tu gasto'}
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

      {/* Confirm Modal - ahora soporta múltiples gastos */}
      {pendingResult && pendingResult.spends.length > 0 && (
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          parsedSpends={pendingResult.spends}
          totalConfidence={pendingResult.totalConfidence}
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

