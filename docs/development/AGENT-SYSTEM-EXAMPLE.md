# 🤖 Sistema Agéntico v2.0 - Ejemplo de Uso

> Ejemplo real de cómo funciona el sistema optimizado

---

## 📖 Ejemplo Completo: Agregar Filtros por Categoría

### 1️⃣ Usuario Inicia Sesión

**Usuario escribe:**
```
Tarea: Agregar filtros por categoría en la página de gastos
```

---

### 2️⃣ Sistema Analiza y Propone

**Sistema responde:**

```
📖 Contexto: App con multi-spend funcional, sin filtros implementados

👥 Asignados:
- Principal: 🎨 UI Engineer (componentes de filtro)
- Secundario: 🔗 Integration Engineer (hook de filtrado)

📋 Plan:
1. 🎨 Crear componente SpendFilters.tsx con dropdown categorías
2. 🔗 Crear hook useSpendFilters() para lógica
3. 🎨 Integrar en SpendListPage.tsx
4. 🧪 Validar funcionamiento

Estimación: 1-2 horas
Cambios: ~150 líneas en 3 archivos nuevos/modificados

¿Crear rama feat/filtros-categoria y proceder?
```

---

### 3️⃣ Usuario Confirma

**Usuario:**
```
Sí
```

---

### 4️⃣ Sistema Ejecuta

**Sistema:**

```
[Creando rama feat/filtros-categoria...]
git checkout -b feat/filtros-categoria

---

🎨 UI ENGINEER actuando...
Creando componente SpendFilters.tsx con dropdown de categorías

[código del componente]

✅ UI: SpendFilters.tsx creado

---

🔗 INTEGRATION ENGINEER actuando...
Creando hook useSpendFilters() para gestionar estado de filtros

[código del hook]

✅ Integration: useSpendFilters.tsx creado

---

🎨 UI ENGINEER actuando...
Integrando SpendFilters en SpendListPage.tsx

[código de integración]

✅ UI: Integración completada

---

🧪 QA validando...
✅ Linter OK
✅ TypeScript OK
✅ Filtrado funciona correctamente

---

✅ FEATURE COMPLETADA

Archivos modificados:
- src/components/spend/SpendFilters.tsx (nuevo, 85 líneas)
- src/hooks/useSpendFilters.ts (nuevo, 42 líneas)
- src/pages/SpendListPage.tsx (modificado, +15 líneas)

Sugerencia de commit:
feat(spend): add category filters in spend list

- [🎨 UI] Create SpendFilters component with dropdown
- [🔗 Integration] Create useSpendFilters hook
- [🎨 UI] Integrate filters in SpendListPage

Co-authored-by: AI Agent <agent@foxy.app>

¿Commitear?
```

---

### 5️⃣ Usuario Aprueba y Continúa (SIN "Tarea:")

**Usuario:**
```
Sí, y ahora agrega también filtro por fecha
```

**Nota**: No necesita escribir "Tarea:" de nuevo. El sistema mantiene contexto.

---

### 6️⃣ Sistema Continúa Automáticamente

**Sistema:**

```
[Sin necesidad de volver a leer QUICK-RESUME.md]

👥 Continúa: 🔗 Integration + 🎨 UI

🔗 INTEGRATION ENGINEER actuando...
Extendiendo useSpendFilters() para incluir rango de fechas

[código del hook actualizado]

✅ Integration: Lógica de fecha agregada

---

🎨 UI ENGINEER actuando...
Agregando date picker en SpendFilters.tsx

[código del date picker]

✅ UI: Date picker integrado

---

🧪 QA validando...
✅ Linter OK
✅ TypeScript OK
✅ Filtro por fecha funciona

---

✅ Filtro por fecha agregado

¿Commitear por separado o en mismo commit que filtros por categoría?
```

---

### 7️⃣ Usuario Decide

**Usuario:**
```
Mismo commit, y luego push
```

---

### 8️⃣ Sistema Finaliza Profesionalmente

**Sistema:**

