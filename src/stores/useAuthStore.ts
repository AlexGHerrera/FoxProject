/**
 * Auth Store (Zustand)
 * Gestiona el estado de autenticación del usuario
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

interface AuthStore {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  userRole: 'user' | 'admin' | null
  
  // Actions
  setUser: (user: User | null) => void
  setUserRole: (role: 'user' | 'admin' | null) => void
  setIsLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      userRole: null,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setUserRole: (role) => set({ userRole: role }),

      setIsLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          userRole: null,
        }),
    }),
    {
      name: 'foxy-auth',
      partialize: (state) => ({
        // Only persist user ID, not full user object
        userId: state.user?.id,
      }),
    }
  )
)

