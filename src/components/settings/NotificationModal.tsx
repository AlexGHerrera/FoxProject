/**
 * NotificationModal Component
 * Modal para configurar notificaciones push
 * Incluye permisos del navegador, toggles y opciones
 */

import { useState, useEffect } from 'react'
import { AlertCircle, Bell, BellOff, Target, Calendar } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'
import { Modal, Button } from '@/components/ui'
import { DEFAULT_NOTIFICATION_SETTINGS } from '@/domain/models/NotificationSettings'
import type { NotificationSettings, TimeSlot } from '@/domain/models/NotificationSettings'

interface NotificationModalProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const {
    notificationSettings,
    permissionState,
    hasPermission,
    requestPermission,
    updateNotificationSettings,
  } = useNotifications()

  const [localSettings, setLocalSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  )
  const [isSaving, setIsSaving] = useState(false)
  const [isRequestingPermission, setIsRequestingPermission] = useState(false)

  // Cargar configuración actual cuando se abre el modal
  useEffect(() => {
    if (isOpen && notificationSettings) {
      setLocalSettings(notificationSettings)
    } else if (isOpen) {
      setLocalSettings(DEFAULT_NOTIFICATION_SETTINGS)
    }
  }, [isOpen, notificationSettings])

  const handleRequestPermission = async () => {
    setIsRequestingPermission(true)
    try {
      await requestPermission()
    } finally {
      setIsRequestingPermission(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await updateNotificationSettings(localSettings)
      onClose()
    } catch (error) {
      console.error('[NotificationModal] Error saving:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTimeSlot = (slot: TimeSlot) => {
    const currentSlots = localSettings.expense_reminders.time_slots
    const newSlots = currentSlots.includes(slot)
      ? currentSlots.filter((s) => s !== slot)
      : [...currentSlots, slot]

    setLocalSettings({
      ...localSettings,
      expense_reminders: {
        ...localSettings.expense_reminders,
        time_slots: newSlots as TimeSlot[],
      },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notificaciones">
      <div className="space-y-6">
        {/* Banner de permisos si no están granted */}
        {!hasPermission && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 text-sm mb-1">
                  Permisos necesarios
                </h4>
                <p className="text-xs text-yellow-800 dark:text-yellow-300 mb-3">
                  Para recibir notificaciones, necesitas otorgar permisos desde tu navegador
                </p>
                <Button
                  size="sm"
                  onClick={handleRequestPermission}
                  loading={isRequestingPermission}
                  disabled={isRequestingPermission || permissionState === 'denied'}
                >
                  {permissionState === 'denied' ? 'Permisos denegados' : 'Activar permisos'}
                </Button>
                {permissionState === 'denied' && (
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                    Debes activar los permisos manualmente desde la configuración de tu navegador
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sección 1: Recordatorios de gastos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-text" />
              <div>
                <h4 className="font-semibold text-text text-sm">Recordatorios de gastos</h4>
                <p className="text-xs text-muted">Te avisamos si no has registrado gastos</p>
              </div>
            </div>
            <button
              onClick={() =>
                setLocalSettings({
                  ...localSettings,
                  expense_reminders: {
                    ...localSettings.expense_reminders,
                    enabled: !localSettings.expense_reminders.enabled,
                  },
                })
              }
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${localSettings.expense_reminders.enabled ? 'bg-brand-cyan' : 'bg-gray-300 dark:bg-gray-600'}
              `}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${localSettings.expense_reminders.enabled ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>

          {/* Tramos horarios */}
          {localSettings.expense_reminders.enabled && (
            <div className="pl-8 space-y-2">
              <p className="text-xs text-muted mb-2">Tramos horarios:</p>
              <div className="space-y-2">
                {(['07:00-12:00', '12:00-17:00', '17:00-21:00'] as TimeSlot[]).map((slot) => (
                  <label
                    key={slot}
                    className="flex items-center gap-2 cursor-pointer text-sm text-text"
                  >
                    <input
                      type="checkbox"
                      checked={localSettings.expense_reminders.time_slots.includes(slot)}
                      onChange={() => toggleTimeSlot(slot)}
                      className="w-4 h-4 rounded border-border text-brand-cyan focus:ring-brand-cyan"
                    />
                    <span>{slot.replace('-', ' - ')}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Sección 2: Alerta 70% presupuesto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-text" />
            <div>
              <h4 className="font-semibold text-text text-sm">Alerta 70% presupuesto</h4>
              <p className="text-xs text-muted">Te avisamos cuando alcances el 70%</p>
            </div>
          </div>
          <button
            onClick={() =>
              setLocalSettings({
                ...localSettings,
                budget_alert_70: { enabled: !localSettings.budget_alert_70.enabled },
              })
            }
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${localSettings.budget_alert_70.enabled ? 'bg-brand-cyan' : 'bg-gray-300 dark:bg-gray-600'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${localSettings.budget_alert_70.enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Sección 3: Alerta 90% presupuesto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-text" />
            <div>
              <h4 className="font-semibold text-text text-sm">Alerta 90% presupuesto</h4>
              <p className="text-xs text-muted">Te avisamos cuando alcances el 90%</p>
            </div>
          </div>
          <button
            onClick={() =>
              setLocalSettings({
                ...localSettings,
                budget_alert_90: { enabled: !localSettings.budget_alert_90.enabled },
              })
            }
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${localSettings.budget_alert_90.enabled ? 'bg-brand-cyan' : 'bg-gray-300 dark:bg-gray-600'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${localSettings.budget_alert_90.enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Sección 4: Resúmenes (próximamente) */}
        <div className="opacity-50">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-text" />
            <div>
              <h4 className="font-semibold text-text text-sm">Resúmenes semanales/mensuales</h4>
              <p className="text-xs text-muted">Próximamente disponible</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border">
          <Button variant="secondary" onClick={onClose} disabled={isSaving} className="flex-1">
            Cancelar
          </Button>
          <Button onClick={handleSave} loading={isSaving} disabled={isSaving} className="flex-1">
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

