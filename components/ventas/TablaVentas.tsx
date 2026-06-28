'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { formatearMXN } from '@/lib/calculations';
import * as XLSX from 'xlsx';

interface ModeloZapato {
  id: string;
  nombre: string;
}

interface VentaRow {
  id: string;
  fecha: string;
  modelo_id: string;
  canal: string;
  precio_venta: number;
  descuento: boolean;
  descuento_monto: number;
  cliente_nombre: string | null;
  notas: string | null;
}

const CANALES = [
    { value: 'tienda', label: 'Tienda' },
    { value: 'directa_coleccion', label: 'Directa – Colección Actual' },
    { value: 'directa_custom', label: 'Directa – Custom Made' },
    { value: 'activacion', label: 'Activación' },
    { value: 'otro', label: 'Otra' },
  ];

interface TablaVentasProps {
  mesInicio: string;
  mesFin: string;
}

export function TablaVentas({ mesInicio, mesFin }: TablaVentasProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [ventas, setVentas] = useState<VentaRow[]>([]);
  const [modelos, setModelos] = useState<ModeloZapato[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, [mesInicio, mesFin]);

  async function cargar() {
    setCargando(true);
    const [{ data: ventasData }, { data: modelosData }] = await Promise.all([
      supabase
        .from('ventas')
        .select('id, fecha, modelo_id, canal, precio_venta, descuento, descuento_monto, cliente_nombre, notas')
        .gte('fecha', mesInicio)
        .lt('fecha', mesFin)
        .order('fecha', { ascending: false }),
      supabase.from('modelos_zapato').select('id, nombre').order('nombre'),
    ]);

    if (ventasData) setVentas(ventasData);
    if (modelosData) setModelos(modelosData);
    setCargando(false);
  }

  async function actualizarCampo(id: string, campo: keyof VentaRow, valor: any) {
    setVentas(prev => prev.map(v => v.id === id ? { ...v, [campo]: valor } : v));
    await supabase.from('ventas').update({ [campo]: valor }).eq('id', id);
  }

  async function eliminarVenta(id: string) {
    if (!confirm('¿Eliminar esta venta?')) return;
    setVentas(prev => prev.filter(v => v.id !== id));
    await supabase.from('ventas').delete().eq('id', id);
  }
  async function descargarExcel(soloMes: boolean) {
    let query = supabase
      .from('ventas')
      .select('fecha, modelo_id, canal, precio_venta, descuento, descuento_monto, cliente_nombre, notas')
      .order('fecha', { ascending: false });
  
    if (soloMes) {
      query = query.gte('fecha', mesInicio).lt('fecha', mesFin);
    }
  
    const { data } = await query;
    if (!data) return;
  
    const modelosMap = Object.fromEntries(modelos.map(m => [m.id, m.nombre]));
  
    const canalLabel: Record<string, string> = {
      tienda: 'Tienda',
      directa_coleccion: 'Directa – Colección Actual',
      directa_custom: 'Directa – Custom Made',
      activacion: 'Activación',
      otro: 'Otra',
    };
  
    const filas = data.map(v => ({
      Fecha: v.fecha,
      Modelo: modelosMap[v.modelo_id] ?? v.modelo_id,
      Canal: canalLabel[v.canal] ?? v.canal,
      'Precio venta': v.precio_venta,
      Descuento: v.descuento ? 'Sí' : 'No',
      'Monto descuento': v.descuento_monto || 0,
      'Precio final': v.descuento ? v.precio_venta - (v.descuento_monto || 0) : v.precio_venta,
      Cliente: v.cliente_nombre ?? '',
      Notas: v.notas ?? '',
    }));
  
    const ws = XLSX.utils.json_to_sheet(filas);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
    const nombre = soloMes ? `Ventas_${mesInicio}.xlsx` : 'Ventas_Historico.xlsx';
    XLSX.writeFile(wb, nombre);
  }

  const total = ventas.reduce((sum, v) => {
    const precioFinal = v.descuento ? v.precio_venta - (v.descuento_monto || 0) : v.precio_venta;
    return sum + precioFinal;
  }, 0);

  if (cargando) {
    return (
      <div className="rounded-2xl bg-white p-5 text-sm text-text-muted">
        Cargando ventas...
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-5 text-center text-sm text-text-muted">
        Aún no hay ventas registradas este mes.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-lg">Ventas del mes</h2>
        <span className="font-bold text-lg" style={{ color: '#4A7C59' }}>
          {formatearMXN(total)}
        </span>
      </div>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => descargarExcel(true)}
          className="rounded-lg border border-cream-dark bg-surface px-3 py-1.5 text-xs font-medium text-text-main"
        >
          ↓ Mes actual
        </button>
        <button
          type="button"
          onClick={() => descargarExcel(false)}
          className="rounded-lg border border-cream-dark bg-surface px-3 py-1.5 text-xs font-medium text-text-main"
        >
          ↓ Historial completo
        </button>
      </div>

      <div className="space-y-3">
        {ventas.map((v) => {
          const precioFinal = v.descuento ? v.precio_venta - (v.descuento_monto || 0) : v.precio_venta;
          return (
            <div key={v.id} className="rounded-xl border border-cream-dark p-3">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <select
                  className="rounded-lg border border-cream-dark bg-surface px-2 py-1 text-sm"
                  value={v.modelo_id}
                  onChange={e => actualizarCampo(v.id, 'modelo_id', e.target.value)}
                >
                  {modelos.map(m => (
                    <option key={m.id} value={m.id}>{m.nombre}</option>
                  ))}
                </select>

                <select
                  className="rounded-lg border border-cream-dark bg-surface px-2 py-1 text-sm"
                  value={v.canal}
                  onChange={e => actualizarCampo(v.id, 'canal', e.target.value)}
                >
                  {CANALES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="number"
                  className="rounded-lg border border-cream-dark bg-surface px-2 py-1 text-sm"
                  value={v.precio_venta}
                  onChange={e => actualizarCampo(v.id, 'precio_venta', Number(e.target.value))}
                />
                <input
                  type="date"
                  className="rounded-lg border border-cream-dark bg-surface px-2 py-1 text-sm"
                  value={v.fecha}
                  onChange={e => actualizarCampo(v.id, 'fecha', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <input
                  type="text"
                  className="rounded-lg border border-cream-dark bg-surface px-2 py-1 text-sm"
                  placeholder="Cliente"
                  value={v.cliente_nombre ?? ''}
                  onChange={e => actualizarCampo(v.id, 'cliente_nombre', e.target.value)}
                />
                <label className="flex items-center gap-1 text-xs text-text-muted">
                  <input
                    type="checkbox"
                    checked={v.descuento}
                    onChange={e => actualizarCampo(v.id, 'descuento', e.target.checked)}
                  />
                  Descuento
                  {v.descuento && (
                    <input
                      type="number"
                      className="ml-1 w-20 rounded-lg border border-cream-dark bg-surface px-1 py-0.5 text-xs"
                      value={v.descuento_monto}
                      onChange={e => actualizarCampo(v.id, 'descuento_monto', Number(e.target.value))}
                    />
                  )}
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {formatearMXN(precioFinal)}
                </span>
                <button
                  type="button"
                  onClick={() => eliminarVenta(v.id)}
                  className="text-xs text-[#B5443A] underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}