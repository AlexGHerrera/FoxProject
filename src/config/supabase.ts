/**
 * Supabase client configuration
 */

import { createClient } from '@supabase/supabase-js'
import { env } from './env'

export const supabase = createClient(env.supabase.url, env.supabase.anonKey)

// Types generados desde el schema (placeholder, actualizar cuando tengamos el proyecto real)
export type Database = {
  public: {
    Tables: {
      spends: {
        Row: {
          id: string
          user_id: string
          amount_cents: number
          currency: string
          category: string
          merchant: string | null
          note: string | null
          paid_with: string | null
          ts: string
        }
        Insert: Omit<Database['public']['Tables']['spends']['Row'], 'id' | 'ts'>
        Update: Partial<Database['public']['Tables']['spends']['Insert']>
      }
      settings: {
        Row: {
          user_id: string
          monthly_limit_cents: number
          plan: string
          tz: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['settings']['Row'],
          'created_at' | 'updated_at'
        >
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
      training_examples: {
        Row: {
          id: string
          user_id: string
          raw_text: string
          category: string
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['training_examples']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['training_examples']['Insert']>
      }
      api_usage: {
        Row: {
          id: string
          user_id: string
          provider: string
          endpoint: string
          tokens_input: number | null
          tokens_output: number | null
          latency_ms: number | null
          success: boolean
          error_message: string | null
          created_at: string
        }
        Insert: Omit<
          Database['public']['Tables']['api_usage']['Row'],
          'id' | 'created_at'
        >
        Update: Partial<Database['public']['Tables']['api_usage']['Insert']>
      }
    }
  }
}

