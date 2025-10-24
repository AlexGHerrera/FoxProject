/**
 * Interface: Voice Recognizer
 * Contrato para reconocimiento de voz (Web Speech API, Whisper, etc.)
 */

export interface VoiceRecognitionResult {
  transcript: string
  isFinal: boolean
  confidence?: number
}

export interface IVoiceRecognizer {
  /**
   * Verifica si el reconocimiento de voz está disponible
   */
  isAvailable(): boolean

  /**
   * Solicita permisos de micrófono
   */
  requestPermission(): Promise<boolean>

  /**
   * Inicia el reconocimiento de voz
   */
  start(options?: VoiceRecognitionOptions): void

  /**
   * Detiene el reconocimiento de voz
   */
  stop(): void

  /**
   * Callback cuando se recibe texto
   */
  onResult(callback: (result: VoiceRecognitionResult) => void): void

  /**
   * Callback en caso de error
   */
  onError(callback: (error: Error) => void): void

  /**
   * Callback cuando termina
   */
  onEnd(callback: () => void): void
}

export interface VoiceRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
}

/**
 * Errores específicos de reconocimiento de voz
 */
export class VoiceRecognitionError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'VoiceRecognitionError'
  }
}

