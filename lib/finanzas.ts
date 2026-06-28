import type { Venta, IngresosBreakdown } from "@/types";

export function calcularIngresosBreakdown(ventas: Venta[]): IngresosBreakdown {
  const breakdown: IngresosBreakdown = {
    tienda: 0,
    directaColeccion: 0,
    directaCustom: 0,
    otros: 0,
    total: 0,
  };

  ventas.forEach((v) => {
    const monto = Number(v.precio_venta) - (v.descuento_monto ?? 0);
    const nombre = v.modelos_zapato?.nombre ?? "";

    if (v.canal === "tienda") {
      breakdown.tienda += monto;
    } else if (v.canal === "directa") {
      if (nombre.includes("Custom")) {
        breakdown.directaCustom += monto;
      } else {
        breakdown.directaColeccion += monto;
      }
    } else if (v.canal === "otro" || v.canal === "activacion") {
      breakdown.otros += monto;
    }
  });

  breakdown.total =
    breakdown.tienda +
    breakdown.directaColeccion +
    breakdown.directaCustom +
    breakdown.otros;

  return breakdown;
}

export function calcularPromedioMensualAnual(
  ventasAnio: Pick<Venta, "precio_venta" | "descuento_monto">[],
  mesActual: number
): number {
  const totalAnio = ventasAnio.reduce(
    (sum, v) => sum + Number(v.precio_venta) - (v.descuento_monto ?? 0),
    0
  );
  const meses = Math.max(mesActual, 1);
  return totalAnio / meses;
}

export const GASTOS_VARIABLES_PRESUPUESTO: { concepto: string; monto: number }[] =
  [
    { concepto: "Materiales e insumos", monto: 6603 },
    { concepto: "Mano de obra (José)", monto: 5050 },
    { concepto: "Activaciones de marca", monto: 3750 },
    { concepto: "Empaque", monto: 3300 },
    { concepto: "Comisiones tarjeta/tienda", monto: 3362 },
    { concepto: "Envíos y traslados", monto: 1500 },
    { concepto: "Zapato regalo/compensación", monto: 1204 },
  ];
