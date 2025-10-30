# 🦊 Foxy - App de Finanzas por Voz

> Aplicación PWA para registro de gastos por voz con IA. MVP enfocado en experiencia voice-first con arquitectura hexagonal.

## 🎯 Estado del Proyecto

**Fase Actual**: Setup y arquitectura base completada

### ✅ Completado

- [x] Setup del proyecto (Vite + React + TypeScript)
- [x] Configuración de Tailwind CSS con design tokens
- [x] Arquitectura hexagonal completa
- [x] Capa de dominio (modelos, reglas de negocio)
- [x] Casos de uso (parseSpend, saveSpend, calculateBudget, exportSpends)
- [x] Adapters (DeepSeek, Supabase, Web Speech API, IndexedDB)
- [x] Tests unitarios básicos

### 🚧 Próximos Pasos

1. **Crear proyecto en Supabase**
   - Ejecutar `SCHEMA.sql`
   - Configurar RLS policies
   - Crear edge function para `parse-spend`
   - Obtener credenciales (URL + anon key)

2. **Implementar stores y hooks**
   - Zustand stores (voice, spends, UI)
   - Hooks custom (useSpeechRecognition, useSpendSubmit, useBudgetProgress)

3. **Crear componentes UI base**
   - Button, Modal, Toast
   - Sistema de temas (light/dark)
   - Foxy avatar con animaciones CSS

4. **Flujo de voz (core del MVP)**
   - MicButton con modos PTT y toggle
   - VoiceRecorder con estados visuales
   - ConfirmModal con auto-confirm
   - Toast "Deshacer"

5. **Dashboard**
   - BudgetBar con colores dinámicos
   - RecentSpends
   - Integración Foxy

---

## 🚀 Setup Rápido

### Prerequisitos

