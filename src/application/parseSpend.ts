/**
 * Caso de uso: Parse Spend
 * Convierte texto libre en gasto estructurado usando IA
 */

import type { IAIProvider } from '@/adapters/ai/IAIProvider'
import type { ParsedSpend } from '@/domain/models'
import { MIN_CONFIDENCE_FOR_PARSE, MIN_TRANSCRIPT_LENGTH } from '@/config/constants'

export interface ParseSpendOptions {
  locale?: string
  minConfidence?: number
}

/**
 * Parsea texto de voz a gasto estructurado
 */
export async function parseSpend(
  text: string,
  aiProvider: IAIProvider,
  options: ParseSpendOptions = {}
): Promise<ParsedSpend> {
  const { locale = 'es-ES', minConfidence = MIN_CONFIDENCE_FOR_PARSE } = options

  // Validación básica
  if (!text || text.trim().length < MIN_TRANSCRIPT_LENGTH) {
    throw new Error(
      `Transcripción muy corta. Mínimo ${MIN_TRANSCRIPT_LENGTH} caracteres.`
    )
  }

  // Llamar a IA provider
  const parsed = await aiProvider.parseSpendText(text, locale)

  // Validar resultado
  if (parsed.confidence < minConfidence) {
    console.warn(`[parseSpend] Low confidence: ${parsed.confidence}`, { text, parsed })
  }

  if (parsed.amountEur <= 0) {
    throw new Error('No se detectó un importe válido en el texto')
  }

  return parsed
}

/**
 * Parsea con fallback a regex básico si IA falla
 */
export async function parseSpendWithFallback(
  text: string,
  aiProvider: IAIProvider,
  options: ParseSpendOptions = {}
): Promise<ParsedSpend> {
  try {
    return await parseSpend(text, aiProvider, options)
  } catch (error) {
    console.warn('[parseSpendWithFallback] AI failed, using regex fallback', error)
    return parseSpendRegex(text)
  }
}

/**
 * Parser regex básico como fallback
 * Detecta patrones comunes: "10 euros", "€5", "3,50"
 */
function parseSpendRegex(text: string): ParsedSpend {
  // Intenta extraer números
  const amountMatch = text.match(/(\d+)[\s,.]?(\d{0,2})/)
  if (!amountMatch) {
    throw new Error('No se pudo extraer un importe del texto')
  }

  const euros = parseInt(amountMatch[1], 10)
  const cents = amountMatch[2] ? parseInt(amountMatch[2].padEnd(2, '0'), 10) : 0
  const amountEur = euros + cents / 100

  // Categoría por defecto
  const category = 'Otros'

  return {
    amountEur,
    category,
    merchant: '',
    note: text.substring(0, 100), // guarda el texto original
    confidence: 0.4, // baja confianza para fallback
  }
}

