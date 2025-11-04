/**
 * NotificationSection Component
 * Tarjeta clickeable que abre modal para configurar notificaciones
 * Sigue el patrón de diseño establecido (BudgetSection/ThemeSection)
 */

import { useState } from 'react'
import { ChevronRight, Bell } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { NotificationModal } from './NotificationModal'

export function NotificationSection() {
  const { notificationSettings, hasPermission } = useNotifications()
  const [showModal, setShowModal] = useState(false)

  // Determinar estado para mostrar
  const status = !hasPermission
    ? 'Permisos desactivados'
    : notificationSettings?.expense_reminders.enabled ||
      notificationSettings?.budget_alert_70.enabled ||
      notificationSettings?.budget_alert_90.enabled
    ? 'Activadas'
    : 'Desactivadas'

  return (
    <>
      {/* Tarjeta clickeable */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left"
      >
        <div className="flex items-center gap-4">
          {/* Icono */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-cyan/10 dark:bg-brand-cyan/20 flex items-center justify-center">
            <Bell className="w-6 h-6 text-brand-cyan" strokeWidth={2.5} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text text-base mb-0.5">Notificaciones</h3>
            <p className="text-sm text-muted truncate">{status}</p>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
        </div>
      </button>

      {/* Modal de configuración */}
      <NotificationModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

