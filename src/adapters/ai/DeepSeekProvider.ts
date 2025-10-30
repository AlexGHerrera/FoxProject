/**
 * Adapter: DeepSeek AI Provider
 * Implementación de IAIProvider usando DeepSeek API
 */

import type { IAIProvider } from './IAIProvider'
import type { ParsedSpend, ParsedSpendResult } from '@/domain/models'
import { AIProviderError } from './IAIProvider'
import { AI_TIMEOUT_MS } from '@/config/constants'
import { isValidCategory } from '@/domain/models'
import { parseDateExpression } from '@/application/parseDateExpression'

// Prompts optimizados (balance entre velocidad y claridad)
const SYSTEM_PROMPT = `Parser financiero ES. Devuelve JSON array sin texto extra.`

const INSTRUCTION_PROMPT = `Extrae TODOS los gastos. Puede haber 1 o múltiples.

Por cada gasto: {amount_eur, category, merchant, note, paid_with, date, confidence}.

- Formatos: '10,55', '€10', '10 euros'
- MÚLTIPLES: '5€ café y 10€ taxi' → 2 gastos
- Categorías: Café, Comida fuera, Supermercado, Transporte, Ocio, Hogar, Salud, Compras, Otros
  * Café: café, bebidas no alcohólicas
  * Comida fuera: comidas, alcohol (cervezas, vinos, vermut, etc.)
  * Ocio: cine, teatro (NO comida)
- date: 'ayer', 'el martes', 'hace 3 días' o null
- confidence: 0..1

Responde SOLO JSON array sin texto.`

interface DeepSeekConfig {
  apiKey: string
  baseUrl?: string
  model?: string
  timeout?: number
}

export class DeepSeekProvider implements IAIProvider {
  private config: Required<DeepSeekConfig>

