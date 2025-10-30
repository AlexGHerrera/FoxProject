/**
 * ConfirmSpendCard Component
 * Tarjeta swipable para confirmación de gastos
 * Similar a SpendCard pero sin opción de seleccionar
 */

import { useState, useRef, useLayoutEffect, useEffect } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { ConfirmDialog } from '../ui'
import type { ParsedSpend } from '../../domain/models'

interface ConfirmSpendCardProps {
  spend: ParsedSpend
  index: number
  totalCount: number
  onEdit: (spend: ParsedSpend, index: number) => void
  onDelete: (index: number) => void
}

const SWIPE_THRESHOLD = -10
const BUTTON_GAP = 8
const ACTIONS_PADDING = 8

export function ConfirmSpendCard({
  spend,
  index,
  totalCount,
  onEdit,
  onDelete,
}: ConfirmSpendCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [actionsWidth, setActionsWidth] = useState(200)
  const x = useMotionValue(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Calcular ancho de acciones basado en altura de tarjeta
  useLayoutEffect(() => {
    if (cardRef.current) {
      const cardHeight = cardRef.current.offsetHeight
      // 2 botones cuadrados (editar + borrar) + gap + padding
      const calculatedWidth = (cardHeight * 2) + BUTTON_GAP + ACTIONS_PADDING
      setActionsWidth(calculatedWidth)
    }
  }, [spend.merchant, spend.category])

  // ResizeObserver para cambios dinámicos de altura
  useLayoutEffect(() => {
    if (!cardRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const cardHeight = entry.contentRect.height
        const calculatedWidth = (cardHeight * 2) + BUTTON_GAP + ACTIONS_PADDING
        setActionsWidth(calculatedWidth)
      }
    })

    resizeObserver.observe(cardRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Cerrar tarjeta en interacciones externas
  useEffect(() => {
    if (!isOpen) return

    const handleInteraction = (e: Event) => {
      if (
        cardRef.current &&
        (cardRef.current.contains(e.target as Node) ||
          (e.target as HTMLElement).closest('.swipe-actions'))
      ) {
        return
      }
      setIsOpen(false)
    }

    const handleScroll = () => {
      setIsOpen(false)
    }

    window.addEventListener('scroll', handleScroll, true)
    document.addEventListener('click', handleInteraction)
    document.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('click', handleInteraction)
      document.removeEventListener('touchstart', handleInteraction)
    }
  }, [isOpen])

  // Transform para opacidad de botones de acción
  const actionsOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1])

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    const shouldOpen =
      offset < SWIPE_THRESHOLD || (velocity < -10 && offset < -15)
    setIsOpen(shouldOpen)
  }

  const handleEdit = () => {
    onEdit(spend, index)
    setIsOpen(false)
  }

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }

  const handleDeleteConfirm = () => {
    onDelete(index)
    setIsOpen(false)
  }

  return (
    <div className="relative overflow-hidden rounded-xl" ref={cardRef}>
      {/* Botones de acción (detrás de la tarjeta) */}
      <motion.div
        className="swipe-actions absolute right-0 top-0 h-full flex items-stretch pr-2"
        style={{
          width: actionsWidth,
          opacity: actionsOpacity,
          gap: `${BUTTON_GAP}px`,
        }}
      >
        {/* Botón Editar */}
        <button
          onClick={handleEdit}
          className="aspect-square h-full bg-gray-400 dark:bg-gray-600 text-gray-900 dark:text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Editar gasto"
        >
          <span className="text-3xl">✏️</span>
        </button>

        {/* Botón Eliminar */}
        <button
          onClick={handleDeleteClick}
          className="aspect-square h-full bg-red-500 text-white font-bold rounded-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Eliminar gasto"
        >
          <span className="text-3xl">✕</span>
        </button>
      </motion.div>

      {/* Diálogo de confirmación de eliminación */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar este gasto?"
        message={`Se eliminará el gasto de ${spend.amountEur.toFixed(2)} € en ${spend.merchant || spend.category}. Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />

      {/* Tarjeta (arrastrable) */}
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
        className="rounded-xl p-4 bg-surface-light dark:bg-surface-dark border border-divider-light dark:border-divider-dark shadow-sm cursor-grab active:cursor-grabbing relative z-10"
      >
        <div className="flex items-center justify-between">
          {/* Importe grande */}
          <div className="flex-1">
            <div className="text-2xl font-bold text-brand-cyan dark:text-brand-cyan-dark">
              {spend.amountEur.toFixed(2)} €
            </div>

            {/* Categoría y detalles */}
            <div className="mt-1 space-y-1">
              <div className="text-sm font-medium text-text-light dark:text-text-dark">
                {spend.category}
              </div>

              {/* Establecimiento si existe */}
              {spend.merchant && (
                <div className="text-xs text-muted-light dark:text-muted-dark">
                  {spend.merchant}
                </div>
              )}

              {/* Forma de pago si existe */}
              {spend.paidWith && (
                <div className="text-xs text-muted-light dark:text-muted-dark">
                  {spend.paidWith === 'tarjeta' && '💳 Con tarjeta'}
                  {spend.paidWith === 'efectivo' && '💵 En efectivo'}
                  {spend.paidWith === 'transferencia' && '📱 Transferencia'}
                </div>
              )}
            </div>
          </div>

          {/* Indicador de confianza individual (solo si múltiples) */}
          {totalCount > 1 && (
            <div className="ml-4">
              <div className="text-xs text-muted-light dark:text-muted-dark mb-1">
                {(spend.confidence * 100).toFixed(0)}%
              </div>
              <div className="w-12 h-1.5 bg-divider-light dark:bg-divider-dark rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    spend.confidence >= 0.7
                      ? 'bg-success'
                      : spend.confidence >= 0.5
                      ? 'bg-warning'
                      : 'bg-danger'
                  }`}
                  style={{ width: `${spend.confidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

