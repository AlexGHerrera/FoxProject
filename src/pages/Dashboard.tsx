/**
 * Dashboard Page
 * Pantalla principal con resumen de presupuesto, gastos recientes y Foxy
 */

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLoadSpends, useSettings } from '@/hooks'
import { useBudgetProgress } from '@/hooks/useBudgetProgress'
import { useSpendStore } from '@/stores/useSpendStore'
import { useUIStore } from '@/stores/useUIStore'
import { BudgetBar, RecentSpends } from '@/components/dashboard'
import { FoxyAvatar } from '@/components/foxy'
import { PageIndicator } from '@/components/ui'
import { SpendEditModal } from '@/components/spend'
import { VoiceInputPage } from './VoiceInputPage'
import { ManualInputPage } from './ManualInputPage'
import type { Spend, UpdateSpendData } from '@/domain/models'

const ROUTES = ['/', '/spends', '/settings'] as const

export function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [showVoiceInput, setShowVoiceInput] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  const [editingSpend, setEditingSpend] = useState<Spend | null>(null)
  const currentIndex = ROUTES.indexOf(location.pathname as typeof ROUTES[number])
  
  // Cargar datos al montar
  useLoadSpends()
  const { settings } = useSettings()
  
  // Obtener estado
  const { spends, isLoading, deleteSpend } = useSpendStore()
  const { showToast } = useUIStore()
  
  // Usar el límite mensual de settings, o 100000 (1000€) por defecto
  const monthlyLimitCents = settings?.monthlyLimitCents ?? 100000
  const budgetProgress = useBudgetProgress(monthlyLimitCents)

  // Determinar estado de Foxy según presupuesto
  const foxyState = budgetProgress.status === 'alert' ? 'alert' : 'idle'

  // Handlers para editar y eliminar
  const handleEdit = (spend: Spend) => {
    setEditingSpend(spend)
  }

  const handleSaveEdit = async (updatedData: UpdateSpendData) => {
    if (!editingSpend) return
    
    try {
      await useSpendStore.getState().updateSpend(editingSpend.id, updatedData)
      showToast('Gasto actualizado correctamente', 'success')
      setEditingSpend(null)
    } catch (error) {
      console.error('Error updating spend:', error)
      showToast('Error al actualizar el gasto', 'error')
      throw error
    }
  }

  const handleDelete = async (spend: Spend) => {
    try {
      await deleteSpend(spend.id)
      showToast('Gasto eliminado correctamente', 'success')
    } catch (error) {
      console.error('Error deleting spend:', error)
      showToast('Error al eliminar el gasto', 'error')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-brand-cyan dark:text-brand-cyan-dark text-4xl mb-4">
            🦊
          </div>
          <p className="text-muted">Cargando...</p>
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
    <div className="h-full bg-background transition-colors duration-200">
      {/* Page Indicator */}
      <div className="pt-4">
        <PageIndicator
          currentIndex={currentIndex}
          totalPages={ROUTES.length}
          className="py-2"
        />
      </div>

      {/* Contenido principal */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-28">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-1">
            🦊 Foxy
          </h1>
          <p className="text-muted">
            Tu asistente financiero
          </p>
        </header>

        {/* Budget Progress */}
        <section className="mb-8 bg-surface rounded-2xl p-6 shadow-md">
          <BudgetBar
            spent={budgetProgress.spent}
            limit={budgetProgress.limit}
            percentage={budgetProgress.percentage}
            status={budgetProgress.status}
          />
          
          {/* Stats adicionales */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-xs text-muted mb-1">
                Promedio diario
              </p>
              <p className="text-lg font-semibold text-text">
                {(budgetProgress.averageDaily / 100).toFixed(2)}€
              </p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">
                Días restantes
              </p>
              <p className="text-lg font-semibold text-text">
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
            <p className="text-lg font-medium text-text mb-1">
              Toca a Foxy para registrar por voz
            </p>
            <p className="text-xs text-muted">
              Es la forma más rápida
            </p>
          </div>
          
          {/* Botón manual DISCRETO (solo texto, sin botón visible) */}
          <button
            onClick={() => setShowManualInput(true)}
            className="text-xs text-muted hover:text-text transition-colors underline decoration-dashed"
          >
            ✏️ O escribe manualmente
          </button>
        </section>

        {/* Recent Spends */}
        <section className="bg-surface rounded-2xl p-6 shadow-md">
          <RecentSpends
            spends={spends}
            limit={5}
            onViewAll={() => navigate('/spends')}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </section>
      </div>

      {/* Edit Spend Modal */}
      {editingSpend && (
        <SpendEditModal
          isOpen={!!editingSpend}
          spend={editingSpend}
          onClose={() => setEditingSpend(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

