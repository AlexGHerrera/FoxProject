# 🔧 MCP Troubleshooting - Solución de Problemas

> Guía paso a paso para resolver problemas comunes con el servidor MCP de Supabase

---

## 📋 Checklist de Verificación

Antes de intentar solucionar un problema, verifica:

- [ ] ✅ `.cursor/mcp.json` existe y está bien formateado (JSON válido)
- [ ] ✅ `SUPABASE_ACCESS_TOKEN` tiene formato `sbat_...`
- [ ] ✅ `SUPABASE_PROJECT_REF` tiene ~16 caracteres alfanuméricos
- [ ] ✅ Cursor está completamente reiniciado (cerrar y abrir)
- [ ] ✅ "Manual approval" está activado en Settings → MCP
- [ ] ✅ Tienes conexión a internet

---

## 🚨 Problemas Comunes

### 1. "MCP server not found" o "Server not responding"

**Síntoma**: Cursor no puede encontrar el servidor MCP

**Causas posibles**:

#### A) Archivo de configuración no existe
```bash
# Verificar si existe
ls -la .cursor/mcp.json

# Si no existe, copiarlo del ejemplo
cp .cursor/mcp.json.example .cursor/mcp.json
```

#### B) JSON inválido
```bash
# Verificar sintaxis JSON
cat .cursor/mcp.json | python -m json.tool
```

**Errores comunes de JSON**:
- Comas finales: `"features": "docs,database",` ❌
- Comillas incorrectas: usar `"` no `'`
- Falta llaves de cierre: `{` sin `}`

#### C) Cursor no recargó la configuración
**Solución**:
1. Guarda `.cursor/mcp.json`
2. Cierra Cursor **completamente** (no solo la ventana)
3. Abre Cursor de nuevo
4. Espera 10-15 segundos antes de probar

---

### 2. "Authentication failed" o "Unauthorized"

**Síntoma**: El servidor responde pero rechaza las credenciales

**Soluciones**:

#### A) Token inválido o expirado

