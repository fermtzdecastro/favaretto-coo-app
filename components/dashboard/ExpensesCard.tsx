import { Card } from "@/components/ui/Card";
import { formatearMXN } from "@/lib/calculations";
import type { GastoFijo, GastoVariableMes } from "@/types";

interface ExpensesCardProps {
  gastosFijos: GastoFijo[];
  gastosVariables: GastoVariableMes[];
}

export function ExpensesCard({
  gastosFijos,
  gastosVariables,
}: ExpensesCardProps) {
  const totalFijos = gastosFijos.reduce(
    (sum, g) => sum + Number(g.monto_mensual),
    0
  );
  const totalVariables = gastosVariables.reduce(
    (sum, g) => sum + Number(g.monto),
    0
  );
  const total = totalFijos + totalVariables;

  return (
    <Card>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="font-heading text-lg font-semibold">Gastos</h2>
        <span className="font-semibold text-red">{formatearMXN(total)}</span>
      </div>

      <div className="mb-3">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-main/50">
          Fijos
        </p>
        <ul className="space-y-1.5">
          {gastosFijos.map((g) => (
            <li key={g.id} className="flex justify-between text-sm">
              <span className="text-text-main/70">{g.concepto}</span>
              <span className="font-medium">
                {formatearMXN(Number(g.monto_mensual))}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {gastosVariables.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-main/50">
            Variables
          </p>
          <ul className="space-y-1.5">
            {gastosVariables.map((g) => (
              <li key={g.id} className="flex justify-between text-sm">
                <span className="text-text-main/70">{g.concepto}</span>
                <span className="font-medium">
                  {formatearMXN(Number(g.monto))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
