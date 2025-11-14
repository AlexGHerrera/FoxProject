/**
 * ThemeSection Component
 * Tarjeta clickeable que abre modal para configurar el tema de la app
 * Opciones: Auto (sistema), Light, Dark
 */

import { useState } from 'react'
import { ChevronRight, Palette } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { ThemeModal } from './ThemeModal'

export function ThemeSection() {
  const { theme, resolvedTheme } = useTheme()
  const [showModal, setShowModal] = useState(false)

  // Formatear el tema actual para mostrar
  const getThemeLabel = () => {
    if (theme === 'auto') {
      return `Automático (${resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'})`
    }
    return theme === 'dark' ? 'Oscuro' : 'Claro'
  }

  return (
    <>
      {/* Tarjeta clickeable */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left"
      >
        <div className="flex items-center gap-4">
          {/* Icono */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" strokeWidth={2.5} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text text-base mb-0.5">
              Tema y apariencia
            </h3>
            <p className="text-sm text-muted truncate">
              {getThemeLabel()}
            </p>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
        </div>
      </button>

      {/* Modal de configuración */}
      <ThemeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}

