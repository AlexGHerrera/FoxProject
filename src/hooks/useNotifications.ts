/**
 * Hook: useNotifications
 * Gestiona el estado y operaciones de notificaciones
 */

import { useEffect, useState } from 'react'
import { useSettingsStore } from '@/stores/useSettingsStore'
import { useSettings } from './useSettings'
import { BrowserNotificationProvider } from '@/adapters/notifications/BrowserNotificationProvider'
import type { NotificationSettings } from '@/domain/models/NotificationSettings'

const notificationProvider = new BrowserNotificationProvider()

export function useNotifications() {
  const { settings } = useSettingsStore()
  const { updateSettings } = useSettings()
  const [permissionState, setPermissionState] = useState<NotificationPermission>(
    notificationProvider.getPermissionState()
  )

  useEffect(() => {
    setPermissionState(notificationProvider.getPermissionState())
  }, [])

  const requestPermission = async () => {
    const result = await notificationProvider.requestPermission()
    setPermissionState(result)
    return result
  }

  const updateNotificationSettings = async (newSettings: NotificationSettings) => {
    await updateSettings({ notifications: newSettings })
  }

  return {
    notificationSettings: settings?.notifications,
    permissionState,
    hasPermission: notificationProvider.hasPermission(),
    requestPermission,
    updateNotificationSettings,
  }
}

