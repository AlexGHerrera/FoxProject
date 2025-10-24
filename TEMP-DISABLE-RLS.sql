-- ⚠️ TEMPORAL: Deshabilitar RLS para testing sin autenticación
-- Este script es SOLO para desarrollo local
-- NO ejecutar en producción

-- Deshabilitar RLS en tabla spends
ALTER TABLE public.spends DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'spends';

-- NOTA: Para volver a habilitar RLS después:
-- ALTER TABLE public.spends ENABLE ROW LEVEL SECURITY;

