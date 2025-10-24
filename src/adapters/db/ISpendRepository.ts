/**
 * Interface: Spend Repository
 * Contrato para persistencia de gastos (Supabase, Firebase, etc.)
 */

import type { Spend, CreateSpendData } from '@/domain/models'

export interface SpendFilters {
  startDate?: Date
  endDate?: Date
  categories?: string[]
  paymentMethods?: string[]
  search?: string
}

export interface PaginationOptions {
  limit: number
  offset: number
}

export interface ISpendRepository {
  /**
   * Crea un nuevo gasto
   */
  create(data: CreateSpendData): Promise<Spend>

  /**
   * Obtiene un gasto por ID
   */
  getById(id: string, userId: string): Promise<Spend | null>

  /**
   * Lista gastos con filtros y paginación
   */
  list(
    userId: string,
    filters?: SpendFilters,
    pagination?: PaginationOptions
  ): Promise<Spend[]>

  /**
   * Obtiene el total de gastos en un rango de fechas
   */
  getTotalInRange(userId: string, startDate: Date, endDate: Date): Promise<number>

  /**
   * Actualiza un gasto existente
   */
  update(id: string, userId: string, data: Partial<Spend>): Promise<Spend>

  /**
   * Elimina un gasto
   */
  delete(id: string, userId: string): Promise<void>
}

/**
 * Errores específicos de repositorio
 */
export class RepositoryError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'RepositoryError'
  }
}

