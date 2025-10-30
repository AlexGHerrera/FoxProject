/**
 * ConfirmModal Component
 * Modal para confirmar/editar uno o MÚLTIPLES gastos parseados
 * Soporta edición inline de cada gasto individualmente
 */

import { useState } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Button } from '../ui/Button'
import { cn } from '@/utils/cn'
import type { ParsedSpend } from '../../domain/models'
import { CATEGORIES, PAYMENT_METHODS } from '../../config/constants'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  parsedSpends: ParsedSpend[]
  totalConfidence: number
  onConfirm: (spends: ParsedSpend[]) => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  onClose,
  parsedSpends,
  totalConfidence,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [editedSpends, setEditedSpends] = useState<ParsedSpend[]>(parsedSpends)

  const handleConfirm = () => {
    onConfirm(editedSpends)
    onClose()
  }

  const handleCancel = () => {
    onCancel()
    onClose()
  }

  const updateSpend = (index: number, updates: Partial<ParsedSpend>) => {
    const newSpends = [...editedSpends]
    newSpends[index] = { ...newSpends[index], ...updates }
    setEditedSpends(newSpends)
  }

  const removeSpend = (index: number) => {
    setEditedSpends(editedSpends.filter((_, i) => i !== index))
  }

  const count = editedSpends.length
  const total = editedSpends.reduce((sum, s) => sum + s.amountEur, 0)

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={count > 1 ? `Confirmar ${count} gastos` : 'Confirmar gasto'}
      size="lg"
      closeOnBackdrop={false}
      footer={
        <ModalFooter
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          cancelText="Cancelar"
          confirmText={`Guardar ${count > 1 ? `${count} gastos` : 'gasto'}`}
        />
      }
    >
      <div className="space-y-4">
        {/* Confidence indicator */}
        <div className="flex items-center justify-between p-3 bg-chip-bg rounded-md">
          <span className="text-sm text-muted">
            Confianza del análisis
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-divider rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  totalConfidence >= 0.7
                    ? 'bg-success'
                    : totalConfidence >= 0.5
                    ? 'bg-warning'
                    : 'bg-danger'
                }`}
                style={{ width: `${totalConfidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text">
              {(totalConfidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Lista de gastos */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {editedSpends.map((spend, index) => (
            <div
              key={index}
              className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg space-y-3 relative"
            >
              {/* Botón eliminar si hay múltiples gastos */}
              {count > 1 && (
                <button
                  onClick={() => removeSpend(index)}
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                  aria-label="Eliminar gasto"
                >
                  ×
                </button>
              )}

              {/* Título del gasto */}
              {count > 1 && (
                <div className="text-xs font-semibold text-muted uppercase">
                  Gasto {index + 1}
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Cantidad (€)
                </label>
                <input
                  type="number"
                  value={spend.amountEur}
                  onChange={(e) => updateSpend(index, { amountEur: parseFloat(e.target.value) || 0 })}
                  step="0.01"
                  min="0"
                  className="input-base"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Categoría
                </label>
                <select
                  value={spend.category}
                  onChange={(e) => updateSpend(index, { category: e.target.value as any })}
                  className="input-base"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Merchant */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Establecimiento
                </label>
                <input
                  type="text"
                  value={spend.merchant}
                  onChange={(e) => updateSpend(index, { merchant: e.target.value })}
                  className="input-base"
                  placeholder="Ej: Mercadona, Zara..."
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-text mb-1">
                  Forma de pago
                </label>
                <select
                  value={spend.paidWith || ''}
                  onChange={(e) => updateSpend(index, { paidWith: e.target.value as any || null })}
                  className="input-base"
                >
                  <option value="">No especificado</option>
                  {PAYMENT_METHODS.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm.charAt(0).toUpperCase() + pm.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              {spend.date && (
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Fecha
                  </label>
                  <input
                    type="text"
                    value={spend.date}
                    onChange={(e) => updateSpend(index, { date: e.target.value })}
                    className="input-base"
                    placeholder="ayer, el martes, hace 3 días..."
                  />
                </div>
              )}

              {/* Note */}
              {spend.note && (
                <div>
                  <label className="block text-sm font-medium text-text mb-1">
                    Nota
                  </label>
                  <input
                    type="text"
                    value={spend.note}
                    onChange={(e) => updateSpend(index, { note: e.target.value })}
                    className="input-base"
                  />
                </div>
              )}

              {/* Confidence individual */}
              <div className="text-xs text-muted">
                Confianza: {(spend.confidence * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        {count > 1 && (
          <div className="pt-3 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-text">
                Total
              </span>
              <span className="text-lg font-bold text-brand-cyan dark:text-brand-cyan-dark">
                {total.toFixed(2)} €
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
