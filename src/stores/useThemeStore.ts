/**
 * Theme Store (Zustand)
 * Estado global del tema de la aplicación
 */

import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'auto'
type ResolvedTheme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  setResolvedTheme: (resolvedTheme: ResolvedTheme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'auto',
  resolvedTheme: 'light',
  setTheme: (theme) => {
    console.log('[ThemeStore] setTheme llamado, cambiando de', useThemeStore.getState().theme, 'a', theme)
    set({ theme })
  },
  setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
}))

