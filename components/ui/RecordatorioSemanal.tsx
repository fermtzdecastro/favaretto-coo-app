'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

type Humor = 'feliz' | 'neutral' | 'triste' | 'enojado';

function getHumor(diasSinActividad: number): Humor {
  if (diasSinActividad <= 2) return 'feliz';
  if (diasSinActividad <= 4) return 'neutral';
  if (diasSinActividad <= 7) return 'triste';
  return 'enojado';
}

function Monito({ humor }: { humor: Humor }) {
  const emojis: Record<Humor, string> = {
    feliz: '🥰',
    neutral: '😐',
    triste: '😢',
    enojado: '😤',
  };

  const mensajes: Record<Humor, string> = {
    feliz: '¡Vas muy bien! Tus datos están al día 🎉',
    neutral: 'Llevas unos días sin registrar. ¡No te olvides!',
    triste: 'Ya tengo una semana sin saber de ti... ¿todo bien?',
    enojado: '¡Oye! ¡Llevo más de una semana esperando tus datos! 😤 ¡Registra algo YA!',
  };

  const colores: Record<Humor, string> = {
    feliz: '#4A7C59',
    neutral: '#C9A227',
    triste: '#C9956E',
    enojado: '#B5443A',
  };

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-4"
      style={{ backgroundColor: colores[humor] + '18', borderLeft: `4px solid ${colores[humor]}` }}
    >
      <span className="text-4xl">{emojis[humor]}</span>
      <div>
        <p className="text-sm font-semibold" style={{ color: colores[humor] }}>
          {mensajes[humor]}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Tu mascota de datos te está vigilando 👀
        </p>
      </div>
    </div>
  );
}

export function RecordatorioSemanal() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [diasSinActividad, setDiasSinActividad] = useState<number | null>(null);

  useEffect(() => {
    async function verificar() {
      const hoy = new Date();

      // Buscar la venta más reciente
      const { data: ultimaVenta } = await supabase
        .from('ventas')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Buscar el ingreso manual más reciente
      const { data: ultimoIngreso } = await supabase
        .from('ingresos_manuales_mes')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Tomar la fecha más reciente entre ventas e ingresos
      const fechas = [
        ultimaVenta?.created_at,
        ultimoIngreso?.created_at,
      ].filter(Boolean).map(f => new Date(f!));

      if (fechas.length === 0) {
        setDiasSinActividad(8); // nunca ha registrado nada
        return;
      }

      const masReciente = new Date(Math.max(...fechas.map(f => f.getTime())));
      const diff = Math.floor((hoy.getTime() - masReciente.getTime()) / (1000 * 60 * 60 * 24));
      setDiasSinActividad(diff);
    }

    verificar();
  }, []);

  if (diasSinActividad === null) return null;

  const humor = getHumor(diasSinActividad);

 // Siempre mostrar el monito

  return <Monito humor={humor} />;
}