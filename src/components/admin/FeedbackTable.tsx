/**
 * FeedbackTable Component
 * Tabla que muestra feedback pendiente con acciones
 */

import { useState } from 'react'
import { MessageSquare, Bug, Lightbulb, HelpCircle, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { AdminFeedback } from '@/adapters/db/IAdminRepository'

interface FeedbackTableProps {
  feedback: AdminFeedback[]
  onUpdateStatus: (id: string, status: 'pending' | 'reviewed' | 'resolved', notes?: string) => Promise<void>
}

const typeIcons = {
  bug: Bug,
  suggestion: Lightbulb,
  question: HelpCircle,
}

const typeLabels = {
  bug: 'Bug',
  suggestion: 'Sugerencia',
  question: 'Pregunta',
}

export function FeedbackTable({ feedback, onUpdateStatus }: FeedbackTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const handleStatusUpdate = async (id: string, status: 'pending' | 'reviewed' | 'resolved') => {
    setUpdatingId(id)
    try {
      await onUpdateStatus(id, status)
    } finally {
      setUpdatingId(null)
    }
  }

  if (feedback.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <MessageSquare className="w-12 h-12 text-muted mx-auto mb-2" />
        <p className="text-muted">No hay feedback pendiente</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Mensaje</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {feedback.map((fb) => {
              const Icon = typeIcons[fb.type]
              return (
                <tr key={fb.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-muted" />
                      <span className="text-sm text-text">{typeLabels[fb.type]}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-text max-w-md truncate">{fb.message}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted">
                    {new Date(fb.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusUpdate(fb.id, 'reviewed')}
                        disabled={updatingId === fb.id}
                        loading={updatingId === fb.id}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Revisado
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusUpdate(fb.id, 'resolved')}
                        disabled={updatingId === fb.id}
                        loading={updatingId === fb.id}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Resuelto
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

