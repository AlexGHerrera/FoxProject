/**
 * Interface: AI Provider
 * Contrato para proveedores de IA (DeepSeek, OpenAI, etc.)
 */

import type { ParsedSpend } from '@/domain/models'

export interface IAIProvider {
  /**
   * Parsea texto libre a gasto estructurado
   */
  parseSpendText(text: string, locale?: string): Promise<ParsedSpend>

  /**
   * Genera un mensaje de feedback para el usuario
   */
  generateFeedback?(
    category: string,
    amount: number,
    budgetStatus: 'ok' | 'warning' | 'alert'
  ): Promise<string>
}

/**
 * Errores específicos de AI Provider
 */
export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly originalError?: unknown
  ) {
    super(message)
    this.name = 'AIProviderError'
  }
}

