/**
 * Adapter: IndexedDB Cache
 * Cache local para soporte offline
 */

interface CacheEntry<T> {
  key: string
  value: T
  timestamp: number
  expiresAt?: number
}

export class IndexedDBCache {
  private dbName: string
  private storeName: string
  private version: number

  constructor(
    dbName = 'foxy-cache',
    storeName = 'cache',
    version = 1
  ) {
    this.dbName = dbName
    this.storeName = storeName
    this.version = version
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'key' })
        }
      }
    })
  }

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction(this.storeName, 'readwrite')
    const store = transaction.objectStore(this.storeName)

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    }

    return new Promise((resolve, reject) => {
      const request = store.put(entry)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.openDB()
    const transaction = db.transaction(this.storeName, 'readonly')
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      const request = store.get(key)

      request.onsuccess = () => {
        const entry = request.result as CacheEntry<T> | undefined

        if (!entry) {
          resolve(null)
          return
        }

        // Check expiration
        if (entry.expiresAt && Date.now() > entry.expiresAt) {
          this.delete(key) // clean up expired entry
          resolve(null)
          return
        }

        resolve(entry.value)
      }

      request.onerror = () => reject(request.error)
    })
  }

  async delete(key: string): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction(this.storeName, 'readwrite')
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      const request = store.delete(key)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(): Promise<void> {
    const db = await this.openDB()
    const transaction = db.transaction(this.storeName, 'readwrite')
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async keys(): Promise<string[]> {
    const db = await this.openDB()
    const transaction = db.transaction(this.storeName, 'readonly')
    const store = transaction.objectStore(this.storeName)

    return new Promise((resolve, reject) => {
      const request = store.getAllKeys()
      request.onsuccess = () => resolve(request.result as string[])
      request.onerror = () => reject(request.error)
    })
  }
}

