"use client"

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  data: { date: string; revenue: number }[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#c9a84c" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#888" }}
            tickFormatter={(val) => {
              const d = new Date(val)
              return `${d.getDate()}/${d.getMonth() + 1}`
            }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#888" }}
            tickFormatter={(val) => `S/${(val / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ borderRadius: "8px", border: "1px solid #e5e5e5", fontSize: "12px" }}
            formatter={(value: number | undefined) => [`S/ ${(value ?? 0).toFixed(2)}`, "Ingresos"]}
            labelFormatter={(label) => new Date(label).toLocaleDateString("es-PE")}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#c9a84c"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
