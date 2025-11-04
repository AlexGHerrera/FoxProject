# Sistema de Notificaciones - Foxy

> Documentación del sistema de notificaciones push implementado

---

## 📋 Resumen

Sistema completo de notificaciones push con:
- ✅ Recordatorios de gastos por tramos horarios
- ✅ Alertas de presupuesto (70% y 90%)
- ✅ Arquitectura hexagonal respetada
- ✅ Web Worker para ejecución en background
- ✅ Mensajes variados y amigables
- 🔄 Resúmenes semanales/mensuales (base implementada, horarios TODO)

---

## 🏗️ Arquitectura

### Capas Implementadas

```
domain/
  └── models/NotificationSettings.ts   # Tipos y configuración por defecto

adapters/
  ├── notifications/
  │   ├── INotificationProvider.ts      # Interface del contrato
  │   └── BrowserNotificationProvider.ts # Implementación Web API
  └── db/SupabaseSettingsRepository.ts  # Actualizado con notifications

application/
  ├── notificationMessages.ts           # Generador de mensajes variados
  ├── checkExpenseReminder.ts           # Lógica de recordatorios
  ├── checkBudgetAlerts.ts              # Lógica de alertas presupuesto
  └── generateSummary.ts                # Generador de resúmenes

services/
  └── notificationScheduler.ts          # Orquestador con Web Worker

hooks/
  └── useNotifications.ts               # Hook de React

components/settings/
  ├── NotificationSection.tsx           # Tarjeta en Settings
  └── NotificationModal.tsx             # Modal de configuración
```

### Base de Datos

**Tabla `notification_logs`**: Tracking de notificaciones enviadas
- `id`: UUID
- `user_id`: UUID
- `notification_type`: enum('reminder','budget_70','budget_90','weekly_summary','monthly_summary')
- `time_slot`: text (nullable)
- `sent_at`: timestamptz
- `metadata`: jsonb

**Columna `settings.notifications`**: JSONB con configuración del usuario
```json
{
  "expense_reminders": {
    "enabled": true,
    "time_slots": ["07:00-12:00", "12:00-17:00", "17:00-21:00"]
  },
  "budget_alert_70": {"enabled": true},
  "budget_alert_90": {"enabled": true},
  "weekly_summary": {
    "enabled": false,
    "day": "sunday",
    "time": "20:00"
  },
  "monthly_summary": {
    "enabled": false,
    "day": 1,
    "time": "09:00"
  }
}
```

---

## 🎯 Funcionalidades

### 1. Recordatorios de Gastos

**Lógica**:
- Checks cada 15 minutos
- Verifica si está en algún tramo horario activo (07:00-12:00, 12:00-17:00, 17:00-21:00)
- NO envía si ya se envió hoy en ese tramo
- NO envía si el usuario ya registró gastos en ese tramo hoy
- Mensajes aleatorios de 5 variantes

**Ejemplos de mensajes**:
- "¿Todo controlado por ahí? 🦊"
- "Foxy por aquí 👋"
- "¡Foxy al habla! 🦊"

### 2. Alertas de Presupuesto

**Lógica**:
- Calcula % gastado del mes actual
- Alerta 70%: Se envía una sola vez al alcanzar el umbral
- Alerta 90%: Se envía una sola vez al alcanzar el umbral
- Tracking mensual en localStorage (key: `foxy_alerts_YYYY-M`)
- Mensajes aleatorios de 3 variantes por nivel

**Ejemplos de mensajes**:
- 70%: "¡Vas por el 70% del presupuesto! 📊"
- 90%: "⚠️ 90% del presupuesto alcanzado"

### 3. Resúmenes (Base Implementada)

**Funciones**:
- `generateWeeklySummary()`: Total gastado + top 3 categorías (últimos 7 días)
- `generateMonthlySummary()`: Total gastado + top 3 categorías (mes actual)

**TODO**: Implementar lógica de horarios específicos según configuración

---

## 🔧 Uso

### En la UI

1. Ir a **Settings → Notificaciones**
2. Solicitar permisos del navegador (si no están activos)
3. Configurar:
   - Recordatorios de gastos (toggle + tramos horarios)
   - Alerta 70% presupuesto
   - Alerta 90% presupuesto
   - Resúmenes (próximamente)
4. Guardar

### Programáticamente

```typescript
// Usar el hook
const { 
  notificationSettings, 
  hasPermission, 
  requestPermission, 
  updateNotificationSettings 
} = useNotifications()

// Solicitar permisos
await requestPermission()

// Actualizar configuración
await updateNotificationSettings({
  expense_reminders: { enabled: true, time_slots: ['07:00-12:00'] },
  budget_alert_70: { enabled: true },
  budget_alert_90: { enabled: true },
  weekly_summary: { enabled: false, day: 'sunday', time: '20:00' },
  monthly_summary: { enabled: false, day: 1, time: '09:00' },
})
```

---

## 🧪 Testing Manual

### Checklist de Pruebas

