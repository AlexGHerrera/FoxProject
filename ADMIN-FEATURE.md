# 👨‍💼 Feature: Panel de Administración

> Sistema de monitorización y gestión para administradores de Foxy

---

## 🎯 Objetivo

Permitir a administradores monitorizar el uso de la aplicación, gestionar usuarios y controlar costes de IA.

---

## 📋 Requisitos

### Roles de Usuario

```typescript
type UserRole = 'user' | 'admin' | 'superadmin'

interface User {
  id: string
  email: string
  role: UserRole
  created_at: Date
  last_login: Date
  is_active: boolean
}
```

### Permisos

| Acción | User | Admin | SuperAdmin |
|--------|------|-------|------------|
| Ver propios gastos | ✅ | ✅ | ✅ |
| Registrar gastos | ✅ | ✅ | ✅ |
| Ver dashboard admin | ❌ | ✅ | ✅ |
| Ver gastos de otros | ❌ | ✅ (anonimizados) | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Cambiar roles | ❌ | ❌ | ✅ |
| Ver costes IA | ❌ | ✅ | ✅ |

---

## 🗄️ Cambios en Base de Datos

### 1. Agregar tabla `users` con roles

```sql
-- Tabla de usuarios (complementa auth.users de Supabase)
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('user','admin','superadmin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  last_login timestamptz,
  updated_at timestamptz not null default now()
);

-- Índice para queries de admin
create index if not exists idx_user_profiles_role on public.user_profiles(role);
create index if not exists idx_user_profiles_active on public.user_profiles(is_active);

-- RLS para user_profiles
alter table public.user_profiles enable row level security;

-- Policy: usuarios ven su propio perfil
drop policy if exists "user_profiles_select_own" on public.user_profiles;
create policy "user_profiles_select_own" on public.user_profiles
  for select using (id = auth.uid());

-- Policy: admins ven todos los perfiles
drop policy if exists "user_profiles_select_admin" on public.user_profiles;
create policy "user_profiles_select_admin" on public.user_profiles
  for select using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

-- Policy: solo superadmins modifican roles
drop policy if exists "user_profiles_update_superadmin" on public.user_profiles;
create policy "user_profiles_update_superadmin" on public.user_profiles
  for update using (
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role = 'superadmin'
    )
  );

-- Function: trigger para actualizar last_login
create or replace function public.update_last_login()
returns trigger as $$
begin
  new.last_login := now();
  new.updated_at := now();
  return new;
end;
$$ language plpgsql security definer;

create trigger trigger_update_last_login
  before update on public.user_profiles
  for each row
  when (old.last_login is distinct from new.last_login)
  execute function public.update_last_login();
```

### 2. Modificar políticas RLS para admins

```sql
-- Policy: admins pueden ver todos los gastos (para dashboard)
drop policy if exists "spends_select_admin" on public.spends;
create policy "spends_select_admin" on public.spends
  for select using (
    user_id = auth.uid() 
    OR 
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );

-- Policy: admins pueden ver todo api_usage
drop policy if exists "api_usage_select_admin" on public.api_usage;
create policy "api_usage_select_admin" on public.api_usage
  for select using (
    user_id = auth.uid()
    OR
    exists (
      select 1 from public.user_profiles
      where id = auth.uid() and role in ('admin', 'superadmin')
    )
  );
```

### 3. Vista agregada para dashboard admin

```sql
-- Vista: estadísticas globales
create or replace view public.admin_stats as
select
  count(distinct user_id) as total_users,
  count(*) as total_spends,
  sum(amount_cents) as total_amount_cents,
  avg(amount_cents) as avg_amount_cents,
  count(*) filter (where ts >= now() - interval '30 days') as spends_last_30d,
  count(*) filter (where ts >= now() - interval '7 days') as spends_last_7d
from public.spends;

-- Vista: uso de IA
create or replace view public.admin_api_stats as
select
  provider,
  count(*) as total_requests,
  count(*) filter (where success = true) as successful_requests,
  count(*) filter (where success = false) as failed_requests,
  round(avg(latency_ms)) as avg_latency_ms,
  sum(tokens_input) as total_tokens_input,
  sum(tokens_output) as total_tokens_output
from public.api_usage
where created_at >= now() - interval '30 days'
group by provider;

-- Vista: top categorías
create or replace view public.admin_top_categories as
select
  category,
  count(*) as spend_count,
  sum(amount_cents) as total_amount_cents,
  round(avg(amount_cents)) as avg_amount_cents
from public.spends
where ts >= now() - interval '30 days'
group by category
order by spend_count desc
limit 10;

-- RLS para vistas (solo admins)
alter view public.admin_stats set (security_invoker = true);
alter view public.admin_api_stats set (security_invoker = true);
alter view public.admin_top_categories set (security_invoker = true);
```

