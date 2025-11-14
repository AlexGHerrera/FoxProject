# 🐛 Error: "Failed to upsert settings"

## 📋 Problema

Al intentar guardar la configuración de presupuesto mensual en la página de Ajustes, aparece un error:

```
❌ Failed to upsert settings
```

## 🔍 Causa Raíz

El error ocurre porque **Row Level Security (RLS) está habilitado** en la tabla `settings` de Supabase. Las políticas RLS requieren que exista un usuario autenticado (`auth.uid()`), pero la app actualmente usa un `DEMO_USER_ID` fijo sin autenticación real de Supabase Auth.

### Política que bloquea:
```sql
-- En SCHEMA.sql
create policy "settings_modify" on public.settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```

Como no hay sesión autenticada, `auth.uid()` retorna `NULL`, y la política rechaza cualquier INSERT/UPDATE.

## ✅ Solución Rápida (Desarrollo)

### Opción 1: Ejecutar script de deshabilitar RLS

1. Abrir **Supabase SQL Editor**
2. Ejecutar el archivo `database/TEMP-DISABLE-RLS.sql` completo:

```sql
ALTER TABLE public.spends DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage DISABLE ROW LEVEL SECURITY;
```

### Opción 2: Comando directo

Solo para la tabla `settings`:

```sql
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
```

## 🧪 Verificar que funcionó

### 1. Verificar estado de RLS
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'settings';
```

Debe mostrar: `rowsecurity = false`

### 2. Probar en la app
1. Ir a página de Ajustes
2. Hacer clic en "Presupuesto mensual"
3. Ingresar un valor (ej: 1500)
4. Hacer clic en "Guardar"
5. ✅ Debe mostrar: "Configuración guardada correctamente"

## ⚠️ Importante

- **Esta solución es SOLO para desarrollo**
- **NO deshabilitar RLS en producción**
- Cuando implementemos Supabase Auth real:
  - Re-habilitaremos RLS
  - Los usuarios autenticados funcionarán correctamente
  - Las políticas protegerán automáticamente los datos por usuario

## 🔐 Re-habilitar RLS (futuro)

Cuando tengamos autenticación real:

```sql
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
```

Las políticas existentes funcionarán automáticamente con usuarios autenticados.

## 📚 Referencias

- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/auth/row-level-security)
- `database/README.md` - Documentación completa de setup
- `database/TEMP-DISABLE-RLS.sql` - Script de deshabilitar RLS

---

**Fecha**: Noviembre 2025  
**Estado**: ✅ Documentado + Script actualizado

