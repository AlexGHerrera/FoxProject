# ⚡ MCP Supabase - Inicio Rápido

> 5 minutos para conectar Supabase con Cursor

---

## 🎯 Pasos Rápidos

### 1️⃣ Obtener Credenciales (2 min)

#### Token de Acceso:
1. Ve a [app.supabase.com/account/tokens](https://app.supabase.com/account/tokens)
2. **Generate new token**
3. Nombre: `cursor-mcp`
4. **Copia el token** (solo se muestra una vez)

#### Project Reference:
1. Abre tu proyecto en Supabase
2. Mira la URL: `https://app.supabase.com/project/[ESTE_ES_TU_PROJECT_REF]`
3. O ve a: **Project Settings** → **General** → **Reference ID**

---

### 2️⃣ Configurar Cursor (2 min)

#### Edita `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbat_XXXXXXXXXXXXXXXX",
        "SUPABASE_PROJECT_REF": "abcdefghijklmnop",
        "SUPABASE_DB_PASSWORD": ""
      },
      "params": {
        "features": "docs,database,debugging,development,functions"
      }
    }
  }
}
```

**⚠️ Reemplaza**:
- `SUPABASE_ACCESS_TOKEN`: tu token del paso 1
- `SUPABASE_PROJECT_REF`: tu project ref del paso 1

---

### 3️⃣ Reiniciar Cursor (30 seg)

1. **Guarda** `.cursor/mcp.json`
2. **Cierra** Cursor completamente
3. **Abre** de nuevo el proyecto

---

### 4️⃣ Probar Conexión (30 seg)

En el chat de Cursor, escribe:

```
Lista las tablas de mi base de datos
```

**✅ Respuesta esperada**:
```
Tengo acceso a estas tablas:
- spends
- settings
- notification_logs
- training_examples
- api_usage
- user_roles
- feedback
```

---

## 🎨 ¿Qué puedes hacer ahora?

### Consultar datos:
```
¿Cuántos gastos hay en la tabla spends?
```

### Generar tipos:
```
Genera los tipos TypeScript de mi schema
```

### Ver logs:
```
Muestra los logs de postgres de la última hora
```

### Crear migraciones:
```
Crea una migración para agregar un campo "is_recurring" a spends
```

### Buscar docs:
```
¿Cómo funcionan los RLS policies en Supabase?
```

---

## ⚠️ Seguridad

### ✅ Hacer:
- Revisar cada comando antes de ejecutar
- Mantener "Manual approval" activado en Settings → MCP
- Usar solo en proyectos de desarrollo

### ❌ NO hacer:
- Conectar a producción
- Deshabilitar confirmación manual
- Compartir tu token de acceso

---

## 🐛 Problemas Comunes

### "MCP server not found"
→ Reinicia Cursor completamente

### "Authentication failed"
→ Verifica tu token en [Supabase → Account → Tokens](https://app.supabase.com/account/tokens)

### "Project not found"
→ Comprueba tu `PROJECT_REF` en Project Settings

---

## 📚 Más Información

- [Guía completa](./MCP-SETUP-GUIDE.md)
- [Repo oficial](https://github.com/supabase-community/supabase-mcp)
- [Docs MCP](https://modelcontextprotocol.io)

---

🦊 **¡Listo!** Ya puedes usar Cursor con Supabase.

