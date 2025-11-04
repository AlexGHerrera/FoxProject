/**
 * Web Worker: Notification Scheduler
 * Ejecuta checks periódicos para notificaciones en background
 */

let checkInterval = null

self.addEventListener('message', (event) => {
  const { type, payload } = event.data

  if (type === 'START') {
    const { intervalMs } = payload
    if (checkInterval) clearInterval(checkInterval)

    // Iniciar intervalo
    checkInterval = setInterval(() => {
      self.postMessage({ type: 'CHECK_NOTIFICATIONS' })
    }, intervalMs)

    // Enviar check inmediato
    self.postMessage({ type: 'CHECK_NOTIFICATIONS' })

    console.log('[NotificationWorker] Started with interval:', intervalMs)
  }

  if (type === 'STOP') {
    if (checkInterval) {
      clearInterval(checkInterval)
      checkInterval = null
      console.log('[NotificationWorker] Stopped')
    }
  }
})

