/**
 * Hook para gestión de tema (light/dark)
 * Soporta: auto (system), light, dark
 */

import { useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'auto'
type ResolvedTheme = 'light' | 'dark'

const THEME_KEY = 'foxy-theme'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_KEY)
    return (stored as Theme) || 'auto'
  })

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light')

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
      
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
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
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(THEME_KEY, newTheme)
    setThemeState(newTheme)
  }

  return { theme, setTheme, resolvedTheme }
}

