/**
 * FilterChip Component
 * Chip reutilizable para filtros con soporte para iconos
 * Inspirado en los mockups del diseño
 */

import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

interface FilterChipProps {
  icon?: ReactNode
  label: string
  selected?: boolean
  onClick?: () => void
  className?: string
}

/**
 * Chip de filtro con soporte para iconos y estado seleccionado
 * Se puede usar para categorías, payment methods, date ranges, etc.
 */
export function FilterChip({ 
  icon, 
  label, 
  selected = false, 
  onClick,
  className 
}: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2',
        selected
          ? 'bg-brand-cyan text-white shadow-md scale-105'
          : 'bg-chip-bg text-text border border-border hover:border-brand-cyan hover:bg-chip-bg/80 hover:scale-105',
        className
      )}
      aria-pressed={selected}
    >
      {icon && (
        <span className="flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="truncate">{label}</span>
    </button>
  )
}

