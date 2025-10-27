import { useState, useMemo, useCallback } from 'react';
import { Spend } from '@/domain/models';
import { SpendFilters } from '@/components/spend';

/**
 * Hook para gestionar filtros y búsqueda de gastos
 */
export function useSpendFilters(spends: Spend[]) {
  const [filters, setFilters] = useState<SpendFilters>({
    dateRange: 'this-month',
    categories: [],
    paymentMethod: 'all',
    sortBy: 'recent',
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  // Aplicar filtros y búsqueda
  const filteredSpends = useMemo(() => {
    let result = [...spends];

    // Filter by date range
    const now = new Date();
    if (filters.dateRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      result = result.filter((s) => s.timestamp >= startOfDay);
    } else if (filters.dateRange === 'this-week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      result = result.filter((s) => s.timestamp >= startOfWeek);
    } else if (filters.dateRange === 'this-month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      result = result.filter((s) => s.timestamp >= startOfMonth);
    } else if (filters.dateRange === 'custom' && filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      result = result.filter((s) => s.timestamp >= start && s.timestamp <= end);
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      result = result.filter((s) => filters.categories.includes(s.category));
    }

    // Filter by payment method
    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      result = result.filter((s) => s.paidWith === filters.paymentMethod);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        const merchant = s.merchant?.toLowerCase() || '';
        const note = s.note?.toLowerCase() || '';
        return merchant.includes(query) || note.includes(query);
      });
    }

    // Sort
    if (filters.sortBy === 'recent') {
      result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    } else if (filters.sortBy === 'amount') {
      result.sort((a, b) => b.amountCents - a.amountCents);
    }

    return result;
  }, [spends, filters, searchQuery]);

  const applyFilters = useCallback((newFilters: SpendFilters) => {
    setFilters(newFilters);
  }, []);

  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      dateRange: 'this-month',
      categories: [],
      paymentMethod: 'all',
      sortBy: 'recent',
    });
    setSearchQuery('');
  }, []);

  return {
    filters,
    searchQuery,
    filteredSpends,
    applyFilters,
    updateSearchQuery,
    resetFilters,
  };
}

