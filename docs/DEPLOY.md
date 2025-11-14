# 🚀 Guía de Despliegue - Foxy

## Pre-requisitos

1. Cuenta en [Supabase](https://supabase.com)
2. Cuenta en [Vercel](https://vercel.com)
3. (Opcional) Cuenta en [Resend](https://resend.com) para emails personalizados

## Paso 1: Configurar Supabase

### 1.1 Crear Proyecto
1. Ve a [Supabase Dashboard](https://app.supabase.com)
2. Crea un nuevo proyecto
3. Anota la URL y las API keys (anon key y service_role key)

### 1.2 Ejecutar Migraciones SQL
1. Ve a SQL Editor en Supabase
2. Ejecuta en orden:
   - `database/SCHEMA.sql` (schema base)
   - `database/migrations/002_production_ready.sql` (roles y feedback)
   - `database/migrations/003_create_storage_bucket.sql` (storage para screenshots)

### 1.3 Configurar Storage
1. Ve a Storage en Supabase Dashboard
2. Verifica que el bucket `feedback-screenshots` existe
3. Si no existe, créalo manualmente:
   - Nombre: `feedback-screenshots`
   - Público: No
   - File size limit: 5MB

### 1.4 Configurar Auth
1. Ve a Authentication > Settings
2. Configura Site URL: `https://tu-dominio.vercel.app`
3. Agrega Redirect URLs:
   - `https://tu-dominio.vercel.app/login`
   - `https://tu-dominio.vercel.app/reset-password`
4. (Opcional) Configura SMTP para emails personalizados

### 1.5 Asignar Primer Admin
1. Regístrate en la app con tu email
2. Ejecuta en SQL Editor:
```sql
-- Reemplaza 'TU_EMAIL@ejemplo.com' con tu email real
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'TU_EMAIL@ejemplo.com'),
  'admin'
)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
```

## Paso 2: Configurar Vercel

### 2.1 Conectar Repositorio
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Importa tu repositorio de GitHub/GitLab
3. Configura:
   - Framework Preset: Vite
   - Root Directory: `.` (o el directorio raíz)
   - Build Command: `npm run build`
   - Output Directory: `dist`

### 2.2 Variables de Entorno
Agrega las siguientes variables en Vercel Dashboard > Settings > Environment Variables:

```
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_DEEPSEEK_API_KEY=tu_deepseek_api_key (opcional)
SUPABASE_SERVICE_ROLE_KEY=tu_supabase_service_role_key
CRON_SECRET=genera_un_secreto_aleatorio_aqui
ADMIN_EMAIL=tu_email@ejemplo.com
RESEND_API_KEY=tu_resend_api_key (opcional, para emails)
```

**Importante**: 
- `CRON_SECRET` debe ser una cadena aleatoria segura (usa `openssl rand -hex 32`)
- `SUPABASE_SERVICE_ROLE_KEY` solo se usa en serverless functions, nunca en el cliente

### 2.3 Configurar Cron Job
1. El cron job está configurado en `vercel.json`
2. Se ejecuta todos los lunes a las 9:00 AM UTC
3. Para probarlo manualmente:
```bash
curl -X POST https://tu-dominio.vercel.app/api/cron/weekly-report \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

## Paso 3: Verificar Despliegue

### 3.1 Checklist Pre-Launch
- [ ] RLS habilitado en todas las tablas
- [ ] Primer admin asignado
- [ ] Variables de entorno configuradas en Vercel
- [ ] Emails de confirmación funcionando (probar signup)
- [ ] Panel admin accesible solo para admin (`/admin`)
- [ ] Feedback submission funcional
- [ ] Storage bucket creado y con políticas correctas
- [ ] Cron job configurado (verificar logs en Vercel)
- [ ] Políticas legales accesibles (`/legal/privacy`, `/legal/terms`)

### 3.2 Testing
1. **Autenticación**:
   - Crear cuenta nueva
   - Confirmar email
   - Login
   - Reset password

2. **Funcionalidad Core**:
   - Registrar gasto por voz
   - Ver gastos en lista
   - Editar/eliminar gastos
   - Configurar presupuesto

3. **Panel Admin**:
   - Acceder a `/admin` con cuenta admin
   - Verificar que usuarios normales no pueden acceder
   - Revisar métricas, errores, feedback

4. **Feedback**:
   - Enviar feedback desde Settings
   - Subir captura de pantalla
   - Verificar que aparece en panel admin

## Paso 4: Configurar Emails (Opcional)

### Opción A: Usar Supabase Auth (Gratis)
- Ya está configurado por defecto
- Emails básicos de confirmación y reset password
- No permite emails personalizados (reportes semanales)

### Opción B: Usar Resend (Recomendado)
1. Crea cuenta en [Resend](https://resend.com)
2. Verifica tu dominio
3. Obtén API key
4. Agrega `RESEND_API_KEY` a variables de entorno
5. Descomenta código de Resend en `api/cron/weekly-report.ts`

## Troubleshooting

### Error: "Row Level Security policy violation"
- Verifica que RLS está habilitado
- Verifica que el usuario está autenticado
- Revisa las políticas en Supabase Dashboard > Authentication > Policies

### Error: "Storage bucket not found"
- Verifica que el bucket `feedback-screenshots` existe
- Ejecuta `database/migrations/003_create_storage_bucket.sql`

### Cron job no se ejecuta
- Verifica que `CRON_SECRET` está configurado correctamente
- Revisa logs en Vercel Dashboard > Functions
- Verifica que el schedule en `vercel.json` es correcto

### Emails no llegan
- Verifica configuración SMTP en Supabase
- Revisa spam folder
- Si usas Resend, verifica que el dominio está verificado

## Soporte

Para problemas o preguntas, usa la sección de Feedback en la app o contacta al administrador.

