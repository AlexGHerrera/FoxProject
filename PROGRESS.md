# 📊 Progreso del Desarrollo - Foxy MVP

> Documento de seguimiento del proyecto. Última actualización: Octubre 2025

---

## ✅ Completado (Fase 0-3)

### Fase 0: Setup del Proyecto ✅

- [x] Proyecto Vite + React + TypeScript inicializado
- [x] Dependencias instaladas (Zustand, Supabase, date-fns, zod, etc.)
- [x] Tailwind CSS configurado con design tokens
- [x] Path aliases configurados (`@/domain`, `@/application`, etc.)
- [x] Vitest + React Testing Library configurados
- [x] Scripts npm setup (dev, build, test, type-check)
- [x] `.gitignore` y `.env.example` creados

### Fase 1: Mejoras a Archivos Base ✅

- [x] `SCHEMA.sql` mejorado con:
  - Índice compuesto `(user_id, ts desc, category)`
  - Tabla `api_usage` para monitoreo de IA
  - Campo `tz` en `settings` para zona horaria
  - Constraint flexible en `paid_with` (permite NULL)
  - Policies RLS para `api_usage`

- [x] `PROMPTS.json` refinado con:
  - Casos edge añadidos ("10 con 50 céntimos", "una coca cola", etc.)
  - Prompt de fallback para confidence < 0.5
  - Reglas de normalización de merchant
  
- [x] `AGENTS.md` creado con:
  - Guía completa de arquitectura hexagonal
  - Convenciones de código (naming, estructura)
  - Testing strategy
  - Reglas específicas para agentes IA
  - Checklist pre-PR

### Fase 2: Capa de Dominio ✅

#### Modelos

- [x] `Spend.ts`: modelo de gasto con helpers (eurToCents, centsToEur, validación)
- [x] `Settings.ts`: configuración de usuario
- [x] `Category.ts`: categorías con normalización, validación y emojis

#### Reglas de Negocio

- [x] `budgetCalculator.ts`: cálculo de presupuesto, proyecciones, daily average
- [x] Tests unitarios (100% cobertura de reglas críticas)

### Fase 3: Application Layer (Casos de Uso) ✅

- [x] `parseSpend.ts`: parseo de texto → gasto estructurado con IA
  - Validación de longitud mínima
  - Fallback a regex si IA falla
  - Manejo de confidence threshold

- [x] `saveSpend.ts`: guardar, actualizar, eliminar gastos
  - Validaciones
  - Integración con repositorio

- [x] `calculateBudget.ts`: cálculo de presupuesto mensual
  - Mes actual y meses específicos
  - Integración con settings y spends

- [x] `exportSpends.ts`: exportación a CSV
  - Formato español (separador `;`, decimales con coma)
  - UTF-8
  - Generación de nombre de archivo

### Fase 4: Adapters ✅

#### IA

- [x] `IAIProvider.ts`: interfaz para proveedores de IA
- [x] `DeepSeekProvider.ts`: implementación con DeepSeek
  - Llamadas a API con timeout
  - Parsing de respuesta JSON
  - Manejo de errores
  - Generación de feedback básico

#### Base de Datos

- [x] `ISpendRepository.ts`: interfaz para persistencia de gastos
- [x] `ISettingsRepository.ts`: interfaz para configuración
- [x] `SupabaseSpendRepository.ts`: implementación con Supabase
  - CRUD completo
  - Filtros (fechas, categorías, métodos de pago, búsqueda)
  - Paginación
  - Cálculo de totales

- [x] `SupabaseSettingsRepository.ts`: implementación con Supabase
  - Get, upsert, delete
  - Manejo de timestamps

#### Voz

- [x] `IVoiceRecognizer.ts`: interfaz para reconocimiento de voz
- [x] `WebSpeechRecognizer.ts`: implementación con Web Speech API
  - Verificación de disponibilidad
  - Configuración (lang, continuous, interim results)
  - Event handlers (result, error, end)
  - TypeScript declarations para API

#### Storage

- [x] `IndexedDBCache.ts`: cache local para offline
  - Set/get con TTL
  - Clear y delete
  - Manejo de expiración automática

### Configuración

- [x] `constants.ts`: constantes del sistema
- [x] `env.ts`: validación de env vars
- [x] `supabase.ts`: cliente y tipos

---

## 🚧 Pendiente (Fase 5-13)

### Fase 5: Supabase Setup 🔴

**Requiere acción manual del usuario**

- [ ] Crear proyecto en Supabase
- [ ] Ejecutar `SCHEMA.sql` en SQL Editor
- [ ] Crear edge function `parse-spend`
- [ ] Configurar secret `DEEPSEEK_API_KEY`
- [ ] Obtener credenciales y actualizar `.env.local`

### Fase 6: Estado y Hooks 🟡

- [ ] Stores Zustand:
  - `useVoiceStore` (recording, transcript, etc.)
  - `useSpendStore` (spends list, total, filters)
  - `useUIStore` (modals, toasts, theme)
  - `useAuthStore` (user, session)

- [ ] Hooks custom:
  - `useSpeechRecognition` (orquesta WebSpeechRecognizer)
  - `useSpendSubmit` (orquesta parse + save)
  - `useBudgetProgress` (calcula y cachea presupuesto)

### Fase 7: Componentes UI Base 🟡

- [ ] `Button` (primary, secondary, ghost, danger)
- [ ] `Modal` (overlay, close, confirm/cancel)
- [ ] `Toast` (success, error, info, con timer)
- [ ] Sistema de temas (auto light/dark)
- [ ] `FoxyAvatar` (CSS animations: idle, listening, processing, happy, alert)

