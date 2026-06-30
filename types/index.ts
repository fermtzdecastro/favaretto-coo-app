'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { formatearMXN } from '@/lib/calculations';
import type { VentasPorCanal } from '@/types';

interface IngresosTableProps {
  ventasPorCanal: VentasPorCanal;
  mes: string;
  onTotalChange?: (total: number) => void;
}

const ADIC_INGRESOS = ['ingreso_adic_1', 'ingreso_adic_2'];

interface VentasCanal {
  tienda: number;
  directa_coleccion: number;
  directa_custom: number;
  activacion: number;
  otro: number;
}

export function IngresosTable({ ventasPorCanal, mes, onTotalChange }: IngresosTableProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [ventasCanal, setVentasCanal] = useState<VentasCanal>({
    tienda: 0,
    directa_coleccion: 0,
    directa_custom: 0,
    activacion: 0,
    otro: 0,
  });

  const [tienda, setTienda] = useState(0);
  const [directaColeccion, setDirectaColeccion] = useState(0);
  const [directaCustom, setDirectaCustom] = useState(0);
  const [activacion, setActivacion] = useState(0);
  const [otros, setOtros] = useState(0);
  const [adicNombre, setAdicNombre] = useState<Record<string, string>>({});
  const [adicMonto, setAdicMonto] = useState<Record<string, number>>({});

  useEffect(() => {
    async function cargar() {
      const { data: manuales } = await supabase
        .from('ingresos_manuales_mes')
        .select('*')
        .eq('mes', mes);

      if (manuales) {
        manuales.forEach((row: any) => {
          if (row.concepto === 'tienda') setTienda(row.monto);
          else if (row.concepto === 'directa_coleccion') setDirectaColeccion(row.monto);
          else if (row.concepto === 'directa_custom') setDirectaCustom(row.monto);
          else if (row.concepto === 'activacion') setActivacion(row.monto);
          else if (row.concepto === 'otros') setOtros(row.monto);
          else if (ADIC_INGRESOS.includes(row.concepto)) {
            setAdicMonto(prev => ({ ...prev, [row.concepto]: row.monto }));
            if (row.nombre_personalizado) {
              setAdicNombre(prev => ({ ...prev, [row.concepto]: row.nombre_personalizado }));
            }
          }
        });
      }

      const [anio, m] = mes.split('-').map(Number);
      const pad = (n: number) => String(n).padStart(2, '0');
      const mesFin = m === 12 ? `${anio + 1}-01-01` : `${anio}-${pad(m + 1)}-01`;

      const canalesValidos = ['tienda', 'directa_coleccion', 'directa_custom', 'activacion', 'otro'];
      const { data: ventas } = await supabase
        .from('ventas')
        .select('canal, precio_venta, descuento, descuento_monto')
        .gte('fecha', mes)
        .lt('fecha', mesFin);

      if (ventas) {
        const agrupado: VentasCanal = {
          tienda: 0,
          directa_coleccion: 0,
          directa_custom: 0,
          activacion: 0,
          otro: 0,
        };
        ventas.forEach((v: any) => {
          if (!canalesValidos.includes(v.canal)) return;
          const precio = v.descuento ? v.precio_venta - (v.descuento_monto || 0) : v.precio_venta;
          const canal = v.canal as keyof VentasCanal;
          if (canal in agrupado) agrupado[canal] += precio;
        });
        setVentasCanal(agrupado);
      }
    }
    cargar();
  }, [mes]);

  async function saveIngreso(concepto: string, monto: number, nombrePersonalizado?: string) {
    await supabase.from('ingresos_manuales_mes').upsert(
      { mes, concepto, monto, nombre_personalizado: nombrePersonalizado ?? null },
      { onConflict: 'mes,concepto' }
    );
  }

  const totalAdicionales = Object.values(adicMonto).reduce((s, v) => s + v, 0);
  const total =
    (ventasCanal.tienda + tienda) +
    (ventasCanal.directa_coleccion + directaColeccion) +
    (ventasCanal.directa_custom + directaCustom) +
    (ventasCanal.activacion + activacion) +
    (ventasCanal.otro + otros) +
    totalAdicionales;

  useEffect(() => {
    onTotalChange?.(total);
  }, [total]);

  const rowClass = "py-2 border-b border-gray-50 last:border-0";
  const inputClass = "w-24 text-right text-sm border-b border-gray-200 focus:border-gray-400 outline-none bg-transparent";
  const inputNombreClass = "flex-1 text-left text-sm border-b border-gray-200 focus:border-gray-400 outline-none bg-transparent text-gray-800 placeholder:text-gray-400";

  function FilaIngreso({
    label,
    deVentas,
    manual,
    setManual,
    concepto,
  }: {
    label: string;
    deVentas: number;
    manual: number;
    setManual: (v: number) => void;
    concepto: string;
  }) {
    const totalFila = deVentas + manual;
    return (
      <div className={rowClass}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">{label}</span>
          <span className="text-sm font-semibold" style={{ color: '#4A7C59' }}>
            {formatearMXN(totalFila)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-400 gap-2">
          <span>Ventas registradas: <span className="text-gray-600 font-medium">{formatearMXN(deVentas)}</span></span>
          <div className="flex items-center gap-1">
            <span>Ajuste manual:</span>
            <input
              className={inputClass + " text-xs w-20"}
              type="number"
              value={manual || ''}
              placeholder="$0"
              onChange={e => setManual(Number(e.target.value))}
              onBlur={e => saveIngreso(concepto, Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">Ingresos del mes</h2>
        <span className="font-bold text-lg" style={{ color: '#4A7C59' }}>{formatearMXN(total)}</span>
      </div>

      <FilaIngreso label="Tienda" deVentas={ventasCanal.tienda} manual={tienda} setManual={setTienda} concepto="tienda" />
      <FilaIngreso label="Directa — Colección Actual" deVentas={ventasCanal.directa_coleccion} manual={directaColeccion} setManual={setDirectaColeccion} concepto="directa_coleccion" />
      <FilaIngreso label="Directa — Custom Made" deVentas={ventasCanal.directa_custom} manual={directaCustom} setManual={setDirectaCustom} concepto="directa_custom" />
      <FilaIngreso label="Activación" deVentas={ventasCanal.activacion} manual={activacion} setManual={setActivacion} concepto="activacion" />
      <FilaIngreso label="Otros" deVentas={ventasCanal.otro} manual={otros} setManual={setOtros} concepto="otros" />

      {ADIC_INGRESOS.map((key, i) => (
        <div className={rowClass} key={key}>
          <div className="flex items-center justify-between gap-2">
            <input className={inputNombreClass} type="text" placeholder={`Ingreso adicional ${i + 1}`}
              value={adicNombre[key] ?? ''}
              onChange={e => setAdicNombre(prev => ({ ...prev, [key]: e.target.value }))}
              onBlur={e => saveIngreso(key, adicMonto[key] ?? 0, e.target.value)}
            />
            <input className={inputClass} type="number" placeholder="$0"
              value={adicMonto[key] ?? ''}
              onChange={e => setAdicMonto(prev => ({ ...prev, [key]: Number(e.target.value) }))}
              onBlur={e => saveIngreso(key, Number(e.target.value), adicNombre[key] ?? '')}
            />
          </div>
        </div>
      ))}
    </div>
  );
}