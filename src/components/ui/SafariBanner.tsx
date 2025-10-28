/**
 * Safari Banner
 * Aviso informativo sobre el indicador de micrófono en Safari
 */

import { useState } from 'react'

export function SafariBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('foxy-safari-banner-dismissed') === 'true'
  })

  // Detectar Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

  const handleDismiss = () => {
    localStorage.setItem('foxy-safari-banner-dismissed', 'true')
    setDismissed(true)
  }

  // No mostrar si no es Safari o ya fue cerrado
  if (!isSafari || dismissed) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500/90 dark:bg-yellow-600/90 text-black dark:text-white p-4 shadow-lg z-[60]">
      <div className="max-w-4xl mx-auto flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">ℹ️</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold mb-1">
            Nota para usuarios de Safari
          </p>
          <p>
            El indicador de micrófono puede quedar visible por un bug de Safari. 
            <strong> Tu privacidad está protegida</strong> — el micrófono está realmente cerrado.{' '}
            <a 
              href="https://github.com/tu-repo/foxy-app/blob/main/SAFARI-MIC-ISSUE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Más info
            </a>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-xl hover:opacity-70 transition-opacity"
          aria-label="Cerrar aviso"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

