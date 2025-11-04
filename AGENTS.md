# AGENTS.md — Foxy (Finanzas por Voz)

> Reglas para desarrollo del proyecto Foxy - Arquitectura, convenciones y estrategias de ahorro de tokens

---

## 📋 Contexto

- **Stack**: React 18 + TypeScript + Vite + Tailwind + Zustand + Supabase
- **Arquitectura**: Hexagonal (Ports & Adapters)
- **Propósito**: PWA de finanzas con registro por voz + IA
- **Sistema de agentes**: Ver `.cursorrules` para protocolo de trabajo

---

## 🏗️ Arquitectura Hexagonal (OBLIGATORIA)

### Estructura
```
src/
├── domain/        # Modelos puros, reglas negocio (sin deps externas)
├── application/   # Casos de uso (reciben interfaces I*)
├── adapters/      # Implementaciones (AI, DB, voz, storage)
├── hooks/         # Orquestación (UI ↔ application)
├── stores/        # Estado global (Zustand)
├── components/    # UI pura (React + Tailwind)
├── pages/         # Rutas
└── utils/         # Utilidades
```

### Reglas
1. **Domain** NO depende de nada
2. **Application** usa interfaces (IAIProvider, ISpendRepository)
3. **Adapters** implementan interfaces
4. **Hooks** orquestan (conectan UI → application → adapters)
5. **Components** solo UI (llaman hooks)

---

## 📝 Convenciones

### Naming
- Componentes: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Stores: `useCamelCase.ts`
- Casos uso: `camelCase.ts`
- Interfaces: `IPascalCase.ts`
- Tipos: `PascalCase`
- Constantes: `UPPER_SNAKE_CASE`

### TypeScript
- Tipado explícito en funciones públicas
- Evitar `any` → usar `unknown`
- Validación con `zod` en fronteras
- Interfaces para contratos, types para uniones

---

## 🎨 UI & Accesibilidad

- **Tokens**: `config/DESIGN-TOKENS.json` única fuente de verdad
- **Tailwind**: sin valores hardcoded
- **Tamaño táctil**: mínimo 44×44px
- **Contraste**: WCAG AA (4.5:1)
- **ARIA labels**: en íconos sin texto
- **Keyboard nav**: todas las funciones accesibles

---

## 🧠 IA & Optimización de Costes

### DeepSeek Config
- Endpoint: `https://api.deepseek.com/v1/chat/completions`
- Modelo: `deepseek-chat`
- Prompts: `config/PROMPTS.json` (versionados)
- Timeout: 3s → fallback regex

### Estrategias de Ahorro
1. **Cache inteligente**: 10s para mismo texto
2. **Pre-procesado**: regex parser para casos simples
3. **Threshold**: >15 chars para llamar IA
4. **Prompts optimizados**: concisos, max_tokens: 250
5. **Temperatura baja**: 0.1 para parsing estructurado

### Monitoreo
- Tabla `api_usage`: cada llamada (tokens, latencia, success)
- Logs estructurados: `console.log({ context, metrics })`
- Dashboard en Settings: uso mensual

---

## 🧪 Testing Strategy

### Cobertura Esperada
- **Domain**: 100%
- **Application**: >80%
- **Adapters**: >70%
- **Hooks**: >70%
- **Components**: >60%

### Herramientas
- **Unit**: Vitest
- **Components**: React Testing Library
- **E2E**: Playwright (futuro)

### Reglas
- NO mockear domain (objetos reales)
- Mockear adapters en tests de casos de uso
- Nombres descriptivos: `test('should auto-confirm when confidence >= 0.8')`

---

## 🚀 Performance

### Objetivos
- Bundle: <120 KB gzipped
- LCP: <2.0s móvil
- Voz→guardado: <1.2s (P50)
- FID/INP: <100ms

### Estrategias
- Code splitting: `React.lazy()`
- Tree shaking: imports específicos
- Lazy loading: imágenes, rutas
- Service Worker: cache assets estáticos

---

## 💾 Supabase

### Config
- Auth: email + password
- RLS: habilitado (policies por `user_id`)
- Edge Functions: para `/parse-spend`

### Queries
- Siempre con límites: `.limit(100)`
- Select específico (no `SELECT *`)
- Try/catch + retry 1x en 5XX

---

## 📦 Git & Commits

### Conventional Commits
```
<tipo>(scope): descripción

- [Emoji Agente] Cambio 1
- [Emoji Agente] Cambio 2

Co-authored-by: AI Agent <agent@foxy.app>
```

**Tipos**: feat, fix, refactor, perf, test, docs, chore  
**Scopes**: voice, spend, dashboard, ui, ai, db

### Branching
- `main`: protegida
- `feat/nombre`: features
- `fix/nombre`: bugs
- `refactor/nombre`: refactors

---

## 📚 Referencias Internas

| Doc | Propósito |
|-----|-----------|
| `docs/project/QUICK-RESUME.md` | Estado actual, última sesión |
| `config/PROMPTS.json` | Prompts IA versionados |
| `config/DESIGN-TOKENS.json` | Sistema de diseño |
| `database/SCHEMA.sql` | Schema DB |
| `docs/project/SPEC.md` | Especificación funcional |
| `.cursorrules` | Sistema de agentes |

---

## ✅ Checklist Pre-Commit

