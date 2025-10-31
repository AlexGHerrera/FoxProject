/**
 * CategoryIcon Component
 * Renderiza un icono de categoría con background de color
 * Reemplaza los emojis por iconos SVG profesionales de Lucide
 */

import { CATEGORY_ICONS, CATEGORY_COLORS } from '@/config/categoryIcons'
import { Category } from '@/domain/models'
import { cn } from '@/utils/cn'

interface CategoryIconProps {
  category: Category
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Renderiza un icono de categoría con background coloreado
 * Los colores y el icono se obtienen de la configuración centralizada
 */
export function CategoryIcon({ category, size = 'md', className }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category]
  const colors = CATEGORY_COLORS[category]
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  }
  
  return (
    <div 
      className={cn(
        'rounded-xl flex items-center justify-center transition-colors',
        colors.bg,
        sizeClasses[size],
        className
      )}
      role="img"
      aria-label={`Icono de categoría ${category}`}
    >
      <Icon 
        size={iconSizes[size]} 
        className={colors.icon} 
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </div>
  )
}

