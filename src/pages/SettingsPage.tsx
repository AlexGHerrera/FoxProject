/**
 * Settings Page (Temporal)
 * Página de configuración - placeholder para futuras implementaciones
 */

import { useLocation } from 'react-router-dom'
import { PageIndicator } from '@/components/ui'
import { FoxyAvatar } from '@/components/foxy'
import { BudgetSection } from '@/components/settings'

const ROUTES = ['/', '/spends', '/settings'] as const

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
        {/* Sección de Presupuesto Mensual */}
        <BudgetSection />

        {/* Placeholder de futuras opciones */}
        <div className="space-y-3 mt-8">
          {[
            { icon: '🎨', label: 'Tema y apariencia', subtitle: 'Light, dark o automático' },
            { icon: '🔔', label: 'Notificaciones', subtitle: 'Alertas y recordatorios' },
            { icon: '🦊', label: 'Personalizar Foxy', subtitle: 'Ajusta la mascota a tu gusto' },
            { icon: '📊', label: 'Categorías', subtitle: 'Gestiona tus categorías de gastos' },
            { icon: '🔐', label: 'Privacidad y seguridad', subtitle: 'Controla tus datos' },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-card/50 border border-border/50 rounded-lg p-4 flex items-center gap-4 opacity-40"
            >
              <div className="text-3xl">{item.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-text">{item.label}</h3>
                <p className="text-sm text-muted">{item.subtitle}</p>
              </div>
              <div className="text-muted text-sm">Próximamente</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
