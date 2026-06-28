import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatearMXN } from "@/lib/calculations";

interface BreakEvenProgressProps {
  ingresos: number;
  puntoEquilibrio: number;
  porcentaje: number;
  diasRestantes: number;
}

export function BreakEvenProgress({
  ingresos,
  puntoEquilibrio,
  porcentaje,
  diasRestantes,
}: BreakEvenProgressProps) {
  return (
    <Card>
      <p className="mb-3 text-sm text-text-main/70">
        Llevas{" "}
        <span className="font-semibold text-text-main">
          {formatearMXN(ingresos)}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-text-main">
          {formatearMXN(puntoEquilibrio)}
        </span>{" "}
        para cubrir tus gastos este mes
      </p>
      <ProgressBar value={porcentaje} max={100} />
      <div className="mt-2 flex justify-between text-xs text-text-main/60">
        <span>{Math.round(porcentaje)}% del punto de equilibrio</span>
        <span>
          {diasRestantes === 0
            ? "Último día del mes"
            : `${diasRestantes} ${diasRestantes === 1 ? "día" : "días"} restantes`}
        </span>
      </div>
    </Card>
  );
}
