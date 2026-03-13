"use client"

import { useEffect, useState, useCallback } from "react"
import HousekeepingBoard from "@/components/admin/HousekeepingBoard"
import Skeleton from "@/components/ui/Skeleton"
import { RefreshCw } from "lucide-react"

interface Room {
  id: string
  number: string
  floor: number
  status: string
  notes: string | null
  type?: { name: string }
  roomType?: { name: string }
}

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/rooms")
      if (res.ok) {
        const data = await res.json()
        setRooms(data.rooms || [])
      }
    } catch (e) {
      console.error("Error fetching rooms", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])

  // SSE for real-time updates
  useEffect(() => {
    const es = new EventSource("/api/housekeeping/stream")
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "room-status-change") {
          setRooms((prev) =>
            prev.map((r) => r.id === data.roomId ? { ...r, status: data.newStatus } : r)
          )
        }
      } catch {
        // heartbeat
      }
    }
    es.onerror = () => {
      es.close()
    }
    return () => es.close()
  }, [])

  async function handleStatusChange(roomId: string, newStatus: string) {
    const res = await fetch(`/api/rooms/${roomId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, status: newStatus } : r))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Housekeeping</h1>
          <p className="font-sans text-sm text-slate-500">
            Gestión de limpieza y mantenimiento · Actualización en tiempo real
          </p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchRooms() }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ivory-100 text-sm font-sans text-navy-700 hover:bg-ivory-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Limpieza", count: rooms.filter((r) => r.status === "HOUSEKEEPING").length, color: "bg-amber-50 border-amber-200 text-amber-700" },
          { label: "Mantenimiento", count: rooms.filter((r) => r.status === "MAINTENANCE").length, color: "bg-red-50 border-red-200 text-red-700" },
          { label: "Fuera de servicio", count: rooms.filter((r) => r.status === "OUT_OF_ORDER").length, color: "bg-slate-50 border-slate-200 text-slate-700" },
          { label: "Disponibles", count: rooms.filter((r) => r.status === "AVAILABLE").length, color: "bg-green-50 border-green-200 text-green-700" },
        ].map(({ label, count, color }) => (
          <div key={label} className={`p-4 rounded-xl border ${color}`}>
            <p className="font-sans text-xs font-medium uppercase tracking-wide">{label}</p>
            <p className="font-serif text-3xl font-bold mt-1">{count}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-64" />)}
        </div>
      ) : (
        <HousekeepingBoard rooms={rooms} onStatusChange={handleStatusChange} />
      )}
    </div>
  )
}
