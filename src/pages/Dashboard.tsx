/**
 * Dashboard Page
 * Pantalla principal con resumen de presupuesto, gastos recientes y Foxy
 */

import { useState } from 'react'
import { useLoadSpends } from '@/hooks/useLoadSpends'
import { useBudgetProgress } from '@/hooks/useBudgetProgress'
import { useSpendStore } from '@/stores/useSpendStore'
import { BudgetBar, RecentSpends } from '@/components/dashboard'
import { FoxyAvatar } from '@/components/foxy'
import { VoiceRecorder } from '@/components/voice'
import { Button } from '@/components/ui'

// TODO: obtener el límite mensual de settings cuando implementemos esa funcionalidad
const MONTHLY_LIMIT_CENTS = 100000 // 1000€ por defecto

export function Dashboard() {
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  
  // Cargar gastos al montar
  useLoadSpends()
  
  // Obtener estado
  const { spends, isLoading } = useSpendStore()
  const budgetProgress = useBudgetProgress(MONTHLY_LIMIT_CENTS)

  // Determinar estado de Foxy según presupuesto
  const foxyState = budgetProgress.status === 'alert' ? 'alert' : 'idle'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-brand-cyan dark:text-brand-cyan-dark text-4xl mb-4">
            🦊
          </div>
          <p className="text-muted-light dark:text-muted-dark">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark transition-colors duration-200">
      {/* Modal de Voice Recorder */}
      {showVoiceRecorder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 max-w-lg w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
                Registrar Gasto
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowVoiceRecorder(false)}
                aria-label="Cerrar"
              >
                ✕
              </Button>
            </div>
            <VoiceRecorder onClose={() => setShowVoiceRecorder(false)} />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text-light dark:text-text-dark mb-1">
            🦊 Foxy
          </h1>
          <p className="text-muted-light dark:text-muted-dark">
            Tu asistente financiero
          </p>
        </header>

        {/* Budget Progress */}
        <section className="mb-8 bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-md">
          <BudgetBar
            spent={budgetProgress.spent}
            limit={budgetProgress.limit}
            percentage={budgetProgress.percentage}
            status={budgetProgress.status}
          />
          
          {/* Stats adicionales */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-divider-light dark:border-divider-dark">
            <div>
              <p className="text-xs text-muted-light dark:text-muted-dark mb-1">
                Promedio diario
              </p>
              <p className="text-lg font-semibold text-text-light dark:text-text-dark">
                {(budgetProgress.averageDaily / 100).toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-light dark:text-muted-dark mb-1">
                Días restantes
              </p>
              <p className="text-lg font-semibold text-text-light dark:text-text-dark">
                {budgetProgress.daysLeft} días
              </p>
            </div>
          </div>
        </section>

        {/* Foxy Avatar */}
        <section className="mb-8 flex justify-center">
          <FoxyAvatar state={foxyState} size="lg" />
        </section>

        {/* Recent Spends */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-md">
          <RecentSpends
            spends={spends}
            limit={5}
            onViewAll={() => {
              // TODO: navegar a página de gastos completa cuando implementemos routing
              console.log('Ver todos los gastos')
            }}
          />
        </section>
      </div>

      {/* Floating Action Button (Mic) */}
      <button
        onClick={() => setShowVoiceRecorder(true)}
        className="fixed bottom-6 right-6 w-16 h-16 sm:w-18 sm:h-18 bg-gradient-to-br from-brand-cyan-neon to-brand-cyan rounded-full shadow-mic flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan/50"
        aria-label="Registrar gasto por voz"
      >
        <span className="text-3xl" aria-hidden="true">
          🎤
        </span>
      </button>
    </div>
  )
}

