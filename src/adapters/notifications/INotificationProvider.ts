/**
 * Interface: INotificationProvider
 * Contrato para proveedores de notificaciones push
 */

export interface INotificationProvider {
  /**
   * Solicita permisos para enviar notificaciones
   */
  requestPermission(): Promise<'granted' | 'denied' | 'default'>

  /**
   * Envía una notificación push
   */
  sendNotification(
    title: string,
    body: string,
    options?: { tag?: string; icon?: string }
  ): Promise<void>

  /**
   * Verifica si tiene permisos concedidos
   */
  hasPermission(): boolean

  /**
   * Obtiene el estado actual de los permisos
   */
  getPermissionState(): NotificationPermission
}

