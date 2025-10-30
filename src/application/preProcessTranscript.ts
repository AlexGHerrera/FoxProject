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
 * MEJORADO: Captura más casos comunes sin perder precisión
 * Formatos detectables:
 * - "5€ café"
 * - "10 euros mercadona"
 * - "taxi 6,50"
 * - "5€ café y 10€ taxi" (múltiples simples)
 */
export function tryParseWithRegex(text: string): ParsedSpend | null {
  const lowerText = text.toLowerCase().trim()

  // FILTRO 1: Si el texto es MUY largo (> 8 palabras), usar IA
  const wordCount = text.trim().split(/\s+/).length
  if (wordCount > 8) {
    return null
  }

  // Extraer importe con múltiples formatos
  const amount = extractAmount(lowerText)
  if (!amount || amount <= 0) {
    return null
  }

  // Detectar forma de pago
  const paidWith = extractPaidWith(lowerText)

  // Detectar categoría por palabras clave (mejorado)
  const category = detectCategoryByKeywords(lowerText)

  // Extraer merchant (básico)
  const merchant = extractMerchantSimple(lowerText)

  // FILTRO 2: Si tenemos importe + categoría clara → OK para regex
  // Incluimos casos simples aunque no tengan merchant
  const isSimpleCase = wordCount <= 5 && category !== 'Otros'
  
  if (isSimpleCase) {
    return {
      amountEur: amount,
      category,
      merchant: merchant || '',
      note: '',
      paidWith,
      confidence: 0.85, // Alta confianza para casos simples
    }
  }

  return null // Caso complejo, necesita IA
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
 * Detecta categoría por palabras clave (mejorado para más casos)
 * Ampliado para capturar más patrones comunes sin perder precisión
 */
function detectCategoryByKeywords(text: string): string {
  const keywords: Record<string, (string | RegExp)[]> = {
    'Café': [
      'starbucks', 'cappuccino', 'latte', 'espresso', 'café', 'cafe', 
      'coca cola', 'cocacola', 'red bull', 'bebida', 'refresco',
      /café|coffee/i
    ],
    'Comida fuera': [
      'mcdonalds', 'burger king', 'pizza hut', 'dominos', 'kfc',
      'restaurante', 'restaurant', 'bar', 'taverna', 'mesón',
      'cerveza', 'cervezas', 'vino', 'vermut', 'tapas', 'raciones',
      /comida|comer|cena|almuerzo|menú/i
    ],
    'Supermercado': [
      'mercadona', 'carrefour', 'lidl', 'dia', 'aldi', 'eroski',
      'hipercor', 'el corte inglés', 'alcampo',
      /super|supermercado|compra|compras/i
    ],
    'Transporte': [
      'taxi', 'uber', 'cabify', 'metro', 'bus', 'autobús', 'tren',
      'gasolina', 'gasoil', 'parking', 'aparcamiento', 'estacionamiento',
      'peaje', 'autopista',
      /transporte|viaje|viajar/i
    ],
    'Ocio': [
      'cine', 'película', 'teatro', 'concierto', 'fiesta', 'festejo',
      'gimnasio', 'gym', 'deporte', 'partido',
      /ocio|entretenimiento|diversión/i
    ],
    'Compras': [
      'zara', 'h&m', 'primark', 'mango', 'massimo dutti',
      'el corte inglés', 'corte ingles', 'fashion',
      /ropa|compras|shopping|tienda/i
    ],
    'Salud': [
      'farmacia', 'farmacéutico', 'medicina', 'medicamento', 'médico',
      'dentista', 'hospital', 'clínica',
      /salud|medicina|farmacia/i
    ],
    'Hogar': [
      'ikea', 'leroy merlin', 'bricodepot', 'ferretería',
      'luz', 'agua', 'gas', 'electricidad', 'internet',
      /hogar|casa|reforma|bricolaje/i
    ],
  }

  for (const [category, patterns] of Object.entries(keywords)) {
    for (const pattern of patterns) {
      if (typeof pattern === 'string') {
        if (text.includes(pattern)) {
          return category
        }
      } else {
        // Es un RegExp
        if (pattern.test(text)) {
          return category
        }
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

