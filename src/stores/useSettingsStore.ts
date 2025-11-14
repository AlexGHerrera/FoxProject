/**
 * Settings Store (Zustand)
 * Estado global de configuración del usuario
 */

import { create } from 'zustand'
import type { Settings } from '@/domain/models'

interface SettingsStore {
  settings: Settings | null
  isLoading: boolean
  setSettings: (settings: Settings | null) => void
  setLoading: (loading: boolean) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: null,
  isLoading: true,
  setSettings: (settings) => set({ settings }),
  setLoading: (loading) => set({ isLoading: loading }),
}))

