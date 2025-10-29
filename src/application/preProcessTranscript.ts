/**
 * Pre-procesamiento de transcripciones
 * Filtra y valida antes de llamar a la API de IA (optimización de costes)
 */

import type { ParsedSpend } from '@/domain/models'
import { CATEGORIES } from '@/config/constants'

/**
 * Resultado del pre-procesamiento
 */
export interface PreProcessResult {
  isValid: boolean
  reason?: string
  confidence: number
  shouldUseAI: boolean
  parsed?: ParsedSpend | null
}

/**
 * Validación básica: filtrar ruido antes de llamar API
 */
export function validateTranscript(text: string): { isValid: boolean; reason?: string } {
  const trimmed = text.trim()

  // Muy corto (< 5 caracteres)
  if (trimmed.length < 5) {
    return { isValid: false, reason: 'Transcripción demasiado corta (mínimo 5 caracteres)' }
  }

  // Solo números o símbolos (sin letras)
  if (!/[a-záéíóúñA-ZÁÉÍÓÚÑ]/.test(trimmed)) {
    return { isValid: false, reason: 'No se detectaron palabras válidas' }
  }

  // Demasiado largo (> 200 caracteres, probablemente ruido)
  if (trimmed.length > 200) {
    return { isValid: false, reason: 'Transcripción sospechosamente larga' }
  }

  // Detectar frases inútiles comunes
  const uselessPhrases = [
    /^(eh|um|ah|mmm|hmm)\s*$/i,
    /^(hola|hello|hey)\s*$/i,
    /^(vale|ok|okay)\s*$/i,
  ]

  for (const pattern of uselessPhrases) {
    if (pattern.test(trimmed)) {
      return { isValid: false, reason: 'Frase no relacionada con gastos' }
    }
  }

  return { isValid: true }
}

/**
 * Parser regex para casos simples (evita llamada a API)
 * Formatos detectables:
 * - "5€ café"
 * - "10 euros en mercadona"
 * - "taxi 6,50"
 * - "3€ tarjeta starbucks"
 */
export function tryParseWithRegex(text: string): ParsedSpend | null {
  const lowerText = text.toLowerCase().trim()

  // Extraer importe con múltiples formatos
  const amount = extractAmount(lowerText)
  if (!amount || amount <= 0) {
    return null // Sin importe válido, necesita IA
  }

  // Detectar forma de pago
  const paidWith = extractPaidWith(lowerText)

  // Detectar categoría por palabras clave
  const category = detectCategoryByKeywords(lowerText)

  // Extraer merchant (básico)
  const merchant = extractMerchantSimple(lowerText)

  // Solo retornar resultado si tenemos confianza alta en categoría
  if (category !== 'Otros') {
    return {
      amountEur: amount,
      category,
      merchant: merchant || '',
      note: '',
      paidWith,
      confidence: 0.85, // Alta confianza para casos simples
    }
  }

  return null // Categoría ambigua, necesita IA
}

/**
 * Extrae importe del texto
 */
function extractAmount(text: string): number | null {
  // Patrón 1: "5€", "5 €", "€5"
  let match = text.match(/€?\s*(\d+(?:[,.]\d{1,2})?)\s*€?/)
  if (match) {
    return parseFloat(match[1].replace(',', '.'))
  }

  // Patrón 2: "5 euros", "5 euro"
  match = text.match(/(\d+(?:[,.]\d{1,2})?)\s*euros?/)
  if (match) {
    return parseFloat(match[1].replace(',', '.'))
  }

  // Patrón 3: "10 con 50" (10,50)
  match = text.match(/(\d+)\s+con\s+(\d{1,2})/)
  if (match) {
    return parseFloat(`${match[1]}.${match[2].padStart(2, '0')}`)
  }

  return null
}

/**
 * Detecta forma de pago
 */
function extractPaidWith(text: string): 'tarjeta' | 'efectivo' | 'transferencia' | null {
  if (/tarjeta|card/.test(text)) return 'tarjeta'
  if (/efectivo|cash/.test(text)) return 'efectivo'
  if (/transferencia|bizum|transfer/.test(text)) return 'transferencia'
  return null
}

/**
 * Detecta categoría por palabras clave (casos muy claros)
 */
function detectCategoryByKeywords(text: string): string {
  const keywords: Record<string, string[]> = {
    'Café': ['café', 'coffee', 'cafeteria', 'cafetería', 'starbucks', 'cappuccino', 'latte', 'espresso'],
    'Comida fuera': ['comida', 'cena', 'almuerzo', 'restaurante', 'mcdonalds', 'burger', 'pizza'],
    'Supermercado': ['super', 'mercadona', 'carrefour', 'lidl', 'dia', 'aldi', 'compra'],
    'Transporte': ['taxi', 'uber', 'cabify', 'metro', 'bus', 'tren', 'gasolina', 'parking'],
    'Ocio': ['cine', 'teatro', 'concierto', 'entrada', 'fiesta', 'bar', 'copa'],
  }

  for (const [category, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (text.includes(word)) {
        return category
      }
    }
  }

  return 'Otros'
}

/**
 * Extrae merchant simple (solo palabras conocidas)
 */
function extractMerchantSimple(text: string): string | null {
  const merchants = [
    'mercadona', 'carrefour', 'lidl', 'dia', 'aldi',
    'starbucks', 'mcdonalds', 'burger king',
    'zara', 'h&m', 'primark',
    'uber', 'cabify', 'taxi',
  ]

  for (const merchant of merchants) {
    if (text.includes(merchant)) {
      return merchant.charAt(0).toUpperCase() + merchant.slice(1)
    }
  }

  return null
}

/**
 * Pre-procesa transcripción: valida + intenta parsear con regex
 * Si el regex tiene éxito, evita la llamada a IA (ahorro de costes)
 */
export function preProcessTranscript(text: string): PreProcessResult {
  // 1. Validar
  const validation = validateTranscript(text)
  if (!validation.isValid) {
    return {
      isValid: false,
      reason: validation.reason,
      confidence: 0,
      shouldUseAI: false,
      parsed: null,
    }
  }

  // 2. Intentar parsear con regex (casos simples)
  const regexResult = tryParseWithRegex(text)
  if (regexResult && regexResult.confidence >= 0.8) {
    console.log('[PreProcessor] ✅ Parsed with regex (API call avoided)', { text, regexResult })
    return {
      isValid: true,
      confidence: regexResult.confidence,
      shouldUseAI: false, // ✅ EVITAMOS LLAMADA A API
      parsed: regexResult,
    }
  }

  // 3. Caso complejo: necesita IA
  console.log('[PreProcessor] 🤖 Complex case, using AI', { text })
  return {
    isValid: true,
    confidence: 0,
    shouldUseAI: true, // Llamar a DeepSeek
    parsed: null,
  }
}

