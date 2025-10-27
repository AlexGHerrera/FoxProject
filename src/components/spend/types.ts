/**
 * Types for spend components
 */

export interface SpendFilters {
  dateRange: 'today' | 'this-week' | 'this-month' | 'custom';
  startDate?: string;
  endDate?: string;
  categories: string[];
  paymentMethod?: 'efectivo' | 'tarjeta' | 'all';
  sortBy: 'recent' | 'amount';
}

