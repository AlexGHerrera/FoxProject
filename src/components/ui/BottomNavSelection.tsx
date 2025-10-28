interface BottomNavSelectionProps {
  count: number;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BottomNavSelection({ count, onEdit, onDelete, onCancel }: BottomNavSelectionProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border shadow-lg z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {/* Counter */}
        <p className="text-sm font-medium text-muted text-center mb-3">
          {count} {count === 1 ? 'gasto seleccionado' : 'gastos seleccionados'}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-lg font-semibold bg-card text-muted hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            aria-label="Cancelar selección"
          >
            <span className="text-xl">✕</span>
            <span>Cancelar</span>
          </button>

          <button
            onClick={onEdit}
            disabled={count === 0}
            className="flex-1 py-3 px-4 rounded-lg font-semibold bg-brand-cyan text-white hover:bg-brand-cyan/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Editar gastos seleccionados"
          >
            <span className="text-xl">✏️</span>
            <span>Editar</span>
          </button>

          <button
            onClick={onDelete}
            disabled={count === 0}
            className="flex-1 py-3 px-4 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Eliminar gastos seleccionados"
          >
            <span className="text-xl">🗑️</span>
            <span>Eliminar</span>
          </button>
        </div>
      </div>
    </div>
  );
}

