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
  const { user, isAuthenticated, isLoading, setUser, setIsLoading, setUserRole, logout: logoutStore } = useAuthStore()
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
        setUserRole(data.role as 'user' | 'admin')
      } else {
        setUserRole('user') // Default role
      }
    } catch (error) {
      console.error('[useAuth] Error loading user role:', error)
    } finally {
      setIsCheckingRole(false)
    }
  }, [setUserRole])

  // Inicializar autenticación al montar
  useEffect(() => {
    setIsLoading(true)
    
    // Obtener usuario actual
    authProvider.getCurrentUser().then((currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        loadUserRole(currentUser.id)
      }
    })

    // Escuchar cambios de autenticación
    const unsubscribe = authProvider.onAuthStateChange(async (user) => {
      setUser(user)
      if (user) {
        await loadUserRole(user.id)
      } else {
        setUserRole(null)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [setUser, setIsLoading, loadUserRole, setUserRole])

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { user, error } = await authProvider.signUp(email, password)
      
      if (error) {
        showError(error.message || 'Error al registrarse')
        return { success: false, error }
      }

      if (user) {
        showSuccess('Registro exitoso. Revisa tu email para confirmar tu cuenta.')
        return { success: true, user }
      }

      // Si no hay usuario pero tampoco error, significa que necesita confirmar email
      showSuccess('Revisa tu email para confirmar tu cuenta antes de iniciar sesión.')
      return { success: true, user: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al registrarse'
      showError(message)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }, [showError, showSuccess, setIsLoading])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const { user, error } = await authProvider.signIn(email, password)
      
      if (error) {
        showError(error.message || 'Error al iniciar sesión')
        return { success: false, error }
      }

      if (user) {
        await loadUserRole(user.id)
        showSuccess('Sesión iniciada correctamente')
        navigate('/')
        return { success: true, user }
      }

      return { success: false, error: null }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión'
      showError(message)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }, [showError, showSuccess, setIsLoading, navigate, loadUserRole])

  const signOut = useCallback(async () => {
    try {
      setIsLoading(true)
      const { error } = await authProvider.signOut()
      
      if (error) {
        showError(error.message || 'Error al cerrar sesión')
        return { success: false, error }
      }

      logoutStore()
      showSuccess('Sesión cerrada correctamente')
      navigate('/login')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al cerrar sesión'
      showError(message)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }, [showError, showSuccess, setIsLoading, navigate, logoutStore])

  const resetPassword = useCallback(async (email: string) => {
    try {
      setIsLoading(true)
      const { error } = await authProvider.resetPassword(email)
      
      if (error) {
        showError(error.message || 'Error al enviar email de recuperación')
        return { success: false, error }
      }

      showSuccess('Revisa tu email para restablecer tu contraseña')
      return { success: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al enviar email de recuperación'
      showError(message)
      return { success: false, error }
    } finally {
      setIsLoading(false)
    }
  }, [showError, showSuccess, setIsLoading])

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

