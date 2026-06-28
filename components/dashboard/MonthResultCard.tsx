import { Card } from "@/components/ui/Card";
import { TrafficLight } from "@/components/ui/TrafficLight";
import { formatearMXN } from "@/lib/calculations";
import type { EstadoMes } from "@/types";

interface MonthResultCardProps {
  estado: EstadoMes;
}

export function MonthResultCard({ estado }: MonthResultCardProps) {
  const resultadoPositivo = estado.resultadoNeto >= 0;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-main/60">Resultado del mes</p>
          <p
            className={`mt-1 font-heading text-2xl font-semibold ${
              resultadoPositivo ? "text-green" : "text-red"
            }`}
          >
            {resultadoPositivo ? "+" : ""}
            {formatearMXN(estado.resultadoNeto)}
          </p>
        </div>
        <TrafficLight estado={estado.semaforo} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/5 pt-4">
        <div>
          <p className="text-xs text-text-main/50">Ingresos</p>
          <p className="font-medium">{formatearMXN(estado.ingresosTotales)}</p>
        </div>
        <div>
          <p className="text-xs text-text-main/50">Gastos</p>
          <p className="font-medium">{formatearMXN(estado.gastosTotales)}</p>
        </div>
      </div>
    </Card>
  );
}
