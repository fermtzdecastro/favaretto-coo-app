import { cn } from "@/lib/utils";
import type { EstadoSemaforo } from "@/types";

interface TrafficLightProps {
  estado: EstadoSemaforo;
  className?: string;
}

const colores: Record<EstadoSemaforo, string> = {
  verde: "bg-green",
  amarillo: "bg-yellow",
  rojo: "bg-red",
};

const etiquetas: Record<EstadoSemaforo, string> = {
  verde: "En equilibrio",
  amarillo: "Atención",
  rojo: "Alerta",
};

export function TrafficLight({ estado, className }: TrafficLightProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn("h-3 w-3 rounded-full", colores[estado])}
        aria-hidden
      />
      <span className="text-sm font-medium">{etiquetas[estado]}</span>
    </div>
  );
}
