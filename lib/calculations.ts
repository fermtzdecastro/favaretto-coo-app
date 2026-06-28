import type {
  ModeloZapato,
  CanalVenta,
  Venta,
  GastoFijo,
  GastoVariableMes,
  ResultadoMargen,
  EstadoMes,
  EstadoSemaforo,
} from "@/types";

const COMISION_TIENDA = 0.4;
const COMISION_TARJETA = 0.036;

export function calcularCostoReal(
  modelo: Pick<
    ModeloZapato,
    "costo_materiales" | "costo_produccion_jose" | "horas_ivana"
  >,
  tarifaHoraIvana: number
): number {
  return (
    modelo.costo_materiales +
    modelo.costo_produccion_jose +
    modelo.horas_ivana * tarifaHoraIvana
  );
}

export function calcularMargen(
  precioVenta: number,
  costoReal: number,
  canal: CanalVenta,
  comisionTienda: number = COMISION_TIENDA,
  comisionTarjeta: number = COMISION_TARJETA
): ResultadoMargen {
  let utilidadNeta: number;

  if (canal === "tienda") {
    utilidadNeta = precioVenta * (1 - comisionTienda) - costoReal;
  } else {
    utilidadNeta = precioVenta - costoReal - precioVenta * comisionTarjeta;
  }

  const margenPorcentaje =
    precioVenta > 0 ? (utilidadNeta / precioVenta) * 100 : 0;

  return { utilidadNeta, margenPorcentaje };
}

export function calcularGananciaHora(
  utilidadNeta: number,
  horasIvana: number
): number {
  if (horasIvana <= 0) return 0;
  return utilidadNeta / horasIvana;
}

export function calcularEstadoMes(
  ventasDelMes: Venta[],
  gastosFijos: GastoFijo[],
  gastosVariables: GastoVariableMes[],
  puntoEquilibrio: number
): EstadoMes {
  const ingresosTotales = ventasDelMes.reduce(
    (sum, v) => sum + Number(v.precio_venta) - (v.descuento_monto ?? 0),
    0
  );

  const totalGastosFijos = gastosFijos
    .filter((g) => g.activo)
    .reduce((sum, g) => sum + Number(g.monto_mensual), 0);

  const totalGastosVariables = gastosVariables.reduce(
    (sum, g) => sum + Number(g.monto),
    0
  );

  const gastosTotales = totalGastosFijos + totalGastosVariables;
  const resultadoNeto = ingresosTotales - gastosTotales;

  const porcentajeEquilibrio =
    puntoEquilibrio > 0 ? (ingresosTotales / puntoEquilibrio) * 100 : 0;

  let semaforo: EstadoSemaforo;
  if (porcentajeEquilibrio >= 100) {
    semaforo = "verde";
  } else if (porcentajeEquilibrio >= 60) {
    semaforo = "amarillo";
  } else {
    semaforo = "rojo";
  }

  return {
    ingresosTotales,
    gastosTotales,
    resultadoNeto,
    porcentajeEquilibrio,
    semaforo,
  };
}

export function formatearMXN(monto: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
}

export function obtenerPrimerDiaMes(fecha: Date = new Date()): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export function obtenerUltimoDiaMes(fecha: Date = new Date()): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
}

export function diasRestantesMes(fecha: Date = new Date()): number {
  const ultimoDia = obtenerUltimoDiaMes(fecha);
  const hoy = fecha.getDate();
  return ultimoDia.getDate() - hoy;
}

export function esSegundaMitadMes(fecha: Date = new Date()): boolean {
  const dia = fecha.getDate();
  const ultimoDia = obtenerUltimoDiaMes(fecha).getDate();
  return dia > ultimoDia / 2;
}

export function nombreMes(fecha: Date = new Date()): string {
  return fecha.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
}

export function nombreRol(role: string): string {
  if (role === 'admin') return 'Consultora';
  if (role === 'client') return 'Dueña';
  return 'Usuario';
}
