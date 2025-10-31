import { useState } from 'react'
import { Banknote, CreditCard, Smartphone } from 'lucide-react'
import { Modal, Button, CategoryIcon, FilterChip } from '@/components/ui'
import { CATEGORIES } from '@/config/constants'
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
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                    ${
                      isSelected
                        ? 'bg-brand-cyan text-white shadow-md'
                        : 'bg-card text-text border border-border hover:border-brand-cyan'
                    }
                  `}
                >
                  <div className="flex-shrink-0 scale-75">
                    <CategoryIcon category={category} size="sm" />
                  </div>
                  <span className="truncate">{category}</span>
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
                <FilterChip
                  key={range.value}
                  label={range.label}
                  selected={isSelected}
                  onClick={() =>
                    setLocalFilters((prev) => ({ ...prev, dateRange: range.value }))
                  }
                />
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
              
              // Get icon based on payment method
              const getIcon = () => {
                switch (method.value) {
                  case 'cash':
                    return <Banknote size={16} strokeWidth={2.5} />
                  case 'card':
                    return <CreditCard size={16} strokeWidth={2.5} />
                  case 'transfer':
                    return <Smartphone size={16} strokeWidth={2.5} />
                  default:
                    return undefined
                }
              }
              
              return (
                <FilterChip
                  key={method.value}
                  label={method.label}
                  icon={getIcon()}
                  selected={isSelected}
                  onClick={() =>
                    setLocalFilters((prev) => ({ ...prev, paymentMethod: method.value }))
                  }
                />
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

