/**
 * Adapter: DeepSeek AI Provider
 * Implementación de IAIProvider usando DeepSeek API
 */

import type { IAIProvider } from './IAIProvider'
import type { ParsedSpend } from '@/domain/models'
import { AIProviderError } from './IAIProvider'
import { AI_TIMEOUT_MS } from '@/config/constants'
import { isValidCategory } from '@/domain/models'

// Importar prompts desde PROMPTS.json (temporalmente hardcodeado)
const SYSTEM_PROMPT = `Eres un parser financiero para español (España). Devuelves SIEMPRE JSON válido sin texto extra.`

const INSTRUCTION_PROMPT = `Extrae {amount_eur}, {category}, {merchant}, {note}, {paid_with}, {confidence} de la frase del usuario.
- Admite formatos: '10,55', '10.55', '10 con 55', '€10', '10 euros'.
- Si hay varias cantidades, elige la más probable como IMPORTE.
- Categoriza en una de: ['Café','Comida fuera','Supermercado','Transporte','Ocio','Hogar','Salud','Compras','Otros'].
- {merchant} es el establecimiento (Zara, Starbucks, etc.).
- {paid_with} detecta forma de pago: 'tarjeta', 'efectivo', 'transferencia' o null si no se menciona.
- {note} es el comentario o descripción de los artículos (ej: 'una camiseta', '2 pantalones', 'camiseta y 2 pantalones').
- {confidence} en 0..1 (≥0.8 auto‑confirm).
- IMPORTANTE: El usuario puede decir los campos en cualquier orden.
Responde SOLO con JSON.`

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

  async parseSpendText(text: string, locale = 'es-ES'): Promise<ParsedSpend> {
    const startTime = Date.now()

    try {
      const response = await this.callDeepSeek(text, locale)
      const latency = Date.now() - startTime

      console.log('[DeepSeekProvider] Parse successful', {
        latency,
        confidence: response.confidence,
      })

      return response
    } catch (error) {
      const latency = Date.now() - startTime
      console.error('[DeepSeekProvider] Parse failed', { latency, error })

      throw new AIProviderError(
        'Error parsing spend with DeepSeek',
        'deepseek',
        error
      )
    }
  }

  private async callDeepSeek(text: string, locale: string): Promise<ParsedSpend> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

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
            { role: 'user', content: `${INSTRUCTION_PROMPT}\n\nFrase: "${text}"\n\nIMPORTANTE: Responde ÚNICAMENTE con el objeto JSON, sin texto adicional, sin markdown, sin explicaciones.` },
          ],
          temperature: 0.2, // Más determinista para JSON consistente
          max_tokens: 300, // Más espacio para respuestas complejas
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new Error('No content in DeepSeek response')
      }

      console.log('[DeepSeekProvider] Raw response:', content)

      // Limpiar respuesta: a veces DeepSeek añade texto antes/después del JSON
      let cleanedContent = content.trim()
      
      // Buscar JSON entre ```json y ``` si está en markdown
      const markdownMatch = cleanedContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
      if (markdownMatch) {
        cleanedContent = markdownMatch[1]
      }
      
      // Buscar el primer { y último } para extraer solo el JSON
      const firstBrace = cleanedContent.indexOf('{')
      const lastBrace = cleanedContent.lastIndexOf('}')
      
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1)
      }

      // Parse JSON response
      let parsed: {
        amount_eur: number
        category: string
        merchant?: string
        note?: string
        paid_with?: 'tarjeta' | 'efectivo' | 'transferencia' | null
        confidence: number
      }

      try {
        parsed = JSON.parse(cleanedContent)
      } catch (parseError) {
        console.error('[DeepSeekProvider] JSON parse error:', parseError)
        console.error('[DeepSeekProvider] Content was:', content)
        throw new Error(`Failed to parse DeepSeek response as JSON: ${content.substring(0, 100)}`)
      }

      // Validar campos requeridos
      if (typeof parsed.amount_eur !== 'number') {
        throw new Error('Missing or invalid amount_eur in response')
      }
      if (!parsed.category) {
        throw new Error('Missing category in response')
      }
      if (typeof parsed.confidence !== 'number') {
        throw new Error('Missing or invalid confidence in response')
      }

      // Validar y normalizar
      if (!isValidCategory(parsed.category)) {
        parsed.category = 'Otros'
        parsed.confidence = Math.min(parsed.confidence, 0.6)
      }

      return {
        amountEur: parsed.amount_eur,
        category: parsed.category as any,
        merchant: parsed.merchant || '',
        note: parsed.note || '',
        paidWith: parsed.paid_with || null,
        confidence: parsed.confidence,
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

