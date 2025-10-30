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

### **[TEMP-DISABLE-RLS.sql](./TEMP-DISABLE-RLS.sql)**
Script temporal para deshabilitar RLS (Row Level Security). 

⚠️ **ADVERTENCIA**: Solo usar en desarrollo, nunca en producción.

**Cuándo usar**: Para debugging o testing de queries sin políticas RLS.

## 🚀 Uso

### Setup inicial

1. Crear proyecto en [Supabase](https://supabase.com)
2. Ir al SQL Editor
3. Ejecutar `SCHEMA.sql` completo
4. (Opcional) Ejecutar `DEMO-USER.sql` para datos de prueba

### Desarrollo

```bash
# Ejecutar schema en Supabase SQL Editor
# Copiar y pegar contenido de SCHEMA.sql

# Restaurar datos demo
# Ejecutar RESTORE-DEMO-DATA.sql en SQL Editor
```

## 📝 Notas

- Todos los scripts son idempotentes (pueden ejecutarse múltiples veces)
- Los scripts usan `IF NOT EXISTS` y `DROP IF EXISTS` cuando es apropiado
- Las políticas RLS están habilitadas por defecto (seguridad)

---

**Última actualización**: Octubre 2025  
**Mantenedor**: Alex G. Herrera
