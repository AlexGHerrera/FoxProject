# 🚀 Próximos Pasos - Foxy MVP

> Guía rápida de qué hacer ahora para continuar el desarrollo

---

## ✅ Lo que Ya Está Hecho

Hemos completado la **base sólida** del proyecto:

1. **Setup completo** del proyecto (Vite + React + TS + Tailwind)
2. **Arquitectura hexagonal** implementada
3. **Capa de dominio** (modelos + reglas de negocio)
4. **Casos de uso** (parseSpend, saveSpend, calculateBudget, exportSpends)
5. **Adapters** (DeepSeek, Supabase, Web Speech API, IndexedDB)
6. **Tests unitarios** básicos (12 tests pasando ✓)
7. **Configuración** completa (Tailwind, TypeScript, Vitest)
8. **Documentación** (README, AGENTS, PROGRESS)

**Estado**: ✅ No hay errores de TypeScript, todos los tests pasan

---

## 🎯 Paso 1: Configurar Supabase (BLOQUEANTE)

**Sin esto, la app no puede funcionar**

### 1.1 Crear Proyecto

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Haz clic en "New Project"
4. Elige:
   - **Organization**: personal o crea una nueva
   - **Name**: `foxy-app` (o el que prefieras)
   - **Database Password**: genera uno seguro y **guárdalo**
   - **Region**: elige la más cercana (Europe West recomendada)
   - **Pricing Plan**: Free (suficiente para MVP)

5. Espera ~2 minutos a que se cree el proyecto

### 1.2 Ejecutar Schema

1. En el dashboard de Supabase, ve a **SQL Editor** (menú lateral)
2. Haz clic en **New Query**
3. Abre el archivo `SCHEMA.sql` del proyecto
4. **Copia todo su contenido**
5. Pégalo en el editor de Supabase
6. Haz clic en **Run** (abajo a la derecha)
7. Deberías ver: "Success. No rows returned"

Esto crea:
- 4 tablas: `spends`, `settings`, `training_examples`, `api_usage`
- Índices optimizados
- RLS policies (seguridad automática)

### 1.3 Obtener Credenciales

1. Ve a **Settings** (ruedita en menú lateral) → **API**
2. Copia estos valores:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOi...` (clave larga)

### 1.4 Configurar .env.local

1. En la raíz del proyecto `foxy-app/`, crea un archivo `.env.local`
2. Pega esto (reemplazando con tus valores reales):

```env
VITE_APP_ENV=dev
VITE_APP_URL=http://localhost:5173
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

3. Guarda el archivo

### 1.5 Probar Conexión

```bash
# En la carpeta foxy-app/
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en el navegador.

Si ves la página de Vite sin errores en la consola → ✅ Supabase conectado

---

## 🎯 Paso 2: Obtener API Key de DeepSeek (Opcional)

**Solo necesario si quieres probar el parsing de IA**

1. Ve a [https://platform.deepseek.com](https://platform.deepseek.com)
2. Crea una cuenta
3. Ve a **API Keys** → **Create New Key**
4. Copia la key (`sk-...`)
5. En Supabase, ve a **Edge Functions** → **Secrets**
6. Añade secret:
   - Name: `DEEPSEEK_API_KEY`
   - Value: `sk-...`

**Nota**: Por ahora, como no hemos creado la Edge Function, puedes usar DeepSeek directamente desde el frontend (menos seguro pero ok para dev). En producción, se usa desde Supabase Edge Function.

---

## 🎯 Paso 3: Continuar con el Desarrollo

### Opción A: Con Agente IA (Recomendado)

```
Prompt sugerido:
"Continúa implementando el proyecto Foxy siguiendo el plan en PROGRESS.md.
Empieza por la Fase 6: crear los stores Zustand (useVoiceStore, useSpendStore, useUIStore).
Luego implementa los hooks custom.
Sigue estrictamente la arquitectura hexagonal definida en AGENTS.md."
```

### Opción B: Manual

1. Lee `AGENTS.md` para entender arquitectura y convenciones
2. Lee `PROGRESS.md` para ver qué falta (sección "🚧 Pendiente")
3. Empieza por **Fase 6: Estado y Hooks**:
   - Crear `src/stores/useVoiceStore.ts`
   - Crear `src/stores/useSpendStore.ts`
   - Crear `src/stores/useUIStore.ts`
   - Crear `src/hooks/useSpeechRecognition.ts`
   - etc.

4. Luego **Fase 7: Componentes UI Base**:
   - `src/components/ui/Button.tsx`
   - `src/components/ui/Modal.tsx`
   - `src/components/ui/Toast.tsx`

5. Después **Fase 8: Flujo de Voz (CORE del MVP)**

---

## 🔍 Verificar que Todo Funciona

```bash
cd foxy-app

# Type checking (debe pasar sin errores)
npm run type-check

# Tests (debe mostrar 12 tests pasando)
npm run test -- --run

# Linter (debe pasar)
npm run lint

# Servidor de desarrollo
npm run dev
```

---

## 📚 Recursos Útiles

### Documentación del Proyecto

- `README.md`: setup, arquitectura, comandos
- `AGENTS.md`: convenciones, hexagonal, reglas para agentes
- `PROGRESS.md`: tracking detallado de tareas completadas/pendientes
- `SPEC.md`: especificación funcional del MVP
- `ROADMAP.md`: fases completas del desarrollo

### Archivos de Configuración

- `DESIGN-TOKENS.json`: colores, espaciados, tipografía
- `PROMPTS.json`: prompts de IA (DeepSeek)
- `SCHEMA.sql`: estructura de base de datos

### Recursos Externos

- [Supabase Docs](https://supabase.com/docs)
- [Zustand Guide](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [DeepSeek API Docs](https://platform.deepseek.com/api-docs)

---

## ❓ Troubleshooting

### "No puedo conectarme a Supabase"

- Verifica que `.env.local` existe y tiene los valores correctos
- Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` están correctos
- Reinicia el servidor de desarrollo (`Ctrl+C` y `npm run dev`)
- Verifica en Supabase que el proyecto está activo

### "Los tests fallan"

- Asegúrate de que todas las dependencias están instaladas: `npm install`
- Verifica que no hay errores de TypeScript: `npm run type-check`
- Lee el mensaje de error específico

### "Errores de TypeScript"

- Ejecuta `npm run type-check` para ver todos los errores
- Revisa que los imports usan los path aliases correctamente (`@/domain/...`)
- Verifica que no hay `any` sin justificación

### "No sé por dónde empezar"

1. Lee `AGENTS.md` (sección "Arquitectura Hexagonal")
2. Lee `PROGRESS.md` (sección "🚧 Pendiente")
3. Mira los archivos ya creados en `src/domain/` como ejemplo
4. Empieza por la Fase 6 (stores) que es la base para todo lo demás

---

## 💡 Consejos

1. **Sigue la arquitectura hexagonal**: no mezcles capas, respeta las interfaces
2. **Escribe tests**: al menos para casos de uso y componentes críticos
3. **Comitea frecuentemente**: commits pequeños y atómicos
4. **Usa Conventional Commits**: `feat(voice): add mic button`
5. **Lee los comentarios**: los archivos tienen documentación inline útil

---

## 📞 Contacto

- **Autor**: Alex G. Herrera
- **Proyecto**: HackABoss 2025
- **Repositorio**: (añadir URL cuando esté en GitHub)

---

**¡Éxito con el desarrollo! 🚀**

El setup está completo y sólido. Lo que sigue es implementar la UI y conectar todo.
La arquitectura ya está pensada para que sea fácil y mantenible.

