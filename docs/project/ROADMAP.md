# 🦊 FOXY — Roadmap de Desarrollo (MVP por Voz)

> Aplicación financiera gamificada centrada en el registro de gastos por voz.  
> Usuario habla → IA interpreta → Foxy responde → gasto registrado.  
> Estilo moderno, tono lúdico, enfoque productivo.

---

## 🧩 FASE 0 – Preparación del entorno

### 0.1 Configuración inicial
1. Instalar **Node.js** y **npm** actualizados.
2. Crear carpeta raíz del proyecto `foxy-app`.
3. Inicializar proyecto React con Vite:
   ```bash
   npm create vite@latest foxy-app -- --template react
   ```
4. Instalar dependencias:
   ```bash
   npm install react-router-dom tailwindcss @supabase/supabase-js
   ```
5. Inicializar Tailwind:
   ```bash
   npx tailwindcss init -p
   ```
6. Crear estructura:
   ```
   src/
   ├── components/
   ├── hooks/
   ├── pages/
   ├── services/
   ├── assets/
   ├── App.jsx
   └── main.jsx
   ```

### 0.2 Stack
- Frontend: React + Vite + Tailwind
- Backend: Supabase (DB + auth + edge)
- IA: DeepSeek / OpenAI mini (parser + respuestas)
- Voz: Web Speech API (navegador) + fallback Whisper API
- Hosting: Vercel
- Animación: Lottie o Rive

---

## 🎙️ FASE 1 – Núcleo: voz → IA → gasto

### 1.1 Captura de voz
1. Crear hook `useSpeechRecognition.js`.
2. Implementar **Web Speech API** (start / stop / transcript).
3. Crear botón circular “🎤 Hablar con Foxy”.
4. Mostrar animación de grabación (onda o pulsación).

### 1.2 Procesamiento del texto
1. Al detener grabación, enviar texto a `/api/parse-spend`.
2. Backend usa modelo IA para clasificar:
   - Monto (€)
   - Categoría
   - Descripción
3. Devolver JSON:
   ```json
   { "amount": 3.5, "category": "Café", "description": "Café Starbucks" }
   ```

### 1.3 Confirmación y guardado
1. Foxy responde: “He anotado un café de 3,50 €. ¿Confirmo?”
2. Botones Confirmar / Cancelar.
3. Si confirma → guardar en Supabase → tabla `spends`.

---

## 💾 FASE 2 – Backend y base de datos

