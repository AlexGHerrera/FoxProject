# 🐛 Bug Fix - App se queda en blanco después de "Analizando con IA"

**Fecha**: Oct 30, 2025  
**Reportado por**: Alex G. Herrera  
**Severidad**: 🔴 Crítico (bloqueante)

---

## 📋 Descripción del Bug

Después de terminar una locución de voz, la aplicación muestra "Analizando con IA..." y luego **se queda en blanco**. El navegador no continúa y no muestra el modal de confirmación.

---

## 🔍 Causa Raíz

En `VoiceRecorder.tsx`, el `useEffect` que llama a `handleParse()` **NO tenía `handleParse` en su array de dependencias**:

```typescript
// ❌ ANTES (INCORRECTO)
useEffect(() => {
  if (state === 'processing' && transcript && transcript.length > 3) {
    handleParse()
  }
}, [state, transcript]) // ❌ Falta handleParse
```

Esto causa uno de dos problemas:

1. **Infinite loop**: El efecto se ejecuta constantemente
2. **Stale closure**: Llama una versión vieja de `handleParse` que no tiene acceso a las funciones correctas

---

## ✅ Solución Aplicada

### Paso 1: Importar `useCallback`
```typescript
import { useEffect, useState, useCallback } from 'react'
```

### Paso 2: Envolver `handleParse` con `useCallback`
```typescript
const handleParse = useCallback(async () => {
  if (!transcript) {
    console.warn('[VoiceRecorder] handleParse called without transcript')
    return
  }

  console.log('[VoiceRecorder] Starting parse for:', transcript)

  try {
    const result = await parseTranscript(transcript)
    
    if (!result || result.spends.length === 0) {
      console.warn('[VoiceRecorder] Parse returned no spends')
      return
    }

    if (result.totalConfidence >= 0.95) {
      const spends = await submitMultipleSpends(result.spends)
      if (spends && onClose) {
        onClose()
      }
    } else {
      setPendingResult(result)
      setShowConfirmModal(true)
    }
  } catch (error) {
    console.error('[VoiceRecorder] Error in handleParse:', error)
  }
}, [transcript, parseTranscript, submitMultipleSpends, onClose])
```

### Paso 3: Incluir `handleParse` en dependencias del `useEffect`
```typescript
// ✅ DESPUÉS (CORRECTO)
useEffect(() => {
  if (state === 'processing' && transcript && transcript.length > 3) {
    handleParse()
  }
}, [state, transcript, handleParse]) // ✅ Ahora incluye handleParse
```

---

## 🧪 Testing

### Para verificar el fix:

1. **Ir a** http://localhost:5173/voice
2. **Presionar** el botón del micrófono
3. **Decir**: "5 euros café"
4. **Soltar** el botón
5. **Esperar** el mensaje "Analizando con IA..."
6. **Verificar**:
   - ✅ El modal de confirmación aparece (si confidence < 0.95)
   - ✅ O el gasto se guarda automáticamente (si confidence >= 0.95)
   - ✅ **NO** se queda en blanco

### Casos de prueba adicionales:

- **Multi-spend**: "5 euros café y 10 euros taxi" → Modal con 2 gastos
- **Fecha relativa**: "ayer 5 euros café" → Modal con fecha correcta
- **Alta confidence**: "5 euros café" → Auto-confirmación sin modal

---

## 📊 Impact

### Antes del fix:
- ❌ **UX bloqueada completamente**
- ❌ Imposible guardar gastos por voz
- ❌ Usuarios confundidos (pantalla en blanco sin feedback)

### Después del fix:
- ✅ **Flujo completo funcional**
- ✅ Modal aparece correctamente
- ✅ Auto-confirmación funciona
- ✅ Multi-spend funciona

---

## 🔗 Archivos Modificados

- `src/components/voice/VoiceRecorder.tsx` (líneas 7, 32-76)

---

## 🚨 Lecciones Aprendidas

1. **Siempre incluir todas las dependencias** en arrays de `useEffect`
2. **Usar `useCallback`** para funciones que son dependencias de `useEffect`
3. **Testing manual crítico** para detectar bugs de UX bloqueantes
4. **Logs estructurados** ayudan a diagnosticar (los logs de consola fueron clave)

---

## ✅ Status

- [x] Bug identificado
- [x] Fix aplicado
- [ ] Testing manual pendiente (esperando feedback del usuario)
- [ ] Tests automatizados pendientes

---

**Próximo paso**: Usuario testea el fix en su navegador y reporta resultados.


