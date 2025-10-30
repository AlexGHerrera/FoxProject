import { Spend } from '@/domain/models';
import { SpendCard } from './SpendCard';

interface SpendListProps {
  spends: Spend[];
  loading?: boolean;
  onEdit?: (spend: Spend) => void;
  onDelete?: (spend: Spend) => void;
  onSelect?: (spend: Spend) => void;
  emptyMessage?: string;
  selectionMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (spend: Spend) => void;
}

export function SpendList({
  spends,
  loading = false,
  onEdit,
  onDelete,
  onSelect,
  emptyMessage = 'No hay gastos registrados',
  selectionMode = false,
  selectedIds = new Set(),
  onToggleSelect,
}: SpendListProps) {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="bg-card rounded-lg p-4 shadow-sm animate-pulse"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-muted/20 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted/20 rounded w-3/4" />
                <div className="h-3 bg-muted/20 rounded w-1/2" />
              </div>
              <div className="w-20 h-6 bg-muted/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!spends || spends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-text mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-muted max-w-sm">
          Comienza a registrar tus gastos usando la voz o entrada manual.
        </p>
      </div>
    );
  }

  // List of spends
  return (
    <div className="space-y-3">
      {spends.map((spend) => (
        <SpendCard
          key={spend.id}
          spend={spend}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
          selectionMode={selectionMode}
          isSelected={selectedIds.has(spend.id)}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}


