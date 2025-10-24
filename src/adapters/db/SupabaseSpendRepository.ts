/**
 * Adapter: Supabase Spend Repository
 * Implementación de ISpendRepository usando Supabase
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ISpendRepository,
  SpendFilters,
  PaginationOptions,
} from './ISpendRepository'
import type { Spend, CreateSpendData } from '@/domain/models'
import { RepositoryError } from './ISpendRepository'
import type { Database } from '@/config/supabase'

type SpendRow = Database['public']['Tables']['spends']['Row']
type SpendInsert = Database['public']['Tables']['spends']['Insert']

export class SupabaseSpendRepository implements ISpendRepository {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(data: CreateSpendData): Promise<Spend> {
    try {
      const insertData: SpendInsert = {
        user_id: data.userId,
        amount_cents: data.amountCents,
        currency: data.currency,
        category: data.category,
        merchant: data.merchant,
        note: data.note,
        paid_with: data.paidWith,
      }

      const { data: row, error } = await this.supabase
        .from('spends')
        .insert(insertData)
        .select()
        .single()

      if (error) throw error
      if (!row) throw new Error('No data returned from insert')

      return this.mapRowToSpend(row)
    } catch (error) {
      throw new RepositoryError('Failed to create spend', 'create', error)
    }
  }

  async getById(id: string, userId: string): Promise<Spend | null> {
    try {
      const { data: row, error } = await this.supabase
        .from('spends')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // not found
        throw error
      }

      return row ? this.mapRowToSpend(row) : null
    } catch (error) {
      throw new RepositoryError('Failed to get spend by ID', 'getById', error)
    }
  }

  async list(
    userId: string,
    filters?: SpendFilters,
    pagination?: PaginationOptions
  ): Promise<Spend[]> {
    try {
      let query = this.supabase
        .from('spends')
        .select('*')
        .eq('user_id', userId)
        .order('ts', { ascending: false })

      // Aplicar filtros
      if (filters?.startDate) {
        query = query.gte('ts', filters.startDate.toISOString())
      }
      if (filters?.endDate) {
        query = query.lte('ts', filters.endDate.toISOString())
      }
      if (filters?.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories)
      }
      if (filters?.paymentMethods && filters.paymentMethods.length > 0) {
        query = query.in('paid_with', filters.paymentMethods)
      }
      if (filters?.search) {
        // Buscar en merchant y note
        query = query.or(
          `merchant.ilike.%${filters.search}%,note.ilike.%${filters.search}%`
        )
      }

      // Aplicar paginación
      if (pagination) {
        query = query.range(
          pagination.offset,
          pagination.offset + pagination.limit - 1
        )
      } else {
        query = query.limit(100) // límite por defecto
      }

      const { data: rows, error } = await query

      if (error) throw error

      return (rows || []).map((row) => this.mapRowToSpend(row))
    } catch (error) {
      throw new RepositoryError('Failed to list spends', 'list', error)
    }
  }

  async getTotalInRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      // Supabase no tiene SUM directo, usamos RPC o calculamos en cliente
      const { data: rows, error } = await this.supabase
        .from('spends')
        .select('amount_cents')
        .eq('user_id', userId)
        .gte('ts', startDate.toISOString())
        .lte('ts', endDate.toISOString())

      if (error) throw error

      const total = (rows || []).reduce((sum, row) => sum + row.amount_cents, 0)
      return total
    } catch (error) {
      throw new RepositoryError('Failed to get total in range', 'getTotalInRange', error)
    }
  }

  async update(id: string, userId: string, data: Partial<Spend>): Promise<Spend> {
    try {
      const updateData: Partial<SpendRow> = {}
      if (data.amountCents !== undefined) updateData.amount_cents = data.amountCents
      if (data.category !== undefined) updateData.category = data.category
      if (data.merchant !== undefined) updateData.merchant = data.merchant
      if (data.note !== undefined) updateData.note = data.note
      if (data.paidWith !== undefined) updateData.paid_with = data.paidWith

      const { data: row, error } = await this.supabase
        .from('spends')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      if (!row) throw new Error('Spend not found or access denied')

      return this.mapRowToSpend(row)
    } catch (error) {
      throw new RepositoryError('Failed to update spend', 'update', error)
    }
  }

  async delete(id: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('spends')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      throw new RepositoryError('Failed to delete spend', 'delete', error)
    }
  }

  private mapRowToSpend(row: SpendRow): Spend {
    return {
      id: row.id,
      userId: row.user_id,
      amountCents: row.amount_cents,
      currency: row.currency,
      category: row.category as any, // validated by DB constraint
      merchant: row.merchant,
      note: row.note,
      paidWith: row.paid_with as any,
      timestamp: new Date(row.ts),
    }
  }
}

