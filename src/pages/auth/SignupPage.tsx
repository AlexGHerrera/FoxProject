/**
 * SignupPage Component
 * Página de registro
 */

import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AuthLayout } from './AuthLayout'

export function SignupPage() {
  const navigate = useNavigate()
  const { signUp, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    terms?: string
  }>({})

  const validate = () => {
    const newErrors: typeof errors = {}
    
    if (!email) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'El email no es válido'
    }

    if (!password) {
      newErrors.password = 'La contraseña es requerida'
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    const result = await signUp(email, password)
    if (result.success) {
      // Si el usuario necesita confirmar email, mostrar mensaje
      // Si no, redirigir al login
      if (!result.user) {
        // Necesita confirmar email
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        navigate('/')
      }
    }
  }

  return (
    <AuthLayout
      title="Únete a Foxy"
      subtitle="Crea tu cuenta para empezar"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          fullWidth
          autoComplete="email"
          disabled={isLoading}
          required
        />

        <Input
          label="Contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          fullWidth
          autoComplete="new-password"
          disabled={isLoading}
          required
        />

        <Input
          label="Confirmar contraseña"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          fullWidth
          autoComplete="new-password"
          disabled={isLoading}
          required
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            disabled={isLoading}
            className="mt-1"
          />
          <label htmlFor="terms" className="text-sm text-text">
            Acepto los{' '}
            <Link
              to="/legal/terms"
              className="text-brand-cyan hover:underline"
              target="_blank"
            >
              términos de servicio
            </Link>
            {' '}y la{' '}
            <Link
              to="/legal/privacy"
              className="text-brand-cyan hover:underline"
              target="_blank"
            >
              política de privacidad
            </Link>
          </label>
        </div>
        {errors.terms && (
          <span className="text-sm text-danger">{errors.terms}</span>
        )}

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
        >
          Crear cuenta
        </Button>

        <div className="text-center text-sm text-muted">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/login"
            className="text-brand-cyan hover:underline font-medium"
          >
            Inicia sesión
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}

