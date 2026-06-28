'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { formatearMXN } from '@/lib/calculations';
import type { GastoFijo } from '@/types';

interface GastosTableProps {
  gastosFijos: GastoFijo[];
  mes: string;
  onTotalChange?: (total: number) => void;
}

const VARIABLES_BASE = [
  { concepto: 'Materiales e insumos', presupuestado: 6603 },
  { concepto: 'Mano de obra (José)', presupuestado: 5050 },
  { concepto: 'Activaciones de marca', presupuestado: 3750 },
  { concepto: 'Empaque', presupuestado: 3300 },
  { concepto: 'Comisiones tarjeta/tienda', presupuestado: 3362 },
  { concepto: 'Envíos y traslados', presupuestado: 1500 },
  { concepto: 'Zapato regalo/compensación', presupuestado: 1204 },
];

const ADIC_FIJOS = ['fijo_adic_1','fijo_adic_2','fijo_adic_3','fijo_adic_4'];
const ADIC_VARS = ['var_adic_1','var_adic_2','var_adic_3','var_adic_4'];

function Delta({ presupuestado, real }: { presupuestado: number; real: number | null }) {
  if (real === null || real === undefined) return <span className="text-gray-400">—</span>;
  const delta = real - presupuestado;
  if (delta === 0) return <span className="text-gray-400">—</span>;
  if (delta > 0) return <span style={{ color: '#B5443A' }}>−{formatearMXN(Math.abs(delta))}</span>;
  return <span style={{ color: '#4A7C59' }}>+{formatearMXN(Math.abs(delta))}</span>;
}

