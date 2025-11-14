<!-- 5e6b0e2b-d8e2-4293-b805-f83de8dc7601 0dc9b944-7db7-48b1-bb8b-46a83a7be7c7 -->
# Plan: Sistema de Notificaciones

## 1. Base de Datos - Schema Update

Actualizar `database/SCHEMA.sql` para agregar columnas de notificaciones en tabla `settings`:

```sql
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{
  "expense_reminders": {"enabled": true, "time_slots": ["07:00-12:00", "12:00-17:00", "17:00-21:00"]},
  "budget_alert_70": {"enabled": true},
  "budget_alert_90": {"enabled": true},
  "weekly_summary": {"enabled": false, "day": "sunday", "time": "20:00"},
  "monthly_summary": {"enabled": false, "day": 1, "time": "09:00"}
}'::jsonb;
```

Ejecutar en Supabase para usuario demo.

## 2. Domain - Models & Types

Crear `src/domain/models/NotificationSettings.ts`:

```typescript
export type NotificationSettings = {
  expense_reminders: {
    enabled: boolean
    time_slots: string[] // ["07:00-12:00", "12:00-17:00", "17:00-21:00"]
  }
  budget_alert_70: { enabled: boolean }
  budget_alert_90: { enabled: boolean }
  weekly_summary: {
    enabled: boolean
    day: 'sunday' | 'monday' // etc
    time: string // "20:00"
  }
  monthly_summary: {
    enabled: boolean
    day: number // 1-28
    time: string // "09:00"
  }
}
```

Actualizar `src/domain/models/Settings.ts` para incluir `notifications?: NotificationSettings`.

## 3. Adapter - Notifications Provider

Crear `src/adapters/notifications/INotificationProvider.ts`:

```typescript
export interface INotificationProvider {
  requestPermission(): Promise<'granted' | 'denied' | 'default'>
  sendNotification(title: string, body: string, tag?: string): Promise<void>
  hasPermission(): boolean
}
```

Crear `src/adapters/notifications/BrowserNotificationProvider.ts` implementando la interfaz usando Notification API.

## 4. Application - Notification Logic

Crear casos de uso:

- `src/application/checkExpenseReminder.ts`: Verifica si corresponde enviar recordatorio según tramo horario y gastos registrados
- `src/application/checkBudgetAlerts.ts`: Verifica si se alcanzó 70% o 90% del presupuesto
- `src/application/scheduleSummaries.ts`: Lógica para resúmenes semanales/mensuales
- `src/application/notificationMessages.ts`: Generador de mensajes originales y amigables (array de variaciones)

Ejemplo de mensajes para recordatorios:

```typescript
const REMINDER_MESSAGES = [
  { title: "¿Todo controlado por ahí? 🦊", body: "Si has tenido algún gasto, apúntalo para no olvidarlo" },
  { title: "Foxy por aquí 👋", body: "¿Has comprado algo hoy? Vamos a registrarlo juntos" },
  // ... más variaciones
]
```

## 5. Hook - useNotifications

Crear `src/hooks/useNotifications.ts`:

- Lee settings de notificaciones desde `useSettingsStore`
- Expone `updateNotificationSettings()`
- Expone `requestNotificationPermission()`
- Integra con `BrowserNotificationProvider`
- useEffect con intervalo para verificar tramos horarios (cada 15 min aprox)

## 6. Components - UI

### NotificationSection.tsx

Tarjeta clickable similar a BudgetSection/ThemeSection con icono Bell.

### NotificationModal.tsx

Modal con:

- Banner de permisos del navegador (si no están granted)
- Toggle principal "Activar notificaciones"
- 4 secciones expandibles (acordeón o lista):

  1. Recordatorios de registro (toggle on/off)
  2. Alerta 70% presupuesto (toggle)
  3. Alerta 90% presupuesto (toggle)
  4. Resúmenes (weekly/monthly con selección de día/hora)

- Botones Guardar/Cancelar

Diseño consistente con BudgetModal/ThemeModal (bg-card, rounded-xl, Lucide icons).

## 7. Integration - Settings Repository

Actualizar `src/adapters/db/SupabaseSettingsRepository.ts`:

- Agregar soporte para leer/escribir campo `notifications` (JSONB)
- Mapear a/desde `NotificationSettings` en domain

