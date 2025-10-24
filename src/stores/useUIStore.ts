/**
 * UI Store (Zustand)
 * Gestiona estado global de UI: toasts, modales, loading states
 */

import { create } from 'zustand'
import type { Toast, ToastType } from '../components/ui/Toast'

interface UIState {
  // Toasts
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
  
  // Helper methods
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
}

let toastIdCounter = 0

export const useUIStore = create<UIState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${toastIdCounter++}`
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }))
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },

  // Helper methods
  showSuccess: (message, duration = 5000) => {
    set((state) => {
      const id = `toast-${Date.now()}-${toastIdCounter++}`
      return {
        toasts: [...state.toasts, { id, type: 'success', message, duration }],
      }
    })
  },

  showError: (message, duration = 5000) => {
    set((state) => {
      const id = `toast-${Date.now()}-${toastIdCounter++}`
      return {
        toasts: [...state.toasts, { id, type: 'error', message, duration }],
      }
    })
  },

  showWarning: (message, duration = 5000) => {
    set((state) => {
      const id = `toast-${Date.now()}-${toastIdCounter++}`
      return {
        toasts: [...state.toasts, { id, type: 'warning', message, duration }],
      }
    })
  },

  showInfo: (message, duration = 5000) => {
    set((state) => {
      const id = `toast-${Date.now()}-${toastIdCounter++}`
      return {
        toasts: [...state.toasts, { id, type: 'info', message, duration }],
      }
    })
  },
}))

