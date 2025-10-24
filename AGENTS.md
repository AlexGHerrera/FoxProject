# AGENTS.md — Foxy (Finanzas por Voz)

> Reglas específicas para agentes trabajando en el proyecto Foxy: aplicación PWA de finanzas con registro de gastos por voz, IA y gamificación.

---

## 0) Contexto del proyecto

- **Nombre**: Foxy (provisional)
- **Stack**: React 18 + TypeScript + Vite + Tailwind CSS + Zustand + Supabase
- **Arquitectura**: Hexagonal (Ports & Adapters)
- **Propósito**: Registro de gastos voz-first con feedback de IA y mascota animada
- **Owner**: Alex G. Herrera
- **Entorno**: macOS, desarrollo local + Supabase cloud

---

## 1) Arquitectura Hexagonal (obligatoria)

### Capas y responsabilidades

```
src/
├── domain/           # Modelos puros, reglas de negocio (sin deps externas)
├── application/      # Casos de uso (orquestan dominio)
├── adapters/         # Puertos externos (IA, DB, voz, storage)
├── config/           # Configuración, env vars
├── hooks/            # React hooks (conectan UI con casos de uso)
├── stores/           # Estado global (Zustand)
├── components/       # UI components (React + Tailwind)
├── pages/            # Páginas/rutas
├── utils/            # Utilidades puras
└── types/            # TypeScript types compartidos
```

### Reglas estrictas

1. **Dominio NO depende de nada**: no imports de adapters, React, Supabase, etc.
2. **Application usa interfaces**: los casos de uso reciben interfaces (`IAIProvider`, `ISpendRepository`), no implementaciones concretas.
3. **Adapters implementan interfaces**: `DeepSeekProvider implements IAIProvider`.
4. **Hooks orquestan**: los hooks custom conectan UI → casos de uso → adapters.
5. **Components solo UI**: llaman hooks, muestran estado, no lógica de negocio.

### Ejemplo de flujo (voz → gasto)

```
MicButton.tsx (component)
  ↓ usa
useSpeechRecognition() (hook)
  ↓ usa
WebSpeechRecognizer (adapter/voice) → transcripción
  ↓ pasa texto a
useSpendSubmit() (hook)
  ↓ llama
parseSpend(text, aiProvider) (application/use case)
  ↓ usa
DeepSeekProvider (adapter/ai) → JSON parseado
  ↓ regresa a hook, que llama
saveSpend(spend, repository) (application/use case)
  ↓ usa
SupabaseRepository (adapter/db) → guardado
```

**Beneficio**: cambiar DeepSeek por GPT = solo modificar `DeepSeekProvider`.

---

## 2) Convenciones de código

### Naming

- **Componentes React**: PascalCase (`MicButton.tsx`, `BudgetBar.tsx`)
- **Hooks custom**: camelCase con prefijo `use` (`useSpeechRecognition.ts`)
- **Stores Zustand**: camelCase con prefijo `use` (`useVoiceStore.ts`)
- **Casos de uso**: camelCase (`parseSpend.ts`, `saveSpend.ts`)
- **Interfaces**: PascalCase con prefijo `I` (`IAIProvider.ts`, `ISpendRepository.ts`)
- **Tipos**: PascalCase (`Spend`, `Category`, `Settings`)
- **Constantes**: UPPER_SNAKE_CASE (`CATEGORIES`, `MAX_RECORDING_TIME`)

### Estructura de archivos

- **Un componente por archivo** (excepto componentes muy pequeños auxiliares)
- **Colocation**: tests junto al código (`MyComponent.tsx` + `MyComponent.test.tsx`)
- **Barrel exports**: usar `index.ts` en carpetas con múltiples exports

### TypeScript

- **Siempre tipado explícito** en funciones públicas y props
- **Evitar `any`**: usar `unknown` si es necesario
- **Usar `zod` para validación** en runtime de datos externos
- **Interfaces para contratos**, types para uniones/aliases