---

## 💻 Implementación Frontend

### 1. Modelo de Dominio

```typescript
// src/domain/models/UserProfile.ts
export interface UserProfile {
  id: string
  email: string
  role: 'user' | 'admin' | 'superadmin'
  isActive: boolean
  createdAt: Date
  lastLogin: Date | null
  updatedAt: Date
}

export interface AdminStats {
  totalUsers: number
  totalSpends: number
  totalAmountCents: number
  avgAmountCents: number
  spendsLast30d: number
  spendsLast7d: number
}

export interface AdminApiStats {
  provider: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgLatencyMs: number
  totalTokensInput: number
  totalTokensOutput: number
}

export interface TopCategory {
  category: string
  spendCount: number
  totalAmountCents: number
  avgAmountCents: number
}
```

### 2. Repository Interface

```typescript
// src/adapters/db/IAdminRepository.ts
export interface IAdminRepository {
  // Usuarios
  listUsers(filters?: UserFilters): Promise<UserProfile[]>
  getUserById(userId: string): Promise<UserProfile | null>
  updateUserRole(userId: string, role: UserRole): Promise<void>
  toggleUserActive(userId: string, isActive: boolean): Promise<void>
  
  // Estadísticas
  getGlobalStats(): Promise<AdminStats>
  getApiStats(): Promise<AdminApiStats[]>
  getTopCategories(): Promise<TopCategory[]>
  
  // Gastos (todos los usuarios)
  getAllSpends(filters?: SpendFilters, pagination?: PaginationOptions): Promise<Spend[]>
  getUserSpends(userId: string, filters?: SpendFilters): Promise<Spend[]>
}
```

### 3. Casos de Uso

```typescript
// src/application/admin/getGlobalStats.ts
export async function getGlobalStats(
  adminRepo: IAdminRepository
): Promise<AdminStats> {
  return await adminRepo.getGlobalStats()
}

// src/application/admin/getUsersList.ts
export async function getUsersList(
  adminRepo: IAdminRepository,
  filters?: UserFilters
): Promise<UserProfile[]> {
  return await adminRepo.listUsers(filters)
}

// src/application/admin/updateUserRole.ts
export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  adminRepo: IAdminRepository
): Promise<void> {
  // Validación: no se puede cambiar propio rol
  // Validación: solo superadmin puede promover a admin
  await adminRepo.updateUserRole(userId, newRole)
}
```

### 4. Componentes UI

```typescript
// src/pages/AdminDashboard.tsx
interface AdminDashboardProps {}

export function AdminDashboard() {
  const stats = useAdminStats()
  const apiStats = useAdminApiStats()
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Panel de Administración</h1>
      
      {/* Estadísticas globales */}
      <StatsGrid stats={stats} />
      
      {/* Uso de IA */}
      <ApiUsageChart data={apiStats} />
      
      {/* Top categorías */}
      <TopCategoriesTable />
      
      {/* Usuarios activos */}
      <ActiveUsersTable />
    </div>
  )
}

// src/components/admin/StatsCard.tsx
interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

// src/components/admin/UsersTable.tsx
interface UsersTableProps {
  users: UserProfile[]
  onRoleChange: (userId: string, role: UserRole) => void
  onToggleActive: (userId: string) => void
}
```

---

## 🔐 Seguridad

### 1. Middleware de Autorización

```typescript
// src/utils/auth.ts
export function requireAdmin(user: UserProfile | null): void {
  if (!user || !['admin', 'superadmin'].includes(user.role)) {
    throw new Error('Unauthorized: Admin access required')
  }
}

export function requireSuperAdmin(user: UserProfile | null): void {
  if (!user || user.role !== 'superadmin') {
    throw new Error('Unauthorized: SuperAdmin access required')
  }
}
```

### 2. Hook de Autenticación

