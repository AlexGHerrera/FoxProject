/**
 * Adapter: DeepSeek AI Provider
 * Implementación de IAIProvider usando DeepSeek API
 */

import type { IAIProvider } from './IAIProvider'
import type { ParsedSpend } from '@/domain/models'
import { AIProviderError } from './IAIProvider'
import { AI_TIMEOUT_MS } from '@/config/constants'
import { isValidCategory } from '@/domain/models/Category'

// Importar prompts desde PROMPTS.json (temporalmente hardcodeado)
const SYSTEM_PROMPT = `Eres un parser financiero para español (España). Devuelves SIEMPRE JSON válido sin texto extra.`

const INSTRUCTION_PROMPT = `Extrae {amount_eur}, {category}, {merchant}, {note}, {confidence} de la frase del usuario.
- Admite formatos: '10,55', '10.55', '10 con 55', '€10', '10 euros'.
- Si hay varias cantidades, elige la más probable como IMPORTE.
- Categoriza en una de: ['Café','Comida fuera','Supermercado','Transporte','Ocio','Hogar','Salud','Compras','Otros'].
- {merchant} opcional (marca/tienda), {note} opcional.
- {confidence} en 0..1 (≥0.8 auto‑confirm).
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
            { role: 'user', content: `${INSTRUCTION_PROMPT}\n\nFrase: "${text}"` },
          ],
          temperature: 0.3,
          max_tokens: 200,
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

      // Parse JSON response
      const parsed = JSON.parse(content) as {
        amount_eur: number
        category: string
        merchant?: string
        note?: string
        confidence: number
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

