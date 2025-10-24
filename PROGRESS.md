# 🦊 Foxy - Progress Tracker

> Estado actual del desarrollo del MVP

---

## ✅ Completado

### Fase 0: Setup Inicial
- [x] Proyecto creado con Vite + React 18 + TypeScript
- [x] Dependencias instaladas: Zustand, Supabase, Tailwind CSS, Zod, date-fns, Vitest
- [x] Tailwind configurado con design tokens de `DESIGN-TOKENS.json`
- [x] Path aliases configurados (`@/domain`, `@/application`, etc.)
- [x] Vitest + React Testing Library configurados
- [x] `.gitignore` y `.env.local` creados

### Fase 1: Supabase y Esquema
- [x] `SCHEMA.sql` mejorado con:
  - Índice compuesto `idx_spends_composite` para queries optimizadas
  - Tabla `api_usage` para monitoreo de costes IA
  - Campo `tz` en `settings` para timezone
  - Constraints flexibles en `paid_with`
- [x] Proyecto Supabase configurado
- [x] Tablas creadas y verificadas
- [x] RLS temporalmente deshabilitado para testing (ver `TEMP-DISABLE-RLS.sql`)
- [x] Usuario demo creado (UUID fijo, ver `DEMO-USER.sql`)

### Fase 2: Dominio y Casos de Uso
- [x] Modelos de dominio:
  - `Spend` con validación Zod
  - `Category` (union type)
  - `Settings` con validación Zod
- [x] Reglas de negocio:
  - `budgetCalculator.ts` con 12 tests unitarios pasando
- [x] Casos de uso:
  - `parseSpend.ts` (orquesta AI parsing)
  - `saveSpend.ts` (guarda gastos con validaciones)
  - `calculateBudget.ts` (calcula progreso de presupuesto)
  - `exportSpends.ts` (exporta a CSV formato ES)

### Fase 3: Adapters
- [x] **AI Providers**:
  - `IAIProvider` interface
  - `DeepSeekProvider` (integración con API)
  - `MockAIProvider` (regex básico para demo sin API key)
- [x] **Database**:
  - `ISpendRepository` interface
  - `SupabaseSpendRepository` (CRUD completo)
  - `ISettingsRepository` interface
  - `SupabaseSettingsRepository`
- [x] **Voice**:
  - `IVoiceRecognizer` interface
  - `WebSpeechRecognizer` (Web Speech API nativa del navegador)
- [x] **Storage**:
  - `IndexedDBCache` (preparado para offline-first)

### Fase 4: Estado y Hooks
- [x] **Zustand Stores**:
  - `useVoiceStore` (estado del reconocimiento de voz)
  - `useSpendStore` (gestión de gastos)
  - `useUIStore` (toasts, modales)
  - `useAuthStore` (placeholder para autenticación futura)
- [x] **Custom Hooks**:
  - `useSpeechRecognition` (orquesta WebSpeechRecognizer)
  - `useSpendSubmit` (orquesta parse + save)
  - `useBudgetProgress` (calcula progreso de presupuesto)
  - `useLoadSpends` (carga gastos desde Supabase)
  - `useTheme` (gestión de tema light/dark/system)

### Fase 5: Componentes UI Base
- [x] `Button` component:
  - Múltiples variantes (primary, secondary, ghost, danger)
  - Tamaños (sm, md, lg)
  - Estados (loading, disabled)
  - Icons support
- [x] `Modal` component:
  - Backdrop con animaciones
  - Focus trap
  - Close on ESC
  - Accesibilidad (ARIA)
- [x] `Toast` component:
  - 4 tipos (success, error, warning, info)
  - Colores con contraste WCAG AAA (emerald-600, red-600, amber-600, cyan-600)
  - Auto-dismiss configurable
  - Soporte para acciones (ej: "Deshacer")
  - Posiciones configurables
- [x] Theme system (light/dark/system auto-detection)

### Fase 6: Flujo de Voz (CORE) ✅
- [x] `MicButton` component:
  - Estados visuales (idle, listening, processing, success, error)
  - Animaciones de pulso
  - Accesibilidad
- [x] `TranscriptDisplay` component:
  - Muestra transcripción en tiempo real
  - Estados vacío/con contenido
- [x] `ConfirmModal` component:
  - Muestra gasto parseado para confirmación
  - Edición inline de campos
  - Auto-confirm cuando confidence >= 0.8
- [x] `VoiceRecorder` component:
  - Orquesta flujo completo de voz
  - Banner de "Modo Demo" cuando no hay API key
  - Estados visuales claros
  - Manejo de errores robusto
- [x] **Toast "Deshacer"** implementado:
  - Aparece tras guardar gasto
  - Botón "Deshacer" funcional
  - Auto-dismiss en 5s
- [x] **Flujo end-to-end funcionando**:
  - Usuario habla → Web Speech API transcribe
  - MockAIProvider parsea (o DeepSeek si hay API key)
  - Auto-confirm si confidence >= 0.8
  - Guardado en Supabase
  - Toast de éxito con opción "Deshacer"

