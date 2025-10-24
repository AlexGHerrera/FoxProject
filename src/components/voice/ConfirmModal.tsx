/**
 * ConfirmModal Component
 * Modal para confirmar/editar gasto parseado
 * Solo se muestra si confidence < 0.8
 * Si confidence >= 0.8, se auto-confirma
 */

import { useState } from 'react'
import { Modal, ModalFooter } from '../ui/Modal'
import { Button } from '../ui/Button'
import type { ParsedSpend } from '../../adapters/ai/IAIProvider'
import { CATEGORIES } from '../../config/constants'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  parsedSpend: ParsedSpend
  onConfirm: (spend: ParsedSpend) => void
  onCancel: () => void
}

export function ConfirmModal({
  isOpen,
  onClose,
  parsedSpend,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [editing, setEditing] = useState(false)
  const [editedSpend, setEditedSpend] = useState<ParsedSpend>(parsedSpend)

  const handleConfirm = () => {
    onConfirm(editing ? editedSpend : parsedSpend)
    onClose()
  }

  const handleCancel = () => {
    onCancel()
    onClose()
  }

  const formatAmount = (eur: number) => {
    return eur.toFixed(2)
  }

  const handleAmountChange = (value: string) => {
    const eur = parseFloat(value)
    setEditedSpend({ ...editedSpend, amountEur: eur })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Confirmar gasto"
      size="md"
      closeOnBackdrop={false}
      footer={
        <ModalFooter
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          cancelText="Cancelar"
          confirmText={editing ? 'Guardar cambios' : 'Confirmar'}
        />
      }
    >
      <div className="space-y-4">
        {/* Confidence indicator */}
        <div className="flex items-center justify-between p-3 bg-chip-bg-light dark:bg-chip-bg-dark rounded-md">
          <span className="text-sm text-muted-light dark:text-muted-dark">
            Confianza del análisis
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-divider-light dark:bg-divider-dark rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  parsedSpend.confidence >= 0.7
                    ? 'bg-success'
                    : parsedSpend.confidence >= 0.5
                    ? 'bg-warning'
                    : 'bg-danger'
                }`}
                style={{ width: `${parsedSpend.confidence * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-text-light dark:text-text-dark">
              {Math.round(parsedSpend.confidence * 100)}%
            </span>
          </div>
        </div>

        {/* Edit mode toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-light dark:text-text-dark">
            {editing ? 'Editar detalles' : 'Revisión automática'}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancelar edición' : 'Editar'}
          </Button>
        </div>

        {/* Display/Edit fields */}
        <div className="space-y-3">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Importe
            </label>
            {editing ? (
              <input
                type="number"
                step="0.01"
                value={formatAmount(editedSpend.amountEur)}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              />
            ) : (
              <p className="text-2xl font-bold text-brand-cyan dark:text-brand-cyan-dark">
                {formatAmount(parsedSpend.amountEur)} €
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
              Categoría
            </label>
            {editing ? (
              <select
                value={editedSpend.category}
                onChange={(e) =>
                  setEditedSpend({ ...editedSpend, category: e.target.value })
                }
                className="w-full px-3 py-2 rounded-md border border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg text-text-light dark:text-text-dark">
                {parsedSpend.category}
              </p>
            )}
          </div>

          {/* Merchant */}
          {(parsedSpend.merchant || editing) && (
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Comercio
              </label>
              {editing ? (
                <input
                  type="text"
                  value={editedSpend.merchant || ''}
                  onChange={(e) =>
                    setEditedSpend({ ...editedSpend, merchant: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                  placeholder="Nombre del comercio"
                />
              ) : (
                <p className="text-lg text-text-light dark:text-text-dark">
                  {parsedSpend.merchant}
                </p>
              )}
            </div>
          )}

          {/* Note */}
          {(parsedSpend.note || editing) && (
            <div>
              <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">
                Nota
              </label>
              {editing ? (
                <textarea
                  value={editedSpend.note || ''}
                  onChange={(e) =>
                    setEditedSpend({ ...editedSpend, note: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-md border border-divider-light dark:border-divider-dark bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-brand-cyan"
                  placeholder="Nota adicional"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-muted-light dark:text-muted-dark">
                  {parsedSpend.note}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Warning if confidence is low */}
        {parsedSpend.confidence < 0.5 && (
          <div className="p-3 bg-warning/10 border border-warning rounded-md">
            <p className="text-sm text-warning">
              ⚠️ La confianza del análisis es baja. Por favor, revisa los datos
              antes de confirmar.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}