```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Obtener usuario autenticado
    const fetchUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const profile = await getUserProfile(authUser.id)
        setUser(profile)
      }
      setLoading(false)
    }
    fetchUser()
  }, [])
  
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'
  const isSuperAdmin = user?.role === 'superadmin'
  
  return { user, loading, isAdmin, isSuperAdmin }
}
```

### 3. Rutas Protegidas

```typescript
// src/components/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  requireSuperAdmin?: boolean
}

export function ProtectedRoute({ 
  children, 
  requireAdmin, 
  requireSuperAdmin 
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isSuperAdmin } = useAuth()
  
  if (loading) return <LoadingSpinner />
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/unauthorized" />
  }
  
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" />
  }
  
  return <>{children}</>
}

// src/App.tsx
<Routes>
  <Route path="/admin" element={
    <ProtectedRoute requireAdmin>
      <AdminDashboard />
    </ProtectedRoute>
  } />
  
  <Route path="/admin/users" element={
    <ProtectedRoute requireSuperAdmin>
      <UserManagement />
    </ProtectedRoute>
  } />
</Routes>
```

---

## 📊 UI del Dashboard Admin

### Layout

```
┌──────────────────────────────────────────────────┐
│  [Foxy Logo]  Admin Dashboard       [👤 Admin]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📊 Estadísticas Globales                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐         │
│  │ 1,234   │  │ 15,678  │  │ €45,234 │         │
│  │ Usuarios│  │ Gastos  │  │ Total   │         │
│  └─────────┘  └─────────┘  └─────────┘         │
│                                                  │
│  🤖 Uso de IA (últimos 30 días)                 │
│  ┌──────────────────────────────────────────┐   │
│  │ DeepSeek                                 │   │
│  │ Requests: 5,432 │ Success: 98.5%        │   │
│  │ Latency: 850ms  │ Tokens: 2.3M         │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  📈 Top Categorías                              │
│  1. Supermercado    3,456 gastos   €12,345     │
│  2. Transporte      2,123 gastos   €8,765      │
│  3. Ocio            1,890 gastos   €6,543      │
│                                                  │
│  👥 Usuarios Activos (últimos 7 días)           │
│  [Tabla con usuarios]                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Plan de Implementación

### Fase 1: Base de Datos
1. ✅ Crear tabla `user_profiles`
2. ✅ Agregar RLS policies para admins
3. ✅ Crear vistas agregadas
4. ✅ Migración SQL completa

### Fase 2: Backend (Domain + Application)
1. Modelos de dominio (UserProfile, AdminStats)
2. Interfaces de repositorios (IAdminRepository)
3. Casos de uso (getGlobalStats, getUsersList, etc.)
4. Tests unitarios

### Fase 3: Adapters
1. SupabaseAdminRepository
2. Queries optimizadas
3. Caching de estadísticas

### Fase 4: Frontend
1. Hook useAuth con roles
2. ProtectedRoute component
3. AdminDashboard page
4. Componentes de UI (StatsCard, UsersTable, etc.)

### Fase 5: Testing & Polish
1. Tests E2E de flujos admin
2. Auditoría de seguridad
3. Optimización de queries
4. Documentación

---

## 📝 Notas Importantes

### Privacidad

- Los gastos mostrados a admins pueden ser **anonimizados** (ocultar `user_id` real)
- Opción de "privacy mode" donde solo se ven agregados, no detalles individuales
- Logs de auditoría cuando admin ve datos de un usuario específico

### Performance

- Usar vistas materializadas para estadísticas agregadas (refresh cada hora)
- Cachear stats en Redis/Memcached
- Paginación obligatoria en listados de usuarios/gastos

### Compliance

- GDPR: usuarios pueden solicitar exportación/borrado de datos
- Logs de acceso admin (quién vió qué y cuándo)
- Encriptación de datos sensibles

---

## 🔄 Migración

Para agregar esta feature a un proyecto existente:

```bash
# 1. Ejecutar migración SQL
psql -f migrations/002_add_admin_roles.sql

# 2. Promover primer admin manualmente
UPDATE public.user_profiles 
SET role = 'superadmin' 
WHERE email = 'admin@foxy.app';

# 3. Implementar código frontend
# (seguir estructura hexagonal)
```

---

**Autor**: Alex G. Herrera  
**Fecha**: Octubre 2025  
**Estado**: Propuesta (no implementado)

