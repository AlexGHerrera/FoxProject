/**
 * TranscriptDisplay Component
 * Muestra el texto transcrito en tiempo real
 * Estados: idle, listening, processing
 */

import { useVoiceStore } from '../../stores/useVoiceStore'

export function TranscriptDisplay() {
  const { transcript, state } = useVoiceStore()

  const getPlaceholder = () => {
    switch (state) {
      case 'idle':
        return 'Di algo como: "5 euros de café en Starbucks"'
      case 'listening':
        return 'Escuchando...'
      case 'processing':
        return 'Procesando...'
      case 'success':
        return '¡Gasto guardado! ✅'
      case 'error':
        return 'Error al procesar'
      default:
        return ''
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`
          min-h-[100px] p-4 rounded-lg
          bg-surface-light dark:bg-surface-dark
          border-2 transition-all duration-200
          ${
            state === 'listening'
              ? 'border-brand-cyan dark:border-brand-cyan-dark shadow-md'
              : state === 'processing'
              ? 'border-warning dark:border-warning-dark'
              : state === 'success'
              ? 'border-success dark:border-success-dark'
              : state === 'error'
              ? 'border-danger dark:border-danger-dark'
              : 'border-divider-light dark:border-divider-dark'
          }
        `}
      >
        {transcript ? (
          <p className="text-lg text-text-light dark:text-text-dark">
            {transcript}
          </p>
        ) : (
          <p className="text-muted-light dark:text-muted-dark italic">
            {getPlaceholder()}
          </p>
        )}

        {/* Processing indicator */}
        {state === 'processing' && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-warning rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-muted-light dark:text-muted-dark">
              Analizando con IA...
            </span>
          </div>
        )}
      </div>

      {/* Confidence meter (shown during processing) */}
      {state === 'processing' && (
        <div className="mt-2 text-center">
          <span className="text-xs text-muted-light dark:text-muted-dark">
            Confianza del análisis: calculando...
          </span>
        </div>
      )}
    </div>
  )
}

