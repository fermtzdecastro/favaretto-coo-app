"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { VentasPorModelo } from "@/types";

interface ModelosBarChartProps {
  data: VentasPorModelo[];
}

const BAR_COLOR = "#C9956E";

export function ModelosBarChart({ data }: ModelosBarChartProps) {
  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-main/50">
        Aún no hay ventas este mes
      </p>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="nombre"
            width={80}
            tick={{ fontSize: 11, fill: "#2C2C2C" }}
            axisLine={false}
            tickLine={false}
          />
          <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} barSize={16}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLOR} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
