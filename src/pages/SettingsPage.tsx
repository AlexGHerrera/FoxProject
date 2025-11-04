/**
 * Settings Page
 * Página de configuración con estética consistente
 * Usa tarjetas clickeables que abren modals
 */

import { useLocation } from 'react-router-dom'
import { ChevronRight, Bell, Sparkles, BarChart3, Shield } from 'lucide-react'
import { PageIndicator } from '@/components/ui'
import { FoxyAvatar } from '@/components/foxy'
import { BudgetSection, ThemeSection } from '@/components/settings'

const ROUTES = ['/', '/spends', '/settings'] as const

// Opciones de configuración pendientes con iconos Lucide
const SETTINGS_OPTIONS = [
  {
    icon: Bell,
    label: 'Notificaciones',
    subtitle: 'Alertas y recordatorios',
    disabled: true,
  },
  {
    icon: Sparkles,
    label: 'Personalizar Foxy',
    subtitle: 'Ajusta la mascota a tu gusto',
    disabled: true,
  },
  {
    icon: BarChart3,
    label: 'Categorías',
    subtitle: 'Gestiona tus categorías de gastos',
    disabled: true,
  },
  {
    icon: Shield,
    label: 'Privacidad y seguridad',
    subtitle: 'Controla tus datos',
    disabled: true,
  },
] as const

export function SettingsPage() {
  const location = useLocation()
  const currentIndex = ROUTES.indexOf(location.pathname as typeof ROUTES[number])

  return (
    <div className="h-full bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text">Ajustes</h1>
              <p className="text-sm text-muted">
                Configuración de la aplicación
              </p>
            </div>
            
            {/* Foxy Avatar */}
            <div className="flex-shrink-0 ml-4">
              <FoxyAvatar state="idle" size="sm" />
            </div>
          </div>
        </div>

        {/* Page Indicator */}
        <PageIndicator
          currentIndex={currentIndex}
          totalPages={ROUTES.length}
          className="py-2"
        />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-28">
        <div className="space-y-3">
          {/* Sección de Presupuesto Mensual */}
          <BudgetSection />

          {/* Sección de Tema y Apariencia */}
          <ThemeSection />
        </div>

        {/* Otras opciones - Próximamente */}
        <div className="space-y-3 mt-6">
          {SETTINGS_OPTIONS.map((option, index) => {
            const Icon = option.icon
            return (
              <button
                key={index}
                disabled={option.disabled}
                className="w-full bg-card border border-border rounded-xl p-5 shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed text-left relative"
              >
                <div className="flex items-center gap-4">
                  {/* Icono */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-muted" strokeWidth={2.5} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text text-base mb-0.5">
                      {option.label}
                    </h3>
                    <p className="text-sm text-muted truncate">
                      {option.subtitle}
                    </p>
                  </div>

                  {/* Badge próximamente */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted font-medium px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
                      Próximamente
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