1. Ve a [app.supabase.com/account/tokens](https://app.supabase.com/account/tokens)
2. Verifica que tu token existe y está activo
3. Si no aparece, genera uno nuevo:
   - Click "Generate new token"
   - Nombre: `cursor-mcp`
   - Copia el token (empieza con `sbat_`)
4. Reemplaza en `.cursor/mcp.json`

#### B) Token tiene permisos insuficientes

El token debe tener al menos:
- ✅ Read access to projects
- ✅ Read access to database

Para verificar permisos:
1. Dashboard → Account → Access Tokens
2. Click en tu token → Ver permisos
3. Si faltan, genera un nuevo token con permisos correctos

#### C) Project Reference incorrecto

**Verificar tu PROJECT_REF**:

1. Ve a tu proyecto en Supabase Dashboard
2. Mira la URL: `https://app.supabase.com/project/[PROJECT_REF]`
3. O ve a: Project Settings → General → Reference ID
4. Debe tener ~16 caracteres: `abcdefghijklmnop`

---

### 3. "Project not found" o "Project access denied"

**Síntoma**: Se autentica pero no encuentra el proyecto

**Soluciones**:

#### A) PROJECT_REF incorrecto
- Verifica que no tenga espacios al inicio/final
- No incluyas la URL completa, solo el ID
- Correcto: `abcdefghijklmnop`
- Incorrecto: `https://abcdefghijklmnop.supabase.co`

#### B) Proyecto pausado
1. Dashboard → Project → Ver estado
2. Si está pausado: Click "Resume project"
3. Espera 1-2 minutos a que se active

#### C) No tienes acceso al proyecto
- Verifica que tu cuenta tenga acceso al proyecto
- Dashboard → Project → Settings → General → Members

---

### 4. "Feature not available" o "Method not allowed"

**Síntoma**: Algunas funciones no están disponibles

**Soluciones**:

#### A) Feature no habilitado
Verifica tu configuración en `.cursor/mcp.json`:

```json
"params": {
  "features": "docs,database,debugging,development,functions"
}
```

**Features disponibles**:
- `account` - Gestión de proyectos (deshabilitado por defecto)
- `docs` - Buscar documentación ✅
- `database` - Queries y migraciones ✅
- `debugging` - Logs y advisors ✅
- `development` - API keys, tipos TS ✅
- `functions` - Edge Functions ✅
- `branching` - Branches (requiere plan pago) ⚠️
- `storage` - Storage buckets (opcional)

#### B) Feature requiere plan pago
Algunas features como `branching` requieren un plan Pro o superior.

**Verificar tu plan**:
1. Dashboard → Organization → Billing
2. Si estás en Free tier, actualiza o desactiva la feature

---

### 5. "Rate limit exceeded"

**Síntoma**: "Too many requests" después de varias queries

**Solución**:
- Espera 1-2 minutos
- Reduce la frecuencia de comandos
- Si persiste, puede ser un límite de tu plan de Supabase

---

### 6. "Connection timeout" o "Network error"

**Síntoma**: Timeout al intentar conectar

**Soluciones**:

#### A) Firewall o proxy
- Verifica que puedes acceder a `https://mcp.supabase.com`
- Si estás en una red corporativa, puede estar bloqueado
- Prueba desde otra red (ej. hotspot móvil)

#### B) Problema con Supabase
- Verifica el estado: [status.supabase.com](https://status.supabase.com)
- Si hay incidencias, espera a que se resuelvan

---

### 7. Cursor pide contraseña de base de datos

**Síntoma**: Se solicita `SUPABASE_DB_PASSWORD` pero no la tienes

**Causa**: Solo necesitas la contraseña si usas modo read-only

**Solución A - Sin read-only (recomendado)**:
```json
"env": {
  "SUPABASE_ACCESS_TOKEN": "sbat_...",
  "SUPABASE_PROJECT_REF": "abcd...",
  "SUPABASE_DB_PASSWORD": ""  // ← Dejar vacío
}
```

**Solución B - Obtener contraseña**:
1. Dashboard → Project Settings → Database
2. Section "Connection Info"
3. Copia el password (o resetéalo si no lo recuerdas)

---

### 8. "SSL certificate error"

**Síntoma**: Error de certificado SSL

**Solución**:
- Actualiza Cursor a la última versión
- Verifica la fecha/hora del sistema
- En macOS: `sudo ntpdate -u time.apple.com`

---

## 🧪 Tests de Diagnóstico

### Test 1: Verificar conectividad a Supabase MCP

```bash
# Desde terminal
curl -I https://mcp.supabase.com/mcp
```

**Respuesta esperada**: `HTTP/2 200` o similar

### Test 2: Verificar tu proyecto de Supabase

```bash
# Reemplaza con tu PROJECT_REF
curl -I https://[TU_PROJECT_REF].supabase.co
```

**Respuesta esperada**: `HTTP/2 200` o `301`

### Test 3: Validar JSON de configuración

```bash
cat .cursor/mcp.json | python3 -m json.tool
```

**Respuesta esperada**: JSON formateado sin errores

---

## 📊 Logs de Debugging

### Ver logs de Cursor

**macOS**:
```bash
tail -f ~/Library/Logs/Cursor/main.log
```

**Linux**:
```bash
tail -f ~/.config/Cursor/logs/main.log
```

**Windows**:
```
%APPDATA%\Cursor\logs\main.log
```

Busca líneas con `MCP` o `Supabase` para ver errores específicos.

---

## 🔄 Reset Completo

Si nada funciona, intenta un reset completo:

### Paso 1: Limpiar configuración

```bash
# Backup actual
cp .cursor/mcp.json .cursor/mcp.json.backup

# Copiar plantilla limpia
cp .cursor/mcp.json.example .cursor/mcp.json
```

### Paso 2: Generar nuevo token

1. Ve a [app.supabase.com/account/tokens](https://app.supabase.com/account/tokens)
2. **Revoca el token anterior** (opcional pero recomendado)
3. Genera uno nuevo con permisos completos
4. Copia el nuevo token

### Paso 3: Configurar desde cero

Edita `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "supabase": {
      "url": "https://mcp.supabase.com/mcp",
      "env": {
        "SUPABASE_ACCESS_TOKEN": "[PEGA_NUEVO_TOKEN_AQUI]",
        "SUPABASE_PROJECT_REF": "[TU_PROJECT_REF]",
        "SUPABASE_DB_PASSWORD": ""
      },
      "params": {
        "features": "docs,database,debugging,development,functions"
      }
    }
  }
}
```

### Paso 4: Reiniciar Cursor

1. Guarda el archivo
2. Cierra Cursor **completamente**
3. Espera 5 segundos
4. Abre Cursor de nuevo
5. Espera 15 segundos a que cargue

### Paso 5: Test simple

En el chat de Cursor:

```
¿Estás conectado a mi proyecto de Supabase? Intenta listar las tablas.
```

---

## 🆘 Ayuda Adicional

Si ninguna solución funciona:

### 1. Documentación oficial
- [GitHub Repo](https://github.com/supabase-community/supabase-mcp)
- [Issues](https://github.com/supabase-community/supabase-mcp/issues)

### 2. Soporte de Supabase
- [Discord](https://discord.supabase.com)
- [Support](https://supabase.com/support)

### 3. Verificar estado de servicios
- [Supabase Status](https://status.supabase.com)
- [Cursor Status](https://status.cursor.sh) (si existe)

---

## 📝 Reportar un Bug

Si crees que encontraste un bug:

1. Revisa [issues existentes](https://github.com/supabase-community/supabase-mcp/issues)
2. Si no existe, abre un nuevo issue con:
   - Versión de Cursor
   - Sistema operativo
   - Contenido de `.cursor/mcp.json` (sin credenciales)
   - Logs relevantes
   - Pasos para reproducir

---

**Última actualización**: Noviembre 2025  
**Versión**: 1.0

🦊 Si sigues teniendo problemas, pregunta en el chat: "Ayuda con MCP troubleshooting"

