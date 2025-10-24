/**
 * Modelo de dominio: Category (Categoría de gasto)
 * Definiciones y utilidades relacionadas con categorías
 */

import { CATEGORIES, type Category } from '@/config/constants'

/**
 * Valida que un string sea una categoría válida
 */
export function isValidCategory(value: string): value is Category {
  return CATEGORIES.includes(value as Category)
}

/**
 * Normaliza una categoría (manejo de variaciones)
 */
export function normalizeCategory(raw: string): Category | null {
  const normalized = raw.trim().toLowerCase()

  // Mapeo de variaciones comunes
  const mappings: Record<string, Category> = {
    cafe: 'Café',
    coffee: 'Café',
    bebidas: 'Café',
    comida: 'Comida fuera',
    restaurante: 'Comida fuera',
    restaurant: 'Comida fuera',
    super: 'Supermercado',
    supermercado: 'Supermercado',
    mercado: 'Supermercado',
    transporte: 'Transporte',
    taxi: 'Transporte',
    bus: 'Transporte',
    metro: 'Transporte',
    ocio: 'Ocio',
    entretenimiento: 'Ocio',
    hogar: 'Hogar',
    casa: 'Hogar',
    salud: 'Salud',
    farmacia: 'Salud',
    medico: 'Salud',
    compras: 'Compras',
    ropa: 'Compras',
    otros: 'Otros',
  }

  return mappings[normalized] || null
}

/**
 * Obtiene emoji representativo de la categoría
 */
export function getCategoryEmoji(category: Category): string {
  const emojis: Record<Category, string> = {
    Café: '☕',
    'Comida fuera': '🍽️',
    Supermercado: '🛒',
    Transporte: '🚗',
    Ocio: '🎮',
    Hogar: '🏠',
    Salud: '💊',
    Compras: '🛍️',
    Otros: '📦',
  }
  return emojis[category]
}

