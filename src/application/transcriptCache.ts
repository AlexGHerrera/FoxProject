/**
 * Cache de transcripciones parseadas
 * Evita llamadas duplicadas a la API en <10s
 */

import type { ParsedSpend } from '@/domain/models'

interface CacheEntry {
  transcript: string
  parsedArray: ParsedSpend[]
  timestamp: number
}

const CACHE_TTL_MS = 10_000 // 10 segundos
const MAX_CACHE_SIZE = 20

class TranscriptCache {
  private cache: Map<string, CacheEntry> = new Map()

  /**
   * Normaliza texto para hacer matching más flexible
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Múltiples espacios → uno
      .replace(/[€,]/g, '') // Quitar símbolos
  }

  /**
   * Busca en cache
   */
  get(transcript: string): ParsedSpend[] | null {
    const key = this.normalize(transcript)
    const entry = this.cache.get(key)

    if (!entry) return null

    // Expirado?
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      this.cache.delete(key)
      return null
    }

    console.log('[TranscriptCache] ✅ Cache HIT (API call avoided)', { transcript })
    return entry.parsedArray
  }

  /**
   * Guarda en cache
   */
  set(transcript: string, parsedArray: ParsedSpend[]): void {
    const key = this.normalize(transcript)

    // Evitar cache infinito
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      transcript,
      parsedArray,
      timestamp: Date.now(),
    })

    console.log('[TranscriptCache] 💾 Cached', { transcript, cacheSize: this.cache.size })
  }

  /**
   * Limpia cache expirado
   */
  clean(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Stats para debugging
   */
  getStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    }
  }
}

// Singleton
export const transcriptCache = new TranscriptCache()

// Limpiar cache cada minuto
setInterval(() => transcriptCache.clean(), 60_000)