export function GastosTable({ gastosFijos, mes, onTotalChange }: GastosTableProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [fijosReal, setFijosReal] = useState<Record<string, number>>(
    Object.fromEntries(gastosFijos.map(g => [g.concepto, g.monto_mensual]))
  );
  const [variablesReal, setVariablesReal] = useState<Record<string, number>>({});
  const [adicFijosNombre, setAdicFijosNombre] = useState<Record<string, string>>({});
  const [adicFijosMonto, setAdicFijosMonto] = useState<Record<string, number>>({});
  const [adicVarsNombre, setAdicVarsNombre] = useState<Record<string, string>>({});
  const [adicVarsMonto, setAdicVarsMonto] = useState<Record<string, number>>({});

  useEffect(() => {
    async function cargarDatos() {
      const { data } = await supabase
        .from('gastos_variables_mes')
        .select('*')
        .eq('mes', mes);

      if (!data) return;

      const nuevosFijosReal: Record<string, number> = { ...Object.fromEntries(gastosFijos.map(g => [g.concepto, g.monto_mensual])) };
      const nuevosVars: Record<string, number> = {};
      const nAdicFijosNombre: Record<string, string> = {};
      const nAdicFijosMonto: Record<string, number> = {};
      const nAdicVarsNombre: Record<string, string> = {};
      const nAdicVarsMonto: Record<string, number> = {};

      data.forEach((row: any) => {
        if (gastosFijos.find(g => g.concepto === row.concepto)) {
          nuevosFijosReal[row.concepto] = row.monto;
        } else if (VARIABLES_BASE.find(v => v.concepto === row.concepto)) {
          nuevosVars[row.concepto] = row.monto;
        } else if (ADIC_FIJOS.includes(row.concepto)) {
          nAdicFijosMonto[row.concepto] = row.monto;
          if (row.nombre_personalizado) nAdicFijosNombre[row.concepto] = row.nombre_personalizado;
        } else if (ADIC_VARS.includes(row.concepto)) {
          nAdicVarsMonto[row.concepto] = row.monto;
          if (row.nombre_personalizado) nAdicVarsNombre[row.concepto] = row.nombre_personalizado;
        }
      });

      setFijosReal(nuevosFijosReal);
      setVariablesReal(nuevosVars);
      setAdicFijosNombre(nAdicFijosNombre);
      setAdicFijosMonto(nAdicFijosMonto);
      setAdicVarsNombre(nAdicVarsNombre);
      setAdicVarsMonto(nAdicVarsMonto);
    }
    cargarDatos();
  }, [mes]);

  async function saveGasto(concepto: string, monto: number, nombrePersonalizado?: string) {
    await supabase.from('gastos_variables_mes').upsert(
      { mes, concepto, monto, nombre_personalizado: nombrePersonalizado ?? null },
      { onConflict: 'mes,concepto' }
    );
  }

  const subtotalFijosPresupuestado = gastosFijos.reduce((s, g) => s + g.monto_mensual, 0);
  const subtotalFijosReal = gastosFijos.reduce((s, g) => s + (fijosReal[g.concepto] ?? g.monto_mensual), 0)
    + Object.values(adicFijosMonto).reduce((s, v) => s + v, 0);

  const subtotalVarsPresupuestado = VARIABLES_BASE.reduce((s, v) => s + v.presupuestado, 0);
  const subtotalVarsReal = VARIABLES_BASE.reduce((s, v) => s + (variablesReal[v.concepto] ?? 0), 0)
    + Object.values(adicVarsMonto).reduce((s, v) => s + v, 0);

  const totalPresupuestado = subtotalFijosPresupuestado + subtotalVarsPresupuestado;
  const totalReal = subtotalFijosReal + subtotalVarsReal;

  useEffect(() => {
    onTotalChange?.(totalReal);
  }, [totalReal]);

  const thClass = "text-xs font-semibold text-gray-500 uppercase tracking-wide pb-2 text-right first:text-left";
  const tdClass = "py-2 text-sm text-right first:text-left";
  const inputClass = "w-24 text-right text-sm border-b border-gray-200 focus:border-gray-400 outline-none bg-transparent";
  const inputNombreClass = "w-full text-left text-sm border-b border-gray-200 focus:border-gray-400 outline-none bg-transparent text-gray-800 placeholder:text-gray-400";

  return (
    <div className="rounded-2xl bg-white p-5">
      <h2 className="font-bold text-lg mb-4">Gastos del mes</h2>
      <table className="w-full">
        <thead>
          <tr>
            <th className={thClass}>Concepto</th>
            <th className={thClass}>Presupuestado</th>
            <th className={thClass}>Real</th>
            <th className={thClass}>Δ</th>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan={4} className="pt-2 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-widest">Fijos</td></tr>
          {gastosFijos.map(g => (
            <tr key={g.id}>
              <td className={tdClass}>{g.concepto}</td>
              <td className={tdClass}>{formatearMXN(g.monto_mensual)}</td>
              <td className={tdClass}>
                <input className={inputClass} type="number"
                  value={fijosReal[g.concepto] ?? g.monto_mensual}
                  onChange={e => setFijosReal(prev => ({ ...prev, [g.concepto]: Number(e.target.value) }))}
                  onBlur={e => saveGasto(g.concepto, Number(e.target.value))}
                />
              </td>
              <td className={tdClass}><Delta presupuestado={g.monto_mensual} real={fijosReal[g.concepto] ?? g.monto_mensual} /></td>
            </tr>
          ))}
          {ADIC_FIJOS.map((key, i) => (
            <tr key={key}>
              <td className={tdClass}>
                <input className={inputNombreClass} type="text" placeholder={`Gasto adicional ${i+1}`}
                  value={adicFijosNombre[key] ?? ''}
                  onChange={e => setAdicFijosNombre(prev => ({ ...prev, [key]: e.target.value }))}
                  onBlur={e => saveGasto(key, adicFijosMonto[key] ?? 0, e.target.value)}
                />
              </td>
              <td className={tdClass}>$0</td>
              <td className={tdClass}>
                <input className={inputClass} type="number" placeholder="$0"
                  value={adicFijosMonto[key] ?? ''}
                  onChange={e => setAdicFijosMonto(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  onBlur={e => saveGasto(key, Number(e.target.value), adicFijosNombre[key])}
                />
              </td>
              <td className={tdClass}><Delta presupuestado={0} real={adicFijosMonto[key] ?? null} /></td>
            </tr>
          ))}
          <tr className="font-semibold border-t border-gray-100">
            <td className={tdClass}>Subtotal fijos</td>
            <td className={tdClass}>{formatearMXN(subtotalFijosPresupuestado)}</td>
            <td className={tdClass}>{formatearMXN(subtotalFijosReal)}</td>
            <td className={tdClass}><Delta presupuestado={subtotalFijosPresupuestado} real={subtotalFijosReal} /></td>
          </tr>

          <tr><td colSpan={4} className="pt-4 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-widest">Variables</td></tr>
          {VARIABLES_BASE.map(v => (
            <tr key={v.concepto}>
              <td className={tdClass}>{v.concepto}</td>
              <td className={tdClass}>{formatearMXN(v.presupuestado)}</td>
              <td className={tdClass}>
                <input className={inputClass} type="number" placeholder="$0"
                  value={variablesReal[v.concepto] ?? ''}
                  onChange={e => setVariablesReal(prev => ({ ...prev, [v.concepto]: Number(e.target.value) }))}
                  onBlur={e => saveGasto(v.concepto, Number(e.target.value))}
                />
              </td>
              <td className={tdClass}><Delta presupuestado={v.presupuestado} real={variablesReal[v.concepto] ?? null} /></td>
            </tr>
          ))}
          {ADIC_VARS.map((key, i) => (
            <tr key={key}>
              <td className={tdClass}>
                <input className={inputNombreClass} type="text" placeholder={`Variable adicional ${i+1}`}
                  value={adicVarsNombre[key] ?? ''}
                  onChange={e => setAdicVarsNombre(prev => ({ ...prev, [key]: e.target.value }))}
                  onBlur={e => saveGasto(key, adicVarsMonto[key] ?? 0, e.target.value)}
                />
              </td>
              <td className={tdClass}>$0</td>
              <td className={tdClass}>
                <input className={inputClass} type="number" placeholder="$0"
                  value={adicVarsMonto[key] ?? ''}
                  onChange={e => setAdicVarsMonto(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                  onBlur={e => saveGasto(key, Number(e.target.value), adicVarsNombre[key])}
                />
              </td>
              <td className={tdClass}><Delta presupuestado={0} real={adicVarsMonto[key] ?? null} /></td>
            </tr>
          ))}
          <tr className="font-semibold border-t border-gray-100">
            <td className={tdClass}>Subtotal variables</td>
            <td className={tdClass}>{formatearMXN(subtotalVarsPresupuestado)}</td>
            <td className={tdClass}>{formatearMXN(subtotalVarsReal)}</td>
            <td className={tdClass}><Delta presupuestado={subtotalVarsPresupuestado} real={subtotalVarsReal} /></td>
          </tr>
          <tr className="font-bold text-base border-t-2 border-gray-200">
            <td className="py-3 text-left">TOTAL</td>
            <td className="py-3 text-right">{formatearMXN(totalPresupuestado)}</td>
            <td className="py-3 text-right">{formatearMXN(totalReal)}</td>
            <td className="py-3 text-right"><Delta presupuestado={totalPresupuestado} real={totalReal} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}