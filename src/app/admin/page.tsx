"use client"

import { useEffect, useState } from "react"
import FrontDeskCard from "@/components/admin/FrontDeskCard"
import OccupancyChart from "@/components/admin/OccupancyChart"
import Skeleton from "@/components/ui/Skeleton"
import {
  BedDouble,
  CalendarCheck,
  CalendarX,
  DollarSign,
  Sparkles,
  TrendingUp,
} from "lucide-react"

interface DashboardData {
  stats: {
    totalRooms: number
    occupiedRooms: number
    occupancyRate: number
    todayCheckIns: number
    todayCheckOuts: number
    monthRevenue: number
    pendingHousekeeping: number
  }
  roomsByStatus: { status: string; count: number }[]
  recentReservations: {
    id: string
    confirmationCode: string
    guestName: string
    roomType: string
    roomNumber: string
    checkIn: string
    checkOut: string
    status: string
    total: number
  }[]
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-28" />)}
        </div>
        <Skeleton variant="card" className="h-80" />
      </div>
    )
  }

  if (!data) return <p>Error loading dashboard</p>

  const statCards = [
    { label: "Ocupación", value: `${data.stats.occupancyRate}%`, sub: `${data.stats.occupiedRooms}/${data.stats.totalRooms}`, icon: BedDouble, color: "text-blue-500" },
    { label: "Check-ins Hoy", value: data.stats.todayCheckIns, sub: "Llegadas del día", icon: CalendarCheck, color: "text-green-500" },
    { label: "Check-outs Hoy", value: data.stats.todayCheckOuts, sub: "Salidas del día", icon: CalendarX, color: "text-amber-500" },
    { label: "Ingresos del Mes", value: `S/ ${data.stats.monthRevenue.toLocaleString("es-PE", { minimumFractionDigits: 0 })}`, sub: "Pagos completados", icon: DollarSign, color: "text-gold-500" },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Dashboard</h1>
        <p className="font-sans text-sm text-slate-500">
          Resumen operativo · {new Date().toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="p-5 rounded-xl border border-ivory-200 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-sans text-xs text-slate-500 uppercase tracking-wide">{label}</p>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="font-serif text-2xl font-bold text-navy-900">{value}</p>
            <p className="font-sans text-xs text-slate-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Charts + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Occupancy Donut */}
        <div className="p-6 rounded-xl border border-ivory-200 bg-white shadow-sm">
          <h2 className="font-sans text-sm font-bold text-navy-900 mb-4">Estado de Habitaciones</h2>
          <OccupancyChart data={data.roomsByStatus} />
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-ivory-200 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-sm font-bold text-navy-900">Últimas Reservas</h2>
            {data.stats.pendingHousekeeping > 0 && (
              <span className="flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-sans font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                {data.stats.pendingHousekeeping} pendientes limpieza
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.recentReservations.map((r) => (
              <FrontDeskCard
                key={r.id}
                confirmationCode={r.confirmationCode}
                guestName={r.guestName}
                roomType={r.roomType}
                roomNumber={r.roomNumber}
                checkIn={r.checkIn}
                checkOut={r.checkOut}
                status={r.status}
                total={r.total}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
