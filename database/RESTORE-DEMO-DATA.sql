-- Script para restaurar datos de demo
-- Ejecutar en Supabase SQL Editor después de eliminar accidentalmente los datos

-- 1. Asegurar que existe el usuario demo
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
) ON CONFLICT (user_id) DO NOTHING;

-- 2. Insertar gastos de demo
INSERT INTO public.spends (
  user_id,
  amount_cents,
  currency,
  category,
  merchant,
  note,
  paid_with,
  ts
) VALUES
  -- Octubre 2025
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 1000, 'EUR', 'Café', 'Starbucks', 'Café con leche', 'tarjeta', '2025-10-27 20:11:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 300, 'EUR', 'Supermercado', 'Mercadona', NULL, 'tarjeta', '2025-10-27 14:24:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 300, 'EUR', 'Supermercado', 'Mercadona', NULL, 'tarjeta', '2025-10-27 12:32:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 15300, 'EUR', 'Otros', 'Corte Inglés', 'Compras varias', 'tarjeta', '2025-10-24 14:33:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 3300, 'EUR', 'Supermercado', 'Mercadona', 'Compra semanal', 'tarjeta', '2025-10-24 14:32:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 3300, 'EUR', 'Supermercado', 'Mercadona', NULL, 'efectivo', '2025-10-24 14:29:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 3300, 'EUR', 'Supermercado', 'Mercadona', NULL, 'tarjeta', '2025-10-24 14:26:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 13300, 'EUR', 'Supermercado', 'Mercadona', 'Compra grande', 'tarjeta', '2025-10-24 14:25:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 300, 'EUR', 'Compras', 'Zara', 'Camiseta', 'tarjeta', '2025-10-24 14:22:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 300, 'EUR', 'Compras', 'Zara', NULL, 'tarjeta', '2025-10-24 14:20:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 300, 'EUR', 'Otros', 'Toys', NULL, 'tarjeta', '2025-10-24 14:11:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 300, 'EUR', 'Otros', 'Toys', 'Juguete', 'efectivo', '2025-10-24 14:09:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 4500, 'EUR', 'Comida fuera', 'Restaurante Pepito', 'Almuerzo', 'tarjeta', '2025-10-23 14:30:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 850, 'EUR', 'Café', 'Starbucks', 'Cappuccino', 'tarjeta', '2025-10-23 10:15:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 1250, 'EUR', 'Transporte', 'Uber', 'A la oficina', 'tarjeta', '2025-10-23 08:45:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 3200, 'EUR', 'Ocio', 'Cine', 'Película + palomitas', 'efectivo', '2025-10-22 19:30:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 6500, 'EUR', 'Comida fuera', 'McDonald''s', 'Cena', 'tarjeta', '2025-10-22 21:00:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 5500, 'EUR', 'Supermercado', 'Carrefour', 'Compra mensual', 'tarjeta', '2025-10-21 18:00:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 2800, 'EUR', 'Hogar', 'IKEA', 'Estantería', 'tarjeta', '2025-10-20 16:30:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 4200, 'EUR', 'Salud', 'Farmacia', 'Medicamentos', 'efectivo', '2025-10-19 12:00:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 7800, 'EUR', 'Comida fuera', 'Pizzería', 'Cena con amigos', 'tarjeta', '2025-10-18 20:45:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 1500, 'EUR', 'Café', 'Café Central', 'Desayuno', 'tarjeta', '2025-10-18 09:30:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 9500, 'EUR', 'Transporte', 'Gasolinera Repsol', 'Repostaje', 'tarjeta', '2025-10-17 17:00:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 3500, 'EUR', 'Ocio', 'Spotify', 'Suscripción mensual', 'tarjeta', '2025-10-15 00:00:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 12000, 'EUR', 'Comida fuera', 'Sushi Bar', 'Cena especial', 'tarjeta', '2025-10-14 21:30:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 4800, 'EUR', 'Supermercado', 'Lidl', 'Compra semanal', 'efectivo', '2025-10-13 19:00:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 2500, 'EUR', 'Café', 'Dunkin', 'Café y donut', 'tarjeta', '2025-10-12 11:00:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 8500, 'EUR', 'Compras', 'H&M', 'Ropa nueva', 'tarjeta', '2025-10-11 16:00:00'),
  ('d5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a', 5200, 'EUR', 'Hogar', 'Leroy Merlin', 'Herramientas', 'tarjeta', '2025-10-10 14:00:00');

-- 3. Verificar que se insertaron correctamente
SELECT COUNT(*) as total_gastos 
FROM public.spends 
WHERE user_id = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a';

-- 4. Mostrar los últimos 5 gastos
SELECT 
  category,
  merchant,
  amount_cents / 100.0 as amount_eur,
  paid_with,
  ts
FROM public.spends 
WHERE user_id = 'd5e6f7a8-b9c0-1d2e-3f4a-5b6c7d8e9f0a'
ORDER BY ts DESC
LIMIT 5;

