/**
 * OnboardingWizard Component
 * Wizard de configuración inicial para nuevos usuarios
 */

import { useState } from 'react'
import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { FoxyAvatar } from '@/components/foxy'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useOnboardingStore } from '@/stores/useOnboardingStore'
import { useSettings } from '@/hooks/useSettings'
import { BUDGET_SUGGESTIONS } from '@/config/constants'

interface OnboardingWizardProps {
  onComplete: () => void
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1)
  const [budget, setBudget] = useState('')
  const [notificationsPermission, setNotificationsPermission] = useState<NotificationPermission | null>(null)
  const [micPermission, setMicPermission] = useState<boolean | null>(null)
  const { setCompleted } = useOnboardingStore()
  const { updateSettings } = useSettings()

  const handleNext = async () => {
    if (step === 2) {
      // Guardar presupuesto
      if (budget) {
        const budgetCents = Math.round(parseFloat(budget) * 100)
        await updateSettings({ monthlyLimitCents: budgetCents })
      }
    }

    if (step === 3) {
      // Solicitar permisos
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        setNotificationsPermission(permission)
      }

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true })
          setMicPermission(true)
        } catch {
          setMicPermission(false)
        }
      }
    }

    if (step < 4) {
      setStep(step + 1)
    } else {
      // Completar onboarding
      setCompleted(true)
      onComplete()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSkip = () => {
    setCompleted(true)
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6 space-y-6">
        {/* Paso 1: Bienvenida */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <FoxyAvatar state="happy" size="lg" />
            <div>
              <h2 className="text-2xl font-bold text-text mb-2">¡Bienvenido a Foxy! 🦊</h2>
              <p className="text-muted">
                Tu asistente personal para gestionar tus finanzas por voz.
                Te guiaremos en la configuración inicial.
              </p>
            </div>
            <Button onClick={handleNext} fullWidth>
              Comenzar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Paso 2: Presupuesto */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text mb-2">Configura tu presupuesto</h2>
              <p className="text-muted">
                Establece un límite mensual para controlar tus gastos
              </p>
            </div>
            <Input
              label="Presupuesto mensual (€)"
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Ej: 1000"
              fullWidth
            />
            <div className="grid grid-cols-2 gap-2">
              {BUDGET_SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setBudget((suggestion / 100).toString())}
                  className="p-2 border border-border rounded-lg hover:border-brand-cyan transition-colors text-sm"
                >
                  {(suggestion / 100).toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                  })}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continuar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Paso 3: Permisos */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-text mb-2">Permisos necesarios</h2>
              <p className="text-muted">
                Para usar todas las funciones de Foxy, necesitamos algunos permisos
              </p>
            </div>
            <div className="space-y-3">
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text">Notificaciones</p>
                    <p className="text-sm text-muted">Para recordatorios de gastos</p>
                  </div>
                  {notificationsPermission === 'granted' && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-text">Micrófono</p>
                    <p className="text-sm text-muted">Para registrar gastos por voz</p>
                  </div>
                  {micPermission === true && (
                    <Check className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleBack} className="flex-1">
                <ArrowLeft className="w-4 h-4 mr-2" /> Atrás
              </Button>
              <Button onClick={handleNext} className="flex-1">
                Continuar <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Paso 4: Listo */}
        {step === 4 && (
          <div className="text-center space-y-4">
            <FoxyAvatar state="happy" size="lg" />
            <div>
              <h2 className="text-2xl font-bold text-text mb-2">¡Todo listo! 🎉</h2>
              <p className="text-muted">
                Ya puedes empezar a usar Foxy. Di "5€ café" y verás la magia.
              </p>
            </div>
            <Button onClick={handleNext} fullWidth>
              Comenzar a usar Foxy
            </Button>
          </div>
        )}

        {/* Indicador de pasos */}
        <div className="flex justify-center gap-2 pt-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full ${
                s === step ? 'bg-brand-cyan' : 'bg-border'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

