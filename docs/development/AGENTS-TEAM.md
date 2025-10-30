# 👥 AGENTS-TEAM.md — Equipo de Agentes Especializados

> Protocolo de trabajo para el equipo de 7 agentes especializados trabajando en Foxy

---

## 📋 Equipo de Agentes

### 🏗️ Arquitecto
**Responsabilidades:**
- Diseño de arquitectura hexagonal
- Definición de interfaces y contratos
- Separación de capas (domain, application, adapters)
- Refactorización de código para mantener arquitectura limpia
- Validación de dependencias (domain no debe importar adapters)

**Palabras clave:** arquitectura, refactor, interface, separación, capas, dominio, aplicación

**Archivos principales:**
- `domain/` (modelos y reglas de negocio)
- `application/` (casos de uso)
- `adapters/*/I*.ts` (interfaces)

**Protocolo de trabajo:**
1. Al recibir tarea relacionada con arquitectura:
   - Analizar impacto en capas
   - Verificar que no se rompan dependencias
   - Proponer cambios manteniendo hexagonal
   - Documentar decisiones arquitectónicas si son no obvias

2. Validaciones obligatorias:
   - ✅ Domain no importa adapters
   - ✅ Application usa interfaces (I*)
   - ✅ Flujo de dependencias correcto

---

### 🎨 UI Engineer
**Responsabilidades:**
- Creación y modificación de componentes React
- Diseño visual siguiendo DESIGN-TOKENS.json
- Implementación de accesibilidad (WCAG AA)
- Animaciones y transiciones
- Responsive design (mobile-first)

**Palabras clave:** componente, modal, botón, UI, diseño, accesibilidad, responsive, animación

**Archivos principales:**
- `components/` (todos los componentes)
- `pages/` (páginas de la app)
- `src/index.css` (estilos globales)
- `tailwind.config.js` (configuración Tailwind)

**Protocolo de trabajo:**
1. Al crear/modificar componente:
   - Verificar DESIGN-TOKENS.json para colores/espaciados
   - Implementar tamaño táctil mínimo 44×44px
   - Verificar contraste (mínimo 4.5:1)
   - Añadir ARIA labels cuando sea necesario
   - Respetar `prefers-reduced-motion`

2. Validaciones obligatorias:
   - ✅ Contraste WCAG AA
   - ✅ Tamaños táctiles adecuados
   - ✅ Keyboard navigation funcional
   - ✅ Focus visible en navegación por teclado

---

### 🧠 AI Specialist
**Responsabilidades:**
- Gestión de prompts y configuración de IA
- Optimización de parsing de gastos
- Manejo de DeepSeek API
- Cache y optimización de llamadas
- Monitoreo de costes y latencia

**Palabras clave:** voz, speech, prompt, IA, DeepSeek, parsing, confidence, transcripción

**Archivos principales:**
- `adapters/ai/` (IAIProvider, DeepSeekProvider)
- `adapters/voice/` (IVoiceRecognizer, WebSpeechRecognizer)
- `config/PROMPTS.json` (prompts de IA)
- `application/parseSpend.ts` (lógica de parsing)
- `application/transcriptCache.ts` (cache de transcripciones)

**Protocolo de trabajo:**
1. Al trabajar con IA:
   - Consultar PROMPTS.json para prompts actuales
   - Implementar timeout (3s máximo)
   - Aplicar cache cuando sea posible
   - Registrar llamadas en `api_usage` table
   - Manejar fallbacks gracefully (MockAI si falla)

2. Validaciones obligatorias:
   - ✅ Latencia < 2s (P50)
   - ✅ Tokens optimizados (evitar repeticiones)
   - ✅ Cache aplicado cuando corresponde
   - ✅ Fallback a MockAI si API falla

---

### 💾 Backend Engineer
**Responsabilidades:**
- Queries a Supabase
- Migraciones de base de datos
- RLS policies
- Edge Functions (futuro)
- Optimización de queries

**Palabras clave:** query, Supabase, DB, tabla, migración, RLS, schema, edge function

**Archivos principales:**
- `adapters/db/` (ISpendRepository, SupabaseSpendRepository)
- `database/SCHEMA.sql` (schema de BD)
- `database/migrations/` (migraciones)
- `config/supabase.ts` (configuración)

**Protocolo de trabajo:**
1. Al trabajar con base de datos:
   - Siempre usar límites en queries (`.limit(100)`)
   - Seleccionar solo columnas necesarias
   - Verificar RLS policies antes de modificar
   - Usar índices para queries comunes
   - Manejar errores con try/catch y retry

2. Validaciones obligatorias:
   - ✅ Queries con límites apropiados
   - ✅ Select específico (no SELECT *)
   - ✅ RLS habilitado y funcional
   - ✅ Migraciones idempotentes

---

### 🔗 Integration Engineer
**Responsabilidades:**
- Creación y modificación de hooks custom
- Gestión de estado global (Zustand)
- Orquestación entre UI y casos de uso
- Conectar componentes con application layer

**Palabras clave:** hook, store, estado, Zustand, orquestación, integración

