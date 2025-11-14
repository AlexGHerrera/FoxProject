/**
 * UserTable Component
 * Tabla que muestra usuarios activos
 */

import { Users } from 'lucide-react'
import type { AdminUser } from '@/adapters/db/IAdminRepository'

interface UserTableProps {
  users: AdminUser[]
}

export function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Users className="w-12 h-12 text-muted mx-auto mb-2" />
        <p className="text-muted">No hay usuarios activos</p>
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Usuario</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Registrado</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Última actividad</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted uppercase">Gastos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="px-4 py-3 text-sm text-text font-mono">{user.email}</td>
                <td className="px-4 py-3 text-sm text-muted">
                  {new Date(user.created_at).toLocaleDateString('es-ES')}
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  {user.last_activity
                    ? new Date(user.last_activity).toLocaleDateString('es-ES')
                    : 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm text-text font-semibold">{user.total_spends}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

