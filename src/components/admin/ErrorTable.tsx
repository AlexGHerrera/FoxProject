/**
 * ErrorTable Component
 * Tabla que muestra errores recientes de la API
 */

import { AlertCircle } from 'lucide-react'
import type { AdminError } from '@/adapters/db/IAdminRepository'

interface ErrorTableProps {
  errors: AdminError[]
}

export function ErrorTable({ errors }: ErrorTableProps) {
  if (errors.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-muted mx-auto mb-2" />
        <p className="text-muted">No hay errores recientes</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Provider</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Endpoint</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {errors.map((error) => (
              <tr key={error.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm text-text">
                  {new Date(error.created_at).toLocaleString('es-ES')}
                </td>
                <td className="px-4 py-3 text-sm text-text">{error.provider}</td>
                <td className="px-4 py-3 text-sm text-text font-mono text-xs">{error.endpoint}</td>
                <td className="px-4 py-3 text-sm text-danger max-w-md truncate">
                  {error.error_message || 'Sin mensaje'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

