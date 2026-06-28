-- Favaretto COO App — Initial Schema
-- Run this in the Supabase SQL Editor

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE canal_venta AS ENUM ('tienda', 'directa', 'activacion', 'otro');

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE modelos_zapato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  costo_materiales NUMERIC(12, 2) NOT NULL,
  costo_produccion_jose NUMERIC(12, 2) NOT NULL,
  horas_ivana NUMERIC(6, 2) NOT NULL,
  precio_sugerido NUMERIC(12, 2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  modelo_id UUID NOT NULL REFERENCES modelos_zapato(id) ON DELETE RESTRICT,
  canal canal_venta NOT NULL,
  precio_venta NUMERIC(12, 2) NOT NULL,
  descuento BOOLEAN NOT NULL DEFAULT FALSE,
  descuento_monto NUMERIC(12, 2),
  cliente_nombre TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gastos_fijos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concepto TEXT NOT NULL,
  monto_mensual NUMERIC(12, 2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE gastos_variables_mes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mes DATE NOT NULL,
  concepto TEXT NOT NULL,
  monto NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE configuracion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  punto_equilibrio_base NUMERIC(12, 2) NOT NULL,
  tarifa_hora_ivana_default NUMERIC(12, 2) NOT NULL DEFAULT 300,
  comision_tienda NUMERIC(5, 4) NOT NULL DEFAULT 0.40,
  comision_tarjeta NUMERIC(5, 4) NOT NULL DEFAULT 0.036,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_ventas_modelo_id ON ventas(modelo_id);
CREATE INDEX idx_gastos_variables_mes ON gastos_variables_mes(mes);

-- ============================================================
-- HELPER: get current user's role
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM usuarios WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE modelos_zapato ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_fijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_variables_mes ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- usuarios: authenticated users can read all; only admins can modify
CREATE POLICY "usuarios_select_authenticated"
  ON usuarios FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "usuarios_insert_admin"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "usuarios_update_admin"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin');

CREATE POLICY "usuarios_delete_admin"
  ON usuarios FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- modelos_zapato: read for all authenticated; write for admin only
CREATE POLICY "modelos_select_authenticated"
  ON modelos_zapato FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "modelos_insert_admin"
  ON modelos_zapato FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "modelos_update_admin"
  ON modelos_zapato FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin');

CREATE POLICY "modelos_delete_admin"
  ON modelos_zapato FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- ventas: read for all authenticated; insert/update for admin and client
CREATE POLICY "ventas_select_authenticated"
  ON ventas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ventas_insert_authenticated"
  ON ventas FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'client'));

CREATE POLICY "ventas_update_authenticated"
  ON ventas FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('admin', 'client'));

CREATE POLICY "ventas_delete_admin"
  ON ventas FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- gastos_fijos: read for all authenticated; write for admin only
CREATE POLICY "gastos_fijos_select_authenticated"
  ON gastos_fijos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "gastos_fijos_insert_admin"
  ON gastos_fijos FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "gastos_fijos_update_admin"
  ON gastos_fijos FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin');

CREATE POLICY "gastos_fijos_delete_admin"
  ON gastos_fijos FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- gastos_variables_mes: read for all authenticated; insert/update for admin and client
CREATE POLICY "gastos_variables_select_authenticated"
  ON gastos_variables_mes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "gastos_variables_insert_authenticated"
  ON gastos_variables_mes FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() IN ('admin', 'client'));

CREATE POLICY "gastos_variables_update_authenticated"
  ON gastos_variables_mes FOR UPDATE
  TO authenticated
  USING (get_user_role() IN ('admin', 'client'));

CREATE POLICY "gastos_variables_delete_admin"
  ON gastos_variables_mes FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- configuracion: read for all authenticated; write for admin only
CREATE POLICY "configuracion_select_authenticated"
  ON configuracion FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "configuracion_insert_admin"
  ON configuracion FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "configuracion_update_admin"
  ON configuracion FOR UPDATE
  TO authenticated
  USING (get_user_role() = 'admin');

CREATE POLICY "configuracion_delete_admin"
  ON configuracion FOR DELETE
  TO authenticated
  USING (get_user_role() = 'admin');

-- ============================================================
-- TRIGGER: auto-create usuario on signup
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.usuarios (id, email, role)
  VALUES (NEW.id, NEW.email, 'client');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
