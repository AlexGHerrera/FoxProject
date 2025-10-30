/**
 * QuickConfirmScreen Component
 * Pantalla simple y rápida para confirmar múltiples gastos
 * Diseño voz-first: pocos clicks, estética bonita
 * Con swipe para editar/eliminar gastos individuales
 */

import { useState } from 'react'
import { FoxyAvatar } from '../foxy'
import { Button } from '../ui'
import { ConfirmSpendCard } from './ConfirmSpendCard'
import { ParsedSpendEditModal } from './ParsedSpendEditModal'
import type { ParsedSpend, ParsedSpendResult } from '../../domain/models'

interface QuickConfirmScreenProps {
  result: ParsedSpendResult
  onConfirm: (spends: ParsedSpend[]) => void
  onEditText: () => void
  onCancel: () => void
}

export function QuickConfirmScreen({
  result,
  onConfirm,
  onEditText,
  onCancel,
}: QuickConfirmScreenProps) {
  const [spends, setSpends] = useState<ParsedSpend[]>(result.spends)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const { totalConfidence } = result
  
  const count = spends.length
  const total = spends.reduce((sum, s) => sum + s.amountEur, 0)
  
  // Solo mostrar edición si confidence baja (< 0.8)
  const showEditOption = totalConfidence < 0.8

  // Recalcular totalConfidence cuando se modifican los gastos
  const currentTotalConfidence =
    spends.length > 0
      ? spends.reduce((sum, s) => sum + s.confidence, 0) / spends.length
      : totalConfidence

  const handleEditSpend = (spend: ParsedSpend, index: number) => {
    setEditingIndex(index)
  }

  const handleSaveSpend = (updatedSpend: ParsedSpend) => {
    const newSpends = [...spends]
    newSpends[editingIndex!] = updatedSpend
    setSpends(newSpends)
    setEditingIndex(null)
  }

  const handleDeleteSpend = (index: number) => {
    const newSpends = spends.filter((_, i) => i !== index)
    setSpends(newSpends)
    
    // Si no quedan gastos, cancelar
    if (newSpends.length === 0) {
      onCancel()
    }
  }

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col items-center p-6 pb-28 overflow-y-auto">
      {/* Foxy Avatar - Estado feliz */}
      <div className="mb-6 mt-8">
        <FoxyAvatar state="happy" size="lg" />
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold text-text-light dark:text-text-dark mb-2 text-center">
        {count === 1 
          ? '✓ He detectado un gasto'
          : `✓ He detectado ${count} gastos`
        }
      </h1>

      {/* Lista de gastos - Diseño compacto y bonito con swipe */}
      <div className="w-full max-w-md space-y-3 my-6">
        {spends.map((spend, index) => (
          <ConfirmSpendCard
            key={index}
            spend={spend}
            index={index}
            totalCount={count}
            onEdit={handleEditSpend}
            onDelete={handleDeleteSpend}
          />
        ))}
      </div>

      {/* Total (solo si múltiples) */}
      {count > 1 && (
        <div className="w-full max-w-md mb-6 p-4 bg-chip-bg-light dark:bg-chip-bg-dark rounded-xl border border-divider-light dark:border-divider-dark">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-text-light dark:text-text-dark">
              Total
            </span>
            <span className="text-2xl font-bold text-brand-cyan dark:text-brand-cyan-dark">
              {total.toFixed(2)} €
            </span>
          </div>
          
          {/* Confidence total */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-muted-light dark:text-muted-dark">
              Confianza del análisis
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-divider-light dark:bg-divider-dark rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    currentTotalConfidence >= 0.7
                      ? 'bg-success'
                      : currentTotalConfidence >= 0.5
                      ? 'bg-warning'
                      : 'bg-danger'
                  }`}
                  style={{ width: `${currentTotalConfidence * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-text-light dark:text-text-dark">
                {(currentTotalConfidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Botón principal - Confirmar (grande y táctil) */}
      <div className="w-full max-w-md space-y-3 mb-6">
        <Button
          variant="primary"
          onClick={() => onConfirm(spends)}
          className="w-full text-lg py-4 font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          ✓ {count === 1 ? 'Confirmar' : `Confirmar ${count} gastos`}
        </Button>

        {/* Opciones secundarias */}
        <div className="flex gap-3">
          {/* Editar texto (solo si confidence baja) */}
          {showEditOption && (
            <Button
              variant="secondary"
              onClick={onEditText}
              className="flex-1 text-sm py-3"
            >
              ✏️ Editar texto
            </Button>
          )}
          
          {/* Cancelar */}
          <Button
            variant="ghost"
            onClick={onCancel}
            className={showEditOption ? 'flex-1 text-sm py-3' : 'w-full text-sm py-3'}
          >
            ✕ Cancelar
          </Button>
        </div>
      </div>

      {/* Modal de edición de gasto individual */}
      {editingIndex !== null && (
        <ParsedSpendEditModal
          isOpen={editingIndex !== null}
          onClose={() => setEditingIndex(null)}
          spend={spends[editingIndex]}
          onSave={handleSaveSpend}
        />
      )}
    </div>
  )
}