---

## 3) Testing Strategy

### Herramientas

- **Unit tests**: Vitest
- **Component tests**: React Testing Library
- **E2E**: Playwright (futuro)

### Cobertura esperada

- **Dominio**: 100% (funciones puras, críticas)
- **Application**: >80% (casos de uso)
- **Adapters**: >70% (con mocks de APIs externas)
- **Components**: >60% (interacciones críticas)
- **Hooks**: >70% (lógica de orquestación)

### Reglas

- **No mockear dominio**: tests de dominio usan objetos reales
- **Mockear adapters**: tests de casos de uso usan mocks de repositorios/providers
- **Render mínimo**: en tests de componentes, renderizar solo lo necesario
- **Nombres descriptivos**: `test('should auto-confirm spend when confidence >= 0.8')`

---

## 4) Estilo y UI

### Design System

- **Tokens**: usar `DESIGN-TOKENS.json` como única fuente de verdad
- **Tailwind**: configurado con tokens, no valores hardcoded
- **Componentes base**: `Button`, `Modal`, `Toast` en `components/ui/`
- **Temas**: light/dark con detección automática (`prefers-color-scheme`)

### Accesibilidad

- **Tamaño táctil mínimo**: 44×44px en botones
- **Contraste**: mínimo WCAG AA (4.5:1 para texto)
- **Focus visible**: anillo azul en navegación por teclado
- **ARIA labels**: en íconos y controles sin texto
- **Keyboard navigation**: todas las funciones accesibles sin ratón

### Animaciones

- **CSS first**: preferir CSS/Tailwind sobre JS cuando sea posible
- **Respeto a `prefers-reduced-motion`**: desactivar animaciones si el usuario lo pide
- **Foxy avatar**: placeholder CSS animado (pulsos, transiciones suaves)
- **Duración**: corta (<300ms para feedback, <600ms para transiciones)

---

## 5) Datos y estado

### Estado global (Zustand)

- **Stores separados** por dominio: `useVoiceStore`, `useSpendStore`, `useUIStore`, `useAuthStore`
- **Acciones explícitas**: `setRecording()`, `addSpend()`, `showToast()`
- **Selectors granulares**: solo suscribirse a lo que se necesita
- **Persistencia**: usar `persist` middleware solo para settings de usuario

### Estado local

- **useState para UI efímero**: modales abiertos, inputs temporales
- **useReducer para flujos complejos**: wizards, forms multi-step
- **React Query (futuro)**: para cache de queries si Supabase no es suficiente

### Manejo de datos

- **Validación**: con `zod` schemas en fronteras (API responses, forms)
- **Transformación**: en adapters, no en UI
- **Inmutabilidad**: nunca mutar estado, siempre nuevas referencias
- **Céntimos internos**: importes siempre en céntimos (int), solo formatear en UI

---

## 6) Performance y bundle

### Objetivos

- **Bundle inicial**: <120 KB gzipped
- **LCP**: <2.0s en móvil (3G rápido simulado)
- **Tiempo voz→guardado**: <1.2s (P50) en auto-confirm
- **FID/INP**: <100ms

### Estrategias

- **Code splitting**: lazy load de rutas (`React.lazy`)
- **Tree shaking**: imports específicos (`import { func } from 'lib'`)
- **Optimizar deps**: evitar librerías pesadas (ej: usar `date-fns` en vez de `moment`)
- **Imágenes**: WebP optimizadas, lazy loading
- **Service Worker**: cache de assets estáticos

---

## 7) IA y costes

### Provider actual: DeepSeek

- **Endpoint**: `https://api.deepseek.com/v1/chat/completions`
- **Modelo**: `deepseek-chat` (económico, bueno para parsing estructurado)
- **Prompts**: en `PROMPTS.json`, versionados
- **Timeout**: 3s máximo (fallback a parser regex si falla)

### Monitoreo de costes

