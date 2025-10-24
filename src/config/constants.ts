/**
 * Application constants
 * Valores que definen comportamiento del sistema
 */

// Categorías de gastos (versión 1)
export const CATEGORIES = [
  'Café',
  'Comida fuera',
  'Supermercado',
  'Transporte',
  'Ocio',
  'Hogar',
  'Salud',
  'Compras',
  'Otros',
] as const

export type Category = (typeof CATEGORIES)[number]

// Métodos de pago
export const PAYMENT_METHODS = ['efectivo', 'tarjeta'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

// Planes de suscripción
export const PLANS = ['free', 'tier1', 'tier2'] as const
export type Plan = (typeof PLANS)[number]

// Voz: Web Speech API
export const MAX_RECORDING_TIME_MS = 30000 // 30 segundos
export const SILENCE_THRESHOLD_MS = 2000 // 2 segundos de silencio → auto-stop
export const MIN_TRANSCRIPT_LENGTH = 15 // mínimo de caracteres para llamar IA

// IA: thresholds
export const AUTO_CONFIRM_CONFIDENCE_THRESHOLD = 0.8
export const MIN_CONFIDENCE_FOR_PARSE = 0.5
export const AI_TIMEOUT_MS = 3000

// UI: Undo toast
export const UNDO_TIMEOUT_MS = 5000 // 5 segundos para deshacer

// Budget progress colors
export const BUDGET_THRESHOLDS = {
  OK: 0.7, // <70% verde
  WARNING: 0.9, // 70-89% ámbar
  // ≥90% rojo
} as const

// Performance targets
export const PERFORMANCE_TARGETS = {
  LCP_MS: 2000, // Largest Contentful Paint
  VOICE_TO_SAVE_MS: 1200, // Tiempo ideal de voz a guardado
} as const

// API URLs (override con env vars)
export const API_BASE_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173'

