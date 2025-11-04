-- Script para crear usuario de demo (temporal, para testing sin auth)
-- Ejecutar en Supabase SQL Editor

-- ⚠️ IMPORTANTE: Este UUID debe coincidir con DEMO_USER_ID en src/config/constants.ts
-- UUID actual: d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a

-- Crear configuración inicial para usuario demo
INSERT INTO public.settings (
  user_id,
  monthly_limit_cents,
  plan,
  tz
) VALUES (
  'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a'::uuid,
  100000, -- 1000€ de límite mensual
  'free',
  'Europe/Madrid'
) ON CONFLICT (user_id) DO UPDATE SET
  monthly_limit_cents = EXCLUDED.monthly_limit_cents,
  plan = EXCLUDED.plan,
  tz = EXCLUDED.tz,
  updated_at = now();

-- Crear algunos gastos de ejemplo (opcional)
INSERT INTO public.spends (
  user_id,
  amount_cents,
  category,
  merchant,
  note,
  paid_with,
  ts
) VALUES
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a'::uuid, 350, 'Café', 'Starbucks', 'Café con leche', 'tarjeta', now() - interval '2 hours'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a'::uuid, 1250, 'Comida fuera', 'La Tagliatella', 'Almuerzo', 'tarjeta', now() - interval '5 hours'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a'::uuid, 4500, 'Supermercado', 'Mercadona', 'Compra semanal', 'tarjeta', now() - interval '1 day'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a'::uuid, 800, 'Transporte', 'Uber', 'Taxi al aeropuerto', 'tarjeta', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- Verificar que se creó correctamente
SELECT 'Settings:' as tipo, * FROM public.settings WHERE user_id = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a'
UNION ALL
SELECT 'Spends:', id::text, user_id::text, amount_cents::text, category, merchant, note, paid_with, ts::text 
FROM public.spends WHERE user_id = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a' 
ORDER BY ts DESC LIMIT 5;