### 2.1 Configurar Supabase
1. Crear proyecto en [supabase.io](https://supabase.io).
2. Crear tablas:
   - `users`: id, email
   - `spends`: id, user_id, amount, category, description, date
   - `settings`: user_id, monthly_limit, plan
3. Guardar `SUPABASE_URL` y `SUPABASE_ANON_KEY` en `.env.local`.

### 2.2 Endpoint `/parse-spend`
1. Crear función edge en Supabase.
2. Recibir texto libre → procesar con IA.
3. Retornar JSON con monto, categoría y descripción.
4. Si falla, usar regex básica para detectar números y palabras clave.

### 2.3 Lógica del límite mensual
1. Calcular gasto total del mes.  
2. Retornar `%` sobre límite.  
3. Guardar progreso del usuario.

---

## 🦊 FASE 3 – Foxy IA y respuestas naturales

### 3.1 Interacción básica
1. Crear componente `VoiceRecorder.jsx`.
2. Flujo: usuario habla → texto → IA → Foxy responde → guardar gasto.
3. Mostrar texto del usuario transcrito.

### 3.2 Respuestas de Foxy
1. Crear microplantillas de respuesta (OK / advertencia / humor).
2. Generar texto con IA y cachear respuestas.
3. Ejemplo:
   - “Perfecto, otro café ☕ anotado.”
   - “Vas fuerte en ocio este mes 😅.”

### 3.3 Voz sintética (opcional)
1. Integrar Text-to-Speech nativo (`window.speechSynthesis`).
2. Leer respuestas de Foxy en voz alta.
3. Añadir toggle “Modo voz activado”.

---

## 🎨 FASE 4 – Mascota Foxy (animación y estados)

### 4.1 Integración visual
1. Crear componente `FoxyAnimated.jsx`.
2. Integrar **Rive** o **Lottie**.
3. Estados:
   - `idle`: esperando entrada
   - `listening`: grabando
   - `processing`: analizando
   - `happy`: gasto confirmado
   - `alert`: exceso de gasto

### 4.2 Control dinámico
1. Hook `useFoxyState` para manejar eventos (`listening`, `success`, `alert`).
2. Cambiar animación según el estado.
3. Sincronizar con respuestas de voz.

---

## 📊 FASE 5 – Dashboard básico

### 5.1 Resumen mensual
1. Mostrar:
   - Total gastado
   - Límite mensual
   - % de uso
2. Barra de progreso animada con colores:
   - 🟢 <70%
   - 🟡 70–89%
   - 🔴 >90%
3. Mensaje contextual:  
   “Llevas el 62 % del límite, ¡bien hecho!”

### 5.2 Historial
1. Mostrar lista de gastos del mes.
2. Filtro por categoría.
3. Implementar búsqueda por voz:
   - “Muéstrame los gastos de comida.”

---

## 🧠 FASE 6 – IA adaptativa

### 6.1 Mejorar parser IA
1. Ajustar prompt para montos y categorías.
2. Guardar ejemplos de usuario en tabla `training_examples`.

### 6.2 Aprendizaje personalizado
1. Asociar patrones recurrentes (ej. “Café” = bebida).
2. Permitir corrección manual del usuario.
3. Registrar feedback para mejorar precisión.

---

## 💬 FASE 7 – Feedback y gamificación

### 7.1 Score mensual
1. Calcular puntuación = 100 - (gasto / límite * 100).
2. Mostrar “Nivel Ahorrista X”.

### 7.2 Reacciones de Foxy
1. Animación según progreso.
2. Frases motivadoras automáticas.

### 7.3 Insignias
1. “Primer gasto por voz”.
2. “Semana perfecta”.
3. “Mes sin pasarte del límite”.

---

## 💰 FASE 8 – Monetización

### 8.1 Estructura de planes
- **Free:** voz + registro + límite.  
- **Tier 1 (€1/mes):** gastos recurrentes + tabs rápidos.  
- **Tier 2 (€3–5/mes):** IA avanzada + dashboard completo.

### 8.2 Stripe integration
1. Crear cuenta test.
2. Implementar checkout modal.
3. Guardar plan del usuario en Supabase.

---

## 🧪 FASE 9 – Testing y despliegue

### 9.1 Pruebas técnicas
1. Test de voz en Chrome, Safari y móvil.
2. Comprobar latencia IA.
3. Validar estados de Foxy.

### 9.2 Beta privada
1. Reunir 10–15 testers.
2. Recoger feedback con Google Form.
3. Medir:
   - Nº de gastos por voz
   - % de error IA
   - Satisfacción

### 9.3 Deploy
1. Subir a **Vercel**.
2. Conectar variables `.env`.
3. Crear dominio temporal `foxy.vercel.app`.

---

## 🚀 FASE 10 – Expansiones futuras

| Módulo | Descripción |
|--------|--------------|
| 📊 **Dashboard avanzado** | Gráficas comparativas e histórico. |
| 🧩 **Plan de ahorro IA** | Foxy sugiere metas personalizadas. |
| 💬 **Conversación con Foxy** | “¿Cómo voy este mes?”, “Recomiéndame un ahorro.” |
| 🎮 **Personalización** | Skins y atuendos desbloqueables para Foxy. |
| 🌍 **Idiomas** | Español, inglés y portugués. |
| 📱 **App nativa** | Exportar a PWA / Capacitor. |

---

## ✅ Próximos pasos inmediatos
1. Crear entorno (fase 0).
2. Implementar captura de voz (fase 1.1).
3. Conectar con IA parser (fase 1.2).
4. Confirmar gastos con voz (fase 1.3).
5. Mostrar feedback visual básico (fase 4 + 5).

---

**Autor:** Alex G. Herrera  
**Versión:** MVP Roadmap v2 (voz como núcleo)  
**Fecha:** Octubre 2025
