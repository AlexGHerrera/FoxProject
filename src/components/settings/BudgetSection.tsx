/**
 * BudgetSection Component
 * Sección de configuración de presupuesto mensual
 * Permite establecer límite mensual con input numérico y sugerencias rápidas
 */

import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Button } from '@/components/ui'
import { BUDGET_SUGGESTIONS } from '@/config/constants'
import { isValidMonthlyLimit } from '@/domain/models/Settings'
import { centsToEur } from '@/domain/models'

export function BudgetSection() {
  const { settings, isLoading, updateSettings } = useSettings()
  const [budgetEur, setBudgetEur] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)

  // Cargar valor inicial cuando settings estén disponibles
  useEffect(() => {
    if (settings?.monthlyLimitCents !== undefined) {
      setBudgetEur(centsToEur(settings.monthlyLimitCents))
    }
  }, [settings])

  const handleInputChange = (value: string) => {
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 1000000) {
      setBudgetEur(numValue)
    } else if (value === '') {
      setBudgetEur(0)
    }
  }

  const handleSuggestionSelect = (cents: number) => {
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
    } catch (error) {
      // Error ya manejado por el hook con toast
      console.error('[BudgetSection] Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-3xl">💰</div>
        <div className="flex-1">
          <h3 className="font-semibold text-text text-base">Presupuesto mensual</h3>
          <p className="text-sm text-muted">Configura tu límite de gastos</p>
        </div>
      </div>

      {/* Input y Dropdown */}
      <div className="space-y-4">
        {/* Input numérico */}
        <div>
          <label
            htmlFor="budget-input"
            className="block text-sm font-medium text-text mb-2"
          >
            Presupuesto (€)
          </label>
          <input
            id="budget-input"
            type="number"
            min="0"
            max="1000000"
            step="0.01"
            value={budgetEur === 0 ? '' : budgetEur}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={isLoading || isSaving}
            className="w-full px-4 py-3 rounded-md border border-border bg-surface text-text text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Presupuesto mensual en euros"
            placeholder="0"
          />
        </div>

        {/* Dropdown de sugerencias */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Sugerencias rápidas
          </label>
          <select
            onChange={(e) => {
              const selectedCents = parseInt(e.target.value, 10)
              if (!isNaN(selectedCents)) {
                handleSuggestionSelect(selectedCents)
              }
            }}
            disabled={isLoading || isSaving}
            className="w-full px-4 py-3 rounded-md border border-border bg-surface text-text text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:border-brand-cyan disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            aria-label="Seleccionar presupuesto sugerido"
            defaultValue=""
          >
            <option value="">Selecciona una sugerencia...</option>
            {BUDGET_SUGGESTIONS.map((cents) => (
              <option key={cents} value={cents}>
                {centsToEur(cents).toLocaleString('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </option>
            ))}
          </select>
        </div>

        {/* Botón Guardar */}
        <Button
          onClick={handleSave}
          variant="primary"
          size="md"
          fullWidth
          loading={isSaving}
          disabled={isLoading || isSaving || budgetEur < 0}
          className="min-h-[44px]"
        >
          Guardar
        </Button>
      </div>
    </div>
  )
}

