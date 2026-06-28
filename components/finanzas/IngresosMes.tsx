import { formatearMXN } from "@/lib/calculations";
import type { IngresosBreakdown } from "@/types";

interface IngresosMesProps {
  breakdown: IngresosBreakdown;
}

const filas: { key: keyof Omit<IngresosBreakdown, "total">; label: string }[] =
  [
    { key: "tienda", label: "Tienda" },
    { key: "directaColeccion", label: "Directa — Colección" },
    { key: "directaCustom", label: "Directa — Custom made" },
    { key: "otros", label: "Otros" },
  ];

export function IngresosMes({ breakdown }: IngresosMesProps) {
  return (
    <section className="rounded-2xl border border-cream-dark bg-surface p-5">
      <h2 className="mb-4 font-heading text-lg font-semibold">
        Ingresos del mes
      </h2>
      <ul className="space-y-2.5">
        {filas.map(({ key, label }) => (
          <li key={key} className="flex justify-between text-sm">
            <span className="text-text-muted">{label}</span>
            <span className="font-medium text-text-main">
              {formatearMXN(breakdown[key])}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-between border-t border-cream-dark pt-3 text-sm font-bold">
        <span>Total</span>
        <span>{formatearMXN(breakdown.total)}</span>
      </div>
    </section>
  );


