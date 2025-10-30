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

- **Tokens**: `DESIGN-TOKENS.json` única fuente de verdad
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
- Prompts: `PROMPTS.json` (versionados)
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
| `QUICK-RESUME.md` | Estado actual, última sesión |
| `PROMPTS.json` | Prompts IA versionados |
| `DESIGN-TOKENS.json` | Sistema de diseño |
| `SCHEMA.sql` | Schema DB |
| `SPEC.md` | Especificación funcional |
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
