import { useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Spend, getCategoryEmoji, centsToEur } from '@/domain/models';

interface SpendCardProps {
  spend: Spend;
  onEdit?: (spend: Spend) => void;
  onDelete?: (spend: Spend) => void;
  onSelect?: (spend: Spend) => void;
}

const SWIPE_THRESHOLD = -80; // Minimum swipe distance to reveal actions
const ACTIONS_WIDTH = 340; // Width: 3 square buttons (~100px each) + 2 gaps (8px) + padding (16px) = ~340px

export function SpendCard({ spend, onEdit, onDelete, onSelect }: SpendCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const x = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Transform for action buttons opacity (fade in as card slides)
  const actionsOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
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

  const handleDelete = () => {
    if (onDelete && confirm('¿Eliminar este gasto?')) {
      onDelete(spend);
    }
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
        className="absolute right-0 top-0 h-full flex items-center gap-2 pr-2 pl-2"
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
            onClick={handleDelete}
            className="aspect-square h-full bg-red-500 text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Eliminar"
          >
            <span className="text-3xl">✕</span>
          </button>
        )}
      </motion.div>

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
        <div className="flex items-start gap-4">
          {/* Category Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-2xl">
            {getCategoryEmoji(spend.category)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text truncate">
                  {spend.merchant || 'Sin establecimiento'}
                </h3>
                <p className="text-sm text-muted capitalize">{spend.category}</p>
                {spend.note && (
                  <p className="text-sm text-muted mt-1 truncate">{spend.note}</p>
                )}
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right">
                <p className="font-bold text-lg text-text">
                  {centsToEur(spend.amountCents).toFixed(2)} €
                </p>
                <p className="text-xs text-muted">{formattedDate}</p>
              </div>
            </div>

            {/* Method */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 rounded-full bg-surface text-muted">
                {spend.method === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

