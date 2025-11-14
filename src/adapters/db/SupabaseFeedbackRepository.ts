/**
 * Adapter: Supabase Feedback Repository
 * Implementación de IFeedbackRepository usando Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { IFeedbackRepository, Feedback, CreateFeedbackData } from './IFeedbackRepository'
import type { Database } from '@/config/supabase'

export class SupabaseFeedbackRepository implements IFeedbackRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(data: CreateFeedbackData): Promise<Feedback> {
    try {
      const { data: row, error } = await this.supabase
        .from('feedback')
        .insert({
          user_id: data.user_id,
          type: data.type,
          message: data.message,
          screenshot_url: data.screenshot_url || null,
        })
        .select()
        .single()

      if (error) throw error
      if (!row) throw new Error('No data returned from insert')

      return this.mapRowToFeedback(row)
    } catch (error) {
      console.error('[SupabaseFeedbackRepository] Error creating feedback:', error)
      throw error
    }
  }

  async getByUserId(userId: string): Promise<Feedback[]> {
    try {
      const { data, error } = await this.supabase
        .from('feedback')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return (data || []).map((row) => this.mapRowToFeedback(row))
    } catch (error) {
      console.error('[SupabaseFeedbackRepository] Error getting feedback:', error)
      throw error
    }
  }

  private mapRowToFeedback(row: Database['public']['Tables']['feedback']['Row']): Feedback {
    return {
      id: row.id,
      user_id: row.user_id,
      type: row.type,
      message: row.message,
      screenshot_url: row.screenshot_url,
      status: row.status,
      admin_notes: row.admin_notes,
      created_at: row.created_at,
      reviewed_at: row.reviewed_at,
    }
  }
}

