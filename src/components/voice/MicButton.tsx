/**
 * MicButton Component
 * Botón principal para activar/desactivar grabación de voz
 * Soporta 2 modos: PTT (push-to-talk) y toggle (tap on/off)
 * Tamaño táctil: 72x72px (WCAG AA+)
 */

import { useVoiceStore } from '../../stores/useVoiceStore'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'

export function MicButton() {
  const { isRecording, mode } = useVoiceStore()
  const { toggleRecording, handlePTT } = useSpeechRecognition()

  const handleClick = () => {
    if (mode === 'toggle') {
      toggleRecording()
    }
  }

  const handleMouseDown = () => {
    if (mode === 'ptt') {
      handlePTT(true)
    }
  }

  const handleMouseUp = () => {
    if (mode === 'ptt') {
      handlePTT(false)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    if (mode === 'ptt') {
      handlePTT(true)
    } else {
      toggleRecording()
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    if (mode === 'ptt') {
      handlePTT(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`
        relative w-18 h-18 rounded-full
        bg-gradient-to-b from-brand-cyan-neon to-brand-cyan
        dark:from-brand-cyan-neon-dark dark:to-brand-cyan-dark
        shadow-mic
        transition-all duration-200
        focus:outline-none focus:ring-4 focus:ring-brand-cyan/50
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isRecording ? 'animate-pulse scale-110' : 'hover:scale-105'}
      `}
      aria-label={isRecording ? 'Detener grabación' : 'Iniciar grabación'}
      aria-pressed={isRecording}
      style={{
        width: '72px',
        height: '72px',
      }}
    >
      {/* Mic Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {!isRecording ? (
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            className="w-8 h-8 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <rect x="6" y="6" width="8" height="8" rx="1" />
          </svg>
        )}
      </div>

      {/* Recording indicator (outer ring) */}
      {isRecording && (
        <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping" />
      )}

      {/* Mode hint (only visible when not recording) */}
      {!isRecording && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <span className="text-xs text-muted-light dark:text-muted-dark">
            {mode === 'ptt' ? 'Mantén presionado' : 'Toca para grabar'}
          </span>
        </div>
      )}
    </button>
  )
}

