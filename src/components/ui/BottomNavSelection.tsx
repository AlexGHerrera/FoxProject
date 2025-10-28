interface BottomNavSelectionProps {
  count: number;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BottomNavSelection({ count, onEdit, onDelete, onCancel }: BottomNavSelectionProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-lg z-50">
      <div className="w-full px-4 py-2">
        <div className="max-w-4xl mx-auto">
          {/* Counter */}
          <p className="text-xs font-medium text-muted text-center mb-2">
            {count} {count === 1 ? 'gasto seleccionado' : 'gastos seleccionados'}
          </p>

          {/* Actions - Vertical Stack */}
          <div className="flex flex-col gap-2">
            <button
              onClick={onDelete}
              disabled={count === 0}
              className="w-full h-11 rounded-lg font-semibold text-sm bg-red-500 text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label="Eliminar gastos seleccionados"
            >
              <span className="text-lg">✕</span>
              <span>Eliminar</span>
            </button>

            <button
              onClick={onEdit}
              disabled={count === 0}
              className="w-full h-11 rounded-lg font-semibold text-sm bg-gray-400 text-gray-900 hover:bg-gray-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label="Editar gastos seleccionados"
            >
              <span className="text-lg">✏️</span>
              <span>Editar</span>
            </button>

            <button
              onClick={onCancel}
              className="w-full h-11 rounded-lg font-semibold text-sm bg-card text-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center active:scale-95"
              aria-label="Cancelar selección"
            >
              <span>Cancelar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
