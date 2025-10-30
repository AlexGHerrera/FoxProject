/**
 * Mock AI Provider
 * Implementación básica usando regex para parsear gastos
 * Útil para desarrollo/demo sin necesidad de API key
 */

import type { IAIProvider } from './IAIProvider'
import type { ParsedSpend, ParsedSpendResult } from '@/domain/models'
import { CATEGORIES } from '../../config/constants'

export class MockAIProvider implements IAIProvider {
  async parseSpendText(text: string): Promise<ParsedSpendResult> {
    console.log('[MockAIProvider] Parsing:', text)
    
    // Simular latencia de red (300-800ms)
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))

    // Detectar múltiples gastos separados por "y" o ","
    const segments = this.splitMultipleSpends(text)
    
    const spends: ParsedSpend[] = segments.map(segment => {
      // Extraer importe (varios formatos)
      const amount = this.extractAmount(segment)
      
      // Extraer categoría
      const category = this.extractCategory(segment)
      
      // Extraer merchant
      const merchant = this.extractMerchant(segment)
      
      // Extraer forma de pago
      const paidWith = this.extractPaidWith(segment)
      
      // Extraer fecha
      const date = this.extractDate(segment)
      
      // Calcular confidence básica
      const confidence = this.calculateConfidence(amount, category, merchant)

      return {
        amountEur: amount,
        category,
        merchant: merchant || '',
        note: '',
        paidWith,
        date,
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
  }

  private splitMultipleSpends(text: string): string[] {
    // Detectar patrones como "5€ café y 10€ taxi"
    // o "3€ coca cola, 2€ chicles y 5€ parking"
    
    // Buscar patrones con cantidades seguidas de "y" o ","
    const multiPattern = /(\d+[€\s,.]?\d*\s*(?:euros?|€)?\s+[^y,]+?)(?:\s+y\s+|\s*,\s*)/gi
    const matches = text.match(multiPattern)
    
    if (matches && matches.length > 0) {
      // Encontramos múltiples gastos
      const segments = text.split(/\s+y\s+|\s*,\s+/)
      return segments.filter(s => s.trim().length > 0)
    }
    
    // Un solo gasto
    return [text]
  }

  private extractDate(text: string): string | null {
    const lowerText = text.toLowerCase()
    
    // Patrones comunes
    if (lowerText.includes('ayer')) return 'ayer'
    if (lowerText.includes('anteayer')) return 'anteayer'
    if (lowerText.match(/hace\s+\d+\s+d[ií]as?/)) {
      const match = lowerText.match(/hace\s+\d+\s+d[ií]as?/)
      return match ? match[0] : null
    }
    
    // Días de la semana
    const weekDays = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo']
    for (const day of weekDays) {
      if (lowerText.includes(day)) {
        return lowerText.includes('pasado') ? `${day} pasado` : `el ${day}`
      }
    }
    
    return null
  }

  private extractAmount(text: string): number {
    const lowerText = text.toLowerCase()

    // Patrones comunes:
    // "5 euros", "€5", "5€", "5,50", "5.50", "5 con 50"
    
    // NUEVO: Convertir números escritos en palabras a dígitos
    const wordToNumber: Record<string, number> = {
      'cero': 0, 'un': 1, 'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 
      'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
      'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
      'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
      'veinte': 20, 'treinta': 30, 'cuarenta': 40, 'cincuenta': 50,
      'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90, 'cien': 100
    }

    // Buscar números escritos en palabras antes de "euro"
    for (const [word, num] of Object.entries(wordToNumber)) {
      const wordPattern = new RegExp(`\\b${word}\\b\\s*(euros?|€)`, 'i')
      if (wordPattern.test(lowerText)) {
        console.log(`[MockAI] Detectado número en palabras: "${word}" = ${num}`)
        return num
      }
    }
    
    // Patrón: "X con Y" (ej: "5 con 50")
    const conMatch = lowerText.match(/(\d+)\s*con\s*(\d+)/)
    if (conMatch) {
      return parseFloat(`${conMatch[1]}.${conMatch[2]}`)
    }

    // Patrón: número con coma o punto
    const numberMatch = text.match(/(\d+)[,.](\d+)/)
    if (numberMatch) {
      return parseFloat(`${numberMatch[1]}.${numberMatch[2]}`)
    }

    // Patrón: número entero seguido de "euros", "€", etc.
    const euroMatch = text.match(/(\d+)\s*(euros?|€)/)
    if (euroMatch) {
      return parseFloat(euroMatch[1])
    }

    // Patrón: solo número
    const simpleMatch = text.match(/(\d+)/)
    if (simpleMatch) {
      return parseFloat(simpleMatch[1])
    }

    // Default si no se encuentra nada - BAJADO a 0 para que sea obvio que hay un error
    console.warn('[MockAI] No se pudo extraer cantidad del texto:', text)
    return 0
  }

  private extractCategory(text: string): string {
    const lowerText = text.toLowerCase()

    // Keywords por categoría
    const categoryKeywords: Record<string, string[]> = {
      'Café': ['café', 'coffee', 'starbucks', 'cafeteria'],
      'Comida fuera': ['comida', 'comer', 'restaurante', 'almuerzo', 'cena', 'burger', 'pizza', 'telepizza', 'dominos', 'mcdonalds', 'burguer king'],
      'Supermercado': ['supermercado', 'mercadona', 'carrefour', 'compra'],
      'Transporte': ['parking', 'gasolina', 'taxi', 'uber', 'metro', 'bus', 'tren'],
      'Ocio': ['cine', 'concierto', 'fiesta', 'bar', 'copas'],
      'Hogar': ['ikea', 'muebles', 'decoración'],
      'Salud': ['farmacia', 'medicina', 'doctor', 'hospital'],
      'Compras': ['ropa', 'zapatos', 'zara', 'mango', 'tienda', 'h&m', 'primark'],
    }

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category
      }
    }

    return 'Otros'
  }

  private extractMerchant(text: string): string | null {
    const lowerText = text.toLowerCase()

    // Marcas/comercios comunes
    const merchants = [
      'starbucks',
      'mercadona',
      'carrefour',
      'corte inglés',
      'el corte inglés',
      'mcdonalds',
      'burger king',
      'telepizza',
      'dominos',
      'pizza hut',
      'ikea',
      'zara',
      'mango',
      'h&m',
      'primark',
    ]

    for (const merchant of merchants) {
      if (lowerText.includes(merchant)) {
        // Capitalizar primera letra de cada palabra
        return merchant
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    }

    // Buscar "de/en X" donde X podría ser el merchant
    const deEnMatch = lowerText.match(/(?:de|en)\s+([a-záéíóúñ\s]+?)(?:\s|$)/)
    if (deEnMatch) {
      const possibleMerchant = deEnMatch[1].trim()
      if (possibleMerchant.length > 2 && possibleMerchant.length < 30) {
        return possibleMerchant
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      }
    }

    return null
  }

  private extractPaidWith(text: string): 'tarjeta' | 'efectivo' | 'transferencia' | null {
    const lowerText = text.toLowerCase()

    // Detectar forma de pago
    if (lowerText.includes('tarjeta') || lowerText.includes('con tarjeta') || lowerText.includes('card')) {
      return 'tarjeta'
    }
    if (lowerText.includes('efectivo') || lowerText.includes('cash') || lowerText.includes('en efectivo')) {
      return 'efectivo'
    }
    if (lowerText.includes('transferencia') || lowerText.includes('bizum') || lowerText.includes('transfer')) {
      return 'transferencia'
    }

    return null
  }

  private calculateConfidence(amount: number, category: string, merchant: string | null): number {
    let confidence = 0.5

    // Boost si encontramos importe válido
    if (amount > 0 && amount < 1000) {
      confidence += 0.2
    }

    // Boost si la categoría no es "Otros"
    if (category !== 'Otros') {
      confidence += 0.2
    }

    // Boost si encontramos merchant
    if (merchant) {
      confidence += 0.1
    }

    return Math.min(confidence, 0.95)
  }

  async generateFeedback(
    category: string,
    amount: number,
    budgetStatus: 'ok' | 'warning' | 'alert'
  ): Promise<string> {
    const messages = {
      ok: `¡Listo! ${category} ${amount.toFixed(2)} € guardado.`,
      warning: `Anotado ${category}: ${amount.toFixed(2)} €. Vas alto este mes.`,
      alert: `He registrado ${amount.toFixed(2)} € en ${category}. ¡Casi alcanzas el límite!`,
    }

    return messages[budgetStatus]
  }
}

