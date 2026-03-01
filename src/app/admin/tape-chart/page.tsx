"use client"

import { useEffect, useState } from "react"
import TapeChart from "@/components/admin/TapeChart"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"

export default function TapeChartPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    return d.toISOString().split("T")[0]
  })
  const [days, setDays] = useState(14)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/tape-chart?startDate=${startDate}&days=${days}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [startDate, days])

  function navigateWeek(direction: number) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + direction * 7)
    setStartDate(d.toISOString().split("T")[0])
  }

  function goToToday() {
    const d = new Date()
    d.setDate(d.getDate() - 2)
    setStartDate(d.toISOString().split("T")[0])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Tape Chart</h1>
          <p className="font-sans text-sm text-slate-500">Vista visual de ocupación por habitación</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            <CalendarDays className="w-4 h-4 mr-1" /> Hoy
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigateWeek(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-ivory-300 text-xs font-sans text-navy-900"
          >
            <option value={7}>7 días</option>
            <option value={14}>14 días</option>
            <option value={21}>21 días</option>
            <option value={30}>30 días</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-4">
        {[
          { color: "bg-blue-400", label: "Confirmada" },
          { color: "bg-green-500", label: "Check-in" },
          { color: "bg-amber-400", label: "Check-out" },
          { color: "bg-red-200", label: "Bloqueada" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${color}`} />
            <span className="font-sans text-xs text-slate-600">{label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <Skeleton variant="card" className="h-96" />
      ) : data ? (
        <TapeChart
          data={data.tapeChart}
          startDate={data.startDate}
          days={data.days}
        />
      ) : (
        <p className="font-sans text-sm text-slate-500">Error cargando tape chart</p>
      )}
    </div>
  )
}
