/**
 * Adapter: Web Speech Recognizer
 * Implementación de IVoiceRecognizer usando Web Speech API
 */

import type {
  IVoiceRecognizer,
  VoiceRecognitionOptions,
  VoiceRecognitionResult,
} from './IVoiceRecognizer'
import { VoiceRecognitionError } from './IVoiceRecognizer'

// TypeScript declarations for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  start(): void
  stop(): void
  abort(): void
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export class WebSpeechRecognizer implements IVoiceRecognizer {
  private recognition: SpeechRecognition | null = null
  private resultCallback: ((result: VoiceRecognitionResult) => void) | null = null
  private errorCallback: ((error: Error) => void) | null = null
  private endCallback: (() => void) | null = null
  private isSafari: boolean = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  isAvailable(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isAvailable()) {
      return false
    }

    try {
      // Web Speech API no requiere requestPermission explícito
      // El permiso se solicita al llamar start()
      // Aquí verificamos si el navegador lo soporta
      return true
    } catch (error) {
      console.error('[WebSpeechRecognizer] Permission error', error)
      return false
    }
  }

  start(options: VoiceRecognitionOptions = {}): void {
    if (!this.isAvailable()) {
      const error = new VoiceRecognitionError(
        'Web Speech API not available in this browser',
        'not-available'
      )
      this.errorCallback?.(error)
      return
    }

    try {
      // Crear instancia
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognitionAPI()

      // Configurar
      this.recognition.continuous = options.continuous ?? false
      this.recognition.interimResults = options.interimResults ?? true
      this.recognition.lang = options.lang || 'es-ES'
      this.recognition.maxAlternatives = options.maxAlternatives || 1

      // Event handlers
      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const result = event.results[event.resultIndex]
        const alternative = result[0]

        const voiceResult: VoiceRecognitionResult = {
          transcript: alternative.transcript,
          isFinal: result.isFinal,
          confidence: alternative.confidence,
        }

        this.resultCallback?.(voiceResult)
      }

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const error = new VoiceRecognitionError(
          `Speech recognition error: ${event.error}`,
          event.error,
          event
        )
        this.errorCallback?.(error)
      }

      this.recognition.onend = () => {
        // Safari: limpiar instancia cuando termina para liberar el mic
        if (this.isSafari) {
          console.log('[WebSpeechRecognizer] Safari: cleaning up on end')
          this.recognition = null
        }
        this.endCallback?.()
      }

      // Safari: también escuchar audioend para asegurar cleanup
      if (this.isSafari) {
        (this.recognition as any).onaudioend = () => {
          console.log('[WebSpeechRecognizer] Safari: audio ended, cleaning up')
          if (this.recognition) {
            this.recognition.abort()
            this.recognition = null
          }
        }
      }

      // Iniciar
      this.recognition.start()
      console.log('[WebSpeechRecognizer] Started', this.isSafari ? '(Safari mode)' : '')
    } catch (error) {
      const recognitionError = new VoiceRecognitionError(
        'Failed to start speech recognition',
        'start-error',
        error
      )
      this.errorCallback?.(recognitionError)
    }
  }

  stop(): void {
    if (this.recognition) {
      try {
        const recog = this.recognition
        
        // Safari: limpiar TODOS los event handlers antes de abortar
        if (this.isSafari) {
          recog.onresult = null
          recog.onerror = null
          recog.onend = null
          ;(recog as any).onaudioend = null
          ;(recog as any).onaudiostart = null
          ;(recog as any).onsoundstart = null
          ;(recog as any).onsoundend = null
          ;(recog as any).onspeechstart = null
          ;(recog as any).onspeechend = null
        }
        
        // abort() cierra el micrófono inmediatamente
        recog.abort()
        
        // Limpiar la instancia
        this.recognition = null
        
        // Safari: forzar garbage collection después de un momento
        if (this.isSafari) {
          setTimeout(() => {
            // Nada más que hacer, solo dar tiempo al navegador
            console.log('[WebSpeechRecognizer] Safari: cleanup complete')
          }, 100)
        }
        
        console.log('[WebSpeechRecognizer] Stopped and aborted', this.isSafari ? '(Safari)' : '')
      } catch (error) {
        console.error('[WebSpeechRecognizer] Error stopping:', error)
        // Forzar cleanup aunque haya error
        this.recognition = null
      }
    }
  }

  onResult(callback: (result: VoiceRecognitionResult) => void): void {
    this.resultCallback = callback
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback
  }

  onEnd(callback: () => void): void {
    this.endCallback = callback
  }
}