```
Actualizando commit con todos los cambios...

git add .
git commit -m "feat(spend): add category and date filters in spend list

- [🎨 UI] Create SpendFilters component with dropdown and date picker
- [🔗 Integration] Create useSpendFilters hook with category and date logic
- [🎨 UI] Integrate filters in SpendListPage

Co-authored-by: AI Agent <agent@foxy.app>"

✅ Commit creado

Haciendo push...
git push origin feat/filtros-categoria

✅ Push completado

---

¿Abrir Pull Request ahora o continuar trabajando?
```

---

### 9️⃣ Usuario Pide PR

**Usuario:**
```
Abrir PR
```

---

### 🔟 Sistema Genera PR Template

**Sistema:**

```
Template de Pull Request:

---

## 🎯 Qué cambia

Agrega sistema de filtros en la página de gastos, permitiendo filtrar por:
- Categoría (dropdown con todas las categorías)
- Rango de fechas (date picker desde/hasta)

Los filtros se aplican en tiempo real y persisten durante la sesión.

## 🏗️ Implementación

### Capas tocadas:
- **Hooks** (`useSpendFilters.ts`): Lógica de filtrado y estado
- **Components** (`SpendFilters.tsx`, `SpendListPage.tsx`): UI de filtros

### Agentes involucrados:
🎨 UI Engineer (componentes, integración)  
🔗 Integration Engineer (hook de filtrado)  
🧪 QA Engineer (validación)

### Arquitectura hexagonal:
✅ Respetada - hook orquesta, componentes solo UI

## 🧪 Tests

- [x] Filtro por categoría funciona
- [x] Filtro por fecha funciona
- [x] Filtros combinados funcionan
- [x] Reset filters funciona
- [x] Linter pasa
- [x] TypeScript compila

## ⚠️ Riesgos

- **Breaking changes**: Ninguno
- **Migraciones DB**: No necesarias
- **Performance**: Filtrado en memoria, OK para <10k gastos

## 📸 Screenshots

[Agregar screenshots si es posible]

---

Copia este contenido al crear el PR en GitHub/GitLab.

✅ Feature completa y lista para review.
```

---

## 🎯 Ventajas del Sistema v2.0

### ✅ Ahorro de Tokens
- **No re-lee** `QUICK-RESUME.md` en cada orden
- **No repite** protocolo verboso
- **Contexto persistente** en sesión
- **Formato conciso**: máximo impacto, mínimas palabras

### ✅ Flujo Profesional
- **Git automático**: ramas, commits, push, PRs
- **Conventional Commits**: formato estándar
- **Trazabilidad**: qué agente hizo qué
- **Decisiones inteligentes**: cuándo commitear, cuándo abrir PR

### ✅ Experiencia Natural
- **Una vez "Tarea:"** → el resto son órdenes directas
- **Asignación automática**: detecta qué agente(s) necesita
- **Sin fricción**: no interrumpe el flow de desarrollo

---

## 📊 Comparación con v1.0

| Aspecto | v1.0 | v2.0 |
|---------|------|------|
| Activación | `🎯 Tarea:` cada vez | `Tarea:` una vez |
| Tokens protocolo | ~800 tokens | ~200 tokens |
| Contexto | Re-lee docs | Persistente |
| Git workflow | Manual | Automático |
| Formato respuesta | Verbose | Conciso |
| Co-authored-by | No | Sí |
| PR templates | No | Sí |

**Ahorro estimado**: **60-70% de tokens** vs v1.0

---

## 💡 Tips de Uso

### ✅ Hacer
- Escribe `Tarea:` para iniciar nueva feature
- Da órdenes directas después (sin "Tarea:")
- Confía en la asignación automática de agentes
- Aprueba sugerencias de commits/PRs

### ❌ Evitar
- Repetir "Tarea:" en cada mensaje
- Micro-gestionar qué agente usar
- Ignorar sugerencias de ramas
- Commitear manualmente (deja que el sistema lo haga)

---

🦊 **Sistema listo para uso. Escribe "Tarea: [descripción]" para comenzar.**

