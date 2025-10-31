import { useState } from 'react';
import { Spend, centsToEur, UpdateSpendData } from '@/domain/models';
import { Modal, Button, CategoryIcon } from '@/components/ui';
import { PaymentMethodToggle } from './PaymentMethodToggle';
import { CATEGORIES } from '@/config/constants';

interface SpendEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  spend: Spend;
  onSave: (updatedData: UpdateSpendData) => Promise<void>;
}

export function SpendEditModal({ isOpen, onClose, spend, onSave }: SpendEditModalProps) {
  const [formData, setFormData] = useState({
    amountCents: spend.amountCents,
    merchant: spend.merchant || '',
    category: spend.category,
    paidWith: (spend.paidWith || 'tarjeta') as 'efectivo' | 'tarjeta',
    note: spend.note || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving spend:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAmountChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setFormData({
        ...formData,
        amountCents: Math.round(numValue * 100)
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text">Editar gasto</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-text transition-colors"
            aria-label="Cerrar"
          >
            <span className="text-2xl">✕</span>
          </button>
        </div>

        {/* Payment Method Toggle */}
        <div className="mb-4">
          <label className="text-sm font-medium text-muted block mb-2">
            Método de pago
          </label>
          <PaymentMethodToggle
            value={formData.paidWith}
            onChange={(method) => setFormData({ ...formData, paidWith: method })}
          />
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-muted block mb-2">
            Importe
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={centsToEur(formData.amountCents).toFixed(2)}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-border bg-card text-text text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-cyan"
              placeholder="0.00"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted font-semibold">
              €
            </span>
          </div>
        </div>

        {/* Merchant Input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-muted block mb-2">
            Establecimiento
          </label>
          <input
            type="text"
            value={formData.merchant}
            onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-text focus:outline-none focus:ring-2 focus:ring-brand-cyan"
            placeholder="Ej: Mercadona, Starbucks..."
          />
        </div>

        {/* Category Grid */}
        <div className="mb-4">
          <label className="text-sm font-medium text-muted block mb-2">
            Categoría
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`p-2 rounded-lg transition-all flex items-center justify-center ${
                  formData.category === cat
                    ? 'bg-brand-cyan/20 ring-2 ring-brand-cyan scale-105'
                    : 'bg-card hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                title={cat}
                aria-label={cat}
                aria-pressed={formData.category === cat}
              >
                <CategoryIcon category={cat} size="md" />
              </button>
            ))}
          </div>
        </div>

        {/* Note Textarea */}
        <div className="mb-6">
          <label className="text-sm font-medium text-muted block mb-2">
            Comentario (opcional)
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            rows={2}
            className="w-full px-4 py-3 rounded-lg border border-border bg-card text-text focus:outline-none focus:ring-2 focus:ring-brand-cyan resize-none"
            placeholder="Añade una nota..."
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} fullWidth loading={isSaving}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </Modal>
  );
}






