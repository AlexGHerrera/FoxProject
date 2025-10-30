# 🧪 Guía de Testing - Features Oct 30

> Testear multi-spend parsing + fechas relativas

---

## 🚀 Preparación

1. **Servidor corriendo**: `npm run dev` (debería estar en http://localhost:5173)
2. **Abrir navegador**: Chrome/Edge (mejor soporte Web Speech API)
3. **Abrir consola**: F12 o Cmd+Option+I
4. **Filtrar logs**: Buscar `[DeepSeekProvider]`, `[parseSpend]`, `[useSpendSubmit]`

---

## 🎯 Test 1: Multi-Spend Simple (2 gastos)

### Input de voz:
```
"5 euros de café y 10 euros de taxi"
```

### Resultado esperado:
- ✅ Modal muestra **2 gastos** separados
- ✅ Gasto 1: 5€ | Categoría: Café | Merchant: [detectado o vacío]
- ✅ Gasto 2: 10€ | Categoría: Transporte | Merchant: [detectado o vacío]
- ✅ Botón dice "Confirmar todos (2)"
- ✅ Al confirmar, se crean **2 entradas** en el dashboard

### Logs a verificar:
```javascript
[DeepSeekProvider] Parse successful ✅
// Response debe tener array de 2 elementos
[useSpendSubmit] Submitting multiple spends: 2
```

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 🎯 Test 2: Multi-Spend Complejo (3 gastos)

### Input de voz:
```
"3 euros coca cola, 2 euros chicles y 5 euros parking"
```

### Resultado esperado:
- ✅ Modal muestra **3 gastos** separados
- ✅ Gasto 1: 3€ | Categoría: Supermercado | Merchant: [detectado]
- ✅ Gasto 2: 2€ | Categoría: Supermercado | Merchant: [detectado]
- ✅ Gasto 3: 5€ | Categoría: Transporte | Merchant: parking
- ✅ Botón dice "Confirmar todos (3)"
- ✅ Al confirmar, se crean **3 entradas**

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 🎯 Test 3: Fecha Relativa - "ayer"

### Input de voz:
```
"ayer gasté 5 euros en café"
```

### Resultado esperado:
- ✅ Modal muestra 1 gasto
- ✅ Monto: 5€ | Categoría: Café
- ✅ **Fecha**: Debe ser la fecha de ayer (verificar en dashboard después de guardar)

### Cómo verificar:
1. Confirmar el gasto
2. Ir al dashboard
3. Buscar el gasto de 5€ café
4. Verificar que la fecha es **ayer** (día anterior a hoy)

### Logs a verificar:
```javascript
// En consola, buscar:
date: "ayer"
// Y luego:
[useSpendSubmit] Parsed date: [Date de ayer]
```

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 🎯 Test 4: Fecha Relativa - "el martes"

### Input de voz:
```
"el martes 10 euros taxi"
```

### Resultado esperado:
- ✅ Modal muestra 1 gasto
- ✅ Monto: 10€ | Categoría: Transporte
- ✅ **Fecha**: Debe ser el martes más reciente

### Cómo verificar:
1. Confirmar el gasto
2. Ir al dashboard
3. Verificar que la fecha es el **último martes** que pasó

**Nota**: Si hoy es martes, debería ser el martes de la semana pasada.

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 🎯 Test 5: Fecha Relativa - "hace 3 días"

### Input de voz:
```
"hace tres días 15 euros supermercado"
```

### Resultado esperado:
- ✅ Modal muestra 1 gasto
- ✅ Monto: 15€ | Categoría: Supermercado
- ✅ **Fecha**: Debe ser hace exactamente 3 días

### Cómo verificar:
1. Confirmar el gasto
2. Ir al dashboard
3. Calcular: Hoy - 3 días = ¿coincide?

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 🎯 Test 6: Sin Fecha Mencionada

### Input de voz:
```
"20 euros comida en el restaurante con tarjeta"
```

### Resultado esperado:
- ✅ Modal muestra 1 gasto
- ✅ Monto: 20€ | Categoría: Comida fuera | Pago: tarjeta
- ✅ **Fecha**: Debe ser **hoy** (fecha actual)

### Cómo verificar:
1. Confirmar el gasto
2. Ir al dashboard
3. Verificar que la fecha es la de **hoy**

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 🎯 Test 7: Multi-Spend + Fecha Combinado

### Input de voz:
```
"ayer 3 euros café y 5 euros bocadillo"
```

### Resultado esperado:
- ✅ Modal muestra **2 gastos**
- ✅ Gasto 1: 3€ | Café
- ✅ Gasto 2: 5€ | Comida fuera / Supermercado
- ✅ **Ambos** deben tener fecha de **ayer**

### Cómo verificar:
1. Confirmar ambos gastos
2. Ir al dashboard
3. Verificar que **ambos** tienen fecha de ayer

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 🎯 Test 8: Auto-Confirmación (confidence ≥ 0.95)

### Input de voz (muy claro):
```
"5 euros café"
```

### Resultado esperado:
- ✅ **NO aparece modal** (auto-confirmado)
- ✅ Toast de éxito aparece directamente
- ✅ Gasto aparece en dashboard inmediatamente
- ✅ Se cierra el grabador de voz automáticamente

### Logs a verificar:
```javascript
[parseSpend] Confidence: 0.95+ (auto-confirm threshold)
[useSpendSubmit] Auto-confirming with high confidence
```

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 🎯 Test 9: Edición Individual en Modal Multi-Spend

### Input de voz:
```
"5 euros café y 10 euros taxi"
```

### Acción:
1. Modal aparece con 2 gastos
2. **Editar** el primer gasto (café):
   - Cambiar monto a 6€
   - Cambiar categoría a "Comida fuera"
3. Dejar el segundo sin cambios
4. Confirmar todos

### Resultado esperado:
- ✅ Se guardan **2 gastos**
- ✅ Gasto 1: **6€** | Categoría: **Comida fuera** (editado)
- ✅ Gasto 2: 10€ | Categoría: Transporte (sin editar)

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 🎯 Test 10: Latencia API

### Input de voz:
```
"6 euros vermut y frutos secos en la bohem con tarjeta"
```

### Métrica a medir:
1. En consola, buscar:
```javascript
[DeepSeekProvider] Request latency: XXXXms
```

### Resultado esperado:
- ✅ Latencia: **< 2000ms** (objetivo optimizado)
- 🔄 Si es > 2000ms: anotar valor exacto

### Valor obtenido:
- **Latencia**: _______ ms
- **Target**: < 2000ms
- **Status**: ✅ PASS / ⚠️ Mejorable / ❌ FAIL

---

## 🎯 Test 11: Fallback a MockAI (opcional)

### Preparación:
1. En `DeepSeekProvider.ts`, cambiar temporalmente la API key a una inválida
2. O desconectar internet temporalmente

### Input de voz:
```
"5 euros café"
```

### Resultado esperado:
- ✅ Error en DeepSeek capturado
- ✅ Aparece log: `[useSpendSubmit] Primary AI provider failed, trying fallback...`
- ✅ MockAI procesa el texto
- ✅ Gasto se guarda correctamente (aunque con MockAI)
- ✅ **App no se rompe**

### ✅ / ❌ Resultado:
- [ ] PASS
- [ ] FAIL (anotar error)

---

## 📊 Resumen de Resultados

| Test | Feature | Status | Notas |
|------|---------|--------|-------|
| 1 | Multi-spend (2) | ⬜ | |
| 2 | Multi-spend (3) | ⬜ | |
| 3 | Fecha "ayer" | ⬜ | |
| 4 | Fecha "el martes" | ⬜ | |
| 5 | Fecha "hace X días" | ⬜ | |
| 6 | Sin fecha (hoy) | ⬜ | |
| 7 | Multi + fecha | ⬜ | |
| 8 | Auto-confirm | ⬜ | |
| 9 | Edición individual | ⬜ | |
| 10 | Latencia API | ⬜ | _____ms |
| 11 | Fallback MockAI | ⬜ | |

**Total PASS**: ___ / 11  
**Total FAIL**: ___ / 11

---

## 🐛 Bugs Encontrados

### Bug #1:
**Descripción**: 

**Pasos para reproducir**:
1. 
2. 
3. 

**Comportamiento esperado**:

**Comportamiento actual**:

**Logs relevantes**:
```
```

---

### Bug #2:
(Agregar si hay más bugs)

---

## ✅ Siguiente Paso

Después de completar estos tests:

1. **Si todo PASS**: 
   - ✅ Features listas para commit
   - Continuar con modo continuous (TODO pendiente)

2. **Si hay FAILS**:
   - 🔧 Anotar bugs en GitHub Issues o docs/project/QUICK-RESUME.md
   - Priorizar fixes antes de continuar

3. **Latencia > 2s**:
   - 📊 Evaluar si es aceptable (desarrollo local puede ser más lento)
   - Considerar optimizaciones adicionales

---

**Fecha de testing**: Oct 30, 2025  
**Testeado por**: Alex G. Herrera  
**Branch**: feat/mejorar-dashboard-voz + cambios multi-spend


