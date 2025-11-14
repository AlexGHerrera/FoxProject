/**
 * Application: Check Expense Reminder
 * Determina si debe enviarse un recordatorio de gastos
 */

import type { ISpendRepository } from '@/adapters/db/ISpendRepository'
import type { TimeSlot } from '@/domain/models/NotificationSettings'

/**
 * Verifica si debe enviarse un recordatorio de gastos
 * 
 * @returns true si debe enviarse, false si no
 */
export async function shouldSendReminder(
  userId: string,
  timeSlot: TimeSlot,
  spendRepo: ISpendRepository,
  lastNotificationSent: Date | null
): Promise<boolean> {
  // Verificar si ya se envió notificación en este tramo HOY
  const now = new Date()
  if (lastNotificationSent) {
    const isSameDay = lastNotificationSent.toDateString() === now.toDateString()
    if (isSameDay) {
      console.log('[checkExpenseReminder] Already sent today for slot:', timeSlot)
      return false
    }
  }

  // Verificar si hay gastos registrados en este tramo HOY
  const [startHour] = timeSlot.split('-')[0].split(':').map(Number)
  const todayStart = new Date(now)
  todayStart.setHours(startHour, 0, 0, 0)

  try {
    const recentSpends = await spendRepo.list(userId, { limit: 100 })
    const spendsInSlot = recentSpends.filter((spend) => {
      const spendDate = new Date(spend.timestamp)
      return spendDate >= todayStart && spendDate.toDateString() === now.toDateString()
    })

    // No enviar si ya registró gastos en este tramo
    if (spendsInSlot.length > 0) {
      console.log('[checkExpenseReminder] User already has spends in slot:', timeSlot, spendsInSlot.length)
      return false
    }

    console.log('[checkExpenseReminder] Should send reminder for slot:', timeSlot)
    return true
  } catch (error) {
    console.error('[checkExpenseReminder] Error checking spends:', error)
    return false
  }
}

