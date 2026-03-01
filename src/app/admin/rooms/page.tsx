"use client"

import { useEffect, useState } from "react"
import RoomStatusCard from "@/components/admin/RoomStatusCard"
import Skeleton from "@/components/ui/Skeleton"
import { BedDouble } from "lucide-react"

interface Room {
  id: string
  number: string
  floor: number
  status: string
  notes: string | null
  type: { name: string; slug: string }
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL")

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((d) => setRooms(d.rooms || []))
      .catch(console.error)
      .finally(() => setLoading(false))
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

  const filtered = filter === "ALL" ? rooms : rooms.filter((r) => r.status === filter)
  const floors = [...new Set(filtered.map((r) => r.floor))].sort()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-navy-900">Habitaciones</h1>
          <p className="font-sans text-sm text-slate-500">{rooms.length} habitaciones totales</p>
        </div>
        <div className="flex items-center gap-2">
          {["ALL", "AVAILABLE", "OCCUPIED", "CLEANING", "MAINTENANCE"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
                filter === s ? "bg-navy-900 text-white" : "bg-ivory-100 text-slate-600 hover:bg-ivory-200"
              }`}
            >
              {s === "ALL" ? "Todas" : s === "AVAILABLE" ? "Disponibles" : s === "OCCUPIED" ? "Ocupadas" : s === "CLEANING" ? "Limpieza" : "Mantenimiento"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => <Skeleton key={i} variant="card" className="h-36" />)}
        </div>
      ) : (
        floors.map((floor) => (
          <div key={floor} className="mb-8">
            <h2 className="font-sans text-sm font-bold text-navy-700 mb-3 flex items-center gap-2">
              <BedDouble className="w-4 h-4 text-gold-500" />
              Piso {floor}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {filtered
                .filter((r) => r.floor === floor)
                .map((room) => (
                  <RoomStatusCard
                    key={room.id}
                    roomNumber={room.number}
                    floor={room.floor}
                    typeName={room.type.name}
                    status={room.status}
                    notes={room.notes}
                    onStatusChange={(newStatus) => handleStatusChange(room.id, newStatus)}
                  />
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