Actualizar `src/adapters/db/ISettingsRepository.ts` con tipo correcto.

## 8. Store Update

Actualizar `src/stores/useSettingsStore.ts` para incluir `notifications` en el tipo `Settings`.

## 9. Scheduler Service

Crear `src/services/notificationScheduler.ts`:

- Clase o función que se inicializa en `App.tsx`
- Verifica cada 15 minutos:
  - Tramos horarios para recordatorios de gastos
  - Progreso de presupuesto (70%, 90%)
  - Horarios de resúmenes programados
- Usa `checkExpenseReminder`, `checkBudgetAlerts`, etc.
- Solo ejecuta si notificaciones están habilitadas

## 10. Messages - Variaciones Originales

Crear al menos 5-7 variaciones de mensajes para cada tipo:

- Recordatorios de gastos (amigables, no presionantes)
- Alertas de presupuesto (informativas, no alarmistas)
- Resúmenes (celebratorios si va bien, motivadores si no)

Ejemplos:

- "¡Foxy al habla! 🦊 ¿Qué tal el día? Si has gastado algo, cuéntamelo"
- "Hey, ¿todo bien? 👋 Solo paso a recordarte que puedes registrar tus gastos"
- "¡Vas por el 70% del presupuesto! 📊 Nada mal, sigamos así"

## Criterios de Aceptación

- [ ] Schema actualizado en Supabase con columna `notifications`
- [ ] Tarjeta "Notificaciones" visible en SettingsPage
- [ ] Modal con 4 tipos de notificaciones configurables
- [ ] Permisos del navegador solicitados correctamente
- [ ] Recordatorios de gastos funcionan por tramos horarios (7-12, 12-17, 17-21)
- [ ] No se envían recordatorios si ya se registró gasto en ese tramo
- [ ] Alertas de presupuesto se disparan al alcanzar 70% y 90%
- [ ] Mensajes son amigables y variados (no robotizados)
- [ ] Configuración persiste en Supabase
- [ ] Notificaciones esenciales activadas por defecto (recordatorios, alertas presupuesto)
- [ ] Arquitectura hexagonal respetada (domain, application, adapters)

## Archivos a Crear

- `database/migrations/add_notifications_column.sql`
- `src/domain/models/NotificationSettings.ts`
- `src/adapters/notifications/INotificationProvider.ts`
- `src/adapters/notifications/BrowserNotificationProvider.ts`
- `src/application/checkExpenseReminder.ts`
- `src/application/checkBudgetAlerts.ts`
- `src/application/scheduleSummaries.ts`
- `src/application/notificationMessages.ts`
- `src/hooks/useNotifications.ts`
- `src/components/settings/NotificationSection.tsx`
- `src/components/settings/NotificationModal.tsx`
- `src/services/notificationScheduler.ts`

## Archivos a Modificar

- `database/SCHEMA.sql`
- `database/DEMO-USER.sql`
- `src/domain/models/Settings.ts`
- `src/domain/models/index.ts`
- `src/adapters/db/ISettingsRepository.ts`
- `src/adapters/db/SupabaseSettingsRepository.ts`
- `src/stores/useSettingsStore.ts`
- `src/components/settings/index.ts`
- `src/pages/SettingsPage.tsx`
- `src/App.tsx` (inicializar scheduler)

## Notas Técnicas

- Usar `Notification.requestPermission()` Web API
- Verificar `Notification.permission` antes de enviar
- Tag en notificaciones para evitar duplicados: `foxy-reminder-${timeSlot}`
- localStorage para tracking de última notificación enviada por tramo
- Mensajes random con `Math.floor(Math.random() * messages.length)`
- Considerar `document.visibilityState` para no notificar si app está abierta (opcional)

### To-dos

- [ ] Actualizar SCHEMA.sql con campos de notificaciones
- [ ] Actualizar Settings model con campos de notificaciones
- [ ] Actualizar SupabaseSettingsRepository para mapear campos
- [ ] Crear NotificationService para Web Notifications API
- [ ] Crear NotificationScheduler con lógica de alertas
- [ ] Crear useNotifications hook
- [ ] Crear NotificationsSection componente
- [ ] Crear NotificationsModal con todas las opciones
- [ ] Integrar NotificationsSection en SettingsPage
- [ ] Inicializar useNotifications en App.tsx
- [ ] Probar todas las alertas y recordatorios