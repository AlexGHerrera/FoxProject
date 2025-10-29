interface PaymentMethodToggleProps {
  value: 'efectivo' | 'tarjeta';
  onChange: (method: 'efectivo' | 'tarjeta') => void;
}

export function PaymentMethodToggle({ value, onChange }: PaymentMethodToggleProps) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => onChange('efectivo')}
        className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
          value === 'efectivo'
            ? 'bg-brand-cyan text-white ring-2 ring-brand-cyan'
            : 'bg-card text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-pressed={value === 'efectivo'}
      >
        <span className="text-xl">💵</span>
        <span>Efectivo</span>
      </button>
      
      <button
        type="button"
        onClick={() => onChange('tarjeta')}
        className={`flex-1 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
          value === 'tarjeta'
            ? 'bg-brand-cyan text-white ring-2 ring-brand-cyan'
            : 'bg-card text-muted hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
        aria-pressed={value === 'tarjeta'}
      >
        <span className="text-xl">💳</span>
        <span>Tarjeta</span>
      </button>
    </div>
  );
}


