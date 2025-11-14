/**
 * Adapter: BrowserNotificationProvider
 * Implementación de INotificationProvider usando Web Notifications API
 */

import type { INotificationProvider } from './INotificationProvider'

export class BrowserNotificationProvider implements INotificationProvider {
  async requestPermission(): Promise<'granted' | 'denied' | 'default'> {
    if (!('Notification' in window)) {
      console.warn('[BrowserNotificationProvider] Notifications not supported')
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      console.log('[BrowserNotificationProvider] Permission result:', permission)
      return permission
    } catch (error) {
      console.error('[BrowserNotificationProvider] Error requesting permission:', error)
      return 'denied'
    }
  }

  async sendNotification(
    title: string,
    body: string,
    options?: { tag?: string; icon?: string }
  ): Promise<void> {
    if (!this.hasPermission()) {
      console.warn('[BrowserNotificationProvider] No permission to send notification')
      return
    }

    // No enviar si la app está activa y visible
    if (document.visibilityState === 'visible') {
      console.log('[BrowserNotificationProvider] App visible, skipping notification')
      return
    }

    try {
      new Notification(title, {
        body,
        icon: options?.icon || '/vite.svg',
        tag: options?.tag,
        badge: '/vite.svg',
      })
      console.log('[BrowserNotificationProvider] Notification sent:', { title, body, tag: options?.tag })
    } catch (error) {
      console.error('[BrowserNotificationProvider] Error sending notification:', error)
    }
  }

  hasPermission(): boolean {
    return 'Notification' in window && Notification.permission === 'granted'
  }

  getPermissionState(): NotificationPermission {
    if (!('Notification' in window)) {
      return 'denied'
    }
    return Notification.permission
  }
}

