/**
 * Interface: Feedback Repository
 * Contrato para operaciones de feedback
 */

export interface Feedback {
  id: string
  user_id: string
  type: 'bug' | 'suggestion' | 'question'
  message: string
  screenshot_url: string | null
  status: 'pending' | 'reviewed' | 'resolved'
  admin_notes: string | null
  created_at: string
  reviewed_at: string | null
}

export interface CreateFeedbackData {
  user_id: string
  type: 'bug' | 'suggestion' | 'question'
  message: string
  screenshot_url?: string
}

export interface IFeedbackRepository {
  create(data: CreateFeedbackData): Promise<Feedback>
  getByUserId(userId: string): Promise<Feedback[]>
}

