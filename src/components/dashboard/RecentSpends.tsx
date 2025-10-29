/**
 * RecentSpends Component
 * Muestra los últimos gastos registrados con swipe-to-reveal para editar/eliminar
 */

import { useState, useMemo, useRef, useLayoutEffect, useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import type { Spend } from '@/domain/models'
import { centsToEur, getCategoryEmoji } from '@/domain/models'
import { ConfirmDialog } from '@/components/ui'

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
        <p className="text-muted-light dark:text-muted-dark mb-2">
          🎤 Aún no hay gastos registrados
        </p>
        <p className="text-sm text-muted-light dark:text-muted-dark">
          Usa el botón de micrófono para empezar
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text-light dark:text-text-dark">
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

const SWIPE_THRESHOLD = -10 // Minimum swipe distance to reveal actions (reduced for better UX)
const BUTTON_GAP = 8 // Gap between buttons
const ACTIONS_PADDING = 8 // Right padding

function SwipeableSpendCard({ spend, onEdit, onDelete }: SwipeableSpendCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [actionsWidth, setActionsWidth] = useState(150) // Default width for 2 buttons
  const x = useMotionValue(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const amountEur = useMemo(() => centsToEur(spend.amountCents), [spend.amountCents])
  const emoji = getCategoryEmoji(spend.category)

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

  // Measure card height and calculate actions width dynamically
  useLayoutEffect(() => {
    if (cardRef.current) {
      const cardHeight = cardRef.current.offsetHeight
      // Calculate: 2 square buttons (height = width) + 1 gap + padding
      const calculatedWidth = (cardHeight * 2) + BUTTON_GAP + ACTIONS_PADDING
      setActionsWidth(calculatedWidth)
    }
  }, [spend.note]) // Recalculate when note changes (affects height)

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
    }

    // Close on scroll
    const handleScroll = () => {
      setIsOpen(false)
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

  // Transform for action buttons opacity (fade in as card slides)
  const actionsOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x
    
    // Consider velocity for better feel
    // If swiping fast to the left, open even if not past threshold
    const shouldOpen = offset < SWIPE_THRESHOLD || (velocity < -10 && offset < -15)
    
    // Always set a definitive state (open or closed)
    // This ensures the card always animates to a final position
    setIsOpen(shouldOpen)
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(spend)
      // Close after action
      setIsOpen(false)
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
  }

  return (
    <div className="relative overflow-hidden rounded-xl" ref={cardRef}>
      {/* Action Buttons (behind the card) */}
      <motion.div
        className="swipe-actions absolute right-0 top-0 h-full flex items-stretch pr-2"
        style={{ 
          width: actionsWidth,
          opacity: actionsOpacity,
          gap: `${BUTTON_GAP}px`
        }}
      >
        {/* Edit Button */}
        {onEdit && (
          <button
            onClick={handleEdit}
            className="aspect-square h-full bg-gray-400 text-gray-900 font-bold rounded-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Editar"
          >
            <span className="text-2xl">✏️</span>
          </button>
        )}

        {/* Delete Button */}
        {onDelete && (
          <button
            onClick={handleDeleteClick}
            className="aspect-square h-full bg-red-500 text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-transform"
            aria-label="Eliminar"
          >
            <span className="text-2xl">✕</span>
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
        dragConstraints={{ left: -actionsWidth, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        dragTransition={{
          bounceStiffness: 500,
          bounceDamping: 35,
        }}
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isOpen ? { x: -actionsWidth } : { x: 0 }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 35,
        }}
        className="flex items-center gap-3 p-3 bg-surface-light dark:bg-surface-dark rounded-xl cursor-grab active:cursor-grabbing relative z-10"
      >
        {/* Emoji de categoría */}
        <div className="text-2xl flex-shrink-0" aria-hidden="true">
          {emoji}
        </div>

        {/* Info del gasto */}
        <div className="flex-1 min-w-0">
          {/* Merchant name with payment method icon */}
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">
              {spend.merchant || 'Sin establecimiento'}
            </p>
            {spend.paidWith && (
              <span className="text-xs flex-shrink-0" title={spend.paidWith}>
                {spend.paidWith === 'efectivo' ? '💵' : '💳'}
              </span>
            )}
          </div>
          {/* Category name and time */}
          <div className="flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark mt-0.5">
            <span>{spend.category}</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>
        </div>

        {/* Monto */}
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-text-light dark:text-text-dark">
            {amountEur.toFixed(2)}€
          </p>
        </div>
      </motion.div>
    </div>
  )
}

