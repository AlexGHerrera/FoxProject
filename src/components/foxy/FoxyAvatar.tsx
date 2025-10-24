/**
 * FoxyAvatar Component
 * Placeholder CSS animado para la mascota Foxy
 * Estados: idle, listening, happy, alert
 */

import { useMemo } from 'react'

type FoxyState = 'idle' | 'listening' | 'happy' | 'alert'

interface FoxyAvatarProps {
  state?: FoxyState
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function FoxyAvatar({ state = 'idle', size = 'md', className = '' }: FoxyAvatarProps) {
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'w-24 h-24'
      case 'md':
        return 'w-32 h-32'
      case 'lg':
        return 'w-48 h-48'
    }
  }, [size])

  const stateConfig = useMemo(() => {
    switch (state) {
      case 'idle':
        return {
          emoji: '🦊',
          bgColor: 'from-orange-400 to-orange-500',
          animation: 'animate-pulse-slow',
          label: 'Foxy en reposo',
        }
      case 'listening':
        return {
          emoji: '🎧',
          bgColor: 'from-cyan-400 to-cyan-500',
          animation: 'animate-pulse',
          label: 'Foxy escuchando',
        }
      case 'happy':
        return {
          emoji: '🦊',
          bgColor: 'from-green-400 to-green-500',
          animation: 'animate-bounce-slow',
          label: 'Foxy feliz',
        }
      case 'alert':
        return {
          emoji: '⚠️',
          bgColor: 'from-red-400 to-red-500',
          animation: 'animate-pulse',
          label: 'Foxy alerta',
        }
    }
  }, [state])

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Avatar circular con gradiente */}
      <div
        className={`
          ${sizeClasses}
          rounded-full
          bg-gradient-to-br ${stateConfig.bgColor}
          flex items-center justify-center
          shadow-lg
          transition-all duration-500 ease-in-out
          ${stateConfig.animation}
        `}
        role="img"
        aria-label={stateConfig.label}
      >
        <span className="text-5xl select-none" aria-hidden="true">
          {stateConfig.emoji}
        </span>
      </div>

      {/* Indicador de estado (opcional) */}
      {state !== 'idle' && (
        <div className="text-xs font-medium text-muted-light dark:text-muted-dark">
          {state === 'listening' && '🎤 Escuchando...'}
          {state === 'happy' && '✨ ¡Genial!'}
          {state === 'alert' && '⚠️ Atención'}
        </div>
      )}
    </div>
  )
}

