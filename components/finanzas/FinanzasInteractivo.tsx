'use client';

import { useState } from 'react';
import { SummaryCards } from '@/components/finanzas/SummaryCards';
import { Termometro } from '@/components/finanzas/Termometro';
import { IngresosTable } from '@/components/finanzas/IngresosTable';
import { GastosTable } from '@/components/finanzas/GastosTable';
import { BreakEvenProgress } from '@/components/dashboard/BreakEvenProgress';
import { MonthResultCard } from '@/components/dashboard/MonthResultCard';
import { PairsSoldCard } from '@/components/dashboard/PairsSoldCard';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { RecordatorioSemanal } from '@/components/ui/RecordatorioSemanal';
import type { VentasPorCanal, GastoFijo, EstadoMes } from '@/types';

interface FinanzasInteractivoProps {
  configuracionId: string;
  ventasPorCanal: VentasPorCanal;
  ingresosIniciales: number;
  gastosIniciales: number;
  breakEvenPoint: number;
  gastosFijos: number;
  gastosFijosList: GastoFijo[];
  mes: string;
  paresVendidos: number;
  promedioMensualAnual: number;
  diasRestantes: number;
  mostrarAlerta: boolean;
  totalPares: number;
  ventasPorModelo: any;
}

export function FinanzasInteractivo({
  configuracionId,
  ventasPorCanal,
  ingresosIniciales,
  gastosIniciales,
  breakEvenPoint,
  gastosFijos,
  gastosFijosList,
  mes,
  paresVendidos,
  promedioMensualAnual,
  diasRestantes,
  mostrarAlerta,
  totalPares,
  ventasPorModelo,
}: FinanzasInteractivoProps) {
  const [ingresosTotales, setIngresosTotales] = useState(ingresosIniciales);
  const [gastosTotales, setGastosTotales] = useState(gastosIniciales);

  const resultadoNeto = ingresosTotales - gastosTotales;
  const porcentaje = breakEvenPoint > 0 ? (ingresosTotales / breakEvenPoint) * 100 : 0;

  let semaforo: 'verde' | 'amarillo' | 'rojo' = 'rojo';
  if (resultadoNeto >= 0) semaforo = 'verde';
  else if (porcentaje >= 70) semaforo = 'amarillo';

  const estado: EstadoMes = {
    ingresosTotales,
    gastosTotales,
    resultadoNeto,
    porcentajeEquilibrio: porcentaje,
    semaforo,
  } as EstadoMes;

  return (
    <>
    <RecordatorioSemanal />
      <SummaryCards
        configuracionId={configuracionId}
        puntoEquilibrio={breakEvenPoint}
        resultadoNeto={resultadoNeto}
        ingresosTotales={ingresosTotales}
        gastosTotales={gastosTotales}
        paresVendidos={paresVendidos}
        promedioMensualAnual={promedioMensualAnual}
      />

      <Termometro
        currentIncome={ingresosTotales}
        breakEvenPoint={breakEvenPoint}
        gastosFijos={gastosFijos}
      />

      {mostrarAlerta && (
        <AlertBanner message="Estás en la segunda mitad del mes y aún no has alcanzado el 40% del punto de equilibrio. Considera registrar ventas pendientes o revisar gastos variables." />
      )}

      <BreakEvenProgress
        ingresos={ingresosTotales}
        puntoEquilibrio={breakEvenPoint}
        porcentaje={porcentaje}
        diasRestantes={diasRestantes}
      />

      <MonthResultCard estado={estado} />

      <IngresosTable
        ventasPorCanal={ventasPorCanal}
        mes={mes}
        onTotalChange={setIngresosTotales}
      />

      <GastosTable
        gastosFijos={gastosFijosList}
        mes={mes}
        onTotalChange={setGastosTotales}
      />

      <PairsSoldCard total={totalPares} ventasPorModelo={ventasPorModelo} />
    </>
  );
}