/**
 * FeedbackModal Component
 * Modal para enviar feedback
 */

import { useState, FormEvent, ChangeEvent } from 'react'
import { X, Bug, Lightbulb, HelpCircle, Upload } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useFeedback } from '@/hooks/useFeedback'
import { supabase } from '@/config/supabase'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug', icon: Bug, description: 'Reportar un error' },
  { value: 'suggestion', label: 'Sugerencia', icon: Lightbulb, description: 'Proponer una mejora' },
  { value: 'question', label: 'Pregunta', icon: HelpCircle, description: 'Hacer una pregunta' },
] as const

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { submit, isSubmitting } = useFeedback()
  const [type, setType] = useState<'bug' | 'suggestion' | 'question'>('suggestion')
  const [message, setMessage] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false)

  const handleScreenshotChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede exceder 5MB')
      return
    }

    setScreenshot(file)
    setUploadingScreenshot(true)

    try {
      // Subir a Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `feedback/${fileName}`

      const { data, error } = await supabase.storage
        .from('feedback-screenshots')
        .upload(filePath, file)

      if (error) throw error

      const { data: urlData } = supabase.storage
        .from('feedback-screenshots')
        .getPublicUrl(filePath)

      setScreenshotUrl(urlData.publicUrl)
    } catch (error) {
      console.error('Error uploading screenshot:', error)
      alert('Error al subir la captura de pantalla')
      setScreenshot(null)
    } finally {
      setUploadingScreenshot(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!message.trim()) {
      alert('Por favor, escribe tu mensaje')
      return
    }

    const result = await submit({
      type,
      message: message.trim(),
      screenshot_url: screenshotUrl || undefined,
    })

    if (result.success) {
      // Reset form
      setType('suggestion')
      setMessage('')
      setScreenshot(null)
      setScreenshotUrl(null)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enviar Feedback">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo de feedback */}
        <div>
          <label className="text-sm font-medium text-text mb-2 block">
            Tipo de feedback
          </label>
          <div className="grid grid-cols-3 gap-2">
            {FEEDBACK_TYPES.map((fbType) => {
              const Icon = fbType.icon
              const isSelected = type === fbType.value
              return (
                <button
                  key={fbType.value}
                  type="button"
                  onClick={() => setType(fbType.value)}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${isSelected
                      ? 'border-brand-cyan bg-brand-cyan/10'
                      : 'border-border hover:border-brand-cyan/50'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${isSelected ? 'text-brand-cyan' : 'text-muted'}`} />
                  <p className={`text-xs font-medium ${isSelected ? 'text-brand-cyan' : 'text-muted'}`}>
                    {fbType.label}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Mensaje */}
        <div>
          <label htmlFor="feedback-message" className="text-sm font-medium text-text mb-2 block">
            Mensaje *
          </label>
          <textarea
            id="feedback-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            maxLength={1000}
            className="input-base w-full resize-none"
            placeholder="Describe tu pregunta, sugerencia o el bug que encontraste..."
            disabled={isSubmitting}
            required
          />
          <p className="text-xs text-muted mt-1">
            {message.length}/1000 caracteres
          </p>
        </div>

        {/* Captura de pantalla */}
        <div>
          <label htmlFor="feedback-screenshot" className="text-sm font-medium text-text mb-2 block">
            Captura de pantalla (opcional)
          </label>
          <div className="flex items-center gap-2">
            <label
              htmlFor="feedback-screenshot"
              className="flex-1 cursor-pointer"
            >
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-brand-cyan/50 transition-colors">
                {screenshotUrl ? (
                  <div className="space-y-2">
                    <img
                      src={screenshotUrl}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded"
                    />
                    <p className="text-xs text-muted">Captura seleccionada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-6 h-6 text-muted mx-auto" />
                    <p className="text-sm text-muted">
                      {uploadingScreenshot ? 'Subiendo...' : 'Haz clic para seleccionar'}
                    </p>
                  </div>
                )}
              </div>
              <input
                id="feedback-screenshot"
                type="file"
                accept="image/*"
                onChange={handleScreenshotChange}
                disabled={isSubmitting || uploadingScreenshot}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || uploadingScreenshot || !message.trim()}
            loading={isSubmitting}
            className="flex-1"
          >
            Enviar
          </Button>
        </div>
      </form>
    </Modal>
  )
}

