import { useState } from 'react'
import { Modal, Button } from '@/components/ui'
import { CATEGORIES } from '@/config/constants'
import { getCategoryEmoji } from '@/domain/models'
import type { SpendFilters } from './types'
import type { Category } from '@/domain/models'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  currentFilters: SpendFilters
  onApply: (filters: SpendFilters) => void
}

const DATE_RANGES = [
  { value: 'today', label: 'Hoy' },
  { value: 'this-week', label: 'Esta semana' },
  { value: 'this-month', label: 'Este mes' },
  { value: 'last-month', label: 'Mes pasado' },
  { value: 'all', label: 'Todo' },
] as const

const PAYMENT_METHODS = [
  { value: 'all', label: 'Todos' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
] as const

export function FilterModal({ isOpen, onClose, currentFilters, onApply }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<SpendFilters>(currentFilters)

  const handleCategoryToggle = (category: Category) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  const handleReset = () => {
    const resetFilters: SpendFilters = {
      categories: [],
      dateRange: 'this-month',
      paymentMethod: 'all',
    }
    setLocalFilters(resetFilters)
    onApply(resetFilters)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtrar gastos">
      <div className="space-y-6">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">Categorías</h3>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((category) => {
              const isSelected = localFilters.categories.includes(category)
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      isSelected
                        ? 'bg-brand-cyan text-white shadow-md'
                        : 'bg-card text-text border border-border hover:border-brand-cyan'
                    }
                  `}
                >
                  <span className="mr-2">{getCategoryEmoji(category)}</span>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Date Range */}
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">Período</h3>
          <div className="flex flex-wrap gap-2">
            {DATE_RANGES.map((range) => {
              const isSelected = localFilters.dateRange === range.value
              return (
                <button
                  key={range.value}
                  onClick={() =>
                    setLocalFilters((prev) => ({ ...prev, dateRange: range.value }))
                  }
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${
                      isSelected
                        ? 'bg-brand-cyan text-white shadow-md'
                        : 'bg-card text-text border border-border hover:border-brand-cyan'
                    }
                  `}
                >
                  {range.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="text-sm font-semibold text-text mb-3">Método de pago</h3>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => {
              const isSelected = localFilters.paymentMethod === method.value
              return (
                <button
                  key={method.value}
                  onClick={() =>
                    setLocalFilters((prev) => ({ ...prev, paymentMethod: method.value }))
                  }
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${
                      isSelected
                        ? 'bg-brand-cyan text-white shadow-md'
                        : 'bg-card text-text border border-border hover:border-brand-cyan'
                    }
                  `}
                >
                  {method.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={handleReset} className="flex-1">
            Limpiar
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Aplicar filtros
          </Button>
        </div>
      </div>
    </Modal>
  )
}

