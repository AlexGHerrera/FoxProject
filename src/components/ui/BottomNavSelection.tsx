interface BottomNavSelectionProps {
  count: number;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BottomNavSelection({ count, onEdit, onDelete, onCancel }: BottomNavSelectionProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-lg z-50">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-3">
        {/* Counter */}
        <p className="text-sm font-medium text-muted text-center mb-3">
          {count} {count === 1 ? 'gasto seleccionado' : 'gastos seleccionados'}
        </p>

        {/* Actions */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={onCancel}
            className="flex-1 h-12 sm:h-14 rounded-lg font-semibold text-xs sm:text-sm bg-card text-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center border border-border active:scale-95"
            aria-label="Cancelar selección"
          >
            Cancelar
          </button>

          <button
            onClick={onEdit}
            disabled={count === 0}
            className="flex-1 h-12 sm:h-14 rounded-lg font-bold bg-gray-400 text-gray-900 hover:bg-gray-500 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            aria-label="Editar gastos seleccionados"
          >
            <span className="text-2xl sm:text-3xl">✏️</span>
          </button>

          <button
            onClick={onDelete}
            disabled={count === 0}
            className="flex-1 h-12 sm:h-14 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            aria-label="Eliminar gastos seleccionados"
          >
            <span className="text-2xl sm:text-3xl">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}

