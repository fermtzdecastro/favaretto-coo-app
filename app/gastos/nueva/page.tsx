import { FormularioGasto } from "@/components/gastos/FormularioGasto";
import { createClient } from "@supabase/supabase-js";

const VARIABLES_BASE = [
  'Materiales e insumos',
  'Mano de obra (José)',
  'Activaciones de marca',
  'Empaque',
  'Comisiones tarjeta/tienda',
  'Envíos y traslados',
  'Zapato regalo/compensación',
];

export default async function NuevoGastoPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data: gastosFijos } = await supabase
    .from('gastos_fijos')
    .select('concepto');

  const conceptosFijos = (gastosFijos ?? []).map(g => g.concepto);

  return (
    <main className="min-h-screen bg-cream px-4 py-8 pb-28">
      <div className="mx-auto max-w-lg">
        <h1 className="font-heading text-2xl font-semibold">Registrar gasto</h1>
        <p className="mt-1 mb-6 text-sm text-text-main/60">
          Completa los datos del gasto
        </p>
        <FormularioGasto conceptosFijos={conceptosFijos} conceptosVariables={VARIABLES_BASE} />
      </div>
    </main>
  );
}