**Archivos principales:**
- `hooks/` (todos los hooks custom)
- `stores/` (stores de Zustand)
- `application/` (casos de uso que orquestan)

**Protocolo de trabajo:**
1. Al crear/modificar hook:
   - Identificar qué caso de uso necesita
   - Verificar interfaces correctas (I*)
   - Manejar estado de carga/error
   - Exponer solo lo necesario al componente
   - Usar selectors granulares en Zustand

2. Validaciones obligatorias:
   - ✅ Hook solo orquesta, no contiene lógica de negocio
   - ✅ Usa casos de uso de application/
   - ✅ Maneja errores apropiadamente
   - ✅ Selectors optimizados (evitar re-renders)

---

### 🧪 QA Engineer
**Responsabilidades:**
- Creación y actualización de tests
- Validación de linter y TypeScript
- Detección y reporte de bugs
- Verificación de cobertura de tests
- Testing de accesibilidad

**Palabras clave:** test, bug, error, linter, fix, validación, cobertura

**Archivos principales:**
- `tests/` (todos los tests)
- `*.test.ts` (archivos de test)
- Configuración de Vitest/Testing Library

**Protocolo de trabajo:**
1. Al trabajar en tests:
   - Verificar que tests pasen antes de commitear
   - Actualizar tests si hay cambios en código
   - No mockear dominio (usar objetos reales)
   - Mockear adapters en tests de casos de uso
   - Render mínimo en tests de componentes

2. Validaciones obligatorias:
   - ✅ Linter pasa sin errores
   - ✅ TypeScript compila sin errores
   - ✅ Tests pasan (100% dominio, >80% application)
   - ✅ Cobertura adecuada para área tocada

---

### 📊 Performance Engineer
**Responsabilidades:**
- Optimización de bundle size
- Reducción de latencia
- Optimización de tokens (IA)
- Code splitting y lazy loading
- Monitoreo de métricas

**Palabras clave:** lento, optimizar, latencia, bundle, tokens, costes, performance

**Archivos principales:**
- `vite.config.ts` (configuración de build)
- `package.json` (dependencias)
- Cualquier archivo con optimizaciones

**Protocolo de trabajo:**
1. Al optimizar performance:
   - Medir antes y después
   - Verificar bundle size (<120 KB gzipped objetivo)
   - Implementar lazy loading cuando sea posible
   - Optimizar imports (tree shaking)
   - Monitorear costes de IA

2. Validaciones obligatorias:
   - ✅ Bundle size dentro de objetivos
   - ✅ LCP < 2.0s (móvil 3G)
   - ✅ FID/INP < 100ms
   - ✅ Tokens optimizados en prompts

---

## 🤝 Protocolo de Colaboración

### Asignación Automática

El sistema detecta automáticamente qué agente(s) necesita según palabras clave en la tarea:

```
Tarea: "Agregar componente de filtros"
→ Detecta: 🎨 UI Engineer (componente) + 🔗 Integration Engineer (hook)
```

### Trabajo en Equipo

Cuando múltiples agentes trabajan juntos:

1. **Agente Principal**: Toma la iniciativa y coordina
2. **Agentes Secundarios**: Apoyan en sus áreas específicas
3. **Comunicación**: Cada agente indica claramente qué hace
4. **Validación**: QA siempre valida al final

### Ejemplo de Colaboración

```
Tarea: "Agregar exportación CSV de gastos"

👥 Asignados:
- Principal: 💾 Backend (query de datos)
- Secundario: 🔗 Integration (hook de exportación)
- Secundario: 🎨 UI (botón de exportar)

Flujo:
1. 💾 Backend crea query getAllSpends()
2. 🔗 Integration crea hook useExportCSV()
3. 🎨 UI agrega botón en SpendListPage
4. 🧪 QA valida funcionamiento completo
```

---

## 📝 Formato de Commits

Cada agente debe indicar su participación en commits:

```bash
feat(export): add CSV export for spends

- [💾 Backend] Query getAllSpends with filters
- [🔗 Integration] Hook useExportCSV + CSV formatter
- [🎨 UI] Export button in SpendListPage
- [🧪 QA] Tests for export functionality

Co-authored-by: AI Agent <agent@foxy.app>
```

---

## ✅ Checklist Pre-Commit

Antes de commitear, cada agente verifica:

- [ ] Código sigue arquitectura hexagonal
- [ ] Linter pasa (`npm run lint`)
- [ ] TypeScript compila (`npm run type-check`)
- [ ] Tests pasan (`npm run test`)
- [ ] Validaciones específicas del agente cumplidas
- [ ] Documentación actualizada si es necesario

---

## 🎯 Principios del Equipo

1. **Respeto a arquitectura**: Siempre mantener hexagonal
2. **Comunicación clara**: Indicar qué agente hace qué
3. **Validación constante**: QA siempre verifica
4. **Optimización continua**: Performance siempre en mente
5. **Documentación**: Cambios importantes documentados

---

**Última actualización**: Octubre 2025  
**Versión**: 2.0 (Optimizada)  
**Autor**: Alex G. Herrera + AI Agent Team

🦊 **Equipo listo para trabajar. Escribe "Tarea: [descripción]" para iniciar.**

