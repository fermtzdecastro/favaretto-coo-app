import { Card } from "@/components/ui/Card";
import { ModelosBarChart } from "@/components/charts/ModelosBarChart";
import type { VentasPorModelo } from "@/types";

interface PairsSoldCardProps {
  total: number;
  ventasPorModelo: VentasPorModelo[];
}

export function PairsSoldCard({ total, ventasPorModelo }: PairsSoldCardProps) {
  return (
    <Card>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-heading text-lg font-semibold">Pares vendidos</h2>
        <span className="font-heading text-2xl font-semibold text-accent">
          {total}
        </span>
      </div>
      <ModelosBarChart data={ventasPorModelo} />
    </Card>
  );
}
