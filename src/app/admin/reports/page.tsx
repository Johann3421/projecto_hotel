"use client"

import { useEffect, useState } from "react"
import RevenueChart from "@/components/admin/RevenueChart"
import Skeleton from "@/components/ui/Skeleton"
import { TrendingUp, DollarSign, CalendarCheck, Moon } from "lucide-react"

interface ReportsData {
  summary: {
    totalRevenue: number
    paymentCount: number
    reservationCount: number
    averageStayNights: number
    period: string
  }
  sourceBreakdown: { source: string; count: number; revenue: number }[]
  roomTypeRevenue: { name: string; bookings: number; revenue: number }[]
  dailyRevenue: { date: string; revenue: number }[]
}

const EMPTY_REPORTS_DATA: ReportsData = {
  summary: {
    totalRevenue: 0,
    paymentCount: 0,
    reservationCount: 0,
    averageStayNights: 0,
    period: "month",
  },
  sourceBreakdown: [],
  roomTypeRevenue: [],
  dailyRevenue: [],
}

export default function AdminReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState("month")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/admin/reports?period=${period}`)
      .then(async (r) => {
        const payload = await r.json().catch(() => null)
        if (!r.ok || !payload || !payload.summary) {
          // don't throw here; set friendly state so we avoid noisy console errors
          setData(EMPTY_REPORTS_DATA)
          setError(payload?.error || "No se pudieron cargar los reportes en este momento.")
          return
        }

        const normalized: ReportsData = {
          summary: {
            ...EMPTY_REPORTS_DATA.summary,
            ...payload.summary,
          },
          sourceBreakdown: Array.isArray(payload.sourceBreakdown) ? payload.sourceBreakdown : [],
          roomTypeRevenue: Array.isArray(payload.roomTypeRevenue) ? payload.roomTypeRevenue : [],
          dailyRevenue: Array.isArray(payload.dailyRevenue) ? payload.dailyRevenue : [],
        }

        setData(normalized)
      })
      .catch(() => {
        // network or unexpected failure: show empty data and a friendly message
        setData(EMPTY_REPORTS_DATA)
        setError("No se pudieron cargar los reportes en este momento.")
      })
      .finally(() => setLoading(false))
  }, [period])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
        <Skeleton variant="card" className="h-80" />
      </div>
    )
  }

  if (!data) return <p className="font-sans text-sm text-slate-500">Error cargando reportes</p>

  const stats = [
    { label: "Ingresos Totales", value: `S/ ${data.summary.totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 0 })}`, icon: DollarSign, color: "text-gold-500" },
    { label: "Reservas", value: data.summary.reservationCount, icon: CalendarCheck, color: "text-blue-500" },
    { label: "Pagos Procesados", value: data.summary.paymentCount, icon: TrendingUp, color: "text-green-500" },
    { label: "Estancia Promedio", value: `${data.summary.averageStayNights} noches`, icon: Moon, color: "text-purple-500" },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Reportes</h1>
          <p className="font-sans text-sm text-slate-500">Análisis de rendimiento del hotel</p>
        </div>
        <div className="flex gap-2">
          {[
            { value: "month", label: "Mes" },
            { value: "quarter", label: "Trimestre" },
            { value: "year", label: "Año" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-lg text-xs font-sans font-medium transition-colors ${
                period === p.value ? "bg-navy-900 text-white" : "bg-ivory-100 text-slate-600 hover:bg-ivory-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="font-sans text-sm text-amber-900">{error}</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border border-ivory-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-sans text-xs text-slate-500 uppercase tracking-wide">{label}</p>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="font-serif text-2xl font-bold text-navy-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="p-6 rounded-xl border border-ivory-200 bg-white shadow-sm mb-8">
        <h2 className="font-sans text-sm font-bold text-navy-900 mb-4">Ingresos Diarios</h2>
        <RevenueChart data={data.dailyRevenue} />
      </div>

      {/* Two column: Source + Room Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Breakdown */}
        <div className="p-6 rounded-xl border border-ivory-200 bg-white shadow-sm">
          <h2 className="font-sans text-sm font-bold text-navy-900 mb-4">Por Canal de Venta</h2>
          <div className="space-y-3">
            {data.sourceBreakdown.map((s) => (
              <div key={s.source} className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-navy-900">{s.source}</p>
                  <p className="font-sans text-xs text-slate-400">{s.count} reservas</p>
                </div>
                <p className="font-sans text-sm font-bold text-gold-600">S/ {s.revenue.toLocaleString("es-PE", { minimumFractionDigits: 0 })}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Room Type Revenue */}
        <div className="p-6 rounded-xl border border-ivory-200 bg-white shadow-sm">
          <h2 className="font-sans text-sm font-bold text-navy-900 mb-4">Por Tipo de Habitación</h2>
          <div className="space-y-3">
            {data.roomTypeRevenue.map((rt) => (
              <div key={rt.name} className="flex items-center justify-between">
                <div>
                  <p className="font-sans text-sm text-navy-900">{rt.name}</p>
                  <p className="font-sans text-xs text-slate-400">{rt.bookings} reservas</p>
                </div>
                <p className="font-sans text-sm font-bold text-gold-600">S/ {rt.revenue.toLocaleString("es-PE", { minimumFractionDigits: 0 })}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
