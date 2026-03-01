"use client"
import { useState, useEffect } from "react"
import DatePicker from "@/components/ui/DatePicker"
import { cn } from "@/lib/utils"

interface AvailabilityCalendarProps {
  roomTypeId: string
  checkIn: Date | null
  checkOut: Date | null
  onDateChange: (checkIn: Date | null, checkOut: Date | null) => void
  className?: string
}

export default function AvailabilityCalendar({
  roomTypeId,
  checkIn,
  checkOut,
  onDateChange,
  className,
}: AvailabilityCalendarProps) {
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!roomTypeId) return

    let cancelled = false
    const controller = new AbortController()

    const fetchBlocked = async () => {
      try {
        const res = await fetch(
          `/api/availability/blocked-dates?roomTypeId=${roomTypeId}`,
          { signal: controller.signal }
        )
        if (!res.ok) throw new Error("Error al obtener disponibilidad")
        const data: { blockedDates: string[] } = await res.json()
        if (!cancelled) {
          setBlockedDates(data.blockedDates ?? [])
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!cancelled && (err as Error).name !== "AbortError") {
          setError("No se pudo cargar la disponibilidad")
          setLoading(false)
        }
      }
    }

    fetchBlocked()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [roomTypeId])

  return (
    <div className={cn("relative", className)}>
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy-500 border-t-transparent" />
            <span className="font-sans text-sm text-navy-700">Cargando disponibilidad…</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-lg bg-rose-50 border border-rose-200 px-4 py-2">
          <p className="font-sans text-sm text-rose-700">{error}</p>
        </div>
      )}

      <DatePicker
        checkIn={checkIn}
        checkOut={checkOut}
        onDateChange={onDateChange}
        blockedDates={blockedDates}
        inline
        className="w-full"
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-sans text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-navy-500" />
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-navy-100" />
          <span>Rango</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-rose-100 border border-rose-300" />
          <span>No disponible</span>
        </div>
      </div>
    </div>
  )
}
