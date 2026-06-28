import { createServerSupabaseClient } from "@/lib/supabase-server";
import {
  calcularEstadoMes,
  obtenerPrimerDiaMes,
} from "@/lib/calculations";
import {
  calcularIngresosBreakdown,
  calcularPromedioMensualAnual,
} from "@/lib/finanzas";
import type {
  DashboardData,
  VentasPorCanal,
  VentasPorModelo,
  Venta,
  GastoFijo,
  GastoVariableMes,
  Configuracion,
} from "@/types";

export async function getDashboardData(
  mes: Date = new Date()
): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient();
  const primerDia = obtenerPrimerDiaMes(mes);
  const year = mes.getFullYear();
  const month = mes.getMonth() + 1;
  const ultimoDia = new Date(year, month, 0).getDate();
  const finMes = `${year}-${String(month).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  const inicioAnio = `${year}-01-01`;

  const [
    { data: ventas },
    { data: ventasAnio },
    { data: gastosFijos },
    { data: gastosVariables },
    { data: configuracionRows },
  ] = await Promise.all([
    supabase
      .from("ventas")
      .select("*, modelos_zapato(*)")
      .gte("fecha", primerDia)
      .lte("fecha", finMes),
    supabase
      .from("ventas")
      .select("precio_venta, descuento_monto")
      .gte("fecha", inicioAnio)
      .lte("fecha", finMes),
    supabase.from("gastos_fijos").select("*").eq("activo", true),
    supabase
      .from("gastos_variables_mes")
      .select("*")
      .eq("mes", primerDia),
    supabase.from("configuracion").select("*").limit(1),
  ]);

  const ventasList: Venta[] = ventas ?? [];
  const gastosFijosList: GastoFijo[] = gastosFijos ?? [];
  const gastosVariablesList: GastoVariableMes[] = gastosVariables ?? [];
  const configuracion: Configuracion = configuracionRows?.[0] ?? {
    id: "",
    punto_equilibrio_base: 36469,
    tarifa_hora_ivana_default: 300,
    comision_tienda: 0.4,
    comision_tarjeta: 0.036,
    updated_at: new Date().toISOString(),
  };

  const ventasPorCanal: VentasPorCanal = {
    tienda: 0,
    directa: 0,
    activacion: 0,
    otro: 0,
  };

  ventasList.forEach((v) => {
    const monto = Number(v.precio_venta) - (v.descuento_monto ?? 0);
    ventasPorCanal[v.canal] += monto;
  });

  const modeloMap = new Map<string, VentasPorModelo>();
  ventasList.forEach((v) => {
    const nombre = v.modelos_zapato?.nombre ?? "Desconocido";
    const existing = modeloMap.get(nombre);
    if (existing) {
      existing.cantidad += 1;
    } else {
      modeloMap.set(nombre, { nombre, cantidad: 1 });
    }
  });

  const ventasPorModelo = Array.from(modeloMap.values()).sort(
    (a, b) => b.cantidad - a.cantidad
  );

  const soloFijosTotal = gastosFijosList.reduce(
    (sum, g) => sum + Number(g.monto_mensual),
    0
  );

  const estadoMes = calcularEstadoMes(
    ventasList,
    gastosFijosList,
    gastosVariablesList,
    Number(configuracion.punto_equilibrio_base)
  );

  const ingresosBreakdown = calcularIngresosBreakdown(ventasList);
  const promedioMensualAnual = calcularPromedioMensualAnual(
    ventasAnio ?? [],
    month
  );

  return {
    ventas: ventasList,
    gastosFijos: gastosFijosList,
    gastosVariables: gastosVariablesList,
    configuracion,
    ventasPorCanal,
    ventasPorModelo,
    estadoMes,
    ingresosBreakdown,
    promedioMensualAnual,
    soloFijosTotal,
    mesActual: primerDia,
  };
}
