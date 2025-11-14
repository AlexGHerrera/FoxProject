/**
 * ResetPasswordPage Component
 * Página para solicitar recuperación de contraseña
 */

import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthLayout } from './AuthLayout'
import { CheckCircle } from 'lucide-react'

export function ResetPasswordPage() {
  const { resetPassword, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email) {
      setError('El email es requerido')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('El email no es válido')
      return
    }

    const result = await resetPassword(email)
    if (result.success) {
      setSent(true)
    } else {
      setError('Error al enviar el email de recuperación')
    }
  }

  if (sent) {
    return (
      <AuthLayout
        title="Email enviado"
        subtitle="Revisa tu bandeja de entrada"
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <p className="text-text">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted">
            Haz clic en el enlace del email para restablecer tu contraseña.
          </p>
          <Link to="/login">
            <Button variant="secondary" fullWidth>
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-danger/10 border border-danger rounded-md p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          autoComplete="email"
          disabled={isLoading}
          required
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Enviar enlace de recuperación
        </Button>

        <div className="text-center text-sm text-muted">
          <Link
            to="/login"
            className="text-brand-cyan hover:underline"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