#### Permisos
- [ ] Solicitar permisos desde modal → debe mostrar prompt del navegador
- [ ] Denegar permisos → banner debe mostrar estado "denegado"
- [ ] Otorgar permisos → banner debe desaparecer, toggle activo

#### Recordatorios
- [ ] Activar recordatorios para tramo actual → debería enviar notificación (si no hay gastos registrados)
- [ ] Registrar gasto en tramo activo → NO debería enviar más notificaciones en ese tramo hoy
- [ ] Desactivar tramo horario → NO debería enviar notificaciones en ese tramo

#### Alertas de Presupuesto
- [ ] Configurar presupuesto bajo (ej: 10€)
- [ ] Agregar gastos hasta superar 70% → debería enviar alerta 70%
- [ ] Agregar más gastos hasta superar 90% → debería enviar alerta 90%
- [ ] Reiniciar mes → tracking de alertas debe resetearse

#### UI
- [ ] Abrir modal de notificaciones → debe cargar configuración actual
- [ ] Cambiar toggles → debe actualizar estado local
- [ ] Guardar → debe persistir en Supabase
- [ ] Recargar página → configuración debe persistir

#### Web Worker
- [ ] Abrir DevTools → Network → ver actividad del worker cada 15 min
- [ ] Scheduler debe iniciar cuando settings están disponibles
- [ ] Scheduler debe reiniciar cuando settings cambian
- [ ] Scheduler debe detenerse al desmontar App

---

## 📊 Tracking de Notificaciones

### LocalStorage (Actual)

**Recordatorios**:
```
foxy_reminder_07:00-12:00 = "2025-11-04T10:30:00.000Z"
foxy_reminder_12:00-17:00 = "2025-11-04T14:15:00.000Z"
foxy_reminder_17:00-21:00 = "2025-11-04T19:45:00.000Z"
```

**Alertas**:
```
foxy_alerts_2025-10 = {"alert70": true, "alert90": false}
```

### Supabase (Futuro - TODO)

La tabla `notification_logs` está preparada para migrar el tracking a Supabase:
- Sincronización entre dispositivos
- Historial completo
- Análisis de engagement

---

## 🚀 Próximos Pasos

### P1: Resúmenes Programados
- [ ] Implementar lógica de día/hora específicos
- [ ] Verificar día de la semana para weekly_summary
- [ ] Verificar día del mes para monthly_summary
- [ ] Activar opciones en NotificationModal

### P2: Migrar Tracking a Supabase
- [ ] Crear helpers para escribir en `notification_logs`
- [ ] Reemplazar localStorage por queries a Supabase
- [ ] Implementar sincronización cross-device

### P3: Mejoras UX
- [ ] Test notification button (enviar notificación de prueba)
- [ ] Preview de mensajes en modal
- [ ] Estadísticas de notificaciones enviadas
- [ ] Snooze de recordatorios

### P4: Optimizaciones
- [ ] Service Worker para mejor persistencia
- [ ] Background Sync API para notificaciones offline
- [ ] Push API para notificaciones desde servidor

---

## 🐛 Troubleshooting

### No se envían notificaciones

1. **Verificar permisos**: `Notification.permission` debe ser `"granted"`
2. **Verificar configuración**: settings.notifications debe existir
3. **Verificar scheduler**: Buscar logs `[NotificationScheduler]` en consola
4. **Verificar worker**: Buscar logs `[NotificationWorker]` en consola
5. **Verificar visibilidad**: Notificaciones solo se envían si `document.visibilityState === 'hidden'`

### Scheduler no inicia

- Settings pueden tardar en cargar → esperar a que `useSettingsStore` tenga datos
- Worker puede fallar si `/notificationWorker.js` no existe en public/
- Verificar que no haya errores de permisos en consola

### Tracking no funciona

- LocalStorage keys: `foxy_reminder_*` y `foxy_alerts_*`
- Limpiar localStorage para resetear tracking
- Mes se calcula con índice 0-based (Enero = 0)

---

## 📝 Notas de Implementación

### Decisiones de Diseño

1. **LocalStorage vs Supabase**: Se usa localStorage temporalmente para tracking por simplicidad. Migrar a Supabase permitirá sincronización cross-device.

2. **Web Worker**: Permite checks en background incluso si el tab no está activo (limitaciones del navegador aplican).

3. **document.visibilityState**: Se evita enviar notificaciones si la app está visible para no ser intrusivo.

4. **Mensajes variados**: Array de variantes aleatorias para evitar fatiga de notificaciones.

5. **Arquitectura Hexagonal**: Fácil reemplazar `BrowserNotificationProvider` por `PushNotificationProvider` (server-side) en futuro.

### Limitaciones Conocidas

- **Web Worker**: Algunos navegadores limitan la ejecución en tabs inactivos
- **Notification API**: No funciona en iOS Safari (requiere Service Worker + Push API)
- **LocalStorage**: No sincroniza entre dispositivos
- **Tramos horarios**: Fijos (no personalizables por el usuario)

---

**Última actualización**: Nov 2025  
**Estado**: ✅ Implementación completa (MVP)  
**Próximo milestone**: Resúmenes programados + migración a Supabase


