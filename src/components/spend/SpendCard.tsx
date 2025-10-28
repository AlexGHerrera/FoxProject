import { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Spend, getCategoryEmoji, centsToEur } from '@/domain/models';
import { ConfirmDialog } from '@/components/ui';

interface SpendCardProps {
  spend: Spend;
  onEdit?: (spend: Spend) => void;
  onDelete?: (spend: Spend) => void;
  onSelect?: (spend: Spend) => void;
}

const SWIPE_THRESHOLD = -80; // Minimum swipe distance to reveal actions
const ACTIONS_WIDTH = 270; // Width: 3 square buttons + gaps, aligned to right edge

export function SpendCard({ spend, onEdit, onDelete, onSelect }: SpendCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const x = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Transform for action buttons opacity (fade in as card slides)
  const actionsOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    
    // If swiped left enough, open
    if (offset < SWIPE_THRESHOLD) {
      setIsOpen(true);
      x.set(-ACTIONS_WIDTH);
    } 
    // If swiped right or not enough, close
    else {
      setIsOpen(false);
      x.set(0);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(spend);
      // Close after action
      setIsOpen(false);
      x.set(0);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(spend);
    }
    // Close swipe after deletion
    setIsOpen(false);
    x.set(0);
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(spend);
      // Close after action
      setIsOpen(false);
      x.set(0);
    }
  };

  // Format date
  const date = new Date(spend.timestamp);
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return (
    <div className="relative overflow-hidden rounded-lg" ref={cardRef}>
      {/* Action Buttons (behind the card) */}
      <motion.div
        className="absolute right-0 top-0 h-full flex items-center gap-2 justify-end"
        style={{ 
          width: ACTIONS_WIDTH,
          opacity: actionsOpacity 
        }}
      >
        {/* Select Button */}
        {onSelect && (
          <button
            onClick={handleSelect}
            className="aspect-square h-full bg-brand-cyan text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Seleccionar"
          >
            <span className="text-3xl">✓</span>
          </button>
        )}

        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={handleEdit}
            className="aspect-square h-full bg-gray-400 text-gray-900 font-bold rounded-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Editar"
          >
            <span className="text-3xl">✏️</span>
          </button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="aspect-square h-full bg-red-500 text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Eliminar"
          >
            <span className="text-3xl">✕</span>
          </button>
        )}
      </motion.div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar este gasto?"
        message={`Se eliminará el gasto de ${centsToEur(spend.amountCents).toFixed(2)} € en ${spend.merchant || spend.category}. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />

      {/* Card (draggable) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -ACTIONS_WIDTH, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isOpen ? { x: -ACTIONS_WIDTH } : { x: 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        className="bg-card rounded-lg p-4 shadow-sm border border-border cursor-grab active:cursor-grabbing relative z-10"
      >
        <div className="flex gap-4">
          {/* Category Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-2xl">
            {getCategoryEmoji(spend.category)}
          </div>

          {/* Content - Aligned to top */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text truncate leading-tight">
                  {spend.merchant || 'Sin establecimiento'}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  {/* Payment method icon */}
                  <span className="text-base" title={spend.paidWith || 'tarjeta'}>
                    {spend.paidWith === 'efectivo' ? '💵' : '💳'}
                  </span>
                </div>
              </div>

              {/* Amount - Aligned to top */}
              <div className="flex-shrink-0 text-right">
                <p className="font-bold text-lg text-text leading-tight">
                  {centsToEur(spend.amountCents).toFixed(2)} €
                </p>
                <p className="text-xs text-muted mt-1">{formattedDate}</p>
              </div>
            </div>
            {spend.note && (
              <p className="text-sm text-muted mt-1.5 truncate">{spend.note}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

