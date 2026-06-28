import { requireAuth } from "@/lib/auth";
import { nombreMes, nombreRol, obtenerPrimerDiaMes } from "@/lib/calculations";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TablaVentas } from "@/components/ventas/TablaVentas";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

export const dynamic = "force-dynamic";

export default async function VentasPage() {
  const usuario = await requireAuth();
  const hoy = new Date();

  const mesInicio = obtenerPrimerDiaMes(hoy);
  const fechaFin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
  const mesFin = fechaFin.toISOString().slice(0, 10);

  return (
    <main className="min-h-screen bg-cream pb-28">
      <DashboardHeader
        mesLabel={nombreMes(hoy)}
        roleLabel={nombreRol(usuario.role)}
      />

      <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <TablaVentas mesInicio={mesInicio} mesFin={mesFin} />
      </div>

      <FloatingActionButton href="/ventas/nueva" label="Registrar venta" />
    </main>
  );
}