### Testing
- [x] 12 tests unitarios de `budgetCalculator` pasando
- [x] Vitest configurado y funcionando

---

## 🚧 En Progreso

*Nada actualmente*

---

## 📋 Pendiente

### Fase 7: Dashboard
- [ ] Implementar `BudgetBar` con colores dinámicos (<70%, 70-89%, >90%)
- [ ] Implementar `RecentSpends` (últimos 4-5 gastos)
- [ ] Implementar página `Dashboard` integrando componentes
- [ ] Sincronizar con Foxy avatar según estado del budget

### Fase 8: Gestión de Gastos
- [ ] Implementar `SpendCard` y `SpendList`
- [ ] Implementar filtros (rango, categorías, método pago)
- [ ] Implementar búsqueda
- [ ] Implementar paginación/infinite scroll
- [ ] Persistir filtros en URL query params

### Fase 9: Onboarding
- [ ] Implementar wizard de 3 pasos:
  1. Permiso de micrófono
  2. Configurar límite mensual
  3. Prueba de voz
- [ ] Agregar ejemplos de frases
- [ ] Validaciones
- [ ] Guardar `settings` en Supabase al completar

### Fase 10: Settings y Exportación
- [ ] Implementar página Settings (límite mensual, plan)
- [ ] Implementar exportación CSV:
  - Rango obligatorio
  - Formato ES (separador `;`, UTF-8)
- [ ] Implementar cambio de tema manual (override auto)

### Fase 11: PWA
- [ ] Crear `manifest.json` con iconos y metadata
- [ ] Implementar Service Worker básico (cache shell)
- [ ] Implementar offline detection
- [ ] Implementar queue de sync para POST fallidos
- [ ] Tests de instalación PWA

### Fase 12: Métricas y Observabilidad
- [ ] Implementar tracking de eventos:
  - `voice_start`, `voice_end`, `spend_saved`
  - `latency_ms_voice_to_save`
- [ ] Agregar logs estructurados
- [ ] Monitorear uso de IA (tokens, latencia, costes)
- [ ] Dashboard básico de métricas

### Fase 13: Polish y Optimización
- [ ] Lazy loading de rutas
- [ ] Code splitting
- [ ] Optimizar bundle (<120 KB gzipped)
- [ ] Verificar LCP < 2s en móvil
- [ ] Auditoría de accesibilidad completa
- [ ] Corregir linter warnings

### Seguridad y Autenticación
- [ ] Implementar autenticación real con Supabase Auth
- [ ] Re-habilitar RLS en todas las tablas
- [ ] Eliminar UUID fijo de demo
- [ ] Configurar políticas RLS correctamente

---

## 🎯 Hitos Alcanzados

### Hito 1: Setup y Arquitectura ✅ (Oct 2024)
- Proyecto configurado con arquitectura hexagonal
- Todas las capas implementadas correctamente
- Testing configurado

### Hito 2: Flujo de Voz Completo ✅ (Oct 2024)
- **Funcionalidad core del MVP completada**
- Usuario puede registrar gastos por voz
- Integración con Supabase funcionando
- UI accesible y con buen contraste

---

## 📊 Métricas Actuales

- **Tests**: 12/12 pasando (100%)
- **Cobertura**: ~80% en dominio y casos de uso
- **Bundle size**: ~250 KB (sin optimizar aún)
- **Componentes creados**: 15+
- **Flujo de voz**: ✅ Funcional end-to-end

---

## 🔧 Problemas Conocidos

1. **RLS deshabilitado temporalmente** en tabla `spends` para permitir testing sin auth.
   - **Solución**: Implementar autenticación real y re-habilitar RLS.

2. **UUID fijo** para usuario demo (`00000000-0000-0000-0000-000000000001`)
   - **Solución**: Reemplazar con Supabase Auth.

3. **MockAIProvider** usa regex básico
   - **Limitación**: Solo detecta patrones simples (ej: "5 euros de café")
   - **Solución**: Agregar API key de DeepSeek para parsing real.

---

## 📝 Notas Técnicas

### Arquitectura Hexagonal
El flujo actual respeta estrictamente la arquitectura hexagonal:
```
UI (VoiceRecorder) 
  → Hook (useSpeechRecognition, useSpendSubmit)
    → Use Case (parseSpend, saveSpend)
      → Adapter (MockAIProvider, SupabaseRepository)
        → External (Supabase DB)
```

### Cambios Fáciles Gracias a Hexagonal
- Cambiar DeepSeek por GPT: Solo modificar `DeepSeekProvider`
- Cambiar Supabase por Firebase: Solo modificar `SupabaseRepository`
- Agregar Whisper: Crear `WhisperRecognizer` e inyectar

### Design Tokens
Todos los colores, espaciados, y tipografía vienen de `DESIGN-TOKENS.json`, garantizando consistencia.

---

**Última actualización**: Octubre 2024  
**Próximo hito**: Dashboard y gestión de gastos
