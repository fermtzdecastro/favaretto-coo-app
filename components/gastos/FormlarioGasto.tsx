'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import confetti from 'canvas-confetti';

const CATEGORIAS = [
  { value: 'fijo', label: 'Gasto fijo' },
  { value: 'variable', label: 'Gasto variable' },
];

const UNIDADES = ['pieza', 'par', 'metro', 'kg', 'litro', 'rollo', 'caja', 'otro'];

interface FormularioGastoProps {
  onGastoGuardado?: () => void;
}

export function FormularioGasto({ onGastoGuardado }: FormularioGastoProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [concepto, setConcepto] = useState('');
  const [categoria, setCategoria] = useState('variable');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [esInsumo, setEsInsumo] = useState(false);
  const [cantidad, setCantidad] = useState('');
  const [unidad, setUnidad] = useState('pieza');
  const [proveedor, setProveedor] = useState('');
  const [notas, setNotas] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function guardarGasto(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);

    if (!concepto.trim()) { setMensaje('Escribe el concepto del gasto.'); return; }
    if (!monto || Number(monto) <= 0) { setMensaje('Ingresa un monto válido.'); return; }
    if (esInsumo && (!cantidad || Number(cantidad) <= 0)) { setMensaje('Ingresa la cantidad del insumo.'); return; }

    setGuardando(true);

    const { error } = await supabase.from('gastos_diarios').insert({
      fecha,
      concepto: concepto.trim(),
      categoria,
      monto: Number(monto),
      es_insumo: esInsumo,
      cantidad: esInsumo ? Number(cantidad) : null,
      unidad: esInsumo ? unidad : null,
      proveedor: proveedor.trim() || null,
      notas: notas.trim() || null,
    });

    setGuardando(false);

    if (error) { setMensaje('Error al guardar el gasto: ' + error.message); return; }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#B5443A', '#C9956E', '#4A7C59', '#F5F0E8'],
    });
    onGastoGuardado?.();
    setTimeout(() => {
      router.push('/finanzas');
      router.refresh();
    }, 2000);
  }

  return (
    <form onSubmit={guardarGasto} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Concepto</label>
        <input type="text" value={concepto} onChange={(e) => setConcepto(e.target.value)}
          placeholder="Ej. Piel, renta del taller, comisión tarjeta..."
          className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm" />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Tipo de gasto</label>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIAS.map((c) => (
            <button key={c.value} type="button" onClick={() => setCategoria(c.value)}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                categoria === c.value ? 'border-text-main bg-text-main text-cream' : 'border-cream-dark bg-surface text-text-main'
              }`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Monto</label>
          <input type="number" value={monto} onChange={(e) => setMonto(e.target.value)}
            placeholder="$0" className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="rounded-xl border border-cream-dark bg-surface p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-text-main">
          <input type="checkbox" checked={esInsumo} onChange={(e) => setEsInsumo(e.target.checked)} />
          ¿Es un insumo? (piel, tacones, materiales)
        </label>

        {esInsumo && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-text-main/70 mb-1">Cantidad</label>
              <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)}
                placeholder="0" className="w-full rounded-lg border border-cream-dark bg-cream px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-main/70 mb-1">Unidad</label>
              <select value={unidad} onChange={(e) => setUnidad(e.target.value)}
                className="w-full rounded-lg border border-cream-dark bg-cream px-3 py-2 text-sm">
                {UNIDADES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="mt-3">
          <label className="block text-xs font-medium text-text-main/70 mb-1">Proveedor (opcional)</label>
          <input type="text" value={proveedor} onChange={(e) => setProveedor(e.target.value)}
            placeholder="Nombre del proveedor"
            className="w-full rounded-lg border border-cream-dark bg-cream px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Notas (opcional)</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3}
          className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm" />
      </div>

      {mensaje && <p className="text-sm text-[#B5443A]">{mensaje}</p>}

      <button type="submit" disabled={guardando}
        className="w-full rounded-xl bg-text-main py-3 text-sm font-semibold text-cream disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Registrar gasto'}
      </button>
    </form>
  );
}