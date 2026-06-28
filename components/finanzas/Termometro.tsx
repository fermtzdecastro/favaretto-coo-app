"use client";

import { formatearMXN } from "@/lib/calculations";

interface TermometroProps {
  currentIncome: number;
  breakEvenPoint?: number;
  gastosFijos?: number;
}

const OVERFLOW_RATIO = 0.5;
const PE_FRACTION = 1 / (1 + OVERFLOW_RATIO);

function calcFillSegments(
  currentIncome: number,
  breakEvenPoint: number,
  gastosFijos: number
) {
  const fijosPercentOfPE = gastosFijos / breakEvenPoint;
  const fijosPercent = fijosPercentOfPE * PE_FRACTION * 100;
  const peLinePercent = PE_FRACTION * 100;

  if (currentIncome <= 0) {
    return { red: 0, yellow: 0, green: 0 };
  }

  if (currentIncome <= gastosFijos) {
    const incomeFraction = (currentIncome / breakEvenPoint) * PE_FRACTION;
    return { red: incomeFraction * 100, yellow: 0, green: 0 };
  }

  if (currentIncome <= breakEvenPoint) {
    const incomeFraction = (currentIncome / breakEvenPoint) * PE_FRACTION;
    return {
      red: fijosPercent,
      yellow: incomeFraction * 100 - fijosPercent,
      green: 0,
    };
  }

  const overflow = currentIncome - breakEvenPoint;
  const overflowFraction = Math.min(overflow / (breakEvenPoint * OVERFLOW_RATIO), 1);
  const greenPercent = overflowFraction * (100 - peLinePercent);

  return {
    red: fijosPercent,
    yellow: peLinePercent - fijosPercent,
    green: greenPercent,
  };
}

export function Termometro({
  currentIncome,
  breakEvenPoint = 36469,
  gastosFijos = 11700,
}: TermometroProps) {
  const fijosPercent = (gastosFijos / breakEvenPoint) * PE_FRACTION * 100;
  const peLinePercent = PE_FRACTION * 100;
  const superoPE = currentIncome >= breakEvenPoint;
  const faltante = Math.max(breakEvenPoint - currentIncome, 0);
  const porcentajeSobrePE =
    breakEvenPoint > 0
      ? Math.round(((currentIncome - breakEvenPoint) / breakEvenPoint) * 100)
      : 0;

  const { red, yellow, green } = calcFillSegments(
    currentIncome,
    breakEvenPoint,
    gastosFijos
  );

  const shoePercent = Math.min(red + yellow + green, 98);

  return (
    <div className="rounded-2xl border border-cream-dark bg-surface p-6">
      <div className="mx-auto flex max-w-md items-stretch justify-center gap-3">
        <div className="relative h-[260px] w-[90px] shrink-0 md:h-[320px] md:w-[110px]">
          <div className="absolute bottom-0 left-1/2 z-0 h-full w-10 -translate-x-1/2 md:w-12">
            <div className="absolute inset-0 overflow-hidden rounded-full border-2 border-cream-dark bg-cream">
              {green > 0 && (
                <div
                  className="absolute left-0 right-0"
                  style={{
                    bottom: `${peLinePercent}%`,
                    height: `${green}%`,
                    backgroundColor: "#4A7C59",
                  }}
                />
              )}
              {yellow > 0 && (
                <div
                  className="absolute left-0 right-0"
                  style={{
                    bottom: `${red}%`,
                    height: `${yellow}%`,
                    backgroundColor: "#C9A227",
                  }}
                />
              )}
              {red > 0 && (
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{ height: `${red}%`, backgroundColor: "#B5443A" }}
                />
              )}
            </div>

            <div
              className="absolute left-full w-4 border-t border-dashed border-text-muted"
              style={{ bottom: `${peLinePercent}%` }}
            />
            <div
              className="absolute left-full w-4 border-t border-dashed border-text-muted"
              style={{ bottom: `${fijosPercent}%` }}
            />
          </div>

          <img
            src="/vixen-roja.png"
            alt="Vixen"
            className="absolute left-0 z-10 w-[55px] md:w-[65px]"
            style={{
              bottom: `${shoePercent}%`,
              objectFit: "contain",
              backgroundColor: "transparent",
              mixBlendMode: "multiply",
              transition: "bottom 0.6s ease",
            }}
          />
        </div>

        <div className="relative h-[260px] min-w-[8rem] flex-1 text-sm text-text-muted md:h-[320px]">
          <div
            className="absolute left-0 leading-tight"
            style={{ bottom: `${peLinePercent}%`, transform: "translateY(50%)" }}
          >
            PE {formatearMXN(breakEvenPoint)}
          </div>
          <div
            className="absolute left-0 leading-tight"
            style={{ bottom: `${fijosPercent}%`, transform: "translateY(50%)" }}
          >
            Fijos {formatearMXN(gastosFijos)}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="font-heading text-3xl font-semibold text-text-main">
          Llevas {formatearMXN(currentIncome)} este mes
        </p>
        <p className="mt-2 text-base text-text-muted">
          {superoPE
            ? `¡Superaste tu punto de equilibrio por ${porcentajeSobrePE}%! 🎉`
            : `Te faltan ${formatearMXN(faltante)} para tu punto de equilibrio`}
        </p>
      </div>
    </div>
  );
}