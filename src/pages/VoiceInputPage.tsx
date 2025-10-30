/**
 * Voice Input Page
 * Pantalla completa para registro de gastos por voz
 * Siguiendo mockup: 08_voice_input_v2_wide.png
 */

import { useState, useEffect } from 'react'
import { useVoiceStore } from '@/stores/useVoiceStore'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpendSubmit } from '@/hooks/useSpendSubmit'
import { FoxyAvatar } from '@/components/foxy'
import { Button } from '@/components/ui'
import { QuickConfirmScreen } from '@/components/voice/QuickConfirmScreen'
import type { ParsedSpend, ParsedSpendResult } from '@/domain/models'

interface VoiceInputPageProps {
  onClose: () => void
}

export function VoiceInputPage({ onClose }: VoiceInputPageProps) {
  const { transcript, state, setTranscript, reset: resetVoice } = useVoiceStore()
  const { isRecording, startRecording, stopRecording } = useSpeechRecognition()
  const { parseTranscript, submitMultipleSpends } = useSpendSubmit()
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingResult, setPendingResult] = useState<ParsedSpendResult | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [originalTranscript, setOriginalTranscript] = useState('')
  const [hasAutoParsed, setHasAutoParsed] = useState(false)

  // Activar escucha automáticamente al entrar
  useEffect(() => {
    startRecording()

    // Cleanup: detener reconocimiento al salir
    return () => {
      stopRecording()
      resetVoice()
    }
  }, [])

  // Auto-parse cuando termina de grabar (solo la primera vez)
  useEffect(() => {
    if (state === 'processing' && transcript && transcript.length > 3 && !hasAutoParsed) {
      setOriginalTranscript(transcript) // Guardar el texto original
      setHasAutoParsed(true)
      
      // Safari: detener ANTES de parsear para liberar el mic
      stopRecording()
      
      handleParse()
    }
  }, [state, transcript, hasAutoParsed])

  const handleParse = async () => {
    if (!transcript || transcript.length < 3) {
      return
    }
    
    try {
      const result = await parseTranscript(transcript)
      if (result && result.spends.length > 0) {
        // Auto-confirmar si confidence >= 0.95 (muy alta)
        if (result.totalConfidence >= 0.95) {
          console.log('[VoiceInputPage] Auto-confirming (confidence >= 0.95)', {
            count: result.spends.length,
            confidence: result.totalConfidence,
          })
          await handleConfirmAll(result.spends)
          return
        }
        
        // Mostrar pantalla de confirmación para revisar
        setPendingResult(result)
        setShowConfirm(true)
      }
    } catch (error) {
      console.error('[VoiceInputPage] Error parsing:', error)
    }
  }

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value)
  }

  const handleConfirmAll = async (spends: ParsedSpend[]) => {
    if (!spends || spends.length === 0) return
    // Detener reconocimiento antes de guardar
    stopRecording()
    const saved = await submitMultipleSpends(spends)
    if (saved) {
      resetVoice()
      onClose()
    }
  }

  const handleEdit = () => {
    // Restaurar el texto original al entrar en modo edición
    setTranscript(originalTranscript)
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    // Guardar el nuevo texto como "original" para futuras ediciones
    setOriginalTranscript(transcript)
    setIsEditing(false)
    // Re-procesar con el texto editado
    await handleParse()
  }

  const handleCancelEdit = () => {
    // Restaurar el texto original si cancela la edición
    setTranscript(originalTranscript)
    setIsEditing(false)
  }

  const handleRetry = () => {
    setShowConfirm(false)
    setPendingResult(null)
    setIsEditing(false)
    setHasAutoParsed(false)
    setOriginalTranscript('')
    setTranscript('')
    // Reset para grabar de nuevo
    startRecording()
  }

  const handleCancel = () => {
    // Detener reconocimiento y limpiar estado
    stopRecording()
    resetVoice()
    setShowConfirm(false)
    setPendingResult(null)
    setIsEditing(false)
    onClose()
  }

  // Pantalla de confirmación o edición
  if (showConfirm && pendingResult) {
    if (isEditing) {
      // Modo edición del texto reconocido (estética mejorada)
      return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6 pb-28">
          {/* Foxy Avatar - Estado idle */}
          <div className="mb-6">
            <FoxyAvatar state="idle" size="lg" />
          </div>

          <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2 text-center">
            Edita el texto reconocido
          </h1>
          <p className="text-sm text-muted-light dark:text-muted-dark mb-6 text-center max-w-md">
            Modifica lo que dijiste y lo reprocesaré
          </p>

          <div className="w-full max-w-md space-y-4 mb-8">
            <textarea
              value={transcript}
              onChange={handleTranscriptChange}
              className="w-full p-4 rounded-xl border-2 border-brand-cyan dark:border-brand-cyan-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark text-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-cyan shadow-sm"
              rows={5}
              placeholder="Ej: 5 euros de café en Starbucks"
              autoFocus
            />
          </div>

          <div className="w-full max-w-md space-y-3">
            <Button
              variant="primary"
              onClick={handleSaveEdit}
              className="w-full text-lg py-4 font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              ✨ Reprocesar con IA
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancelEdit}
              className="w-full text-sm py-3"
            >
              Cancelar edición
            </Button>
          </div>
        </div>
      )
    }

    // Pantalla de confirmación rápida (nueva interfaz bonita)
    return (
      <QuickConfirmScreen
        result={pendingResult}
        onConfirm={handleConfirmAll}
        onEditText={handleEdit}
        onCancel={handleCancel}
      />
    )
  }

  // Pantalla de grabación
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6">
      {/* Título */}
      <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">
        {state === 'listening' ? 'Estoy escuchando...' : 'Esperando...'}
      </h1>

      {/* Transcripción solo para mostrar */}
      {transcript && (
        <p className="text-lg text-muted-light dark:text-muted-dark mb-8 text-center max-w-md">
          {transcript}
        </p>
      )}

      {/* Foxy Avatar con auriculares cuando está escuchando */}
      <div className="my-12">
        <FoxyAvatar 
          state={state === 'listening' ? 'listening' : 'idle'} 
          size="lg" 
        />
      </div>

      {/* Hint si está escuchando */}
      {state === 'listening' && (
        <p className="text-sm text-muted-light dark:text-muted-dark mb-8 text-center">
          Habla de forma natural...
        </p>
      )}

      {/* Botón cancelar */}
      <button
        onClick={onClose}
        className="mt-4 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors underline decoration-dashed"
      >
        Cancelar
      </button>

      {/* Indicador de procesamiento */}
      {state === 'processing' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 flex flex-col items-center gap-4">
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-3 h-3 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-3 h-3 bg-brand-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-text-light dark:text-text-dark">
              Analizando con IA...
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

