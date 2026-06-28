export type UserRole = "admin" | "client";

export type CanalVenta = "tienda" | "directa" | "activacion" | "otro";

export interface Usuario {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface ModeloZapato {
  id: string;
  nombre: string;
  costo_materiales: number;
  costo_produccion_jose: number;
  horas_ivana: number;
  precio_sugerido: number;
  activo: boolean;
  created_at: string;
}

export interface Venta {
  id: string;
  fecha: string;
  modelo_id: string;
  canal: CanalVenta;
  precio_venta: number;
  descuento: boolean;
  descuento_monto: number | null;
  cliente_nombre: string | null;
  notas: string | null;
  created_at: string;
  modelos_zapato?: ModeloZapato;
}

export interface GastoFijo {
  id: string;
  concepto: string;
  monto_mensual: number;
  activo: boolean;
  created_at: string;
}

export interface GastoVariableMes {
  id: string;
  mes: string;
  concepto: string;
  monto: number;
  created_at: string;
}

export interface Configuracion {
  id: string;
  punto_equilibrio_base: number;
  tarifa_hora_ivana_default: number;
  comision_tienda: number;
  comision_tarjeta: number;
  updated_at: string;
}

export type EstadoSemaforo = "verde" | "amarillo" | "rojo";

export interface ResultadoMargen {
  utilidadNeta: number;
  margenPorcentaje: number;
}

export interface EstadoMes {
  ingresosTotales: number;
  gastosTotales: number;
  resultadoNeto: number;
  porcentajeEquilibrio: number;
  semaforo: EstadoSemaforo;
}

export interface VentasPorCanal {
  tienda: number;
  directa: number;
  activacion: number;
  otro: number;
}

export interface VentasPorModelo {
  nombre: string;
  cantidad: number;
}

export interface IngresosBreakdown {
  tienda: number;
  directaColeccion: number;
  directaCustom: number;
  otros: number;
  total: number;
}

export interface DashboardData {
  ventas: Venta[];
  gastosFijos: GastoFijo[];
  gastosVariables: GastoVariableMes[];
  configuracion: Configuracion;
  ventasPorCanal: VentasPorCanal;
  ventasPorModelo: VentasPorModelo[];
  estadoMes: EstadoMes;
  ingresosBreakdown: IngresosBreakdown;
  promedioMensualAnual: number;
  soloFijosTotal: number;
  mesActual: string;
}
