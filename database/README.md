# 🗄️ Scripts de Base de Datos

Este directorio contiene los scripts SQL para la base de datos del proyecto Foxy.

## 📁 Archivos

### **[SCHEMA.sql](./SCHEMA.sql)**
Schema principal de la base de datos. Incluye:

- Tablas: `spends`, `settings`, `training_examples`, `api_usage`
- Índices optimizados para queries comunes
- Políticas RLS (Row Level Security) por usuario
- Funciones auxiliares si las hay

**Cuándo usar**: Al crear un nuevo proyecto en Supabase o al aplicar migraciones.

### **[DEMO-USER.sql](./DEMO-USER.sql)**
Script para crear un usuario de demostración con datos de prueba.

**Cuándo usar**: Para desarrollo local y testing.

### **[RESTORE-DEMO-DATA.sql](./RESTORE-DEMO-DATA.sql)**
Script para restaurar datos de demostración después de limpiar la base de datos.

**Cuándo usar**: Si necesitas resetear los datos de prueba después de testing.

### **[TEMP-DISABLE-RLS.sql](./TEMP-DISABLE-RLS.sql)** ⚠️
Script temporal para deshabilitar RLS (Row Level Security). 

⚠️ **ADVERTENCIA**: Solo usar en desarrollo, nunca en producción.

**Cuándo usar**: Para debugging o testing de queries sin políticas RLS.

---

## 🚀 Setup Inicial

### 1. Crear proyecto en Supabase
1. Ir a [Supabase](https://supabase.com)
2. Crear nuevo proyecto
3. Copiar las credenciales (URL + anon key)

### 2. Ejecutar scripts (en orden)
En el SQL Editor de Supabase:

```sql
-- 1️⃣ Crear el schema
-- Copiar y pegar todo SCHEMA.sql

-- 2️⃣ ⚠️ IMPORTANTE: Deshabilitar RLS para desarrollo sin auth
-- Copiar y pegar todo TEMP-DISABLE-RLS.sql

-- 3️⃣ Crear usuario demo con datos
-- Copiar y pegar todo DEMO-USER.sql
```

---

## ⚠️ PROBLEMA COMÚN: "Failed to upsert settings"

### Síntoma
Al guardar configuración en la app aparece el error:
```
Failed to upsert settings
```

### Causa
El schema tiene **RLS (Row Level Security) habilitado** con políticas que requieren `auth.uid()` (usuario autenticado de Supabase Auth). Como estamos en desarrollo **sin autenticación real**, todos los INSERT/UPDATE/DELETE fallan porque no hay un `auth.uid()` válido.

### Solución ✅

**Ejecutar este SQL en Supabase SQL Editor**:

```sql
-- Deshabilitar RLS en todas las tablas (SOLO desarrollo)
ALTER TABLE public.spends DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage DISABLE ROW LEVEL SECURITY;
```

O ejecutar el archivo `TEMP-DISABLE-RLS.sql` completo.

### Verificar que funcionó

```sql
-- Debe mostrar rowsecurity = false para todas las tablas
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('spends', 'settings', 'training_examples', 'api_usage');
```

### ⚠️ NO hacer esto en producción

- RLS deshabilitado = cualquier cliente puede leer/escribir todos los datos
- Solo OK en desarrollo local con datos demo
- Cuando implementemos Supabase Auth, **re-habilitaremos RLS** y las políticas protegerán automáticamente los datos por usuario

---

## 🔧 Comandos Útiles

### Ver datos del usuario demo
```sql
SELECT * FROM public.spends 
WHERE user_id = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a' 
ORDER BY ts DESC;

SELECT * FROM public.settings 
WHERE user_id = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a';
```

### Limpiar datos del usuario demo
```sql
DELETE FROM public.spends 
WHERE user_id = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a';

DELETE FROM public.settings 
WHERE user_id = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a';
```

### Resetear datos demo
```sql
-- Ejecutar RESTORE-DEMO-DATA.sql completo
```

### Ver estado de RLS
```sql
SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE WHEN rowsecurity THEN '🔒 Protegido' ELSE '⚠️ Desprotegido' END as estado
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## 🔐 Re-habilitar RLS (cuando tengamos auth)

Cuando implementemos Supabase Auth real:

```sql
-- Re-habilitar RLS
ALTER TABLE public.spends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Las políticas existentes funcionarán automáticamente
-- porque usan auth.uid() que será válido con usuarios autenticados
```

---

## 📝 Notas Importantes

- **UUID del usuario demo**: `d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a`
  - Debe coincidir con `DEMO_USER_ID` en `src/config/constants.ts`
- Todos los scripts son **idempotentes** (pueden ejecutarse múltiples veces)
- Las políticas RLS usan `auth.uid()` que retorna el ID del usuario autenticado
- Sin auth real, `auth.uid()` retorna `NULL` → todas las políticas fallan

---

## 🎯 Checklist de Setup

- [ ] ✅ Ejecutar `SCHEMA.sql` en Supabase SQL Editor
- [ ] ✅ Ejecutar `TEMP-DISABLE-RLS.sql` (CRÍTICO para que funcione)
- [ ] ✅ Ejecutar `DEMO-USER.sql`
- [ ] ✅ Verificar que RLS está deshabilitado con query de verificación
- [ ] ✅ Probar guardar un gasto en la app
- [ ] ✅ Probar guardar configuración de presupuesto

---

**Última actualización**: Noviembre 2025  
**Mantenedor**: Alex G. Herrera
