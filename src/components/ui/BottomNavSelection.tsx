interface BottomNavSelectionProps {
  count: number;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BottomNavSelection({ count, onEdit, onDelete, onCancel }: BottomNavSelectionProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-md border-t border-border shadow-2xl z-50 safe-area-inset-bottom">
      {/* Mobile-first: padding mínimo en móvil muy pequeño, luego responsive */}
      {/* px-3 = 12px en móvil pequeño (mínimo seguro), sm:px-4 = 16px desde 640px */}
      <div className="w-full px-3 py-3 sm:px-4 sm:py-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Counter - tamaño responsive pero compacto */}
          <p className="text-xs sm:text-sm font-medium text-muted text-center mb-2 sm:mb-3">
            {count} {count === 1 ? 'gasto seleccionado' : 'gastos seleccionados'}
          </p>

          {/* Actions - SIEMPRE vertical, sin md:flex-row */}
          <div className="flex flex-col gap-2 sm:gap-3">
            {/* Eliminar - Más prominente (primero, más grande visualmente) */}
            <button
              onClick={onDelete}
              disabled={count === 0}
              className="w-full min-w-0 h-12 sm:h-14 rounded-xl font-bold text-sm sm:text-base bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-lg touch-manipulation"
              aria-label="Eliminar gastos seleccionados"
            >
              <span className="text-lg sm:text-xl flex-shrink-0">✕</span>
              <span className="truncate min-w-0">Eliminar</span>
            </button>

            {/* Editar - Tamaño medio */}
            <button
              onClick={onEdit}
              disabled={count === 0}
              className="w-full min-w-0 h-12 sm:h-14 rounded-xl font-semibold text-sm sm:text-base bg-gray-500 text-white hover:bg-gray-600 active:bg-gray-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-md touch-manipulation"
              aria-label="Editar gastos seleccionados"
            >
              <span className="text-lg sm:text-xl flex-shrink-0">✏️</span>
              <span className="truncate min-w-0">Editar</span>
            </button>

            {/* Cancelar - Secundario, menos prominente */}
            <button
              onClick={onCancel}
              className="w-full min-w-0 h-12 sm:h-14 rounded-xl font-semibold text-sm sm:text-base bg-card text-text border-2 border-border hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 transition-all flex items-center justify-center active:scale-[0.98] touch-manipulation"
              aria-label="Cancelar selección"
            >
              <span className="truncate min-w-0">Cancelar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
