# Problema conocido: Indicador de micrófono en Safari

## El problema

Safari (macOS e iOS) tiene un **bug conocido** donde el indicador de micrófono en la barra del navegador puede permanecer visible incluso después de que la aplicación ha detenido el reconocimiento de voz y ha liberado el micrófono.

### ¿Afecta la funcionalidad?

**No.** Aunque el indicador visual permanece activo, el micrófono **NO está realmente grabando**. Es un problema cosmético de Safari/WebKit que no afecta:

- ✅ La privacidad (el mic está realmente cerrado)
- ✅ La funcionalidad de la app
- ✅ El rendimiento del dispositivo
- ✅ El consumo de batería

### ¿Por qué ocurre?

Safari implementa Web Speech API de forma diferente a Chrome/Edge. El navegador mantiene el indicador visual activo por más tiempo del necesario, incluso cuando la aplicación ha llamado correctamente a `abort()` y ha liberado todos los recursos.

## Soluciones temporales

Mientras Apple soluciona este bug de WebKit, puedes probar:

### 1. Recargar la pestaña
- **macOS**: `Cmd + R`
- **iOS**: Pull to refresh
- Esto fuerza a Safari a limpiar el estado del micrófono

### 2. Cerrar y reabrir la pestaña
- En Safari, cierra la pestaña completamente
- Vuelve a abrir localhost en una nueva pestaña

### 3. Usar el modo de entrada manual
- Si el indicador te molesta, puedes usar "✏️ O escribe manualmente"
- No usa el micrófono en absoluto

### 4. Usar Chrome/Edge (macOS)
- En macOS, Chrome y Edge no tienen este problema
- La app funciona perfectamente en estos navegadores

## Estado de implementación

Hemos implementado **todas** las soluciones documentadas para este problema:

- ✅ Llamar a `abort()` en vez de `stop()`
- ✅ Limpiar todos los event handlers antes de abort
- ✅ Usar una instancia global única de SpeechRecognition
- ✅ Detener el reconocimiento antes de procesar el resultado
- ✅ Cleanup en eventos `audioend`, `onend`, etc.
- ✅ Delays para dar tiempo a Safari a procesar

**El problema persiste** porque es un bug del navegador, no de nuestra implementación.

## Referencias

- [Safari Speech Recognition issues - Apple Discussions](https://discussions.apple.com/thread/255492924)
- [Taming the Web Speech API - Medium](https://webreflection.medium.com/taming-the-web-speech-api-ef64f5a245e1)
- [WebKit Bug Tracker - SpeechRecognition](https://bugs.webkit.org)

## Para desarrolladores

Si encuentras una solución que funcione, por favor contribuye:

1. Fork el repo
2. Prueba tu solución en Safari (macOS e iOS)
3. Abre un PR con:
   - Descripción del cambio
   - Por qué funciona
   - Prueba en video de Safari

---

**Última actualización**: Octubre 2025

