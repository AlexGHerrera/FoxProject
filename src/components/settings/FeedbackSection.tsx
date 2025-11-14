/**
 * FeedbackSection Component
 * Sección de feedback en Settings
 */

import { useState } from 'react'
import { ChevronRight, MessageSquare } from 'lucide-react'
import { FeedbackModal } from './FeedbackModal'

export function FeedbackSection() {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] text-left"
      >
        <div className="flex items-center gap-4">
          {/* Icono */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-cyan/10 dark:bg-brand-cyan/20 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-brand-cyan" strokeWidth={2.5} />
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text text-base mb-0.5">
              Pregunta o Sugerencia
            </h3>
            <p className="text-sm text-muted truncate">
              Envía tus comentarios sobre la app
            </p>
          </div>

          {/* Chevron */}
          <ChevronRight className="w-5 h-5 text-muted flex-shrink-0" />
        </div>
      </button>

      {/* Modal de feedback */}
      <FeedbackModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}