- Node.js 18+ y npm/pnpm
- Cuenta en [Supabase](https://supabase.com)
- API key de [DeepSeek](https://platform.deepseek.com) (opcional para desarrollo)

### Instalación

```bash
# Ya instalado, pero si necesitas reinstalar:
cd foxy-app
npm install

# Crear .env.local (copia de .env.example)
cp .env.example .env.local

# Editar .env.local con tus credenciales
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

### Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Tests
npm run test

# Tests con UI
npm run test:ui

# Type checking
npm run type-check

# Lint
npm run lint

# Build
npm run build
```

---

## 📁 Estructura del Proyecto (Hexagonal)

```
src/
├── domain/              # Modelos puros y reglas de negocio
│   ├── models/          # Spend, Category, Settings
│   └── rules/           # budgetCalculator
├── application/         # Casos de uso
│   ├── parseSpend.ts    # Parse texto → gasto
│   ├── saveSpend.ts     # Guardar gasto
│   ├── calculateBudget.ts
│   └── exportSpends.ts
├── adapters/            # Implementaciones de interfaces
│   ├── ai/              # DeepSeekProvider
│   ├── db/              # SupabaseRepository
│   ├── voice/           # WebSpeechRecognizer
│   └── storage/         # IndexedDBCache
├── config/              # Configuración y env
├── hooks/               # React hooks custom
├── stores/              # Zustand stores
├── components/          # UI components
├── pages/               # Rutas/páginas
├── utils/               # Utilidades
└── types/               # TypeScript types
```

### Flujo de Datos (Hexagonal)

```
UI Component
  ↓ usa
Custom Hook
  ↓ llama
Use Case (application/)
  ↓ usa interfaz
Adapter (adapters/)
  ↓ llama
External Service (Supabase, DeepSeek, etc.)
```

**Ejemplo**: Registro de gasto por voz

```
MicButton.tsx
  → useSpeechRecognition()
    → WebSpeechRecognizer (adapter)
      → Web Speech API

[transcripción obtenida]

  → useSpendSubmit()
    → parseSpend() (use case)
      → DeepSeekProvider (adapter)
        → DeepSeek API
    → saveSpend() (use case)
      → SupabaseRepository (adapter)
        → Supabase DB
```

---

## 🧪 Testing

### Estrategia

- **Dominio**: 100% cobertura (funciones puras)
- **Application**: >80% (casos de uso con mocks)
- **Adapters**: >70% (con mocks de APIs)
- **Components**: >60% (interacciones críticas)

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Watch mode
npm run test -- --watch

# Cobertura
npm run test:coverage

# Tests específicos
npm run test budgetCalculator
```

---

## 🔧 Configuración de Supabase

### 1. Crear Proyecto

1. Ir a [supabase.com](https://supabase.com) y crear un nuevo proyecto
2. Guardar la URL y la clave anónima
3. Ir al SQL Editor

### 2. Ejecutar Schema

Copiar y pegar el contenido de `SCHEMA.sql` en el SQL Editor y ejecutar.

Esto creará:
- Tabla `spends` (gastos)
- Tabla `settings` (configuración de usuario)
- Tabla `training_examples` (para mejorar IA)
- Tabla `api_usage` (monitoreo de costes)
- Índices optimizados
- RLS policies (seguridad por usuario)

### 3. Crear Edge Function (parse-spend)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref <tu-project-ref>

# Crear función
supabase functions new parse-spend

# Deploy (después de implementar la función)
supabase functions deploy parse-spend --no-verify-jwt
```

Contenido de la función en `supabase/functions/parse-spend/index.ts` (crear después).

### 4. Configurar Variables de Entorno

En el dashboard de Supabase → Settings → Edge Functions → Add Secret:

```
DEEPSEEK_API_KEY=sk-xxx...
```

---

## 🎨 Design Tokens

Los tokens de diseño están en `DESIGN-TOKENS.json` y se reflejan en:

- `tailwind.config.js` (colores, espaciados, radios)
- `src/index.css` (CSS variables para temas)

### Temas

El tema se detecta automáticamente basándose en `prefers-color-scheme`. Los colores se ajustan via CSS variables.

### Componentes Base

Todos los componentes UI base usan los tokens:

- Botones: `brand-cyan` con sombras definidas
- Cards: `surface` con `card` background
- Texto: `text` y `muted` según jerarquía

---

## 🗣️ Voz (Web Speech API)

### Compatibilidad

| Navegador | Soporte |
|-----------|---------|
| Chrome/Edge | ✅ Excelente |
| Safari macOS/iOS | ⚠️ Funcional con bug cosmético* |
| Firefox | ⚠️ Limitado |

**\*Bug conocido de Safari**: El indicador de micrófono en la barra del navegador puede permanecer visible incluso después de cerrar el reconocimiento. Este es un **bug cosmético de WebKit** — el micrófono está realmente cerrado y no está grabando. Ver `SAFARI-MIC-ISSUE.md` para más detalles.

### Fallback

Si la Web Speech API no está disponible o el usuario deniega permisos:
- Se muestra un input manual optimizado ("Tecleo rápido")
- Mismo flujo de parsing con IA
- UX consistente

### Problemas Conocidos

#### Safari: Indicador de micrófono persistente

**Descripción**: En Safari (macOS e iOS), el indicador rojo de micrófono en la barra del navegador puede quedar visible después de confirmar o cancelar un gasto.

**Estado**: 
- ✅ El micrófono está **realmente cerrado** (privacidad protegida)
- ❌ Safari no actualiza el indicador visual (bug del navegador)
- 📝 Todas las soluciones documentadas implementadas sin éxito
- 🐛 Bug reportado a WebKit/Apple

**Impacto**:
- **Privacidad**: Ninguno (el mic no graba)
- **Funcionalidad**: Ninguno (todo funciona correctamente)
- **UX**: Puede confundir al usuario

**Soluciones temporales para usuarios**:
1. Recargar la pestaña (⌘+R)
2. Usar entrada manual (sin micrófono)
3. Usar Chrome/Edge en macOS

**Detalles técnicos**: Ver `SAFARI-MIC-ISSUE.md`

---

## 🤖 IA (DeepSeek)

### Por qué DeepSeek

- **Coste**: ~95% más económico que GPT-4
- **Precisión**: Buena para parsing estructurado (JSON)
- **Latencia**: ~1-2s (aceptable para MVP)

### Alternativas

Gracias a la arquitectura hexagonal, cambiar de proveedor es trivial:

1. Crear `OpenAIProvider implements IAIProvider`
2. Inyectar en lugar de `DeepSeekProvider`
3. Listo.

### Monitoreo

Todas las llamadas a IA se registran en `api_usage` table:
- Tokens de entrada/salida
- Latencia
- Success/error
- Timestamp

Útil para optimizar costes y detectar problemas.

---

## 📊 Métricas

Eventos que se trackearan (futuro):

- `voice_start`, `voice_stop`
- `stt_text_len`
- `parse_ok`, `parse_low_confidence`
- `spend_saved`, `undo_used`
- `filters_apply`, `csv_export`
- `latency_ms_voice_to_save`

---

## 🚀 Despliegue

### Vercel (recomendado)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Variables de entorno
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Build Local

```bash
npm run build
# Output en dist/
```

---

## 📝 Próximas Funcionalidades

Ver `ROADMAP.md` para el plan completo. Highlights:

- [ ] PWA con service worker
- [ ] Modo offline con sync
- [ ] Insights mensuales con IA
- [ ] Exportación mejorada (PDF, Excel)
- [ ] Gastos recurrentes
- [ ] Multi-moneda
- [ ] Compartir gastos (grupos)

---

## 🤝 Contribuir

Este es un proyecto educativo. Para contribuir:

1. Fork el repo
2. Crea una branch (`feat/mi-feature`)
3. Commits siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
4. Push y abre un PR
5. Asegúrate de que los tests pasen

---

## 📄 Licencia

MIT License - ver `LICENSE` file.

---

## 🙏 Créditos

- **Autor**: Alex G. Herrera
- **Año**: 2025
- **Stack**: React, TypeScript, Tailwind, Supabase, DeepSeek
- **Inspiración**: Filosofía voice-first, arquitectura hexagonal, DDD

---

## 🤖 Sistema de Agentes para Desarrollo

Este proyecto utiliza un **sistema de agentes especializados** para facilitar el desarrollo. 

### Documentación de Agentes

- **`AGENTS.md`**: Reglas generales y arquitectura hexagonal
- **`AGENTS-TEAM.md`**: Equipo de 7 agentes especializados y protocolo de trabajo
- **`AGENTS-QUICK-REF.md`**: Referencia rápida para seleccionar agentes

### Inicio Rápido con Agentes

Al inicio de cada sesión de desarrollo, escribe:

```
🎯 Tarea: [Lo que quieres hacer]
```

**Ejemplos:**
- `🎯 Tarea: Implementar filtros avanzados`
- `🎯 Tarea: Optimizar latencia de DeepSeek`
- `🎯 Tarea: Bug: swipe no funciona en móvil`

El sistema automáticamente:
1. Lee `QUICK-RESUME.md` para contexto
2. Selecciona los agentes apropiados
3. Propone un plan de trabajo detallado
4. Ejecuta con expertise especializada

### Los 7 Agentes

| Agente | Responsabilidad | Archivos principales |
|--------|-----------------|----------------------|
| 🏗️ **Arquitecto** | Arquitectura hexagonal, interfaces | `domain/`, `application/` |
| 🎨 **UI Engineer** | Componentes, diseño, accesibilidad | `components/`, `pages/` |
| 🧠 **AI Specialist** | IA, voz, prompts, optimización | `adapters/ai/`, `PROMPTS.json` |
| 💾 **Backend Engineer** | DB, queries, Supabase | `adapters/db/`, `SCHEMA.sql` |
| 🔗 **Integration Engineer** | Hooks, stores, orquestación | `hooks/`, `stores/` |
| 🧪 **QA Engineer** | Tests, cobertura, calidad | `tests/`, `*.test.ts` |
| 📊 **Performance Engineer** | Bundle, latencia, optimización | `vite.config.ts` |

**Lee más**: `AGENTS-TEAM.md` para detalles completos del sistema.

---

**¿Dudas?** Lee `AGENTS.md` para guías específicas de desarrollo o abre un issue.