- **Tabla `api_usage`**: registrar cada llamada (tokens, latencia, success)
- **Dashboard básico**: en Settings, mostrar uso mensual estimado
- **Alertas**: si latencia P95 >2s o tasa de error >5%, notificar

### Estrategias de ahorro

- **Cache inteligente**: si usuario dice lo mismo en <10s, reutilizar parse
- **Batch**: agrupar múltiples requests si es posible (futuro)
- **Degradación**: si API cae, usar parser regex básico
- **Confidence threshold**: solo llamar IA si transcripción >15 caracteres

---

## 8) Voz (Web Speech API)

### Compatibilidad

- **Chrome/Edge**: excelente soporte
- **Safari iOS**: bueno, requiere user interaction
- **Firefox**: limitado, fallback a input manual

### Implementación

- **Dos modos**: PTT (push-to-talk) y toggle (tap on/off)
- **Timeout**: 30s máximo de grabación continua
- **Silencio**: detectar 2s de silencio → auto-stop
- **Permisos**: pedir en onboarding, handle denegación gracefully
- **Privacidad**: nunca guardar audio, solo texto transcrito

### Fallback

- **Sin mic permission**: mostrar "Tecleo rápido" (input manual optimizado)
- **API no disponible**: igual, modo manual
- **Errors**: reintentar 1 vez, luego ofrecer manual

---

## 9) Supabase

### Configuración

- **Auth**: email + password (simple para MVP)
- **RLS**: habilitado en todas las tablas, policies por `user_id`
- **Edge Functions**: para `/parse-spend` (DeepSeek call desde backend)
- **Realtime**: off por ahora (no necesario)

### Queries

- **Siempre con límites**: `.limit(100)` por defecto
- **Índices**: usar índices compuestos para queries comunes
- **Select específico**: solo columnas necesarias, no `SELECT *`
- **Manejo de errores**: try/catch, log estructurado, retry 1 vez en 5XX

### Migraciones

- **Carpeta**: `supabase/migrations/`
- **Versionadas**: `001_initial_schema.sql`, `002_add_api_usage.sql`
- **Idempotentes**: usar `IF NOT EXISTS`, `DROP IF EXISTS`
- **Testing**: probar en proyecto Supabase de dev antes de prod

---

## 10) PWA

### Requisitos

- **Manifest**: `public/manifest.json` con iconos 192×192 y 512×512
- **Service Worker**: cache de shell, offline fallback
- **Instalable**: cumplir criterios de Chrome (HTTPS, manifest, SW, íconos)
- **Offline**: queue de sync para POST de gastos fallidos

### Estrategia de cache

- **Assets estáticos**: cache-first (HTML, CSS, JS, fonts, íconos)
- **API calls**: network-first, fallback a IndexedDB
- **Imágenes**: cache-first con expiración 7 días

---

## 11) Git y commits

### Branching

- **main**: protegida, solo PRs
- **feat/nombre-feature**: para features nuevas
- **fix/nombre-bug**: para bugs
- **refactor/nombre**: para refactors sin cambios funcionales
- **docs/nombre**: para documentación

### Commits

- **Conventional Commits**: `feat(voice): add PTT mode to mic button`
- **Scope**: dominio (voice, spend, dashboard, ui, etc.)
- **Tamaño**: commits pequeños, atómicos
- **Co-authoring**: si es pair programming, incluir Co-authored-by

### PRs

- **Plantilla**:
  - **Qué cambia**: descripción breve
  - **Cómo se implementa**: arquitectura hexagonal (qué capas tocas)
  - **Tests**: qué tests agregaste/modificaste
  - **Riesgos**: breaking changes, migraciones, etc.
  - **Screenshots**: si hay cambios visuales

---

## 12) Reglas específicas para agentes IA

### Antes de codear

1. **Lee SPEC.md y ROADMAP.md** si tocas funcionalidad nueva
2. **Lee PROMPTS.json** si trabajas con IA
3. **Lee DESIGN-TOKENS.json** si trabajas con UI
4. **Entiende el contexto hexagonal**: identifica qué capa modificarás