  constructor(config: DeepSeekConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://api.deepseek.com/v1',
      model: config.model || 'deepseek-chat',
      timeout: config.timeout || AI_TIMEOUT_MS,
    }
  }

  async parseSpendText(text: string, locale = 'es-ES'): Promise<ParsedSpendResult> {
    const startTime = Date.now()

    console.log('[DeepSeekProvider] Starting parse request:', { text, locale })

    try {
      const result = await this.callDeepSeek(text, locale)
      const latency = Date.now() - startTime

      console.log('[DeepSeekProvider] Parse successful ✅', {
        latency,
        spendCount: result.spends.length,
        totalConfidence: result.totalConfidence,
        result,
      })

      return result
    } catch (error) {
      const latency = Date.now() - startTime
      console.error('[DeepSeekProvider] Parse failed ❌', { 
        latency, 
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
      })

      throw new AIProviderError(
        error instanceof Error ? error.message : 'Error parsing spend with DeepSeek',
        'deepseek',
        error
      )
    }
  }

  private async callDeepSeek(text: string, locale: string): Promise<ParsedSpendResult> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    console.log('[DeepSeekProvider] Calling API:', {
      url: `${this.config.baseUrl}/chat/completions`,
      model: this.config.model,
      timeout: this.config.timeout,
      textLength: text.length,
    })

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: `${INSTRUCTION_PROMPT}\n\nFrase: "${text}"\n\nResponde SOLO JSON array.` },
          ],
          temperature: 0.1, // Muy determinista para consistencia
          max_tokens: 200, // Balance entre velocidad y completitud (era 250, ahora 200)
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response')
        console.error('[DeepSeekProvider] API error response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText.substring(0, 500),
        })
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}. ${errorText.substring(0, 100)}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content in DeepSeek response')
      }

      console.log('[DeepSeekProvider] Raw response:', content)

      // Limpiar respuesta: a veces DeepSeek añade texto antes/después del JSON
      let cleanedContent = content.trim()
      
      // Si el contenido está vacío después de trim, es un error
      if (!cleanedContent || cleanedContent.length === 0) {
        throw new Error('Empty response from DeepSeek')
      }
      
      // Buscar JSON array entre ```json y ``` si está en markdown
      const markdownMatch = cleanedContent.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
      if (markdownMatch) {
        cleanedContent = markdownMatch[1]
      } else {
        // Buscar array sin markdown
        const firstBracket = cleanedContent.indexOf('[')
        const lastBracket = cleanedContent.lastIndexOf(']')
        
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          cleanedContent = cleanedContent.substring(firstBracket, lastBracket + 1)
        } else {
          // Si no encontramos brackets, intentar parsear directamente
          console.warn('[DeepSeekProvider] No JSON brackets found, trying direct parse:', cleanedContent.substring(0, 100))
        }
      }
      
      // Validar que tenemos contenido válido antes de parsear
      if (!cleanedContent || cleanedContent.length === 0) {
        throw new Error(`Failed to extract JSON from response: ${content.substring(0, 200)}`)
      }

      // Parse JSON array response
      type RawSpend = {
        amount_eur: number | string
        category: string
        merchant?: string
        note?: string
        paid_with?: 'tarjeta' | 'efectivo' | 'transferencia' | null
        date?: string | null
        confidence: number | string
      }

      let parsedArray: RawSpend[]

      try {
        parsedArray = JSON.parse(cleanedContent)
        
        // Si por alguna razón no es array, convertir a array
        if (!Array.isArray(parsedArray)) {
          parsedArray = [parsedArray as RawSpend]
        }
      } catch (parseError) {
        console.error('[DeepSeekProvider] JSON parse error:', parseError)
        console.error('[DeepSeekProvider] Content was:', content)
        throw new Error(`Failed to parse DeepSeek response as JSON: ${content.substring(0, 100)}`)
      }

      // Validar y normalizar cada gasto del array
      const spends: ParsedSpend[] = parsedArray.map((raw, index) => {
        // amount_eur: convertir a número si es string
        let amountEur: number
        if (typeof raw.amount_eur === 'number') {
          amountEur = raw.amount_eur
        } else if (typeof raw.amount_eur === 'string') {
          amountEur = parseFloat(raw.amount_eur.replace(',', '.'))
          if (isNaN(amountEur)) {
            throw new Error(`Spend ${index}: Invalid amount_eur: cannot parse "${raw.amount_eur}"`)
          }
        } else {
          throw new Error(`Spend ${index}: Missing or invalid amount_eur`)
        }
        
        // category: validar existencia
        if (!raw.category) {
          throw new Error(`Spend ${index}: Missing category`)
        }
        
        // confidence: convertir a número si es string
        let confidence: number
        if (typeof raw.confidence === 'number') {
          confidence = raw.confidence
        } else if (typeof raw.confidence === 'string') {
          confidence = parseFloat(raw.confidence)
          if (isNaN(confidence)) {
            throw new Error(`Spend ${index}: Invalid confidence: cannot parse "${raw.confidence}"`)
          }
        } else {
          throw new Error(`Spend ${index}: Missing or invalid confidence`)
        }

        // Validar categoría y ajustar confidence si es inválida
        let category = raw.category
        if (!isValidCategory(category)) {
          category = 'Otros'
          confidence = Math.min(confidence, 0.6)
        }

        // Validar y parsear fecha si existe
        const dateStr = raw.date || null

        return {
          amountEur,
          category: category as any,
          merchant: raw.merchant || '',
          note: raw.note || '',
          paidWith: raw.paid_with || null,
          date: dateStr,
          confidence,
        }
      })

      // Calcular confidence promedio
      const totalConfidence = spends.length > 0
        ? spends.reduce((sum, s) => sum + s.confidence, 0) / spends.length
        : 0

      return {
        spends,
        totalConfidence,
      }
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`DeepSeek timeout after ${this.config.timeout}ms`)
      }

      throw error
    }
  }

  async generateFeedback(
    category: string,
    amount: number,
    budgetStatus: 'ok' | 'warning' | 'alert'
  ): Promise<string> {
    // Placeholder: implementar generación de mensajes con IA
    const messages = {
      ok: `¡Listo! ${category} ${amount.toFixed(2)} € guardado.`,
      warning: `Anotado ${category}: ${amount.toFixed(2)} €. Vas alto este mes.`,
      alert: `He registrado ${amount.toFixed(2)} € en ${category}. ¡Casi alcanzas el límite!`,
    }

    return messages[budgetStatus]
  }
}

