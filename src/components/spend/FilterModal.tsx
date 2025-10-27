import { useState } from 'react';
import { Modal } from '@/components/ui';
import { CATEGORIES, PAYMENT_METHODS } from '@/config/constants';
import { getCategoryEmoji } from '@/domain/models';
import type { SpendFilters } from './types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: SpendFilters;
  onApply: (filters: SpendFilters) => void;
}

export function FilterModal({
  isOpen,
  onClose,
  currentFilters,
  onApply,
}: FilterModalProps) {
  const [filters, setFilters] = useState<SpendFilters>(currentFilters);

  // Current month/year
  const currentDate = new Date();
  const monthYear = new Intl.DateTimeFormat('es-ES', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    const defaultFilters: SpendFilters = {
      dateRange: 'this-month',
      categories: [],
      paymentMethod: 'all',
      sortBy: 'recent',
    };
    setFilters(defaultFilters);
  };

  const toggleCategory = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Filtros">
      <div className="space-y-6 p-4">
        {/* Current Month Display */}
        <div className="flex items-center justify-between p-4 bg-surface rounded-lg">
          <div>
            <p className="text-sm text-muted">Mes actual:</p>
            <p className="text-lg font-semibold text-text capitalize">{monthYear}</p>
          </div>
          <div className="text-3xl">🦊</div>
        </div>

        {/* Date Range */}
        <div>
          <h3 className="font-semibold text-text mb-3">Rango de fechas</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'today', label: 'Hoy' },
              { value: 'this-week', label: 'Esta semana' },
              { value: 'this-month', label: 'Este mes' },
              { value: 'custom', label: 'Personalizado' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: option.value as SpendFilters['dateRange'],
                  }))
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.dateRange === option.value
                    ? 'bg-brand-cyan text-white'
                    : 'bg-surface text-text hover:bg-brand-cyan/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="font-semibold text-text mb-3">Categorías</h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.categories.includes(category)
                    ? 'bg-brand-cyan text-white'
                    : 'bg-surface text-text hover:bg-brand-cyan/10'
                }`}
              >
                <span>{getCategoryEmoji(category)}</span>
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <h3 className="font-semibold text-text mb-3">Método de pago</h3>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Todos', icon: '💳' },
              { value: 'efectivo', label: 'Efectivo', icon: '💵' },
              { value: 'tarjeta', label: 'Tarjeta', icon: '💳' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    paymentMethod: option.value as SpendFilters['paymentMethod'],
                  }))
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
                  filters.paymentMethod === option.value
                    ? 'bg-brand-cyan text-white'
                    : 'bg-surface text-text hover:bg-brand-cyan/10'
                }`}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <h3 className="font-semibold text-text mb-3">Ordenar por</h3>
          <div className="flex gap-2">
            {[
              { value: 'recent', label: 'Más reciente' },
              { value: 'amount', label: 'Mayor gasto' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    sortBy: option.value as SpendFilters['sortBy'],
                  }))
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 ${
                  filters.sortBy === option.value
                    ? 'bg-brand-cyan text-white'
                    : 'bg-surface text-text hover:bg-brand-cyan/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 p-4 border-t border-border">
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-3 text-sm font-medium text-text bg-surface rounded-lg hover:bg-muted transition-colors"
        >
          Borrar
        </button>
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-3 text-sm font-medium text-white bg-brand-cyan rounded-lg hover:bg-brand-cyan/90 transition-colors"
        >
          Aplicar filtros
        </button>
      </div>
    </Modal>
  );
}

