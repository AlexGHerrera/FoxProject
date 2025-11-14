/**
 * Interface: Admin Repository
 * Contrato para operaciones de administración
 */

export interface AdminMetrics {
  totalUsers: number
  totalSpends: number
  spendsToday: number
  spendsThisWeek: number
  spendsThisMonth: number
  aiUsage: {
    totalCalls: number
    totalTokens: number
    avgLatency: number
    successRate: number
  }
}

export interface AdminError {
  id: string
  user_id: string
  provider: string
  endpoint: string
  error_message: string | null
  created_at: string
}

export interface AdminFeedback {
  id: string
  user_id: string
  user_email?: string
  type: 'bug' | 'suggestion' | 'question'
  message: string
  screenshot_url: string | null
  status: 'pending' | 'reviewed' | 'resolved'
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
}

export interface AdminUser {
  id: string
  email: string
  created_at: string
  last_activity?: string
  total_spends: number
}

export interface IAdminRepository {
  getMetrics(): Promise<AdminMetrics>
  getRecentErrors(limit?: number): Promise<AdminError[]>
  getPendingFeedback(): Promise<AdminFeedback[]>
  getAllFeedback(): Promise<AdminFeedback[]>
  updateFeedbackStatus(
    id: string,
    status: 'pending' | 'reviewed' | 'resolved',
    adminNotes?: string
  ): Promise<void>
  getActiveUsers(days?: number): Promise<AdminUser[]>
}

