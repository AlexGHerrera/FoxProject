/**
 * Mock AI Provider
 * Implementación básica usando regex para parsear gastos
 * Útil para desarrollo/demo sin necesidad de API key
 */

import type { IAIProvider, ParsedSpend } from './IAIProvider'
import { CATEGORIES } from '../../config/constants'

export class MockAIProvider implements IAIProvider {
  async parseSpendText(text: string): Promise<ParsedSpend> {
    console.log('[MockAIProvider] Parsing:', text)
    
    // Simular latencia de red (300-800ms)
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500))

    // Extraer importe (varios formatos)
    const amount = this.extractAmount(text)
    
    // Extraer categoría
    const category = this.extractCategory(text)
    
    // Extraer merchant
    const merchant = this.extractMerchant(text)
    
    // Calcular confidence básica
    const confidence = this.calculateConfidence(amount, category, merchant)

    return {
      amountEur: amount,
      category,
      merchant: merchant || '',
      note: '',
      confidence,
    }
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

