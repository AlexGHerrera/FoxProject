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
import { MicButton } from '@/components/voice'
import type { ParsedSpend } from '@/adapters/ai/IAIProvider'

interface VoiceInputPageProps {
  onClose: () => void
}

export function VoiceInputPage({ onClose }: VoiceInputPageProps) {
  const { transcript, state, setTranscript } = useVoiceStore()
  const { isRecording, startRecording } = useSpeechRecognition()
  const { parseTranscript, submitSpend } = useSpendSubmit()
  
  const [showConfirm, setShowConfirm] = useState(false)
  const [parsedSpend, setParsedSpend] = useState<ParsedSpend | null>(null)

  // Activar escucha automáticamente al entrar
  useEffect(() => {
    startRecording()
  }, [])

  // NO auto-parse - el usuario debe poder editar tranquilamente
  // Se procesa solo cuando el usuario hace clic en "Procesar" o "Continuar"

  const handleParse = async () => {
    if (!transcript || transcript.length < 3) {
      return
    }
    
    try {
      const parsed = await parseTranscript(transcript)
      if (parsed) {
        setParsedSpend(parsed)
        setShowConfirm(true)
      }
    } catch (error) {
      console.error('[VoiceInputPage] Error parsing:', error)
    }
  }

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value)
  }

  const handleConfirm = async () => {
    if (!parsedSpend) return
    
    const saved = await submitSpend(parsedSpend)
    if (saved) {
      onClose() // Volver al dashboard
    }
  }

  const handleRetry = () => {
    setShowConfirm(false)
    setParsedSpend(null)
    // Reset voice state para poder grabar de nuevo
  }

  const handleCancel = () => {
    setShowConfirm(false)
    setParsedSpend(null)
    onClose()
  }

  // Pantalla de confirmación
  if (showConfirm && parsedSpend) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6">
        {/* Título */}
        <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2 text-center">
          He anotado un {parsedSpend.category.toLowerCase()} de
        </h1>
        <p className="text-5xl font-bold text-brand-cyan dark:text-brand-cyan-dark mb-4">
          {parsedSpend.amountEur.toFixed(2)} €
        </p>
        <p className="text-xl text-muted-light dark:text-muted-dark mb-8">
          ¿Confirmo?
        </p>

        {/* Foxy Avatar - Estado feliz */}
        <div className="mb-12">
          <FoxyAvatar state="happy" size="lg" />
        </div>

        {/* Botones */}
        <div className="w-full max-w-md space-y-3">
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="w-full text-lg py-4"
          >
            Confirmar
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={handleRetry}
              className="w-full"
            >
              Reintentar
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de grabación
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center justify-center p-6">
      {/* Título */}
      <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-2">
        {state === 'listening' ? 'Estoy escuchando...' : 'Revisa el texto'}
      </h1>

      {/* Transcripción - Siempre Editable */}
      {transcript && (
        <div className="w-full max-w-md mb-8">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-muted-light dark:text-muted-dark text-center">
              Revisa o edita el texto reconocido:
            </label>
            <textarea
              value={transcript}
              onChange={handleTranscriptChange}
              className="w-full p-4 rounded-lg border-2 border-brand-cyan dark:border-brand-cyan-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark text-lg resize-none focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              rows={3}
              placeholder="Escribe el gasto aquí..."
              disabled={state === 'processing'}
            />
            <Button
              variant="primary"
              onClick={handleParse}
              className="w-full text-lg py-3"
              disabled={!transcript || transcript.length < 3 || state === 'processing'}
            >
              {state === 'processing' ? 'Procesando...' : 'Continuar →'}
            </Button>
          </div>
        </div>
      )}

      {/* Foxy Avatar con auriculares cuando está escuchando */}
      <div className="my-12">
        <FoxyAvatar 
          state={state === 'listening' ? 'listening' : 'idle'} 
          size="lg" 
        />
      </div>

      {/* Botón de micrófono */}
      <div className="mb-8">
        <MicButton />
      </div>

      {/* Botón detener grabación (solo visible cuando está grabando) */}
      {isRecording && (
        <Button
          variant="secondary"
          onClick={() => {
            // El MicButton maneja el stop
          }}
          className="w-full max-w-md"
        >
          Detener grabación
        </Button>
      )}

      {/* Botón cancelar */}
      <button
        onClick={onClose}
        className="mt-4 text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors"
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

