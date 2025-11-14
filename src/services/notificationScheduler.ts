/**
 * Service: Notification Scheduler
 * Orquesta el envío de notificaciones usando Web Worker
 */

import type { INotificationProvider } from '@/adapters/notifications/INotificationProvider'
import type { ISpendRepository } from '@/adapters/db/ISpendRepository'
import type { Settings } from '@/domain/models'
import type { TimeSlot } from '@/domain/models/NotificationSettings'
import {
  getReminderMessage,
  getBudget70Message,
  getBudget90Message,
} from '@/application/notificationMessages'
import { shouldSendReminder } from '@/application/checkExpenseReminder'
import { checkBudgetAlert } from '@/application/checkBudgetAlerts'

export class NotificationScheduler {
  private worker: Worker | null = null
  private notificationProvider: INotificationProvider
  private spendRepo: ISpendRepository
  private settings: Settings | null = null

  constructor(notificationProvider: INotificationProvider, spendRepo: ISpendRepository) {
    this.notificationProvider = notificationProvider
    this.spendRepo = spendRepo
  }

  start(settings: Settings) {
    this.settings = settings

    if (!settings.notifications) {
      console.log('[NotificationScheduler] No notifications config')
      return
    }

    if (!this.notificationProvider.hasPermission()) {
      console.log('[NotificationScheduler] No permission granted')
      return
    }

    try {
      // Iniciar Web Worker
      this.worker = new Worker('/notificationWorker.js')
      this.worker.addEventListener('message', (event) => {
        if (event.data.type === 'CHECK_NOTIFICATIONS') {
          this.checkAndSendNotifications()
        }
      })

      // Chequear cada 15 minutos
      const intervalMs = 15 * 60 * 1000
      this.worker.postMessage({ type: 'START', payload: { intervalMs } })

      console.log('[NotificationScheduler] Started successfully')
    } catch (error) {
      console.error('[NotificationScheduler] Failed to start worker:', error)
    }
  }

  stop() {
    if (this.worker) {
      this.worker.postMessage({ type: 'STOP' })
      this.worker.terminate()
      this.worker = null
      console.log('[NotificationScheduler] Stopped')
    }
  }

  updateSettings(settings: Settings) {
    this.settings = settings
    
    // Reiniciar si las notificaciones cambiaron
    if (this.worker) {
      this.stop()
      this.start(settings)
    }
  }

  private async checkAndSendNotifications() {
    if (!this.settings?.notifications) return

    const { notifications } = this.settings

    try {
      // 1. Recordatorios de gastos
      if (notifications.expense_reminders.enabled) {
        await this.checkExpenseReminders(
          this.settings.userId,
          notifications.expense_reminders.time_slots
        )
      }

      // 2. Alertas de presupuesto
      if (notifications.budget_alert_70.enabled || notifications.budget_alert_90.enabled) {
        await this.checkBudgetAlerts()
      }

      // 3. Resúmenes (weekly/monthly) - TODO: implementar lógica de horarios exactos
    } catch (error) {
      console.error('[NotificationScheduler] Error checking notifications:', error)
    }
  }

  private async checkExpenseReminders(userId: string, timeSlots: TimeSlot[]) {
    const now = new Date()
    const currentHour = now.getHours()

    for (const slot of timeSlots) {
      const [start, end] = slot.split('-').map((t) => parseInt(t.split(':')[0]))
      
      if (currentHour >= start && currentHour < end) {
        const lastSent = this.getLastReminderSent(slot)
        const should = await shouldSendReminder(userId, slot, this.spendRepo, lastSent)

        if (should) {
          const msg = getReminderMessage()
          await this.notificationProvider.sendNotification(msg.title, msg.body, {
            tag: `reminder-${slot}`,
          })
          this.saveLastReminderSent(slot)
          console.log('[NotificationScheduler] Sent reminder for slot:', slot)
        }
      }
    }
  }

  private async checkBudgetAlerts() {
    if (!this.settings) return

    const alertsSent = this.getAlertsSentThisMonth()
    const result = await checkBudgetAlert(
      this.settings.userId,
      this.settings.monthlyLimitCents,
      this.spendRepo,
      alertsSent
    )

    if (result.shouldSend70 && this.settings.notifications?.budget_alert_70.enabled) {
      const msg = getBudget70Message()
      await this.notificationProvider.sendNotification(msg.title, msg.body, { tag: 'budget-70' })
      this.saveAlertSent('alert70')
      console.log('[NotificationScheduler] Sent 70% budget alert')
    }

    if (result.shouldSend90 && this.settings.notifications?.budget_alert_90.enabled) {
      const msg = getBudget90Message()
      await this.notificationProvider.sendNotification(msg.title, msg.body, { tag: 'budget-90' })
      this.saveAlertSent('alert90')
      console.log('[NotificationScheduler] Sent 90% budget alert')
    }
  }

  // LocalStorage helpers para tracking temporal
  // TODO: Migrar a Supabase notification_logs para sincronización entre dispositivos
  private getLastReminderSent(slot: string): Date | null {
    const stored = localStorage.getItem(`foxy_reminder_${slot}`)
    return stored ? new Date(stored) : null
  }

  private saveLastReminderSent(slot: string) {
    localStorage.setItem(`foxy_reminder_${slot}`, new Date().toISOString())
  }

  private getAlertsSentThisMonth(): { alert70: boolean; alert90: boolean } {
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`
    const stored = localStorage.getItem(`foxy_alerts_${monthKey}`)
    return stored ? JSON.parse(stored) : { alert70: false, alert90: false }
  }

  private saveAlertSent(type: 'alert70' | 'alert90') {
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`
    const current = this.getAlertsSentThisMonth()
    current[type] = true
    localStorage.setItem(`foxy_alerts_${monthKey}`, JSON.stringify(current))
  }
}

