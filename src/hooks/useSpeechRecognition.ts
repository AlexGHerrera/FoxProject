/**
 * useSpeechRecognition Hook
 * Orquesta el reconocimiento de voz usando WebSpeechRecognizer
 * Conecta UI → Adapter → Store
 */

import { useEffect, useRef, useCallback } from 'react'
import { useVoiceStore } from '../stores/useVoiceStore'
import { WebSpeechRecognizer } from '../adapters/voice/WebSpeechRecognizer'

// Instancia global para evitar múltiples reconocedores (crítico en Safari)
let globalRecognizer: WebSpeechRecognizer | null = null

export function useSpeechRecognition() {
  const recognizerRef = useRef<WebSpeechRecognizer | null>(null)
  const {
    isRecording,
    transcript,
    mode,
    setIsRecording,
    setTranscript,
    setState,
    setError,
  } = useVoiceStore()

  // Initialize recognizer - usar instancia global en Safari
  useEffect(() => {
    // Safari: reutilizar instancia global si existe
    if (!globalRecognizer) {
      globalRecognizer = new WebSpeechRecognizer('es-ES')
      console.log('[useSpeechRecognition] Created global recognizer')
    }
    recognizerRef.current = globalRecognizer

    return () => {
      // Cleanup: asegurar que el mic se cierre al desmontar
      if (recognizerRef.current) {
        recognizerRef.current.stop()
        console.log('[useSpeechRecognition] Cleanup on unmount')
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    // Recrear recognizer si fue destruido
    if (!recognizerRef.current && !globalRecognizer) {
      globalRecognizer = new WebSpeechRecognizer('es-ES')
      recognizerRef.current = globalRecognizer
      console.log('[useSpeechRecognition] Recreated global recognizer')
    } else if (!recognizerRef.current) {
      recognizerRef.current = globalRecognizer
    }

    try {
      setState('listening')
      setIsRecording(true)
      setError(null)
      setTranscript('')

      // Configurar callbacks antes de iniciar
      recognizerRef.current.onResult((result) => {
        console.log('[useSpeechRecognition] Result:', result)
        setTranscript(result.transcript)
        
        if (result.isFinal) {
          setState('processing')
        }
      })

      recognizerRef.current.onError((error) => {
        console.error('[useSpeechRecognition] Error:', error)
        setError(error.message)
        setIsRecording(false)
        setState('error')
      })

      recognizerRef.current.onEnd(() => {
        console.log('[useSpeechRecognition] Ended')
        setIsRecording(false)
      })

      // Iniciar reconocimiento
      recognizerRef.current.start({
        continuous: false,
        interimResults: true,
        lang: 'es-ES',
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[useSpeechRecognition] Start error:', errorMessage)
      setError(errorMessage)
      setIsRecording(false)
      setState('error')
    }
  }, [setState, setIsRecording, setError, setTranscript])

  const stopRecording = useCallback(() => {
    if (!recognizerRef.current) return

    try {
      recognizerRef.current.stop()
      setIsRecording(false)
      
      // Si tenemos transcript, ir a processing, sino a idle
      if (transcript) {
        setState('processing')
      } else {
        setState('idle')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al detener'
      console.error('[useSpeechRecognition] Stop error:', errorMessage)
      setError(errorMessage)
      setState('error')
    }
  }, [transcript, setIsRecording, setState, setError])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  const handlePTT = useCallback(
    (pressed: boolean) => {
      if (pressed) {
        startRecording()
      } else {
        stopRecording()
      }
    },
    [startRecording, stopRecording]
  )

  return {
    isRecording,
    transcript,
    mode,
    startRecording,
    stopRecording,
    toggleRecording,
    handlePTT,
  }
}

