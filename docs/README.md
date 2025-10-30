# 📚 Documentación del Proyecto Foxy

Este directorio contiene toda la documentación del proyecto organizada por categorías.

## 📁 Estructura

### 🛠️ [`development/`](./development/)
Guías y documentación para desarrolladores.

- **[AGENTS.md](./development/AGENTS.md)** - Reglas de arquitectura hexagonal y convenciones
- **[AGENT-SYSTEM-EXAMPLE.md](./development/AGENT-SYSTEM-EXAMPLE.md)** - Ejemplos del sistema de agentes
- **[AGENT-SYSTEM-V2-CHANGES.md](./development/AGENT-SYSTEM-V2-CHANGES.md)** - Cambios de la versión 2.0 del sistema
- **[GIT-COMMIT-INSTRUCTIONS.md](./development/GIT-COMMIT-INSTRUCTIONS.md)** - Guía de commits y Git workflow
- **[TESTING-GUIDE-OCT30.md](./development/TESTING-GUIDE-OCT30.md)** - Guía de testing
- **[TEST-REPORT.md](./development/TEST-REPORT.md)** - Reporte de tests

### ✨ [`features/`](./features/)
Documentación de features y especificaciones.

- **[ADMIN-FEATURE.md](./features/ADMIN-FEATURE.md)** - Sistema de administración
- **[DESIGN-SPEC.md](./features/DESIGN-SPEC.md)** - Especificaciones de diseño y UI

### 📝 [`sessions/`](./sessions/)
Notas de sesiones de desarrollo y bug fixes.

- **[SESSION-OCT30-FINAL.md](./sessions/SESSION-OCT30-FINAL.md)** - Resumen final de sesión del 30 de octubre
- **[SESSION-SUMMARY.md](./sessions/SESSION-SUMMARY.md)** - Resumen de sesiones
- **[BUG-FIX-OCT30.md](./sessions/BUG-FIX-OCT30.md)** - Fix de bugs del 30 de octubre

### 📋 [`project/`](./project/)
Documentación del proyecto: especificaciones, roadmap y progreso.

- **[SPEC.md](./project/SPEC.md)** - Especificación funcional del MVP
- **[ROADMAP.md](./project/ROADMAP.md)** - Plan de desarrollo por fases
- **[PROGRESS.md](./project/PROGRESS.md)** - Estado actual del proyecto
- **[NEXT-STEPS.md](./project/NEXT-STEPS.md)** - Próximos pasos
- **[QUICK-RESUME.md](./project/QUICK-RESUME.md)** - Resumen rápido del estado actual
- **[IMPLEMENTATION-SUMMARY.md](./project/IMPLEMENTATION-SUMMARY.md)** - Resumen de implementación

### 🐛 [`issues/`](./issues/)
Issues conocidos y problemas documentados.

- **[SAFARI-MIC-ISSUE.md](./issues/SAFARI-MIC-ISSUE.md)** - Problema conocido con Safari y micrófono

## 🔗 Referencias Rápidas

| Documento | Ruta | Descripción |
|-----------|------|-------------|
| Especificación | [`project/SPEC.md`](./project/SPEC.md) | Especificación funcional completa |
| Roadmap | [`project/ROADMAP.md`](./project/ROADMAP.md) | Plan de desarrollo |
| Arquitectura | [`development/AGENTS.md`](./development/AGENTS.md) | Reglas arquitectura hexagonal |
| Estado actual | [`project/QUICK-RESUME.md`](./project/QUICK-RESUME.md) | Resumen rápido del estado |

## 📄 Archivos de Configuración

Los archivos de configuración del proyecto están en la raíz del proyecto:

- **`config/PROMPTS.json`** - Prompts de IA versionados
- **`config/DESIGN-TOKENS.json`** - Sistema de diseño (tokens)

## 🗄️ Base de Datos

Los scripts SQL están en [`database/`](../database/):

- **`database/SCHEMA.sql`** - Schema principal de la base de datos
- **`database/DEMO-USER.sql`** - Datos de usuario demo
- **`database/RESTORE-DEMO-DATA.sql`** - Script para restaurar datos demo
- **`database/TEMP-DISABLE-RLS.sql`** - Script temporal para deshabilitar RLS

## 🚀 Inicio Rápido

Si es tu primera vez en el proyecto:

1. Lee **[project/QUICK-RESUME.md](./project/QUICK-RESUME.md)** para entender el estado actual
2. Revisa **[project/SPEC.md](./project/SPEC.md)** para la especificación funcional
3. Consulta **[development/AGENTS.md](./development/AGENTS.md)** para entender la arquitectura

Si vas a desarrollar:

1. Lee **[development/AGENTS.md](./development/AGENTS.md)** para reglas de arquitectura
2. Revisa **[development/GIT-COMMIT-INSTRUCTIONS.md](./development/GIT-COMMIT-INSTRUCTIONS.md)** para el workflow
3. Consulta **[development/TESTING-GUIDE-OCT30.md](./development/TESTING-GUIDE-OCT30.md)** para testing

---

**Última actualización**: Octubre 2025  
**Mantenedor**: Alex G. Herrera


