/**
 * Caso de uso: Parse Spend
 * Convierte texto libre en gasto estructurado usando IA
 * OPTIMIZADO: Pre-procesa y cachea para minimizar llamadas a API
 */

import type { IAIProvider } from '@/adapters/ai/IAIProvider'
import type { ParsedSpend } from '@/domain/models'
import { MIN_CONFIDENCE_FOR_PARSE, MIN_TRANSCRIPT_LENGTH } from '@/config/constants'
import { preProcessTranscript } from './preProcessTranscript'
import { transcriptCache } from './transcriptCache'

export interface ParseSpendOptions {
  locale?: string
  minConfidence?: number
  bypassCache?: boolean // Para testing
}

// Métricas de optimización
let apiCallsAvoided = 0
let totalParses = 0

/**
 * Parsea texto de voz a gasto estructurado
 * OPTIMIZADO con pre-procesamiento y cache
 */
export async function parseSpend(
  text: string,
  aiProvider: IAIProvider,
  options: ParseSpendOptions = {}
): Promise<ParsedSpend> {
  const { locale = 'es-ES', minConfidence = MIN_CONFIDENCE_FOR_PARSE, bypassCache = false } = options

  totalParses++

  // 1. Validación básica de longitud
  if (!text || text.trim().length < MIN_TRANSCRIPT_LENGTH) {
    throw new Error(
      `Transcripción muy corta. Mínimo ${MIN_TRANSCRIPT_LENGTH} caracteres.`
    )
  }

  // 2. CACHE: Buscar si ya parseamos esto recientemente
  if (!bypassCache) {
    const cached = transcriptCache.get(text)
    if (cached) {
      apiCallsAvoided++
      logOptimizationStats()
      return cached
    }
  }

  // 3. PRE-PROCESAMIENTO: Validar + intentar regex
  const preProcessed = preProcessTranscript(text)

  // Si no es válido, error inmediato (sin llamar API)
  if (!preProcessed.isValid) {
    apiCallsAvoided++
    logOptimizationStats()
    throw new Error(preProcessed.reason || 'Transcripción inválida')
  }

  // Si el regex lo parseó correctamente, usar ese resultado (SIN API)
  if (!preProcessed.shouldUseAI && preProcessed.parsed) {
    apiCallsAvoided++
    logOptimizationStats()
    
    // Guardar en cache
    transcriptCache.set(text, preProcessed.parsed)
    
    return preProcessed.parsed
  }

  // 4. CASO COMPLEJO: Llamar a IA (DeepSeek)
  console.log('[parseSpend] 🤖 Using AI for complex parsing', { text })
  const parsed = await aiProvider.parseSpendText(text, locale)

  // Validar resultado
  if (parsed.confidence < minConfidence) {
    console.warn(`[parseSpend] Low confidence: ${parsed.confidence}`, { text, parsed })
  }

  if (parsed.amountEur <= 0) {
    throw new Error('No se detectó un importe válido en el texto')
  }

  // Guardar en cache
  transcriptCache.set(text, parsed)

  logOptimizationStats()
  return parsed
}

/**
 * Log de métricas de optimización
 */
function logOptimizationStats() {
  const avoidanceRate = totalParses > 0 ? (apiCallsAvoided / totalParses * 100).toFixed(1) : '0'
  console.log(`[parseSpend] 📊 Optimization: ${apiCallsAvoided}/${totalParses} API calls avoided (${avoidanceRate}%)`)
}

/**
 * Obtener estadísticas de optimización
 */
export function getOptimizationStats() {
  return {
    totalParses,
    apiCallsAvoided,
    avoidanceRate: totalParses > 0 ? (apiCallsAvoided / totalParses * 100).toFixed(1) : '0',
    cacheStats: transcriptCache.getStats(),
  }
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

  // Detectar forma de pago
  const lowerText = text.toLowerCase()
  let paidWith: 'tarjeta' | 'efectivo' | 'transferencia' | null = null
  if (/tarjeta|card/.test(lowerText)) paidWith = 'tarjeta'
  else if (/efectivo|cash/.test(lowerText)) paidWith = 'efectivo'
  else if (/transferencia|bizum/.test(lowerText)) paidWith = 'transferencia'

  return {
    amountEur,
    category,
    merchant: '',
    note: text.substring(0, 100), // guarda el texto original
    paidWith,
    confidence: 0.4, // baja confianza para fallback
  }
}

