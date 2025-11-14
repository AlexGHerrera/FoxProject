/**
 * ProtectedRoute Component
 * Protege rutas que requieren autenticación
 */

import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

  // Mostrar loading mientras se inicializa la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Cargando...</div>
      </div>
    )
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Renderizar contenido protegido
  return <>{children}</>
}

