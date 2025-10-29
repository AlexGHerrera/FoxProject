import { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Spend, getCategoryEmoji, centsToEur } from '@/domain/models';
import { ConfirmDialog } from '@/components/ui';

interface SpendCardProps {
  spend: Spend;
  onEdit?: (spend: Spend) => void;
  onDelete?: (spend: Spend) => void;
  onSelect?: (spend: Spend) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (spend: Spend) => void;
}

const SWIPE_THRESHOLD = -40; // Minimum swipe distance to reveal actions (reduced for better UX)
const BUTTON_GAP = 8; // Gap between buttons
const ACTIONS_PADDING = 8; // Right padding
const AUTO_CLOSE_DELAY = 3000; // Auto-close after 3 seconds

export function SpendCard({ 
  spend, 
  onEdit, 
  onDelete, 
  onSelect, 
  selectionMode = false,
  isSelected = false,
  onToggleSelect 
}: SpendCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionsWidth, setActionsWidth] = useState(200); // Default width
  const x = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  // Measure card height and calculate actions width dynamically
  useLayoutEffect(() => {
    if (cardRef.current) {
      const cardHeight = cardRef.current.offsetHeight;
      // Calculate: 3 square buttons (height = width) + 2 gaps + padding
      const calculatedWidth = (cardHeight * 3) + (BUTTON_GAP * 2) + ACTIONS_PADDING;
      setActionsWidth(calculatedWidth);
    }
  }, [spend.note]); // Recalculate when note changes (affects height)

  // Auto-close after 3 seconds of inactivity
  useEffect(() => {
    if (isOpen) {
      // Clear any existing timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      
      // Set new timeout to close after 3 seconds
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
      }, AUTO_CLOSE_DELAY);
    }

    // Cleanup timeout on unmount or when isOpen changes
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  // Transform for action buttons opacity (fade in as card slides)
  const actionsOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Consider velocity for better feel
    // If swiping fast to the left, open even if not past threshold
    const shouldOpen = offset < SWIPE_THRESHOLD || (velocity < -300 && offset < -15);
    
    // Always set a definitive state (open or closed)
    // This ensures the card always animates to a final position
    setIsOpen(shouldOpen);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(spend);
      // Close after action
      setIsOpen(false);
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
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(spend);
      // Close after action
      setIsOpen(false);
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
        className="absolute right-0 top-0 h-full flex items-stretch pr-2"
        style={{ 
          width: actionsWidth,
          opacity: actionsOpacity,
          gap: `${BUTTON_GAP}px`
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
        drag={selectionMode ? false : "x"}
        dragConstraints={{ left: -actionsWidth, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        dragTransition={{
          bounceStiffness: 500,
          bounceDamping: 35,
        }}
        onDragEnd={handleDragEnd}
        style={{ x: selectionMode ? 0 : x }}
        animate={isOpen && !selectionMode ? { x: -actionsWidth } : { x: 0 }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
        className={`rounded-lg p-4 shadow-sm border relative z-10 ${
          selectionMode 
            ? isSelected 
              ? 'bg-brand-cyan/10 border-brand-cyan cursor-pointer' 
              : 'bg-card border-border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800'
            : 'bg-card border-border cursor-grab active:cursor-grabbing'
        }`}
        onClick={selectionMode && onToggleSelect ? () => onToggleSelect(spend) : undefined}
      >
        <div className="flex gap-4 items-start h-full">
          {/* Category Icon */}
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-2xl">
            {getCategoryEmoji(spend.category)}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-text truncate leading-tight">
                  {spend.merchant || 'Sin establecimiento'}
                </h3>
                {spend.note && (
                  <p className="text-sm text-muted truncate line-clamp-1 mt-0.5">{spend.note}</p>
                )}
                <div className="flex items-center gap-1.5 mt-1">
                  {/* Payment method icon */}
                  <span className="text-base" title={spend.paidWith || 'tarjeta'}>
                    {spend.paidWith === 'efectivo' ? '💵' : '💳'}
                  </span>
                </div>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right">
                <p className="font-bold text-lg text-text leading-tight">
                  {centsToEur(spend.amountCents).toFixed(2)} €
                </p>
                <p className="text-xs text-muted mt-1">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

