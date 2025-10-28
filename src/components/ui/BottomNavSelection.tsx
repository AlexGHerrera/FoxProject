interface BottomNavSelectionProps {
  count: number;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function BottomNavSelection({ count, onEdit, onDelete, onCancel }: BottomNavSelectionProps) {
  return (
    <div className="fixed bottom-0 inset-x-0 bg-card/95 backdrop-blur-md border-t border-border shadow-lg z-50 py-3">
      <div className="max-w-4xl mx-auto px-4">
        {/* Counter */}
        <p className="text-sm font-medium text-muted text-center mb-3">
          {count} {count === 1 ? 'gasto seleccionado' : 'gastos seleccionados'}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={onCancel}
            className="h-14 rounded-lg font-semibold text-sm bg-card text-text hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center active:scale-95"
            aria-label="Cancelar selección"
          >
            <span className="truncate">Cancelar</span>
          </button>

          <button
            onClick={onEdit}
            disabled={count === 0}
            className="h-14 rounded-lg font-bold bg-gray-400 text-gray-900 hover:bg-gray-500 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            aria-label="Editar gastos seleccionados"
          >
            <span className="text-3xl leading-none">✏️</span>
          </button>

          <button
            onClick={onDelete}
            disabled={count === 0}
            className="h-14 rounded-lg font-bold bg-red-500 text-white hover:bg-red-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            aria-label="Eliminar gastos seleccionados"
          >
            <span className="text-3xl leading-none">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
