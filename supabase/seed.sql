-- Favaretto COO App — Seed Data
-- Run AFTER schema.sql in the Supabase SQL Editor

-- ============================================================
-- SHOE MODELS
-- ============================================================

INSERT INTO modelos_zapato (nombre, costo_materiales, costo_produccion_jose, horas_ivana, precio_sugerido) VALUES
  ('Kitty',        620,   500,  5.5,  6150),
  ('Bi',           620,   500,  5.5,  6150),
  ('Pixie',        530,   500,  5.5,  5280),
  ('Vixen',        790,   500,  5.5,  7940),
  ('Birdie',       630,   500,  5.5,  6380),
  ('Starlet',      640,   500,  5.5,  6340),
  ('Besito',       900,   500,  5.5,  9050),
  ('Chachki',      1550,  1000, 5.5,  16400),
  ('Custom Zapato', 1870, 2180, 14,   7500),
  ('Custom Bota',  1870,  2680, 15,   22000);

-- ============================================================
-- MONTHLY FIXED EXPENSES
-- ============================================================

INSERT INTO gastos_fijos (concepto, monto_mensual) VALUES
  ('Renta del taller',              4200),
  ('Community manager (Pol)',       4000),
  ('Servicios (luz, internet)',      800),
  ('Plataformas (Canva, etc.)',      200),
  ('OA — Orden y Alegría',          2500);

-- ============================================================
-- INITIAL CONFIGURATION
-- ============================================================

INSERT INTO configuracion (
  punto_equilibrio_base,
  tarifa_hora_ivana_default,
  comision_tienda,
  comision_tarjeta
) VALUES (
  36469,
  300,
  0.40,
  0.036
);

-- ============================================================
-- USER ROLES (run after creating auth users in Supabase)
-- ============================================================
-- After creating users via Supabase Auth, update their roles:
--
-- UPDATE usuarios SET role = 'admin' WHERE email = 'fernanda@example.com';
-- UPDATE usuarios SET role = 'client' WHERE email = 'ivana@example.com';