### Durante el desarrollo

1. **Respeta hexagonal**: NO mezcles capas, NO importes adapters desde dominio
2. **Tests siempre**: crea/actualiza tests relevantes
3. **TypeScript strict**: no uses `any`, no ignores errors
4. **Accesibilidad**: verifica contraste, tamaños táctiles, keyboard nav
5. **Performance**: lazy load cuando sea posible, evita re-renders innecesarios

### Naming y estructura

1. **Componentes React**: PascalCase, un componente por archivo
2. **Hooks**: camelCase con `use` prefix
3. **Stores**: camelCase con `use` prefix
4. **Casos de uso**: camelCase, nombres verbales (`parseSpend`, `saveSpend`)
5. **Interfaces**: PascalCase con `I` prefix

### Commits y cambios

1. **Commits pequeños**: un cambio lógico por commit
2. **Mensajes claros**: Conventional Commits con scope
3. **No romper nada**: si refactorizas, asegura que tests pasan
4. **Documenta decisiones**: si algo es no obvio, agrega comentario explicativo

### Costes y observabilidad

1. **Log estructurado**: usa `console.log` con objetos JSON, incluye contexto
2. **Métricas**: registra eventos relevantes (voz_start, spend_saved, etc.)
3. **Monitoreo IA**: registra en `api_usage` cada llamada a DeepSeek
4. **Errores**: captura, log y muestra mensaje amigable al usuario

---

## 13) Checklist pre-PR

Antes de abrir un PR, verifica:

- [ ] Tests pasan (`npm run test`)
- [ ] Linter pasa (`npm run lint`)
- [ ] TypeScript compila sin errors (`npm run type-check`)
- [ ] Build funciona (`npm run build`)
- [ ] Arquitectura hexagonal respetada (no imports cruzados)
- [ ] Accesibilidad básica (contraste, tamaños, keyboard)
- [ ] Performance aceptable (no bloqueos, bundle razonable)
- [ ] Documentación actualizada (README, comentarios si necesario)
- [ ] Commits limpios (squash si hay muchos WIP)

---

## 14) Recursos y referencias

### Internos

- `SPEC.md`: especificación funcional del MVP
- `ROADMAP.md`: fases de desarrollo
- `SCHEMA.sql`: esquema de base de datos
- `PROMPTS.json`: prompts de IA
- `DESIGN-TOKENS.json`: tokens de diseño

### Externos

- [Supabase Docs](https://supabase.com/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [React Testing Library](https://testing-library.com/react)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [DeepSeek API](https://platform.deepseek.com/api-docs/)

---

## 15) FAQ para agentes

**P: ¿Puedo usar otra librería de estado en vez de Zustand?**  
R: No para este MVP. Zustand está decidido por simplicidad y bundle size.

**P: ¿Qué hacer si DeepSeek no funciona bien?**  
R: Crea una nueva implementación `OpenAIProvider` que implemente `IAIProvider`. Gracias a la arquitectura hexagonal, es un cambio mínimo.

**P: ¿Puedo hacer un componente monolítico de 500 líneas?**  
R: No. Divide en componentes más pequeños, usa composición.

**P: ¿Tests son obligatorios?**  
R: Sí para dominio y casos de uso. Recomendados para adapters y componentes críticos.

**P: ¿Puedo usar CSS-in-JS (styled-components, emotion)?**  
R: No. Usamos Tailwind + CSS modules si necesitas estilos muy específicos.

**P: ¿Cómo manejo secretos (API keys)?**  
R: `.env.local` en desarrollo (nunca en repo), Supabase secrets en edge functions, Vercel env vars en producción.

**P: ¿Puedo commitear código que rompe tests?**  
R: Nunca en `main`. En branches de desarrollo, ok temporalmente, pero marca como WIP.

---

**Última actualización**: Octubre 2025  
**Autor**: Alex G. Herrera
