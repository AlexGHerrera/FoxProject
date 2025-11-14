/**
 * AdminPage Component
 * Página de administración con métricas, errores, feedback y usuarios
 */

import { Shield, Users, TrendingUp, AlertTriangle, MessageSquare, RefreshCw } from 'lucide-react'
import { useAdminData } from '@/hooks/useAdminData'
import { MetricsCard, ErrorTable, FeedbackTable, UserTable } from '@/components/admin'
import { Button } from '@/components/ui/Button'

export function AdminPage() {
  const { metrics, errors, feedback, users, isLoading, error, refresh, updateFeedbackStatus } = useAdminData()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Cargando datos de administración...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-danger mx-auto mb-4" />
          <p className="text-danger mb-4">{error}</p>
          <Button onClick={refresh}>Reintentar</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-brand-cyan" />
              <div>
                <h1 className="text-2xl font-bold text-text">Panel de Administración</h1>
                <p className="text-sm text-muted">Gestión y monitoreo de la aplicación</p>
              </div>
            </div>
            <Button variant="secondary" onClick={refresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Métricas */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricsCard
              title="Total Usuarios"
              value={metrics.totalUsers}
              icon={Users}
            />
            <MetricsCard
              title="Total Gastos"
              value={metrics.totalSpends}
              icon={TrendingUp}
            />
            <MetricsCard
              title="Gastos Hoy"
              value={metrics.spendsToday}
              icon={TrendingUp}
              subtitle={`Esta semana: ${metrics.spendsThisWeek}`}
            />
            <MetricsCard
              title="Llamadas IA"
              value={metrics.aiUsage.totalCalls}
              icon={MessageSquare}
              subtitle={`Éxito: ${Math.round(metrics.aiUsage.successRate * 100)}%`}
            />
          </div>
        )}

        {/* Errores Recientes */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger" />
            Errores Recientes
          </h2>
          <ErrorTable errors={errors} />
        </div>

        {/* Feedback Pendiente */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-cyan" />
            Feedback Pendiente ({feedback.length})
          </h2>
          <FeedbackTable feedback={feedback} onUpdateStatus={updateFeedbackStatus} />
        </div>

        {/* Usuarios Activos */}
        <div>
          <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-cyan" />
            Usuarios Activos (últimos 30 días)
          </h2>
          <UserTable users={users} />
        </div>
      </main>
    </div>
  )
}

