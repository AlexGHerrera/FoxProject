# 🦊 Foxy - Próximos Pasos

> Guía paso a paso para continuar el desarrollo tras completar el flujo de voz

---

## 🎉 Estado Actual

**✅ COMPLETADO: Dashboard, flujo de voz, gestión de gastos y modo continuous (Fases 7-8 + voz completa)**

**Fase 7 - Dashboard:**
- ✅ Dashboard con BudgetBar y RecentSpends
- ✅ Foxy Avatar clickeable (voice-first)
- ✅ Entrada manual como alternativa
- ✅ VoiceInputPage completa con confirmación
- ✅ Reconocimiento de voz con Web Speech API
- ✅ Parsing con MockAIProvider (o DeepSeek si hay API key)
- ✅ Guardado en Supabase
- ✅ UI accesible y mobile-friendly
- ✅ React Router configurado
- ✅ **Modo Continuous Recording** (Nov 2025):
  - ✅ Toggle UI con 3 modos (Toggle/PTT/Continuous)
  - ✅ Detección automática de pausas (2s silencio)
  - ✅ Segmentación automática de gastos
  - ✅ Continuación de grabación después de guardar

**Fase 8 - Gestión de Gastos:**
- ✅ SpendListPage con lista completa
- ✅ Filtros: fechas, categorías, método de pago, ordenamiento
- ✅ Búsqueda en tiempo real (debounced)
- ✅ Editar y eliminar gastos
- ✅ Navegación bottom entre páginas
- ✅ Stats dinámicas (filtrados/totales)
- ✅ **Fix UI: Nombre de establecimiento centrado** (Nov 2025)

**⚠️ PROBLEMA CONOCIDO: Safari micrófono**
- El indicador de micrófono en Safari puede quedar visible (bug del navegador)
- NO afecta privacidad ni funcionalidad
- Documentado en `SAFARI-MIC-ISSUE.md`
- Banner informativo implementado

---

## 🚀 Próximos Pasos Recomendados

### ~~Opción A: Dashboard (Fase 7)~~ - **✅ COMPLETADO**

El dashboard ya está implementado con todas sus funcionalidades:
- BudgetBar con colores dinámicos
- RecentSpends con últimos gastos
- Foxy Avatar clickeable (voice-first)
- Entrada manual como alternativa
- React Router configurado

---

### ~~Opción A: Gestión de Gastos (Fase 8)~~ - **✅ COMPLETADO**

Lista completa de gastos con filtros y búsqueda ya implementada:
- ✅ SpendCard con acciones editar/eliminar
- ✅ SpendList con estados loading/empty
- ✅ FilterModal completo (fechas, categorías, método pago, ordenamiento)
- ✅ SearchBar con debounce (300ms)
- ✅ useSpendFilters hook para lógica de filtrado
- ✅ Integración completa en SpendListPage
- ✅ Casos de uso updateSpend y deleteSpend
- ✅ Navegación bottom entre páginas

---

### Opción A: Onboarding (Fase 9) - **SIGUIENTE RECOMENDADO**

Wizard de bienvenida para nuevos usuarios.

#### Tareas:
1. **Paso 1: Permiso de micrófono**
   - Solicitar permiso
   - Manejo de denegación
   - Explicación de por qué se necesita

2. **Paso 2: Configurar límite mensual**
   - Input de importe
   - Validaciones
   - Sugerencias (ej: "La mayoría usa 500-1500€")

3. **Paso 3: Prueba de voz**
   - Ejemplo: "5 euros de café en Starbucks"
   - Feedback visual
   - Confirmar que funciona

4. **Guardar en Supabase**
   - Insertar en `settings`
   - Marcar onboarding como completado

#### Estimación: 4-5 horas

---

## 🔧 Tareas Técnicas Pendientes

### Seguridad (Alta Prioridad)
- [ ] **Implementar Supabase Auth**
  - Login/Signup con email + password
  - Integrar con `useAuthStore`
  - Reemplazar UUID fijo por `auth.uid()`
- [ ] **Re-habilitar RLS**
  - Ejecutar: `ALTER TABLE public.spends ENABLE ROW LEVEL SECURITY;`
  - Verificar políticas funcionan correctamente

### Performance
- [ ] Lazy load de rutas con `React.lazy()`
- [ ] Code splitting por página
- [ ] Optimizar bundle (<120 KB gzipped)
- [ ] Medir LCP con Lighthouse

### PWA
- [ ] Crear `manifest.json`
- [ ] Implementar Service Worker
- [ ] Offline detection y queue de sync

### Métricas
- [ ] Implementar tracking de eventos
- [ ] Dashboard de uso de IA (tokens, costes)
- [ ] Monitoreo de latencia voz→guardado

---

## 📚 Recursos Útiles

### Documentación Interna
- `docs/project/SPEC.md`: Especificación funcional completa
- `docs/project/ROADMAP.md`: Fases de desarrollo
- `docs/features/DESIGN-SPEC.md`: Especificaciones de diseño y UI
- `docs/development/AGENTS.md`: Reglas de arquitectura hexagonal
- `PROGRESS.md`: Estado actual del proyecto

### Código Clave
- `src/hooks/useSpendSubmit.ts`: Orquestación del flujo de guardado
- `src/components/voice/VoiceRecorder.tsx`: Flujo de voz completo
- `src/adapters/ai/MockAIProvider.ts`: Parser regex básico
- `src/domain/rules/budgetCalculator.ts`: Lógica de presupuesto

### External Docs
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Zustand](https://docs.pmnd.rs/zustand)
- [React Testing Library](https://testing-library.com/react)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 🐛 Debugging Tips

### Si el reconocimiento de voz no funciona:
1. Verifica que estás en HTTPS o localhost
2. Revisa permisos del micrófono en el navegador
3. Mira la consola del navegador (F12) para ver logs de `[useSpeechRecognition]`

### Si el guardado falla:
1. Verifica que `.env.local` tiene las credenciales correctas
2. Asegúrate de que RLS está deshabilitado (para testing)
3. Revisa la tabla `settings` en Supabase, debe existir el usuario demo
4. Mira logs en consola: `[useSpendSubmit]`

### Si los colores se ven mal:
1. Verifica que Tailwind está compilando correctamente
2. Recarga sin caché (Cmd+Shift+R)
3. Revisa `tailwind.config.js` - debe incluir todos los archivos `.tsx`

---

## 🎯 Recomendación del Asistente

**Sugerencia: Empezar con Dashboard (Opción A)**

Razones:
1. Muestra el valor inmediato del flujo de voz
2. Usa hooks ya implementados (`useBudgetProgress`, `useLoadSpends`)
3. Valida que la carga de gastos desde Supabase funciona
4. Más impacto visual para demos
5. Base sólida para las demás páginas

**Orden sugerido**:
1. Dashboard (Fase 7) ← **EMPIEZA AQUÍ**
2. Gestión de gastos (Fase 8)
3. Onboarding (Fase 9)
4. Settings y exportación (Fase 10)
5. PWA (Fase 11)
6. Autenticación y seguridad
7. Métricas (Fase 12)
8. Polish y optimización (Fase 13)

---

## 💬 ¿Necesitas Ayuda?

Si tienes dudas sobre:
- Arquitectura hexagonal → Lee `docs/development/AGENTS.md`
- Especificaciones funcionales → Lee `docs/project/SPEC.md`
- Diseño y UI → Lee `docs/features/DESIGN-SPEC.md` y revisa mockups en `public/mockups/`
- Estado del proyecto → Lee `PROGRESS.md`

---

**Última actualización**: Octubre 2024  
**Próximo hito sugerido**: Dashboard (Fase 7)
