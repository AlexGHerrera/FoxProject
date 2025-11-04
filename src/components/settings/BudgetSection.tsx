/**
 * BudgetSection Component
 * Tarjeta clickeable que abre modal para configurar presupuesto mensual
 * Sigue el patrón de diseño establecido en la app
 */

import { useState } from 'react'
import { ChevronRight, Wallet } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { centsToEur } from '@/domain/models'
import { BudgetModal } from './BudgetModal'

export function BudgetSection() {
  const { settings, isLoading } = useSettings()
  const [showModal, setShowModal] = useState(false)

  // Formatear el presupuesto actual
  const currentBudget = settings?.monthlyLimitCents
    ? centsToEur(settings.monthlyLimitCents).toLocaleString('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : 'No configurado'

  return (
    <>
      {/* Tarjeta clickeable */}
      <button
        onClick={() => setShowModal(true)}
        disabled={isLoading}
        className="w-full bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-left"
      >
        <div className="flex items-center gap-4">
          {/* Icono */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-cyan/10 dark:bg-brand-cyan/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-brand-cyan" strokeWidth={2.5} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text text-base mb-0.5">
              Presupuesto mensual
            </h3>
            <p className="text-sm text-muted truncate">
              {currentBudget}
            </p>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
        </div>
      </button>

      {/* Modal de configuración */}
      <BudgetModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}

