import { useState } from 'react';
import { getCategoryEmoji } from '@/domain/models';
import { Modal, Button } from '@/components/ui';
import { PaymentMethodToggle } from './PaymentMethodToggle';
import { CATEGORIES } from '@/config/constants';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  onSave: (changes: BulkEditChanges) => Promise<void>;
}

export interface BulkEditChanges {
  paidWith?: 'efectivo' | 'tarjeta';
  category?: string;
}

export function BulkEditModal({ isOpen, onClose, count, onSave }: BulkEditModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'efectivo' | 'tarjeta' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const changes: BulkEditChanges = {};
    
    if (selectedPaymentMethod) {
      changes.paidWith = selectedPaymentMethod;
    }
    
    if (selectedCategory) {
      changes.category = selectedCategory;
    }

    // Don't save if no changes
    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      await onSave(changes);
      onClose();
      // Reset selections
      setSelectedPaymentMethod(null);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Error saving bulk edit:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedPaymentMethod(null);
    setSelectedCategory(null);
    onClose();
  };

  const hasChanges = selectedPaymentMethod !== null || selectedCategory !== null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text">
            Editar {count} {count === 1 ? 'gasto' : 'gastos'}
          </h2>
          <button
            onClick={handleClose}
            className="text-muted hover:text-text transition-colors"
            aria-label="Cerrar"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Payment Method */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted block mb-2">
            Cambiar método de pago (opcional)
          </label>
          <div className="space-y-2">
            <PaymentMethodToggle
              value={selectedPaymentMethod || 'tarjeta'}
              onChange={setSelectedPaymentMethod}
            />
            {selectedPaymentMethod && (
              <button
                onClick={() => setSelectedPaymentMethod(null)}
                className="text-xs text-muted hover:text-text transition-colors"
              >
                ✕ No cambiar método de pago
              </button>
            )}
          </div>
        </div>

        {/* Category */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted block mb-2">
            Cambiar categoría (opcional)
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`p-3 rounded-lg text-3xl transition-all ${
                  selectedCategory === cat
                    ? 'bg-brand-cyan/20 ring-2 ring-brand-cyan scale-110'
                    : 'bg-card hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={cat}
                aria-label={cat}
                aria-pressed={selectedCategory === cat}
              >
                {getCategoryEmoji(cat)}
              </button>
            ))}
          </div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-muted hover:text-text transition-colors"
            >
              ✕ No cambiar categoría
            </button>
          )}
        </div>

        {/* Warning */}
        {hasChanges && (
          <div className="mb-6 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
              <span>⚠️</span>
              <span>
                Se actualizarán <strong>{count}</strong> {count === 1 ? 'gasto' : 'gastos'} con los cambios seleccionados.
              </span>
            </p>
          </div>
        )}

        {/* Info if no changes */}
        {!hasChanges && (
          <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2">
              <span>ℹ️</span>
              <span>
                Selecciona al menos un cambio para aplicar a los gastos seleccionados.
              </span>
            </p>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleClose} fullWidth disabled={isSaving}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            fullWidth 
            loading={isSaving}
            disabled={!hasChanges}
          >
            Aplicar cambios
          </Button>
        </div>
      </div>
    </Modal>
  );
}

