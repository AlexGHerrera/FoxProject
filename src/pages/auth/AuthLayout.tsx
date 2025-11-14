/**
 * AuthLayout Component
 * Layout compartido para páginas de autenticación
 */

import { ReactNode } from 'react'
import { FoxyAvatar } from '@/components/foxy'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header con Foxy */}
        <div className="text-center space-y-4">
          <FoxyAvatar state="idle" size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-text">{title}</h1>
            {subtitle && (
              <p className="text-muted mt-2">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg">
          {children}
        </div>
      </div>
    </div>
  )
}

