/**
 * useSpeechRecognition Hook
 * Orquesta el reconocimiento de voz usando WebSpeechRecognizer
 * Conecta UI → Adapter → Store
 */

import { useEffect, useRef, useCallback } from 'react'
import { useVoiceStore } from '../stores/useVoiceStore'
import { WebSpeechRecognizer } from '../adapters/voice/WebSpeechRecognizer'
import { SILENCE_THRESHOLD_MS } from '../config/constants'

// Instancia global para evitar múltiples reconocedores (crítico en Safari)
let globalRecognizer: WebSpeechRecognizer | null = null

export function useSpeechRecognition() {
  const recognizerRef = useRef<WebSpeechRecognizer | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastTranscriptRef = useRef<string>('')
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
      globalRecognizer = new WebSpeechRecognizer()
      console.log('[useSpeechRecognition] Created global recognizer')
    }
    recognizerRef.current = globalRecognizer

    return () => {
      // Cleanup: asegurar que el mic se cierre al desmontar
      if (recognizerRef.current) {
        recognizerRef.current.stop()
        console.log('[useSpeechRecognition] Cleanup on unmount')
      }
      
      // Limpiar timer de silencio
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = null
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    // Recrear recognizer si fue destruido
    if (!recognizerRef.current && !globalRecognizer) {
      globalRecognizer = new WebSpeechRecognizer()
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
        
        // En modo continuous, detectar pausas entre segmentos
        if (mode === 'continuous') {
          // Si es un resultado final, guardar el segmento y iniciar timer
          if (result.isFinal && result.transcript.trim().length > 0) {
            const currentSegment = result.transcript.trim()
            
            // Si el segmento cambió desde el último guardado, es nuevo
            if (currentSegment !== lastTranscriptRef.current) {
              console.log('[useSpeechRecognition] New final segment detected:', currentSegment)
              lastTranscriptRef.current = currentSegment
              
              // Actualizar transcript con el segmento actual
              setTranscript(currentSegment)
              
              // Resetear timer de silencio
              if (silenceTimeoutRef.current) {
                clearTimeout(silenceTimeoutRef.current)
                silenceTimeoutRef.current = null
              }
              
              // Iniciar timer: si no hay más actividad después de 2s, procesar
              silenceTimeoutRef.current = setTimeout(() => {
                console.log('[useSpeechRecognition] Silence detected (2s), processing segment:', lastTranscriptRef.current)
                if (lastTranscriptRef.current.trim().length > 0) {
                  setState('processing')
                }
              }, SILENCE_THRESHOLD_MS)
            }
          } else if (!result.isFinal) {
            // Resultados intermedios: mostrar en tiempo real pero no procesar
            setTranscript(result.transcript)
            
            // Resetear timer cuando hay actividad (resultados intermedios)
            if (silenceTimeoutRef.current) {
              clearTimeout(silenceTimeoutRef.current)
              silenceTimeoutRef.current = null
            }
          }
        } else {
          // Modo normal: comportamiento actual
          setTranscript(result.transcript)
          
          if (result.isFinal) {
            setState('processing')
          }
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
      const isContinuous = mode === 'continuous'
      recognizerRef.current.start({
        continuous: isContinuous,
        interimResults: true,
        lang: 'es-ES',
      })
      
      console.log(`[useSpeechRecognition] Started in ${mode} mode`, { continuous: isContinuous })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('[useSpeechRecognition] Start error:', errorMessage)
      setError(errorMessage)
      setIsRecording(false)
      setState('error')
    }
  }, [setState, setIsRecording, setError, setTranscript, mode])

  const stopRecording = useCallback(() => {
    if (!recognizerRef.current) return

    try {
      // Limpiar timer de silencio
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = null
      }
      
      recognizerRef.current.stop()
      setIsRecording(false)
      
      // En modo continuous, NO procesar automáticamente al detener
      // El usuario debe detener manualmente para procesar
      if (mode === 'continuous') {
        // Si hay transcript, procesar antes de detener
        if (transcript.trim().length > 0) {
          setState('processing')
        } else {
          setState('idle')
        }
      } else {
        // Modo normal: comportamiento actual
        if (transcript) {
          setState('processing')
        } else {
          setState('idle')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al detener'
      console.error('[useSpeechRecognition] Stop error:', errorMessage)
      setError(errorMessage)
      setState('error')
    }
  }, [transcript, setIsRecording, setState, setError, mode])

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

