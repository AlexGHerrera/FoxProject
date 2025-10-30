/**
 * PageIndicator
 * Muestra puntos indicadores de la página actual (como en iOS)
 */

interface PageIndicatorProps {
  currentIndex: number
  totalPages: number
  className?: string
}

export function PageIndicator({ currentIndex, totalPages, className = '' }: PageIndicatorProps) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {Array.from({ length: totalPages }).map((_, index) => (
        <div
          key={index}
          className={`h-2 rounded-full transition-all duration-300 ${
            index === currentIndex
              ? 'w-6 bg-brand-cyan'
              : 'w-2 bg-muted/30'
          }`}
          aria-label={`Página ${index + 1}${index === currentIndex ? ' (actual)' : ''}`}
        />
      ))}
    </div>
  )
}







