"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilSimple } from "phosphor-react";
import { createClient } from "@/lib/supabase";
import { formatearMXN } from "@/lib/calculations";

interface SummaryCardsProps {
  configuracionId: string;
  puntoEquilibrio: number;
  resultadoNeto: number;
  ingresosTotales: number;
  gastosTotales: number;
  paresVendidos: number;
  promedioMensualAnual: number;
}

function SummaryCard({
  label,
  value,
  valueClassName,
  children,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-cream-dark bg-surface p-3">
      <p className="text-xs text-text-muted">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-1">
        <p className={`text-sm font-semibold leading-tight ${valueClassName ?? "text-text-main"}`}>
          {value}
        </p>
        {children}
      </div>
    </div>
  );
}

export function SummaryCards({
  configuracionId,
  puntoEquilibrio,
  resultadoNeto,
  ingresosTotales,
  gastosTotales,
  paresVendidos,
  promedioMensualAnual,
}: SummaryCardsProps) {
  const router = useRouter();
  const [peValue, setPeValue] = useState(puntoEquilibrio);
  const [editingPe, setEditingPe] = useState(false);
  const [peInput, setPeInput] = useState(String(puntoEquilibrio));
  const [saving, setSaving] = useState(false);

  async function savePuntoEquilibrio() {
    const parsed = Number(peInput.replace(/[^0-9.]/g, ""));
    if (!parsed || parsed <= 0 || !configuracionId) {
      setPeInput(String(peValue));
      setEditingPe(false);
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("configuracion")
      .update({
        punto_equilibrio_base: parsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", configuracionId);

    setSaving(false);
    if (!error) {
      setPeValue(parsed);
      setEditingPe(false);
      router.refresh();
    }
  }

  const resultadoClass =
    resultadoNeto >= 0 ? "text-[#4A7C59]" : "text-[#B5443A]";

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <SummaryCard
        label="Punto de equilibrio"
        value={editingPe ? "" : formatearMXN(peValue)}
      >
        {editingPe ? (
          <input
            type="number"
            value={peInput}
            onChange={(e) => setPeInput(e.target.value)}
            onBlur={savePuntoEquilibrio}
            onKeyDown={(e) => {
              if (e.key === "Enter") savePuntoEquilibrio();
              if (e.key === "Escape") {
                setPeInput(String(peValue));
                setEditingPe(false);
              }
            }}
            disabled={saving}
            autoFocus
            className="w-full rounded border border-cream-dark px-2 py-0.5 text-sm"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setPeInput(String(peValue));
              setEditingPe(true);
            }}
            className="shrink-0 text-text-muted hover:text-text-main"
            aria-label="Editar punto de equilibrio"
          >
            <PencilSimple size={14} />
          </button>
        )}
      </SummaryCard>

      <SummaryCard
        label="Resultado del mes"
        value={formatearMXN(resultadoNeto)}
        valueClassName={resultadoClass}
      />

      <SummaryCard
        label="Ingresos del mes"
        value={formatearMXN(ingresosTotales)}
      />

      <SummaryCard
        label="Gastos del mes"
        value={formatearMXN(gastosTotales)}
      />

      <SummaryCard
        label="Pares vendidos"
        value={String(paresVendidos)}
      />

      <SummaryCard
        label="Promedio mensual anual"
        value={formatearMXN(promedioMensualAnual)}
      />
    </div>
  );
}
