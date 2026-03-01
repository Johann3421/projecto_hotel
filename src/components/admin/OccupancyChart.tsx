"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface OccupancyChartProps {
  data: { status: string; count: number }[]
}

const COLORS: Record<string, string> = {
  AVAILABLE: "#22c55e",
  OCCUPIED: "#3b82f6",
  CLEANING: "#f59e0b",
  MAINTENANCE: "#ef4444",
  BLOCKED: "#94a3b8",
}

const LABELS: Record<string, string> = {
  AVAILABLE: "Disponible",
  OCCUPIED: "Ocupada",
  CLEANING: "Limpieza",
  MAINTENANCE: "Mantenimiento",
  BLOCKED: "Bloqueada",
}

export default function OccupancyChart({ data }: OccupancyChartProps) {
  const chartData = data.map((d) => ({
    name: LABELS[d.status] || d.status,
    value: d.count,
    color: COLORS[d.status] || "#94a3b8",
  }))

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "12px" }}
            formatter={(value: number | undefined) => [value ?? 0, "Habitaciones"]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "11px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
