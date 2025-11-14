/**
 * ThemeModal Component
 * Modal para seleccionar el tema de la aplicación
 * Opciones: Auto (sistema), Light, Dark con preview visual
 */

import { useState, useEffect } from 'react'
import { Monitor, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { Modal, Button } from '@/components/ui'

interface ThemeModalProps {
  isOpen: boolean
  onClose: () => void
}

type Theme = 'light' | 'dark' | 'auto'

const THEME_OPTIONS = [
  {
    value: 'auto' as Theme,
    label: 'Automático',
    description: 'Sigue la configuración del sistema',
    icon: Monitor,
  },
  {
    value: 'light' as Theme,
    label: 'Claro',
    description: 'Tema claro siempre activo',
    icon: Sun,
  },
  {
    value: 'dark' as Theme,
    label: 'Oscuro',
    description: 'Tema oscuro siempre activo',
    icon: Moon,
  },
] as const

const THEME_KEY = 'foxy-theme'

export function ThemeModal({ isOpen, onClose }: ThemeModalProps) {
  const { theme, setTheme, previewTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<Theme>(theme)
  const [originalTheme, setOriginalTheme] = useState<Theme>(theme)

  // Guardar el tema REAL de localStorage cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      // Leer directamente de localStorage para obtener el tema guardado
      const storedTheme = (localStorage.getItem(THEME_KEY) as Theme) || 'auto'
      console.log('[ThemeModal] Modal abierto - Tema guardado en localStorage:', storedTheme)
      console.log('[ThemeModal] Tema actual en store:', theme)
      setOriginalTheme(storedTheme)
      setSelectedTheme(theme) // Mostrar el que está activo ahora
    }
  }, [isOpen, theme])

  // Aplicar preview cuando cambia la selección (SIN guardar en localStorage)
  const handleThemeSelect = (newTheme: Theme) => {
    console.log('[ThemeModal] Seleccionando tema preview:', newTheme)
    setSelectedTheme(newTheme)
    previewTheme(newTheme) // Solo preview, no guarda
  }

  const handleSave = () => {
    // Ahora SÍ guardar permanentemente el tema seleccionado
    console.log('[ThemeModal] Guardando tema:', selectedTheme)
    setTheme(selectedTheme) // Guarda en localStorage
    onClose()
  }

  const handleCancel = () => {
    // Restaurar el tema original (sin guardar)
    console.log('[ThemeModal] Cancelando - Restaurando tema:', originalTheme)
    previewTheme(originalTheme) // Solo restaura visualmente
    setSelectedTheme(originalTheme)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} title="Tema y apariencia">
      <div className="space-y-6">
        {/* Opciones de tema */}
        <div className="space-y-3">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = selectedTheme === option.value

            return (
              <button
                key={option.value}
                onClick={() => handleThemeSelect(option.value)}
                className={`
                  w-full p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${
                    isSelected
                      ? 'border-brand-cyan bg-brand-cyan/10 dark:bg-brand-cyan/20 shadow-md'
                      : 'border-border hover:border-brand-cyan/50 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Icono */}
                  <div
                    className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors
                      ${
                        isSelected
                          ? 'bg-brand-cyan text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-muted'
                      }
                    `}
                  >
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className={`
                          font-semibold text-base
                          ${isSelected ? 'text-brand-cyan dark:text-brand-cyan' : 'text-text'}
                        `}
                      >
                        {option.label}
                      </h3>
                      {isSelected && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-cyan flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted">{option.description}</p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Info adicional */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-border">
          <p className="text-xs text-muted leading-relaxed">
            💡 <strong>Tip:</strong> El modo automático cambiará entre claro y oscuro según la
            configuración de tu sistema operativo.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="secondary"
            onClick={handleCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1"
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

