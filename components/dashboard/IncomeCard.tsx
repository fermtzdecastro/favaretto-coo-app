import { Card } from "@/components/ui/Card";
import { formatearMXN } from "@/lib/calculations";
import type { VentasPorCanal } from "@/types";

interface IncomeCardProps {
  ventasPorCanal: VentasPorCanal;
  total: number;
}

const canales: { key: keyof VentasPorCanal; label: string }[] = [
  { key: "tienda", label: "Tienda" },
  { key: "directa", label: "Directa" },
  { key: "activacion", label: "Activación" },
  { key: "otro", label: "Otro" },
];

export function IncomeCard({ ventasPorCanal, total }: IncomeCardProps) {
  return (
    <Card>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-heading text-lg font-semibold">Ingresos</h2>
        <span className="font-semibold text-green">
          {formatearMXN(total)}
        </span>
      </div>
      <ul className="space-y-2">
        {canales.map(({ key, label }) => (
          <li key={key} className="flex justify-between text-sm">
            <span className="text-text-main/70">{label}</span>
            <span className="font-medium">
              {formatearMXN(ventasPorCanal[key])}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
