/**
 * Adapter: Supabase Admin Repository
 * Implementación de IAdminRepository usando Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IAdminRepository, AdminMetrics, AdminError, AdminFeedback, AdminUser } from './IAdminRepository'
import type { Database } from '@/config/supabase'

export class SupabaseAdminRepository implements IAdminRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getMetrics(): Promise<AdminMetrics> {
    try {
      // Total usuarios
      const { count: totalUsers } = await this.supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })

      // Total gastos
      const { count: totalSpends } = await this.supabase
        .from('spends')
        .select('*', { count: 'exact', head: true })

      // Gastos hoy
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: spendsToday } = await this.supabase
        .from('spends')
        .select('*', { count: 'exact', head: true })
        .gte('ts', today.toISOString())

      // Gastos esta semana
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const { count: spendsThisWeek } = await this.supabase
        .from('spends')
        .select('*', { count: 'exact', head: true })
        .gte('ts', weekAgo.toISOString())

      // Gastos este mes
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      const { count: spendsThisMonth } = await this.supabase
        .from('spends')
        .select('*', { count: 'exact', head: true })
        .gte('ts', monthAgo.toISOString())

      // Uso de IA
      const { data: aiUsageData, error: aiError } = await this.supabase
        .from('api_usage')
        .select('tokens_input, tokens_output, latency_ms, success')

      let totalCalls = 0
      let totalTokens = 0
      let totalLatency = 0
      let successCount = 0

      if (!aiError && aiUsageData) {
        totalCalls = aiUsageData.length
        aiUsageData.forEach((usage) => {
          if (usage.tokens_input) totalTokens += usage.tokens_input
          if (usage.tokens_output) totalTokens += usage.tokens_output
          if (usage.latency_ms) totalLatency += usage.latency_ms
          if (usage.success) successCount++
        })
      }

      const avgLatency = totalCalls > 0 ? totalLatency / totalCalls : 0
      const successRate = totalCalls > 0 ? successCount / totalCalls : 0

      return {
        totalUsers: totalUsers || 0,
        totalSpends: totalSpends || 0,
        spendsToday: spendsToday || 0,
        spendsThisWeek: spendsThisWeek || 0,
        spendsThisMonth: spendsThisMonth || 0,
        aiUsage: {
          totalCalls,
          totalTokens,
          avgLatency: Math.round(avgLatency),
          successRate: Math.round(successRate * 100) / 100,
        },
      }
    } catch (error) {
      console.error('[SupabaseAdminRepository] Error getting metrics:', error)
      throw error
    }
  }

  async getRecentErrors(limit = 50): Promise<AdminError[]> {
    try {
      const { data, error } = await this.supabase
        .from('api_usage')
        .select('id, user_id, provider, endpoint, error_message, created_at')
        .eq('success', false)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      return (data || []).map((row) => ({
        id: row.id,
        user_id: row.user_id,
        provider: row.provider,
        endpoint: row.endpoint,
        error_message: row.error_message,
        created_at: row.created_at,
      }))
    } catch (error) {
      console.error('[SupabaseAdminRepository] Error getting recent errors:', error)
      throw error
    }
  }

  async getPendingFeedback(): Promise<AdminFeedback[]> {
    try {
      const { data, error } = await this.supabase
        .from('feedback')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((fb) => ({
        ...fb,
        user_email: undefined, // Se puede obtener con edge function si es necesario
      }))
    } catch (error) {
      console.error('[SupabaseAdminRepository] Error getting pending feedback:', error)
      throw error
    }
  }

  async getAllFeedback(): Promise<AdminFeedback[]> {
    try {
      const { data, error } = await this.supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      return (data || []).map((fb) => ({
        ...fb,
        user_email: undefined, // Se puede obtener con edge function si es necesario
      }))
    } catch (error) {
      console.error('[SupabaseAdminRepository] Error getting all feedback:', error)
      throw error
    }
  }

  async updateFeedbackStatus(
    id: string,
    status: 'pending' | 'reviewed' | 'resolved',
    adminNotes?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
        reviewed_at: new Date().toISOString(),
      }

      if (adminNotes) {
        updateData.admin_notes = adminNotes
      }

      const { error } = await this.supabase
        .from('feedback')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('[SupabaseAdminRepository] Error updating feedback status:', error)
      throw error
    }
  }

  async getActiveUsers(days = 30): Promise<AdminUser[]> {
    try {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - days)

      // Obtener usuarios con actividad reciente
      const { data: recentSpends, error: spendsError } = await this.supabase
        .from('spends')
        .select('user_id, ts')
        .gte('ts', daysAgo.toISOString())

      if (spendsError) throw spendsError

      // Agrupar por usuario
      const userActivity: Record<string, { lastActivity: string; totalSpends: number }> = {}
      recentSpends?.forEach((spend) => {
        if (!userActivity[spend.user_id]) {
          userActivity[spend.user_id] = {
            lastActivity: spend.ts,
            totalSpends: 0,
          }
        }
        userActivity[spend.user_id].totalSpends++
        if (spend.ts > userActivity[spend.user_id].lastActivity) {
          userActivity[spend.user_id].lastActivity = spend.ts
        }
      })

      // Obtener información básica de usuarios desde user_roles
      const { data: userRoles, error: rolesError } = await this.supabase
        .from('user_roles')
        .select('user_id, created_at')

      if (rolesError) throw rolesError

      const users: AdminUser[] = []
      userRoles?.forEach((role) => {
        const activity = userActivity[role.user_id]
        if (activity) {
          users.push({
            id: role.user_id,
            email: `${role.user_id.substring(0, 8)}...`, // Placeholder, se puede mejorar con edge function
            created_at: role.created_at,
            last_activity: activity.lastActivity,
            total_spends: activity.totalSpends,
          })
        }
      })

      return users.sort((a, b) => {
        const aDate = a.last_activity || a.created_at
        const bDate = b.last_activity || b.created_at
        return new Date(bDate).getTime() - new Date(aDate).getTime()
      })
    } catch (error) {
      console.error('[SupabaseAdminRepository] Error getting active users:', error)
      throw error
    }
  }
}

