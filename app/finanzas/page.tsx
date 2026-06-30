import { requireAuth } from "@/lib/auth";
import { getDashboardData } from "@/lib/dashboard";
import {
  diasRestantesMes,
  esSegundaMitadMes,
  nombreMes,
  nombreRol,
  obtenerPrimerDiaMes
} from "@/lib/calculations";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { FinanzasInteractivo } from "@/components/finanzas/FinanzasInteractivo";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";

export const dynamic = "force-dynamic";

export default async function FinanzasPage() {
  const usuario = await requireAuth();
  const data = await getDashboardData();
  const hoy = new Date();

  const puntoEquilibrio = Number(data.configuracion.punto_equilibrio_base);
  const porcentaje = data.estadoMes.porcentajeEquilibrio;
  const diasRestantes = diasRestantesMes(hoy);
  const totalPares = data.ventas.length;

  const mostrarAlerta =
    esSegundaMitadMes(hoy) && porcentaje < 40;

  return (
    <main className="min-h-screen bg-cream pb-28">
      <DashboardHeader
        mesLabel={nombreMes(hoy)}
        roleLabel={nombreRol(usuario.role)}
      />

      <div className="mx-auto max-w-lg space-y-4 px-4 py-5">
        <FinanzasInteractivo
          configuracionId={data.configuracion.id}
          ventasPorCanal={data.ventasPorCanal}
          ingresosIniciales={data.estadoMes.ingresosTotales}
          gastosIniciales={data.estadoMes.gastosTotales}
          breakEvenPoint={puntoEquilibrio}
          gastosFijos={data.soloFijosTotal}
          gastosFijosList={data.gastosFijos}
          mes={obtenerPrimerDiaMes(hoy)}
          paresVendidos={totalPares}
          promedioMensualAnual={data.promedioMensualAnual}
          diasRestantes={diasRestantes}
          mostrarAlerta={mostrarAlerta}
          totalPares={totalPares}
          ventasPorModelo={data.ventasPorModelo}
        />
      </div>

      <FloatingActionButton href="/ventas/nueva" label="Registrar venta" />
      <FloatingActionButton href="/gastos/nueva" label="Registrar gasto" offset={60} />
    </main>
  );
}