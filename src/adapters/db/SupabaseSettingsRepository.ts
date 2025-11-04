/**
 * Adapter: Supabase Settings Repository
 * Implementación de ISettingsRepository usando Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ISettingsRepository } from './ISettingsRepository'
import type { Settings, UpdateSettingsData } from '@/domain/models'
import { RepositoryError } from './ISpendRepository'
import type { Database } from '@/config/supabase'

type SettingsRow = Database['public']['Tables']['settings']['Row']

export class SupabaseSettingsRepository implements ISettingsRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async get(userId: string): Promise<Settings | null> {
    try {
      const { data: row, error } = await this.supabase
        .from('settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // not found
        throw error
      }

      return row ? this.mapRowToSettings(row) : null
    } catch (error) {
      throw new RepositoryError('Failed to get settings', 'get', error)
    }
  }

  async upsert(userId: string, data: UpdateSettingsData): Promise<Settings> {
    try {
      // Mapear campos de dominio a campos de DB
      const upsertData: Partial<SettingsRow> = {
        user_id: userId,
        updated_at: new Date().toISOString(),
      }

      // Mapear solo los campos que vienen en data
      if (data.monthlyLimitCents !== undefined) {
        upsertData.monthly_limit_cents = data.monthlyLimitCents
      }
      if (data.timezone !== undefined) {
        upsertData.tz = data.timezone
      }
      if (data.plan !== undefined) {
        upsertData.plan = data.plan
      }

      console.log('[SupabaseSettingsRepository] Upsert data:', upsertData)

      const { data: row, error } = await this.supabase
        .from('settings')
        .upsert(upsertData, { onConflict: 'user_id' })
        .select()
        .single()

      if (error) {
        console.error('[SupabaseSettingsRepository] Upsert error:', error)
        throw error
      }
      if (!row) throw new Error('No data returned from upsert')

      console.log('[SupabaseSettingsRepository] Upsert success:', row)
      return this.mapRowToSettings(row)
    } catch (error) {
      console.error('[SupabaseSettingsRepository] Upsert failed:', error)
      throw new RepositoryError('Failed to upsert settings', 'upsert', error)
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('settings')
        .delete()
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      throw new RepositoryError('Failed to delete settings', 'delete', error)
    }
  }

  private mapRowToSettings(row: SettingsRow): Settings {
    return {
      userId: row.user_id,
      monthlyLimitCents: row.monthly_limit_cents,
      plan: row.plan as any, // validated by DB constraint
      timezone: row.tz,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }
  }
}

