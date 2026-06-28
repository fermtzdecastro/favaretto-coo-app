'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import confetti from 'canvas-confetti';

interface ModeloZapato {
  id: string;
  nombre: string;
}

interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  instagram: string | null;
}

const CANALES = [
  { value: 'tienda', label: 'Tienda' },
  { value: 'directa_coleccion', label: 'Directa – Colección Actual' },
  { value: 'directa_custom', label: 'Directa – Custom Made' },
  { value: 'activacion', label: 'Activación' },
  { value: 'otro', label: 'Otra' },
];

interface FormularioVentaProps {
  onVentaGuardada?: () => void;
}

export function FormularioVenta({ onVentaGuardada }: FormularioVentaProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [modelos, setModelos] = useState<ModeloZapato[]>([]);
  const [modeloId, setModeloId] = useState('');
  const [canal, setCanal] = useState('tienda');
  const [precio, setPrecio] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [descuento, setDescuento] = useState(false);
  const [descuentoMonto, setDescuentoMonto] = useState('');
  const [notas, setNotas] = useState('');
  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [resultados, setResultados] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarNuevoCliente, setMostrarNuevoCliente] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: '', telefono: '', email: '', direccion: '', instagram: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  useEffect(() => {
    async function cargarModelos() {
      const { data } = await supabase
        .from('modelos_zapato')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre');
      if (data) setModelos(data);
    }
    cargarModelos();
  }, []);

  useEffect(() => {
    if (busquedaCliente.trim().length < 2) { setResultados([]); return; }
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('clientes')
        .select('id, nombre, telefono, email, direccion, instagram')
        .or(`nombre.ilike.%${busquedaCliente}%,telefono.ilike.%${busquedaCliente}%`)
        .limit(5);
      if (data) setResultados(data);
    }, 300);
    return () => clearTimeout(timeout);
  }, [busquedaCliente]);

  function seleccionarCliente(cliente: Cliente) {
    setClienteSeleccionado(cliente);
    setBusquedaCliente(cliente.nombre);
    setResultados([]);
    setMostrarNuevoCliente(false);
  }

  function limpiarClienteSeleccionado() {
    setClienteSeleccionado(null);
    setBusquedaCliente('');
    setMostrarNuevoCliente(false);
  }

  async function guardarVenta(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    if (!modeloId) { setMensaje('Selecciona un modelo de zapato.'); return; }
    if (!precio || Number(precio) <= 0) { setMensaje('Ingresa un precio válido.'); return; }

    setGuardando(true);

    let clienteId: string | null = clienteSeleccionado?.id ?? null;
    let clienteNombre = clienteSeleccionado?.nombre ?? '';

    if (!clienteId && mostrarNuevoCliente && nuevoCliente.nombre.trim()) {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          nombre: nuevoCliente.nombre.trim(),
          telefono: nuevoCliente.telefono.trim() || null,
          email: nuevoCliente.email.trim() || null,
          direccion: nuevoCliente.direccion.trim() || null,
          instagram: nuevoCliente.instagram.trim() || null,
        })
        .select('id, nombre')
        .single();
      if (error) { setMensaje('Error al guardar el cliente: ' + error.message); setGuardando(false); return; }
      clienteId = data.id;
      clienteNombre = data.nombre;
    } else if (!clienteId && busquedaCliente.trim()) {
      clienteNombre = busquedaCliente.trim();
    }

    const { error: ventaError } = await supabase.from('ventas').insert({
      fecha,
      modelo_id: modeloId,
      canal,
      precio_venta: Number(precio),
      descuento,
      descuento_monto: descuento ? Number(descuentoMonto) || 0 : 0,
      cliente_id: clienteId,
      cliente_nombre: clienteNombre || null,
      notas: notas.trim() || null,
    });

    setGuardando(false);

    if (ventaError) { setMensaje('Error al guardar la venta: ' + ventaError.message); return; }

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#C9956E', '#4A7C59', '#C9A227', '#B5443A', '#F5F0E8'],
    });
    onVentaGuardada?.();
    setTimeout(() => {
      router.push('/finanzas');
      router.refresh();
    }, 3000);
  }

  return (
    <form onSubmit={guardarVenta} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Modelo de zapato</label>
        <select value={modeloId} onChange={(e) => setModeloId(e.target.value)}
          className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm">
          <option value="">Selecciona un modelo</option>
          {modelos.map((m) => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Canal de venta</label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {CANALES.map((c) => (
            <button key={c.value} type="button" onClick={() => setCanal(c.value)}
              className={`rounded-xl border px-3 py-2 text-sm transition ${
                canal === c.value ? 'border-text-main bg-text-main text-cream' : 'border-cream-dark bg-surface text-text-main'
              }`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Precio de venta</label>
          <input type="number" value={precio} onChange={(e) => setPrecio(e.target.value)}
            placeholder="$0" className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-main mb-1">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm" />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-text-main">
          <input type="checkbox" checked={descuento} onChange={(e) => setDescuento(e.target.checked)} />
          ¿Aplicó descuento?
        </label>
        {descuento && (
          <input type="number" value={descuentoMonto} onChange={(e) => setDescuentoMonto(e.target.value)}
            placeholder="Monto del descuento"
            className="mt-2 w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm" />
        )}
      </div>

      <div className="rounded-xl border border-cream-dark bg-surface p-4">
        <label className="block text-sm font-medium text-text-main mb-1">Cliente</label>
        {clienteSeleccionado ? (
          <div className="flex items-start justify-between rounded-lg bg-cream p-3">
            <div className="text-sm">
              <p className="font-semibold">{clienteSeleccionado.nombre}</p>
              {clienteSeleccionado.telefono && <p className="text-text-main/60">{clienteSeleccionado.telefono}</p>}
              {clienteSeleccionado.email && <p className="text-text-main/60">{clienteSeleccionado.email}</p>}
            </div>
            <button type="button" onClick={limpiarClienteSeleccionado} className="text-xs text-text-main/60 underline">Cambiar</button>
          </div>
        ) : (
          <>
            <input type="text" value={busquedaCliente} onChange={(e) => setBusquedaCliente(e.target.value)}
              placeholder="Buscar por nombre o teléfono..."
              className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm" />
            {resultados.length > 0 && (
              <div className="mt-2 space-y-1">
                {resultados.map((c) => (
                  <button key={c.id} type="button" onClick={() => seleccionarCliente(c)}
                    className="block w-full rounded-lg bg-cream px-3 py-2 text-left text-sm hover:bg-cream-dark">
                    <span className="font-medium">{c.nombre}</span>
                    {c.telefono && <span className="text-text-main/60"> — {c.telefono}</span>}
                  </button>
                ))}
              </div>
            )}
            {busquedaCliente.trim().length >= 2 && resultados.length === 0 && !mostrarNuevoCliente && (
              <button type="button"
                onClick={() => { setMostrarNuevoCliente(true); setNuevoCliente((prev) => ({ ...prev, nombre: busquedaCliente })); }}
                className="mt-2 text-sm font-medium text-text-main underline">
                + Crear cliente nuevo "{busquedaCliente}"
              </button>
            )}
            {mostrarNuevoCliente && (
              <div className="mt-3 space-y-2 rounded-lg bg-cream p-3">
                {['nombre', 'telefono', 'email', 'direccion', 'instagram'].map((campo) => (
                  <input key={campo} type={campo === 'email' ? 'email' : 'text'}
                    value={(nuevoCliente as any)[campo]}
                    onChange={(e) => setNuevoCliente((prev) => ({ ...prev, [campo]: e.target.value }))}
                    placeholder={campo === 'nombre' ? 'Nombre completo' : campo === 'telefono' ? 'Teléfono' : campo === 'email' ? 'Email' : campo === 'direccion' ? 'Dirección de envío' : 'Instagram (@usuario)'}
                    className="w-full rounded-lg border border-cream-dark bg-surface px-3 py-2 text-sm" />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-main mb-1">Notas (opcional)</label>
        <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={3}
          className="w-full rounded-xl border border-cream-dark bg-surface px-3 py-2 text-sm" />
      </div>

      {mensaje && <p className="text-sm text-[#B5443A]">{mensaje}</p>}

      <button type="submit" disabled={guardando}
        className="w-full rounded-xl bg-text-main py-3 text-sm font-semibold text-cream disabled:opacity-50">
        {guardando ? 'Guardando...' : 'Registrar venta'}
      </button>
    </form>
  );
}
