# 🦊 FOXY — SPEC (MVP voz‑first)

> Registro de gastos por voz con confirmación/auto‑confirm y feedback de Foxy. PWA (móvil y desktop), fondo claro por defecto y dark mode por sistema.

## 0) Principios
- **Voz primero**: siempre visibles botón 🎤 y estado “escuchando / procesando / guardado”.
- **Fricción mínima**: 1 gesto (mantener) o 1 tap (toggle) para grabar; auto‑confirm con “Deshacer 5 s”.
- **Privacidad**: nunca se guarda audio; solo texto transcrito. Se indica en onboarding.
- **Claridad**: 8–10 categorías base; importes en céntimos; zona horaria del usuario.

## 1) Onboarding (Día 1)
**Objetivo:** activar micrófono, fijar límite y registrar 1 gasto de prueba.
**Criterios de aceptación**
- Muestra 3 pasos (permiso mic, límite mensual, prueba de voz).
- Ejemplos de frases: “Café 1 con 80”, “Taxi 6 euros”, “Supermercado 35”.
- Si no hay permiso de micrófono: muestra “tecleo rápido” en su lugar.
- Al finalizar, muestra Dashboard con barra calculada.

## 2) Dashboard (Home)
**Elementos**
- Barra de progreso (% de límite mensual).
- Texto “Te quedan X € este mes”.
- Últimos 4–5 gastos.
- Botón principal 🎤 (PTT y toggle).
- Foxy animado (idle / listening / processing / happy / alert).
**Criterios**
- Cambio de color: <70% verde, 70–89% ámbar, >90% rojo.
- Tap en “Ver todos” abre **Gastos** (pestaña).

## 3) Registro por voz (pantalla/estado)
**Flujo**
1. Usuario pulsa 🎤 (PTT o toggle).
2. Estado “🎙️ Estoy escuchando…”, ondas y temporizador.
3. Transcripción en vivo. Al soltar/parar: se envía a `/api/parse-spend`.
4. Respuesta JSON → decisión:
   - `confidence >= 0.8` → **auto‑confirm + toast Deshacer 5 s** → guardar.
   - `confidence < 0.8` → **modal de confirmación** con gasto parseado.
**Errores manejados**
- Silencio o ruido: mostrar sugerencia y botón “teclear rápido”.
- Timeout > 2 s en IA: “Procesando…” con animación “pensando”.

## 4) Confirmación (modal)
**Contenido**
- Descripción / comercio (opcional).
- Importe (editable), categoría (select 8–10), fecha (hoy, editable).
- Botones: Cancelar / Confirmar.
**Criterios**
- Confirmar → guarda en `spends`; recalcula barra; Foxy “happy” 1.2 s.
- Cambios del usuario generan **ejemplo de entrenamiento** en `training_examples`.

## 5) Gastos (lista completa)
**Contenido**
- Por defecto: mes corriente del usuario.
- Tarjetas horizontales (nombre, categoría, importe, fecha).
- Buscador y filtros (botón flotante “⚙️”).

## 6) Filtros (panel)
**Controles**
- Rango rápido: Hoy / Esta semana / Mes / Personalizado.
- Categorías (chips multiselección).
- Método de pago: Efectivo / Tarjeta.
- Ordenar: Más reciente / Mayor gasto.
**Criterios**
- “Aplicar” actualiza la lista y persiste en URL (query params).

## 7) Configuración
**Campos**
- Límite mensual (euros con coma o punto).
- Plan: Free / Tier1 / Tier2 (solo UI inicial).
- Exportar CSV (rango de fechas obligatorio).
**Criterios**
- CSV con encabezados en ES y `;` como separador; codificación UTF‑8.

## 8) Estados vacíos y errores
- Sin gastos → tarjetas fantasma + CTA “Pruébalo por voz”.
- Error de red → reintento + guardado local temporal (IndexedDB) y sync al reconectar.
- Sin STT → caer a “tecleo rápido” automáticamente.

## 9) Performance / calidad
- **LCP < 2.0 s** en móvil (3G rápido).
- **Tiempo voz→guardado** (auto‑confirm) medio < **1.2 s**.
- Bundle inicial < 120 KB gz (sin librerías pesadas).
- PWA: manifest + service worker (cache shell + reintento de POST).

## 10) Accesibilidad
- Botones con tamaño mínimo 44×44 px.
- Alto contraste y foco visible; soporte teclado en desktop.
- TTS (lectura) opcional en respuestas de Foxy.

## 11) Métricas (evento → propiedad)
- `voice_start`, `voice_stop`, `stt_text_len`.
- `parse_ok`, `parse_low_confidence`.
- `spend_saved`, `undo_used`.
- `filters_open`, `filters_apply`.
- `csv_export`.
- `latency_ms_voice_to_save`.

---

## API internas (MVP)

### POST `/api/parse-spend`
**body**: `{ text: string, locale?: "es-ES" }`  
**ok**: `{
  "amount_eur": 3.5,
  "category": "Café",
  "merchant": "Starbucks",
  "note": "",
  "confidence": 0.92
}`  
**err**: `{"error":"unparseable"}`

### POST `/api/spends`
**body**: `{ amount_cents, category, merchant?, note?, paid_with?, ts? }`  
**ok**: `{ id }`

---

## Categorías v1
- Café / Bebidas rápidas
- Comida fuera
- Supermercado
- Transporte
- Ocio
- Hogar
- Salud
- Compras
- Otros