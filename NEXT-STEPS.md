# 🦊 Foxy - Próximos Pasos

> Guía paso a paso para continuar el desarrollo tras completar el flujo de voz

---

## 🎉 Estado Actual

**✅ COMPLETADO: Flujo de voz funcional end-to-end**

- Usuario puede hablar y registrar gastos
- Reconocimiento de voz con Web Speech API
- Parsing con MockAIProvider (o DeepSeek si hay API key)
- Guardado en Supabase
- Toast de éxito con botón "Deshacer"
- UI accesible con buen contraste

---

## 🚀 Próximos Pasos Recomendados

### Opción A: Dashboard (Fase 7) - **RECOMENDADO**

El siguiente paso lógico es mostrar los gastos registrados y el progreso del presupuesto.

#### Tareas:
1. **Implementar `BudgetBar` component** (`src/components/dashboard/BudgetBar.tsx`)
   - Mostrar progreso del presupuesto mensual
   - Colores dinámicos:
     - Verde: < 70% del límite
     - Amarillo: 70-89%
     - Rojo: >= 90%
   - Usar `useBudgetProgress` hook (ya implementado)

2. **Implementar `RecentSpends` component** (`src/components/dashboard/RecentSpends.tsx`)
   - Mostrar últimos 4-5 gastos
   - Card compacto con: importe, categoría, merchant, timestamp
   - Link a vista completa de gastos

3. **Implementar `Dashboard` page** (`src/pages/Dashboard.tsx`)
   - Integrar `BudgetBar` + `RecentSpends`
   - Botón flotante para "Agregar gasto por voz"
   - Placeholder para Foxy avatar (CSS animado)

4. **Routing con React Router**
   - Configurar rutas: `/`, `/spends`, `/settings`
   - Layout con navegación bottom

#### Estimación: 4-6 horas

---

### Opción B: Gestión de Gastos (Fase 8)

Implementar lista completa de gastos con filtros y búsqueda.

#### Tareas:
1. **`SpendCard` component**
   - Mostrar gasto individual
   - Acciones: editar, eliminar
   - Swipe gestures (opcional)

2. **`SpendList` component**
   - Lista paginada de gastos
   - Infinite scroll
   - Estados: loading, empty, error

3. **Filtros**
   - Rango de fechas (date picker)
   - Categorías (chips multi-select)
   - Método de pago
   - Persistir en URL query params

4. **Búsqueda**
   - Por merchant o nota
   - Debounced input
   - Highlight de resultados

#### Estimación: 6-8 horas

---

### Opción C: Onboarding (Fase 9)

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
- `SPEC.md`: Especificación funcional completa
- `ROADMAP.md`: Fases de desarrollo
- `DESIGN-SPEC.md`: Especificaciones de diseño y UI
- `AGENTS.md`: Reglas de arquitectura hexagonal
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
- Arquitectura hexagonal → Lee `AGENTS.md`
- Especificaciones funcionales → Lee `SPEC.md`
- Diseño y UI → Lee `DESIGN-SPEC.md` y revisa mockups en `public/mockups/`
- Estado del proyecto → Lee `PROGRESS.md`

---

**Última actualización**: Octubre 2024  
**Próximo hito sugerido**: Dashboard (Fase 7)
