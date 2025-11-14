/**
 * useAuth Hook
 * Hook para operaciones de autenticación
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { SupabaseAuthProvider } from '@/adapters/auth/SupabaseAuthProvider'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { supabase } from '@/config/supabase'

const authProvider = new SupabaseAuthProvider()

export function useAuth() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const { showSuccess, showError } = useUIStore()
  const [isCheckingRole, setIsCheckingRole] = useState(false)

  // Cargar rol de usuario desde la base de datos
  const loadUserRole = useCallback(async (userId: string) => {
    try {
      setIsCheckingRole(true)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('[useAuth] Error loading user role:', error)
        return
      }

      if (data) {
        useAuthStore.getState().setUserRole(data.role as 'user' | 'admin')
      } else {
        useAuthStore.getState().setUserRole('user') // Default role
      }
    } catch (error) {
      console.error('[useAuth] Error loading user role:', error)
    } finally {
      setIsCheckingRole(false)
    }
  }, [])

  // Inicializar autenticación al montar (SOLO UNA VEZ)
  useEffect(() => {
    let mounted = true
    
    const initialize = async () => {
      try {
        useAuthStore.getState().setIsLoading(true)
        
        // Obtener usuario actual con timeout de seguridad
        const currentUser = await Promise.race([
          authProvider.getCurrentUser(),
          new Promise<null>((resolve) => 
            setTimeout(() => resolve(null), 5000)
          )
        ])
        
        if (!mounted) return
        
        useAuthStore.getState().setUser(currentUser)
        
        if (currentUser) {
          await loadUserRole(currentUser.id)
        }
      } catch (error) {
        console.error('[useAuth] Error initializing auth:', error)
        if (mounted) {
          useAuthStore.getState().setUser(null)
          useAuthStore.getState().setIsLoading(false)
        }
      } finally {
        // Asegurar que isLoading se establezca a false incluso si hay errores
        if (mounted) {
          const currentState = useAuthStore.getState()
          if (currentState.isLoading && !currentState.user) {
            useAuthStore.getState().setIsLoading(false)
          }
        }
      }
    }
    
    initialize()

    // Escuchar cambios de autenticación
    const unsubscribe = authProvider.onAuthStateChange(async (user) => {
      if (!mounted) return
      
      useAuthStore.getState().setUser(user)
      if (user) {
        await loadUserRole(user.id)
      } else {
        useAuthStore.getState().setUserRole(null)
      }
    })

    return () => {
      mounted = false
      unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Solo ejecutar al montar, loadUserRole es estable

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      useAuthStore.getState().setIsLoading(true)
      const { user, error } = await authProvider.signUp(email, password)
      
      if (error) {
        useUIStore.getState().showError(error.message || 'Error al registrarse')
        return { success: false, error }
      }

      if (user) {
        useUIStore.getState().showSuccess('Registro exitoso. Revisa tu email para confirmar tu cuenta.')
        return { success: true, user }
      }

      // Si no hay usuario pero tampoco error, significa que necesita confirmar email
      useUIStore.getState().showSuccess('Revisa tu email para confirmar tu cuenta antes de iniciar sesión.')
      return { success: true, user: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrarse'
      useUIStore.getState().showError(message)
      return { success: false, error }
    } finally {
      useAuthStore.getState().setIsLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      useAuthStore.getState().setIsLoading(true)
      const { user, error } = await authProvider.signIn(email, password)
      
      if (error) {
        useUIStore.getState().showError(error.message || 'Error al iniciar sesión')
        return { success: false, error }
      }

      if (user) {
        await loadUserRole(user.id)
        useUIStore.getState().showSuccess('Sesión iniciada correctamente')
        navigate('/')
        return { success: true, user }
      }

      return { success: false, error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión'
      useUIStore.getState().showError(message)
      return { success: false, error }
    } finally {
      useAuthStore.getState().setIsLoading(false)
    }
  }, [navigate, loadUserRole])

  const signOut = useCallback(async () => {
    try {
      useAuthStore.getState().setIsLoading(true)
      const { error } = await authProvider.signOut()
      
      if (error) {
        useUIStore.getState().showError(error.message || 'Error al cerrar sesión')
        return { success: false, error }
      }

      useAuthStore.getState().logout()
      useUIStore.getState().showSuccess('Sesión cerrada correctamente')
      navigate('/login')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión'
      useUIStore.getState().showError(message)
      return { success: false, error }
    } finally {
      useAuthStore.getState().setIsLoading(false)
    }
  }, [navigate])

  const resetPassword = useCallback(async (email: string) => {
    try {
      useAuthStore.getState().setIsLoading(true)
      const { error } = await authProvider.resetPassword(email)
      
      if (error) {
        useUIStore.getState().showError(error.message || 'Error al enviar email de recuperación')
        return { success: false, error }
      }

      useUIStore.getState().showSuccess('Revisa tu email para restablecer tu contraseña')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al enviar email de recuperación'
      useUIStore.getState().showError(message)
      return { success: false, error }
    } finally {
      useAuthStore.getState().setIsLoading(false)
    }
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isCheckingRole,
    signUp,
    signIn,
    signOut,
    resetPassword,
  }
}

