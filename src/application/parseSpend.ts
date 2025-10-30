/**
 * Caso de uso: Parse Spend
 * Convierte texto libre en gasto(s) estructurado(s) usando IA
 * OPTIMIZADO: Pre-procesa y cachea para minimizar llamadas a API
 * SOPORTA: Múltiples gastos en una frase + extracción de fechas
 */

import type { IAIProvider } from '@/adapters/ai/IAIProvider'
import type { ParsedSpendResult } from '@/domain/models'
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
 * Parsea texto de voz a gasto(s) estructurado(s)
 * OPTIMIZADO con pre-procesamiento y cache
 * RETORNA: ParsedSpendResult con array de 1 o más gastos
 */
export async function parseSpend(
  text: string,
  aiProvider: IAIProvider,
  options: ParseSpendOptions = {}
): Promise<ParsedSpendResult> {
  const { locale = 'es-ES', minConfidence = MIN_CONFIDENCE_FOR_PARSE, bypassCache = false } = options

  totalParses++

  // 1. Validación básica de longitud
  if (!text || text.trim().length < MIN_TRANSCRIPT_LENGTH) {
    throw new Error(
      `Transcripción muy corta. Mínimo ${MIN_TRANSCRIPT_LENGTH} caracteres.`
    )
  }

  // 2. CACHE: Buscar si ya parseamos esto recientemente
  // NOTA: Cache ahora guarda array completo de gastos
  if (!bypassCache) {
    const cachedArray = transcriptCache.get(text)
    if (cachedArray && cachedArray.length > 0) {
      apiCallsAvoided++
      logOptimizationStats()
      // Construir ParsedSpendResult desde array en cache
      const totalConfidence = cachedArray.reduce((sum, s) => sum + s.confidence, 0) / cachedArray.length
      return {
        spends: cachedArray,
        totalConfidence,
      }
    }
  }

  // 3. PRE-PROCESAMIENTO: Validar + intentar regex (solo para casos simples de 1 gasto)
  const preProcessed = preProcessTranscript(text)

  // Si no es válido, error inmediato (sin llamar API)
  if (!preProcessed.isValid) {
    apiCallsAvoided++
    logOptimizationStats()
    throw new Error(preProcessed.reason || 'Transcripción inválida')
  }

  // Si el regex lo parseó correctamente Y es un solo gasto, usar ese resultado (SIN API)
  if (!preProcessed.shouldUseAI && preProcessed.parsed) {
    apiCallsAvoided++
    logOptimizationStats()
    
    // Guardar en cache (array de 1)
    transcriptCache.set(text, [preProcessed.parsed])
    
    return {
      spends: [preProcessed.parsed],
      totalConfidence: preProcessed.parsed.confidence,
    }
  }

  // 4. CASO COMPLEJO: Llamar a IA (DeepSeek)
  console.log('[parseSpend] 🤖 Using AI for complex parsing', { text })
  const result = await aiProvider.parseSpendText(text, locale)

  // Validar resultado
  if (result.totalConfidence < minConfidence) {
    console.warn(`[parseSpend] Low confidence: ${result.totalConfidence}`, { text, result })
  }

  // Validar que al menos un gasto tiene importe válido
  const hasValidAmount = result.spends.some(s => s.amountEur > 0)
  if (!hasValidAmount) {
    throw new Error('No se detectó ningún importe válido en el texto')
  }

  // Guardar en cache (array completo)
  if (result.spends.length > 0) {
    transcriptCache.set(text, result.spends)
  }

  logOptimizationStats()
  return result
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
): Promise<ParsedSpendResult> {
  try {
    return await parseSpend(text, aiProvider, options)
  } catch (error) {
    console.warn('[parseSpendWithFallback] AI failed, using regex fallback', error)
    const fallbackSpend = parseSpendRegex(text)
    return {
      spends: [fallbackSpend],
      totalConfidence: fallbackSpend.confidence,
    }
  }
}

/**
 * Parser regex básico como fallback
 * Detecta patrones comunes: "10 euros", "€5", "3,50"
 */
function parseSpendRegex(text: string): import('@/domain/models').ParsedSpend {
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

  // Detectar fecha básica
  let date: string | null = null
  if (/ayer/i.test(lowerText)) date = 'ayer'
  else if (/anteayer/i.test(lowerText)) date = 'anteayer'

  return {
    amountEur,
    category,
    merchant: '',
    note: text.substring(0, 100), // guarda el texto original
    paidWith,
    date,
    confidence: 0.4, // baja confianza para fallback
  }
}