### Fase 8: Flujo de Voz (CORE) 🟡

- [ ] `MicButton` (PTT y toggle modes)
- [ ] `VoiceRecorder` (estados visuales, ondas, temporizador)
- [ ] `TranscriptDisplay` (texto en vivo)
- [ ] `ConfirmModal` (auto-confirm si confidence >= 0.8)
- [ ] Toast "Deshacer (5s)" con temporizador
- [ ] Tests E2E del flujo completo

### Fase 9: Dashboard 🟡

- [ ] `BudgetBar` (colores dinámicos: <70% verde, 70-89% ámbar, ≥90% rojo)
- [ ] `RecentSpends` (últimos 4-5 gastos)
- [ ] Página `Dashboard` integrando componentes
- [ ] Sincronización con Foxy avatar

### Fase 10: Gestión de Gastos 🟡

- [ ] `SpendCard` y `SpendList`
- [ ] Panel de filtros (rango, categorías, método pago)
- [ ] Búsqueda
- [ ] Paginación/infinite scroll
- [ ] Persistencia de filtros en URL

### Fase 11: Onboarding 🟡

- [ ] Wizard de 3 pasos:
  1. Permiso de micrófono
  2. Configurar límite mensual
  3. Prueba de voz (registro de ejemplo)
- [ ] Validaciones
- [ ] Guardar settings al completar

### Fase 12: Settings y Exportación 🟡

- [ ] Página Settings (límite, plan, tema)
- [ ] Exportación CSV (rango obligatorio)
- [ ] Vista previa de uso de IA
- [ ] Cambio de tema manual

### Fase 13: PWA 🟡

- [ ] `manifest.json` con iconos
- [ ] Service Worker (cache shell)
- [ ] Detección de offline
- [ ] Queue de sync para POST fallidos
- [ ] Instrucciones de instalación

### Fase 14: Métricas 🟡

- [ ] Tracking de eventos (voice_start, spend_saved, etc.)
- [ ] Logs estructurados
- [ ] Monitoreo de latencia voz→guardado
- [ ] Dashboard de uso de IA (tokens, costes)

### Fase 15: Polish y Optimización 🟡

- [ ] Lazy loading de rutas
- [ ] Code splitting
- [ ] Optimizar bundle (<120 KB gz)
- [ ] Verificar LCP < 2s
- [ ] Auditoría de accesibilidad
- [ ] Corregir linter errors

---

## 📈 Métricas de Progreso

- **Total de tareas**: ~75
- **Completadas**: ~35 (47%)
- **Pendientes**: ~40 (53%)
- **Bloqueadas**: 1 (Supabase setup - requiere acción manual)

### Por Categoría

| Categoría | Completado | Total | % |
|-----------|------------|-------|---|
| Setup | 6/6 | 100% |
| Documentación | 4/4 | 100% |
| Dominio | 5/5 | 100% |
| Application | 4/4 | 100% |
| Adapters | 7/7 | 100% |
| Stores/Hooks | 0/7 | 0% |
| UI Components | 0/12 | 0% |
| Features | 0/25 | 0% |
| PWA | 0/5 | 0% |

---

## 🎯 Próximos Pasos Inmediatos

1. **Usuario debe crear proyecto Supabase**
   - Ir a supabase.com
   - Crear proyecto
   - Ejecutar SCHEMA.sql
   - Obtener credenciales
   - Actualizar `.env.local`

2. **Implementar Stores Zustand**
   - Crear stores básicos
   - Definir acciones y selectores
   - Tests de stores

3. **Crear Componentes UI Base**
   - Button, Modal, Toast
   - Sistema de temas
   - Foxy avatar placeholder

4. **Implementar Flujo de Voz**
   - MicButton + VoiceRecorder
   - Integrar con hooks
   - ConfirmModal con auto-confirm
   - Toast Deshacer

5. **Dashboard Básico**
   - BudgetBar
   - RecentSpends
   - Layout principal

---

## 🚀 Cómo Continuar

### Para Desarrolladores

```bash
# Ubicación del proyecto
cd "/Users/alexg.herrera/Desktop/HackABoss/App finanzas/foxy-app"

# Ver estructura
tree -L 2 src/

# Ejecutar tests
npm run test

# Verificar tipos
npm run type-check

# Desarrollo
npm run dev
```

### Para Agentes IA

1. Leer `AGENTS.md` para entender arquitectura y convenciones
2. Revisar este `PROGRESS.md` para ver qué falta
3. Implementar siguiente fase según el orden
4. Seguir principios hexagonales estrictamente
5. Crear tests para cada nueva funcionalidad
6. Actualizar este documento con progreso

---

## 📝 Notas Importantes

- **Arquitectura hexagonal es obligatoria**: no mezclar capas
- **TypeScript strict mode**: sin `any`, tipos explícitos
- **Tests críticos**: dominio y casos de uso al 100%
- **Performance**: bundle <120 KB, LCP <2s
- **Accesibilidad**: WCAG AA mínimo
- **Costes**: monitorear uso de DeepSeek en `api_usage`

---

## 🔗 Referencias

- `README.md`: guía de usuario y setup
- `AGENTS.md`: guía para desarrolladores/agentes
- `SPEC.md`: especificación funcional del MVP
- `ROADMAP.md`: plan completo de fases
- `DESIGN-TOKENS.json`: tokens de diseño
- `PROMPTS.json`: prompts de IA
- `SCHEMA.sql`: esquema de base de datos

---

**Última actualización**: Octubre 2025  
**Estado general**: Setup completo, listo para implementar UI y features

