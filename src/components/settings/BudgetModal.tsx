/**
 * BudgetModal Component
 * Modal para configurar el presupuesto mensual
 * Incluye input numérico y sugerencias rápidas
 */

import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Modal, Button } from '@/components/ui'
import { BUDGET_SUGGESTIONS } from '@/config/constants'
import { isValidMonthlyLimit } from '@/domain/models/Settings'
import { centsToEur } from '@/domain/models'

interface BudgetModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BudgetModal({ isOpen, onClose }: BudgetModalProps) {
  const { settings, isLoading, updateSettings } = useSettings()
  const [budgetEur, setBudgetEur] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar valor inicial cuando settings estén disponibles o cuando el modal se abre
  useEffect(() => {
    if (isOpen && settings?.monthlyLimitCents !== undefined) {
      setBudgetEur(centsToEur(settings.monthlyLimitCents))
    }
  }, [settings, isOpen])

  const handleInputChange = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1000000) {
      setBudgetEur(numValue)
    } else if (value === '') {
      setBudgetEur(0)
    }
  }

  const handleSuggestionClick = (cents: number) => {
    setBudgetEur(centsToEur(cents))
  }

  const handleSave = async () => {
    try {
      const budgetCents = Math.round(budgetEur * 100)

      // Validar antes de guardar
      if (!isValidMonthlyLimit(budgetCents)) {
        return // El toast de error se mostrará desde el hook
      }

      setIsSaving(true)
      await updateSettings({ monthlyLimitCents: budgetCents })
      onClose()
    } catch (error) {
      // Error ya manejado por el hook con toast
      console.error('[BudgetModal] Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Presupuesto mensual">
      <div className="space-y-6">
        {/* Input numérico */}
        <div>
          <label
            htmlFor="budget-input"
            className="block text-sm font-semibold text-text mb-3"
          >
            Configura tu límite de gastos
          </label>
          <div className="relative">
            <input
              id="budget-input"
              type="number"
              min="0"
              max="1000000"
              step="0.01"
              value={budgetEur === 0 ? '' : budgetEur}
              onChange={(e) => handleInputChange(e.target.value)}
              disabled={isLoading || isSaving}
              className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text text-lg font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan disabled:opacity-50 disabled:cursor-not-allowed pr-8"
              aria-label="Presupuesto mensual en euros"
              placeholder="0"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-muted pointer-events-none">
              €
            </span>
          </div>
        </div>

        {/* Sugerencias rápidas como chips */}
        <div>
          <label className="block text-sm font-semibold text-text mb-3">
            Sugerencias rápidas
          </label>
          <div className="grid grid-cols-3 gap-2">
            {BUDGET_SUGGESTIONS.map((cents) => {
              const amount = centsToEur(cents)
              const formattedAmount = amount.toLocaleString('es-ES', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })
              const isSelected = budgetEur === amount

              return (
                <button
                  key={cents}
                  onClick={() => handleSuggestionClick(cents)}
                  disabled={isLoading || isSaving}
                  className={`
                    px-4 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px]
                    ${
                      isSelected
                        ? 'bg-brand-cyan text-white shadow-md'
                        : 'bg-card text-text border border-border hover:border-brand-cyan hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {formattedAmount}€
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            loading={isSaving}
            disabled={isLoading || isSaving || budgetEur < 0}
            className="flex-1"
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

