/**
 * Onboarding Store (Zustand)
 * Gestiona el estado del wizard de onboarding
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface OnboardingStore {
  completed: boolean
  setCompleted: (completed: boolean) => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      completed: false,
      setCompleted: (completed) => set({ completed }),
    }),
    {
      name: 'foxy-onboarding',
    }
  )
)

