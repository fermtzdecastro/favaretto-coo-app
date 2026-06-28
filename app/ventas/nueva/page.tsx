import { FormularioVenta } from "@/components/ventas/FormularioVenta";

export default function NuevaVentaPage() {
  return (
    <main className="min-h-screen bg-cream px-4 py-8 pb-28">
      <div className="mx-auto max-w-lg">
        <h1 className="font-heading text-2xl font-semibold">Registrar venta</h1>
        <p className="mt-1 mb-6 text-sm text-text-main/60">
          Completa los datos de la venta
        </p>
        <FormularioVenta />
      </div>
    </main>
  );
}