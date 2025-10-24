/**
 * Spend Store (Zustand)
 * Gestiona el estado de los gastos
 */

import { create } from 'zustand'
import type { Spend } from '../domain/models'

interface SpendStore {
  // State
  spends: Spend[]
  isLoading: boolean
  error: string | null
  
  // Filters
  filters: {
    startDate: string | null // ISO date
    endDate: string | null
    categories: string[]
    searchQuery: string
  }
  
  // Actions
  setSpends: (spends: Spend[]) => void
  addSpend: (spend: Spend) => void
  updateSpend: (id: string, spend: Partial<Spend>) => void
  deleteSpend: (id: string) => void
  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  
  // Filters
  setFilters: (filters: Partial<SpendStore['filters']>) => void
  resetFilters: () => void
  
  // Computed
  getFilteredSpends: () => Spend[]
  getTotalAmount: () => number
}

const initialFilters = {
  startDate: null,
  endDate: null,
  categories: [],
  searchQuery: '',
}

export const useSpendStore = create<SpendStore>((set, get) => ({
  // Initial state
  spends: [],
  isLoading: false,
  error: null,
  filters: initialFilters,

  // Actions
  setSpends: (spends) => set({ spends, isLoading: false }),

  addSpend: (spend) =>
    set((state) => ({
      spends: [spend, ...state.spends],
    })),

  updateSpend: (id, updatedSpend) =>
    set((state) => ({
      spends: state.spends.map((s) => (s.id === id ? { ...s, ...updatedSpend } : s)),
    })),

  deleteSpend: (id) =>
    set((state) => ({
      spends: state.spends.filter((s) => s.id !== id),
    })),

  setIsLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error, isLoading: false }),

  // Filters
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  resetFilters: () => set({ filters: initialFilters }),

  // Computed
  getFilteredSpends: () => {
    const { spends, filters } = get()
    
    return spends.filter((spend) => {
      // Date range filter
      if (filters.startDate && spend.ts < filters.startDate) return false
      if (filters.endDate && spend.ts > filters.endDate) return false
      
      // Category filter
      if (filters.categories.length > 0 && !filters.categories.includes(spend.category)) {
        return false
      }
      
      // Search query (merchant or note)
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        const matchesMerchant = spend.merchant?.toLowerCase().includes(query)
        const matchesNote = spend.note?.toLowerCase().includes(query)
        if (!matchesMerchant && !matchesNote) return false
      }
      
      return true
    })
  },

  getTotalAmount: () => {
    const filtered = get().getFilteredSpends()
    return filtered.reduce((acc, spend) => acc + spend.amount_cents, 0)
  },
}))

