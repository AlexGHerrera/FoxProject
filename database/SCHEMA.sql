-- FOXY — Esquema mínimo (Supabase / Postgres)
-- Ejecutar en el proyecto Supabase (SQL editor)

-- Extensiones útiles
create extension if not exists pgcrypto;

-- Tabla de gastos
create table if not exists public.spends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount_cents int not null check (amount_cents >= 0),
  currency char(3) not null default 'EUR',
  category text not null,
  merchant text,
  note text,
  paid_with text check (paid_with is null or paid_with in ('efectivo','tarjeta')),
  ts timestamptz not null default now()
);

-- Tabla de settings
create table if not exists public.settings (
  user_id uuid primary key,
  monthly_limit_cents int not null default 0,
  plan text not null default 'free' check (plan in ('free','tier1','tier2')),
  tz text not null default 'Europe/Madrid',
  notifications jsonb default '{
    "expense_reminders": {"enabled": true, "time_slots": ["07:00-12:00", "12:00-17:00", "17:00-21:00"]},
    "budget_alert_70": {"enabled": true},
    "budget_alert_90": {"enabled": true},
    "weekly_summary": {"enabled": false, "day": "sunday", "time": "20:00"},
    "monthly_summary": {"enabled": false, "day": 1, "time": "09:00"}
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ejemplos para aprendizaje ligero del parser
create table if not exists public.training_examples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  raw_text text not null,
  category text not null,
  created_at timestamptz not null default now()
);

-- Tabla para monitorear costes de IA
create table if not exists public.api_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null check (provider in ('deepseek','openai','whisper')),
  endpoint text not null,
  tokens_input int,
  tokens_output int,
  latency_ms int,
  success boolean not null default true,
  error_message text,
  created_at timestamptz not null default now()
);

-- Tabla para tracking de notificaciones enviadas
create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  notification_type text not null check (notification_type in ('reminder','budget_70','budget_90','weekly_summary','monthly_summary')),
  time_slot text,
  sent_at timestamptz not null default now(),
  metadata jsonb
);

-- Índices
create index if not exists idx_spends_user_ts on public.spends(user_id, ts desc);
create index if not exists idx_spends_category on public.spends(user_id, category);
create index if not exists idx_spends_composite on public.spends(user_id, ts desc, category);
create index if not exists idx_training_user on public.training_examples(user_id);
create index if not exists idx_api_usage_user on public.api_usage(user_id, created_at desc);
create index if not exists idx_notification_logs_user on public.notification_logs(user_id, sent_at desc);

-- RLS
alter table public.spends enable row level security;
alter table public.settings enable row level security;
alter table public.training_examples enable row level security;
alter table public.api_usage enable row level security;
alter table public.notification_logs enable row level security;

-- Políticas (Supabase: auth.uid() representa al usuario autenticado)
drop policy if exists "spends_select" on public.spends;
create policy "spends_select" on public.spends
  for select using (user_id = auth.uid());

drop policy if exists "spends_modify" on public.spends;
create policy "spends_modify" on public.spends
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "settings_select" on public.settings;
create policy "settings_select" on public.settings
  for select using (user_id = auth.uid());

drop policy if exists "settings_modify" on public.settings;
create policy "settings_modify" on public.settings
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "te_select" on public.training_examples;
create policy "te_select" on public.training_examples
  for select using (user_id = auth.uid());

drop policy if exists "te_modify" on public.training_examples;
create policy "te_modify" on public.training_examples
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "api_usage_select" on public.api_usage;
create policy "api_usage_select" on public.api_usage
  for select using (user_id = auth.uid());

drop policy if exists "api_usage_insert" on public.api_usage;
create policy "api_usage_insert" on public.api_usage
  for insert with check (user_id = auth.uid());

drop policy if exists "notification_logs_select" on public.notification_logs;
create policy "notification_logs_select" on public.notification_logs
  for select using (user_id = auth.uid());

drop policy if exists "notification_logs_insert" on public.notification_logs;
create policy "notification_logs_insert" on public.notification_logs
  for insert with check (user_id = auth.uid());