import { Spend, getCategoryEmoji, centsToEur } from '@/domain/models';

interface SpendCardProps {
  spend: Spend;
  onEdit?: (spend: Spend) => void;
  onDelete?: (spend: Spend) => void;
}

export function SpendCard({ spend, onEdit, onDelete }: SpendCardProps) {
  const handleEdit = () => {
    if (onEdit) onEdit(spend);
  };

  const handleDelete = () => {
    if (onDelete && confirm('¿Eliminar este gasto?')) {
      onDelete(spend);
    }
  };

  // Format date
  const date = new Date(spend.timestamp);
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

  return (
    <div className="bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-border">
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-2xl">
          {getCategoryEmoji(spend.category)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-text truncate">
                {spend.merchant || 'Sin establecimiento'}
              </h3>
              <p className="text-sm text-muted capitalize">{spend.category}</p>
              {spend.note && (
                <p className="text-sm text-muted mt-1 truncate">{spend.note}</p>
              )}
            </div>

            {/* Amount */}
            <div className="flex-shrink-0 text-right">
              <p className="font-bold text-lg text-text">
                {centsToEur(spend.amountCents).toFixed(2)} €
              </p>
              <p className="text-xs text-muted">{formattedDate}</p>
            </div>
          </div>

          {/* Method */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 rounded-full bg-surface text-muted">
              {spend.method === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions (optional, shown on hover or always on mobile) */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          {onEdit && (
            <button
              onClick={handleEdit}
              className="flex-1 px-3 py-2 text-sm font-medium text-brand-cyan hover:bg-brand-cyan/10 rounded-lg transition-colors"
            >
              Editar
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

