/**
 * RecentSpends Component
 * Muestra los últimos gastos registrados con swipe-to-reveal para editar/eliminar
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, PanInfo, useMotionValue } from 'framer-motion'
import { Pencil, Trash2 } from 'lucide-react'
import type { Spend } from '@/domain/models'
import { centsToEur } from '@/domain/models'
import { ConfirmDialog, CategoryIcon } from '@/components/ui'

interface RecentSpendsProps {
  spends: Spend[]
  limit?: number // número de gastos a mostrar
  onViewAll?: () => void
  onEdit?: (spend: Spend) => void
  onDelete?: (spend: Spend) => void
}

export function RecentSpends({ spends, limit = 5, onViewAll, onEdit, onDelete }: RecentSpendsProps) {
  // Ordenar por timestamp más reciente y limitar
  const recentSpends = useMemo(() => {
    return [...spends]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }, [spends, limit])

  if (spends.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted mb-2">
          🎤 Aún no hay gastos registrados
        </p>
        <p className="text-sm text-muted">
          Usa el botón de micrófono para empezar
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">
          Gastos recientes
        </h2>
        {onViewAll && spends.length > limit && (
          <button
            onClick={onViewAll}
            className="text-sm text-brand-cyan dark:text-brand-cyan-dark hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan rounded px-2 py-1"
          >
            Ver todos →
          </button>
        )}
      </div>

      {/* Lista de gastos con swipe */}
      <div className="space-y-2">
        {recentSpends.map((spend) => (
          <SwipeableSpendCard 
            key={spend.id} 
            spend={spend}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * SwipeableSpendCard - Tarjeta individual de gasto con swipe-to-reveal
 */
interface SwipeableSpendCardProps {
  spend: Spend
  onEdit?: (spend: Spend) => void
  onDelete?: (spend: Spend) => void
}

const SWIPE_THRESHOLD = -30 // Minimum swipe distance to reveal actions (aumentado para mejor animación)
const BUTTON_SIZE = 48 // Fixed button size in pixels (48×48px - minimum touch target)
const BUTTON_GAP = 8 // Gap between buttons
const ACTIONS_PADDING = 8 // Right padding
// Calculate fixed width: 2 buttons (Edit + Delete) + 1 gap + padding
const ACTIONS_WIDTH = (BUTTON_SIZE * 2) + BUTTON_GAP + ACTIONS_PADDING // 112px

function SwipeableSpendCard({ spend, onEdit, onDelete }: SwipeableSpendCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [targetX, setTargetX] = useState<number | undefined>(undefined)
  const x = useMotionValue(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const amountEur = useMemo(() => centsToEur(spend.amountCents), [spend.amountCents])

  // Formatear timestamp relativo (ej: "hace 2h")
  const timeAgo = useMemo(() => {
    const now = new Date()
    const diff = now.getTime() - spend.timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Ahora'
    if (minutes < 60) return `Hace ${minutes}m`
    if (hours < 24) return `Hace ${hours}h`
    if (days === 1) return 'Ayer'
    return `Hace ${days}d`
  }, [spend.timestamp])

  // Close card on any external interaction (scroll, click outside, etc.)
  useEffect(() => {
    if (!isOpen) return

    const handleInteraction = (e: Event) => {
      // Don't close if clicking on the card itself or its action buttons
      if (cardRef.current && (cardRef.current.contains(e.target as Node) || 
          (e.target as HTMLElement).closest('.swipe-actions'))) {
        return
      }
      setIsOpen(false)
      setTargetX(0)
    }

    // Close on scroll
    const handleScroll = () => {
      setIsOpen(false)
      setTargetX(0)
    }

    // Listen to various events
    window.addEventListener('scroll', handleScroll, true) // capture phase for nested scrolls
    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [isOpen])

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)
    const offset = info.offset.x
    const velocity = info.velocity.x
    
    // Determinar estado final basado en posición y velocidad
    const shouldOpen = offset < SWIPE_THRESHOLD || (velocity < -300 && offset < -20)
    setIsOpen(shouldOpen)
    
    // Establecer posición final inmediatamente
    const finalX = shouldOpen ? -ACTIONS_WIDTH : 0
    setTargetX(finalX)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(spend)
      // Close after action
      setIsOpen(false)
      setTargetX(0)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(spend)
    }
    // Close swipe after deletion
    setIsOpen(false)
    setTargetX(0)
  }

  return (
    <div className="relative overflow-hidden rounded-xl" ref={cardRef}>
      {/* Action Buttons (behind the card) */}
      <motion.div
        className="swipe-actions absolute right-0 top-1/2 -translate-y-1/2 flex items-center pr-2"
        style={{ 
          width: ACTIONS_WIDTH,
          opacity: 1,
          gap: `${BUTTON_GAP}px`
        }}
      >
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar este gasto?"
        message={`Se eliminará el gasto de ${amountEur.toFixed(2)} € en ${spend.merchant || spend.category}. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />

      {/* Card (draggable) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -ACTIONS_WIDTH, right: 0 }}
        dragElastic={0.05}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{ 
          x,
          willChange: 'transform'
        }}
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
        className="flex items-center gap-3 p-3 bg-surface rounded-xl cursor-grab active:cursor-grabbing relative z-10 gpu-accelerated"
      >
        {/* Icono de categoría */}
        <div className="flex-shrink-0">
          <CategoryIcon category={spend.category} size="sm" />
        </div>

        {/* Info del gasto */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text truncate">
            {spend.merchant || spend.category}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{spend.category}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Monto */}
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-text">
            {amountEur.toFixed(2)}€
          </p>
          {spend.paidWith && (
            <p className="text-xs text-muted">
              {spend.paidWith === 'efectivo' ? '💵' : '💳'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

