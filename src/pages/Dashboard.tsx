/**
 * Dashboard Page
 * Pantalla principal con resumen de presupuesto, gastos recientes y Foxy
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLoadSpends, useSwipeNavigation } from '@/hooks'
import { useBudgetProgress } from '@/hooks/useBudgetProgress'
import { useSpendStore } from '@/stores/useSpendStore'
import { BudgetBar, RecentSpends } from '@/components/dashboard'
import { FoxyAvatar } from '@/components/foxy'
import { BottomNav, PageIndicator } from '@/components/ui'
import { VoiceInputPage } from './VoiceInputPage'
import { ManualInputPage } from './ManualInputPage'

// TODO: obtener el límite mensual de settings cuando implementemos esa funcionalidad
const MONTHLY_LIMIT_CENTS = 100000 // 1000€ por defecto

const pageTransition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export function Dashboard() {
  const navigate = useNavigate()
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const { onDragEnd, currentIndex, totalRoutes, direction } = useSwipeNavigation();

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
  };
  
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

  // Si está en modo voz, mostrar pantalla completa de voz
  if (showVoiceInput) {
    return <VoiceInputPage onClose={() => setShowVoiceInput(false)} />
  }

  // Si está en modo manual, mostrar pantalla de entrada manual
  if (showManualInput) {
    return <ManualInputPage onClose={() => setShowManualInput(false)} />
  }

  return (
    <motion.div
      className="fixed inset-0 bg-bg-light dark:bg-bg-dark transition-colors duration-200 overflow-y-auto"
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
      {/* Page Indicator */}
      <div className="pt-4">
        <PageIndicator
          currentIndex={currentIndex}
          totalPages={totalRoutes}
          className="py-2"
        />
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
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

        {/* Foxy Avatar - PROTAGONISTA para activar voz */}
        <section className="mb-8 flex flex-col items-center gap-3">
          {/* Botón de voz GRANDE y prominente */}
          <button
            onClick={() => setShowVoiceInput(true)}
            className="relative focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-cyan rounded-full transition-transform hover:scale-105 active:scale-95"
            aria-label="Registrar gasto por voz"
          >
            {/* Ring animado para llamar la atención */}
            <div className="absolute inset-0 rounded-full bg-brand-cyan/20 animate-pulse-ring" />
            <FoxyAvatar state={foxyState} size="lg" />
          </button>
          
          {/* Call to action claro */}
          <div className="text-center">
            <p className="text-lg font-medium text-text-light dark:text-text-dark mb-1">
              Toca a Foxy para registrar por voz
            </p>
            <p className="text-xs text-muted-light dark:text-muted-dark">
              Es la forma más rápida
            </p>
          </div>
          
          {/* Botón manual DISCRETO (solo texto, sin botón visible) */}
          <button
            onClick={() => setShowManualInput(true)}
            className="text-xs text-muted-light dark:text-muted-dark hover:text-text-light dark:hover:text-text-dark transition-colors underline decoration-dashed"
          >
            ✏️ O escribe manualmente
          </button>
        </section>

        {/* Recent Spends */}
        <section className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-md">
          <RecentSpends
            spends={spends}
            limit={5}
            onViewAll={() => navigate('/spends')}
          />
        </section>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </motion.div>
  )
}

