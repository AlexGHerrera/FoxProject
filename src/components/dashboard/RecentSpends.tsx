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

const SWIPE_THRESHOLD = -80 // Minimum swipe distance to reveal actions
const BUTTON_GAP = 8 // Gap between buttons
const ACTIONS_PADDING = 8 // Right padding
const AUTO_CLOSE_DELAY = 3000 // Auto-close after 3 seconds

function SwipeableSpendCard({ spend, onEdit, onDelete }: SwipeableSpendCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [actionsWidth, setActionsWidth] = useState(150) // Default width for 2 buttons
  const x = useMotionValue(0)
  const cardRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<number | null>(null)

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

  // Auto-close after 3 seconds of inactivity
  useEffect(() => {
    if (isOpen) {
      // Clear any existing timeout
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
      
      // Set new timeout to close after 3 seconds
      closeTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false)
        x.set(0)
      }, AUTO_CLOSE_DELAY)
    }

    // Cleanup timeout on unmount or when isOpen changes
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
      }
    }
  }, [isOpen, x])

  // Transform for action buttons opacity (fade in as card slides)
  const actionsOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    
    // If swiped left enough, open
    if (offset < SWIPE_THRESHOLD) {
      setIsOpen(true)
      x.set(-actionsWidth)
    } 
    // If swiped right or not enough, close
    else {
      setIsOpen(false)
      x.set(0)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(spend)
      // Close after action
      setIsOpen(false)
      x.set(0)
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
    x.set(0)
  }

  return (
    <div className="relative overflow-hidden rounded-xl" ref={cardRef}>
      {/* Action Buttons (behind the card) */}
      <motion.div
        className="absolute right-0 top-0 h-full flex items-stretch pr-2"
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
        onDragEnd={handleDragEnd}
        style={{ x }}
        animate={isOpen ? { x: -actionsWidth } : { x: 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
        className="flex items-center gap-3 p-3 bg-surface-light dark:bg-surface-dark rounded-xl cursor-grab active:cursor-grabbing relative z-10"
      >
        {/* Emoji de categoría */}
        <div className="text-2xl flex-shrink-0" aria-hidden="true">
          {emoji}
        </div>

        {/* Info del gasto */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-light dark:text-text-dark truncate">
            {spend.merchant || spend.category}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-light dark:text-muted-dark">
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
          {spend.paidWith && (
            <p className="text-xs text-muted-light dark:text-muted-dark">
              {spend.paidWith === 'efectivo' ? '💵' : '💳'}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}

