-- Script para crear usuario de demo (temporal, para testing sin auth)
-- Ejecutar en Supabase SQL Editor

-- Crear un usuario demo con un UUID fijo
INSERT INTO public.settings (
  user_id,
  monthly_limit_cents,
  plan,
  tz
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  100000, -- 1000€ de límite mensual
  'free',
  'Europe/Madrid'
) ON CONFLICT (user_id) DO NOTHING;

-- Verificar que se creó
SELECT * FROM public.settings WHERE user_id = '00000000-0000-0000-0000-000000000001';

