/**
 * Hook para gestión de tema (light/dark)
 * Soporta: auto (system), light, dark
 * Usa Zustand store para estado global
 */

import { useEffect, useCallback } from 'react'
import { useThemeStore } from '@/stores/useThemeStore'

type Theme = 'light' | 'dark' | 'auto'
type ResolvedTheme = 'light' | 'dark'

const THEME_KEY = 'foxy-theme'

export function useTheme() {
  const { theme, resolvedTheme, setTheme: setThemeStore, setResolvedTheme } = useThemeStore()

  // Inicializar tema desde localStorage al montar (solo una vez)
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY)
    if (stored && (stored === 'light' || stored === 'dark' || stored === 'auto')) {
      setThemeStore(stored as Theme)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar al montar

  // Aplicar tema cuando cambie
  useEffect(() => {
    const resolveTheme = (): ResolvedTheme => {
      if (theme === 'auto') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
      }
      return theme
    }

    const applyTheme = () => {
      const resolved = resolveTheme()
      setResolvedTheme(resolved)
      
      // Aplicar/remover clases en el elemento html
      const html = document.documentElement
      
      if (resolved === 'dark') {
        html.classList.add('dark')
        html.classList.remove('light')
      } else {
        html.classList.add('light')
        html.classList.remove('dark')
      }
    }

    applyTheme()

    // Listen for system theme changes if theme is 'auto'
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme()
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]) // Solo depende de theme, no de setResolvedTheme

  const setTheme = useCallback((newTheme: Theme, saveToStorage = true) => {
    if (saveToStorage) {
      localStorage.setItem(THEME_KEY, newTheme)
    }
    setThemeStore(newTheme)
  }, [setThemeStore])

  // Solo para preview (no guarda en localStorage)
  const previewTheme = useCallback((newTheme: Theme) => {
    setThemeStore(newTheme)
  }, [setThemeStore])

  return { theme, setTheme, resolvedTheme, previewTheme }
}