- [ ] `npm run lint` ✅
- [ ] `npm run type-check` ✅
- [ ] Tests relevantes actualizados
- [ ] Arquitectura hexagonal respetada
- [ ] No imports cruzados domain/adapters
- [ ] Accesibilidad básica (si UI)
- [ ] Performance aceptable

---

## 💡 Decisiones Clave

### Hexagonal
**Por qué**: Testing fácil, cambiar providers sin tocar lógica  
**Ejemplo**: DeepSeek → GPT = solo crear `GPTProvider`

### Zustand vs Redux
**Por qué**: Más simple, menos boilerplate, bundle pequeño

### Tailwind
**Por qué**: Desarrollo rápido, tree-shaking, design system

### Supabase
**Por qué**: Auth + DB + Edge Functions todo-en-uno  
**Mitigación vendor lock-in**: Arquitectura hexagonal

---

## 🔧 FAQ

**P: ¿Puedo usar `any`?**  
R: No. Usa `unknown` si es necesario.

**P: ¿Tests obligatorios?**  
R: Sí en domain y application. Recomendados en resto.

**P: ¿Componente de 500 líneas?**  
R: No. Divide, usa composición.

**P: ¿Commitear código roto?**  
R: Nunca en `main`. OK temporal en branches (marca WIP).

**P: ¿Cómo ahorro tokens de IA?**  
R: Cache, regex parser, prompts concisos, temp baja.

---

**Última actualización**: Octubre 2025  
**Versión**: 2.0 (Optimizada)  

🦊 Para trabajar: escribe `Tarea: [descripción]` y el sistema agéntico se activa.

---

## 🤖 Roles de Agentes (orquestación Cursor)

### Planner / Architect
- **Objetivo**: partir “Tarea:” en subtareas atómicas, definir contratos y criterios de aceptación.
- **Entregables**: `docs/project/SPEC.md` actualizado, `schema.md` (si cambia contrato), plan de branches/worktrees y checklist.
- **No toca** UI ni lógica; solo contrato, plan y revisiones.

### Backend
- **Objetivo**: casos de uso (`application/**`), adaptadores (`adapters/**`), persistencia Supabase y endpoints si aplica.
- **Entregables**: código + tests (Vitest) de domain/application/adapters; migraciones si aplica; commits convencionales.
- **Respeta** la arquitectura hexagonal: domain no depende de adapters.

### Frontend
- **Objetivo**: páginas (`pages/**`), componentes (`components/**`), hooks orquestadores (`hooks/**`), stores (`stores/**`).
- **Entregables**: UI accesible (WCAG AA), estados vacíos/errores, pruebas de componentes (React Testing Library).
- **Respetar** design tokens de `config/DESIGN-TOKENS.json`.

### Tester (QA)
- **Objetivo**: ejecutar `npm run lint`, `npm run type-check`, unit y components; preparar smoke E2E (Playwright cuando esté).
- **Entregables**: informe con cobertura y logs, badge de estado, lista de issues bloqueantes.

### Docs
- **Objetivo**: actualizar `README.md`, `CHANGELOG.md`, ejemplos de uso, snippets de comandos.
- **Entregables**: diff docs y sección “Cómo probar esta feature”.

---

## 🧭 Routing de Tareas (guía para el Planner)

- Cambios en **domain/** o **application/** → Backend (+ QA)
- Cambios en **adapters/** (IA, DB, voz, storage) → Backend
- Cambios en **hooks/**, **components/**, **pages/**, **stores/** → Frontend
- Cambios de contrato (DTO, payloads, eventos) → Planner/Architect (+ actualizar `schema.md`)
- Cambios en **docs/** y `AGENTS.md` → Docs
- Siempre que una tarea cree/exponga API interna, **Planner** debe generar/actualizar `schema.md`.

---

## 🛑 Review Gates (pausas antes de merge)

1) **Gate A — Diseño/Contrato**
   - Planner presenta plan, criterios de aceptación y (si aplica) `schema.md`.
   - Aprobación humana requerida.

2) **Gate B — Implementación**
   - Backend/Frontend muestran **diffs**, logs de `lint`, `type-check`, y **tests unitarios** en verde.
   - Aprobación humana requerida.

3) **Gate C — QA**
   - Tester ejecuta suite y comparte informe (cobertura target: Domain 100% / Application >80% / Adapters >70% / Components >60%).
   - Aprobación humana requerida.

4) **Gate D — Docs**
   - Docs actualiza `README` + `CHANGELOG` + ejemplos.
   - Merge manual a `main` (protegida).

---

## 🌿 Branching / Worktrees por Agente

- Un **agente = un branch/worktree** (aislamiento total).
- Naming: `feat/<área>-<tarea>` (p.ej. `feat/voice-quick-add`), `fix/...`, `docs/...`.
- Commits: Conventional Commits con viñetas por agente si colaboran.

---

## 🧪 Scripts de Calidad (usados por QA)

- `npm run lint`
- `npm run type-check`
- `npm run test`
- (Opcional) `npm run test:components`
- **Objetivo**: Domain 100%, Application >80%, Adapters >70%, Components >60% (ya definidos arriba).

---

## 📑 Prompt maestro (pegar en Agents → New Plan)

Usa este prompt con **Parallel Agents** activado y modelo Composer: Lee .cursorrules,QUICK-RESUME.md y AGENTS.md, asigna roles, ejecuta y detente en cada Gate hasta aprobación.
