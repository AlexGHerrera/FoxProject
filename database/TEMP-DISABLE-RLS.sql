-- ⚠️ TEMPORAL: Deshabilitar RLS para testing sin autenticación
-- Este script es SOLO para desarrollo local
-- NO ejecutar en producción

-- Deshabilitar RLS en todas las tablas necesarias
ALTER TABLE public.spends DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_examples DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage DISABLE ROW LEVEL SECURITY;

-- Verificar que se deshabilitó
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('spends', 'settings', 'training_examples', 'api_usage');

-- NOTA: Para volver a habilitar RLS después:
-- ALTER TABLE public.spends ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.training_examples ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

