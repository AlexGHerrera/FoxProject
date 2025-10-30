# ⚙️ Configuración del Proyecto

Este directorio contiene archivos de configuración globales del proyecto Foxy.

## 📁 Archivos

### **[PROMPTS.json](./PROMPTS.json)**
Prompts de IA versionados para el parsing de gastos por voz.

- Prompt principal optimizado para DeepSeek
- Ejemplos de entrenamiento para mejorar precisión
- Versión actualizada del prompt con definiciones de categorías

**Uso**: Referenciado por `adapters/ai/DeepSeekProvider.ts` y casos de uso en `application/parseSpend.ts`

**Versión**: Verificar campo `version` en el JSON para tracking.

### **[DESIGN-TOKENS.json](./DESIGN-TOKENS.json)**
Sistema de diseño (design tokens) - única fuente de verdad para colores, espaciados, tipografía, etc.

**Uso**: 
- Referenciado por `tailwind.config.js` para configuración de Tailwind
- Usado por `src/index.css` para CSS variables de temas
- Consultado por componentes para mantener consistencia visual

**Tokens incluidos**:
- Colores (brand, surface, text, etc.)
- Espaciados (paddings, margins, gaps)
- Tipografía (font sizes, weights, line heights)
- Radios (border radius)
- Sombras (shadows)

## 🔄 Actualización

Cuando actualices estos archivos:

1. **PROMPTS.json**: 
   - Incrementar versión en el JSON
   - Documentar cambios en commit message
   - Probar con casos reales de voz

2. **DESIGN-TOKENS.json**:
   - Verificar que `tailwind.config.js` sigue funcionando
   - Verificar que temas light/dark se reflejan correctamente
   - Actualizar componentes afectados si es necesario

## 📝 Notas

- Estos archivos son **arquitectura neutra** (no dependen de React, Supabase, etc.)
- Pueden ser compartidos entre diferentes partes del proyecto
- Deben mantenerse sincronizados con su uso en código

---

**Última actualización**: Octubre 2025  
**Mantenedor**: Alex G. Herrera

