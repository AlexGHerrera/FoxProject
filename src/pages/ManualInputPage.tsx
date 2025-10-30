/**
 * Manual Input Page
 * Pantalla para registrar gastos manualmente (texto)
 * Fallback cuando el usuario no puede/quiere usar voz
 */

import { useState } from 'react'
import { Button } from '@/components/ui'
import { useSpendSubmit } from '@/hooks/useSpendSubmit'

interface ManualInputPageProps {
  onClose: () => void
}

export function ManualInputPage({ onClose }: ManualInputPageProps) {
  const [text, setText] = useState('')
  const { parseTranscript, submitSpend, isSubmitting } = useSpendSubmit()
  const [parsedSpend, setParsedSpend] = useState<any>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!text || text.length < 3) {
      return
    }

    // Parsear el texto ingresado
    const parsed = await parseTranscript(text)
    if (parsed) {
      setParsedSpend(parsed)
      setShowConfirm(true)
    }
  }

  const handleConfirm = async () => {
    if (!parsedSpend) return
    
    const saved = await submitSpend(parsedSpend)
    if (saved) {
      onClose() // Volver al dashboard
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
    setParsedSpend(null)
  }

  // Pantalla de confirmación
  if (showConfirm && parsedSpend) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-text mb-2 text-center">
          He anotado un {parsedSpend.category.toLowerCase()} de
        </h1>
        <p className="text-5xl font-bold text-brand-cyan dark:text-brand-cyan-dark mb-4">
          {parsedSpend.amountEur.toFixed(2)} €
        </p>
        <p className="text-xl text-muted mb-8">
          ¿Confirmo?
        </p>

        <div className="w-full max-w-md space-y-3">
          <Button
            variant="primary"
            onClick={handleConfirm}
            className="w-full text-lg py-4"
            disabled={isSubmitting}
          >
            ✓ Confirmar
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="w-full text-sm py-3"
            >
              ✏️ Editar
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-sm py-3"
            >
              ✕ Cancelar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Pantalla de entrada manual
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-bold text-text mb-2 text-center">
        ✏️ Entrada manual
      </h1>
      <p className="text-sm text-muted mb-8 text-center">
        Escribe el gasto como lo dirías por voz
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ej: 5 euros de café en Starbucks"
          className="w-full p-4 rounded-lg border-2 border-brand-cyan dark:border-brand-cyan-dark bg-surface text-text text-lg resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan"
          rows={4}
          autoFocus
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full text-lg py-4"
          disabled={!text || text.length < 3 || isSubmitting}
        >
          {isSubmitting ? 'Procesando...' : 'Continuar →'}
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="w-full"
        >
          Cancelar
        </Button>
      </form>

      {/* Hint */}
      <div className="mt-8 max-w-md">
        <p className="text-xs text-muted text-center">
          💡 Tip: Escribe de forma natural, como "10 euros de pizza" o "50€ de gasolina"
        </p>
      </div>
    </div>
  )
}

