/**
 * Modelo de dominio: NotificationSettings
 * Configuración de notificaciones del usuario
 */

export type TimeSlot = '07:00-12:00' | '12:00-17:00' | '17:00-21:00'
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface NotificationSettings {
  expense_reminders: {
    enabled: boolean
    time_slots: TimeSlot[]
  }
  budget_alert_70: { enabled: boolean }
  budget_alert_90: { enabled: boolean }
  weekly_summary: {
    enabled: boolean
    day: WeekDay
    time: string // "20:00"
  }
  monthly_summary: {
    enabled: boolean
    day: number // 1-28
    time: string // "09:00"
  }
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  expense_reminders: { enabled: true, time_slots: ['07:00-12:00', '12:00-17:00', '17:00-21:00'] },
  budget_alert_70: { enabled: true },
  budget_alert_90: { enabled: true },
  weekly_summary: { enabled: false, day: 'sunday', time: '20:00' },
  monthly_summary: { enabled: false, day: 1, time: '09:00' },
}

