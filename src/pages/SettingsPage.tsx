/**
 * Settings Page (Temporal)
 * Página de configuración - placeholder para futuras implementaciones
 */

import { motion } from 'framer-motion'
import { useSwipeNavigation } from '@/hooks'
import { BottomNav, PageIndicator } from '@/components/ui'
import { FoxyAvatar } from '@/components/foxy'

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
}

export function SettingsPage() {
  const { onDragEnd, currentIndex, totalRoutes, direction } = useSwipeNavigation()

  // Variantes dinámicas basadas en la dirección del swipe (estilo carrusel)
  const pageVariants = {
    initial: (dir: number) => ({
      x: dir > 0 ? '100%' : dir < 0 ? '-100%' : 0,
    }),
    animate: {
      x: 0,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : dir < 0 ? '100%' : 0,
    }),
  }

  return (
    <motion.div
      className="fixed inset-0 bg-background overflow-y-auto"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      dragMomentum={false}
      onDragEnd={onDragEnd}
      custom={direction}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
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
          totalPages={totalRoutes}
          className="py-2"
        />
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-28">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚙️</div>
          <h2 className="text-xl font-semibold text-text mb-2">
            Próximamente
          </h2>
          <p className="text-muted max-w-md mx-auto">
            La página de ajustes está en desarrollo. Aquí podrás configurar tu presupuesto mensual, 
            preferencias de notificaciones, tema y mucho más.
          </p>
        </div>

        {/* Placeholder de futuras opciones */}
        <div className="space-y-3 mt-8">
          {[
            { icon: '💰', label: 'Presupuesto mensual', subtitle: 'Configura tu límite de gastos' },
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

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  )
}

