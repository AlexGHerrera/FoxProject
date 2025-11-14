-- Script para asignar rol de administrador a un usuario
-- Ejecutar esto manualmente con TU email después del primer signup
-- 
-- INSTRUCCIONES:
-- 1. Reemplaza 'TU_EMAIL@ejemplo.com' con tu email real
-- 2. Ejecuta este script en el SQL Editor de Supabase
-- 3. Verifica que el rol se asignó correctamente

INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'TU_EMAIL@ejemplo.com'),
  'admin'
)
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Verificar que se asignó correctamente
SELECT 
  u.email,
  ur.role,
  ur.created_at
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'TU_EMAIL@ejemplo.com';

