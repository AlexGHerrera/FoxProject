import { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useMotionValue } from 'framer-motion';
import { Check, Pencil, Trash2 } from 'lucide-react';
import { Spend, centsToEur } from '@/domain/models';
import { ConfirmDialog, CategoryIcon } from '@/components/ui';
import { cn } from '@/utils/cn';

interface SpendCardProps {
  spend: Spend;
  onEdit?: (spend: Spend) => void;
  onDelete?: (spend: Spend) => void;
  onSelect?: (spend: Spend) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (spend: Spend) => void;
}

const SWIPE_THRESHOLD = -30; // Minimum swipe distance to reveal actions (aumentado para mejor animación)
const BUTTON_SIZE = 48; // Fixed button size in pixels (48×48px - minimum touch target)
const BUTTON_GAP = 8; // Gap between buttons
const ACTIONS_PADDING = 8; // Right padding
// Calculate fixed width: 3 buttons + 2 gaps + padding
const ACTIONS_WIDTH = (BUTTON_SIZE * 3) + (BUTTON_GAP * 2) + ACTIONS_PADDING; // 168px

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
  const [isDragging, setIsDragging] = useState(false);
  const [targetX, setTargetX] = useState<number | undefined>(undefined);
  const x = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Close card when entering selection mode and reset position when exiting
  useEffect(() => {
    if (selectionMode) {
      setIsOpen(false);
      setTargetX(undefined);
    } else {
      // Reset card position when exiting selection mode
      setIsOpen(false);
      setTargetX(undefined);
      x.set(0);
    }
  }, [selectionMode, x]);

  // Close card on any external interaction (scroll, click outside, etc.)
  useEffect(() => {
    if (!isOpen) return;

    const handleInteraction = (e: Event) => {
      // Don't close if clicking on the card itself or its action buttons
      if (cardRef.current && (cardRef.current.contains(e.target as Node) || 
          (e.target as HTMLElement).closest('.swipe-actions'))) {
        return;
      }
      setIsOpen(false);
      setTargetX(0);
    };

    // Close on scroll
    const handleScroll = () => {
      setIsOpen(false);
      setTargetX(0);
    };

    // Listen to various events
    window.addEventListener('scroll', handleScroll, true); // capture phase for nested scrolls
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, [isOpen]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Determinar estado final basado en posición y velocidad
    const shouldOpen = offset < SWIPE_THRESHOLD || (velocity < -300 && offset < -20);
    setIsOpen(shouldOpen);
    
    // Establecer posición final inmediatamente
    const finalX = shouldOpen ? -ACTIONS_WIDTH : 0;
    setTargetX(finalX);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(spend);
      // Close after action
      setIsOpen(false);
      setTargetX(0);
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
    setTargetX(0);
  };

  const handleSelect = () => {
    if (onSelect) {
      onSelect(spend);
      // Close after action
      setIsOpen(false);
      setTargetX(0);
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
    <div className={`relative overflow-hidden rounded-lg`} ref={cardRef}>
      {/* Action Buttons (behind the card) - Only show when NOT in selection mode */}
      {!selectionMode && (
      <motion.div
        className="swipe-actions absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-2"
        style={{ 
          width: ACTIONS_WIDTH,
          opacity: 1,
          gap: `${BUTTON_GAP}px`
        }}
      >
        {/* Select Button */}
        {onSelect && (
          <button
            onClick={handleSelect}
            className="w-12 h-12 bg-brand-cyan hover:bg-brand-cyan/90 text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2"
            aria-label="Seleccionar"
          >
            <Check size={24} strokeWidth={2.5} />
          </button>
        )}

        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={handleEdit}
            className="w-12 h-12 bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            aria-label="Editar"
          >
            <Pencil size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            aria-label="Eliminar"
          >
            <Trash2 size={20} strokeWidth={2.5} />
          </button>
        )}
      </motion.div>
      )}

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
        dragConstraints={{ left: -ACTIONS_WIDTH, right: 0 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ 
          x: selectionMode ? 0 : x,
          willChange: 'transform'
        }}
        className={cn(
          'rounded-xl p-5 shadow-sm border relative gpu-accelerated',
          selectionMode 
            ? isSelected 
              ? 'bg-brand-cyan/10 border-brand-cyan cursor-pointer backdrop-blur-md scale-[0.98]' 
              : 'bg-card border-border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 backdrop-blur-md'
            : 'bg-card border-border cursor-grab active:cursor-grabbing'
        )}
        animate={
          !isDragging && targetX !== undefined
            ? { x: targetX }
            : false
        }
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        onClick={selectionMode && onToggleSelect ? () => onToggleSelect(spend) : undefined}
      >
        <div className="flex gap-4 items-start h-full">
          {/* Category Icon and Name */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1 w-16">
            <CategoryIcon category={spend.category} size="md" />
            <p className="text-xs text-muted text-center leading-tight w-full break-words font-medium">
              {spend.category}
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="flex items-center justify-between gap-4 relative">
              {/* Spacer para balancear el layout (igual ancho que el icono de categoría) */}
              <div className="flex-shrink-0 w-16"></div>
              
              {/* Merchant name with payment method icon - centered */}
              <div className="flex-1 flex items-center justify-center gap-1.5">
                <h3 className="font-bold text-lg text-text leading-tight text-center">
                  {spend.merchant || 'Sin establecimiento'}
                </h3>
                <span className="text-base flex-shrink-0" title={spend.paidWith || 'tarjeta'}>
                  {spend.paidWith === 'efectivo' ? '💵' : '💳'}
                </span>
              </div>

              {/* Amount */}
              <div className="flex-shrink-0 text-right w-20">
                <p className="font-bold text-lg text-text leading-tight">
                  {centsToEur(spend.amountCents).toFixed(2)} €
                </p>
                <p className="text-xs text-muted mt-1">{formattedDate}</p>
              </div>
            </div>
            {spend.note && (
              <p className="text-sm text-muted truncate line-clamp-1 mt-0.5 text-center">{spend.note}</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

