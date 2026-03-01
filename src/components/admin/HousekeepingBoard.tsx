"use client"

import RoomStatusCard from "./RoomStatusCard"

interface Room {
  id: string
  number: string
  floor: number
  status: string
  notes: string | null
  type: { name: string }
}

interface HousekeepingBoardProps {
  rooms: Room[]
  onStatusChange: (roomId: string, newStatus: string) => void
}

export default function HousekeepingBoard({ rooms, onStatusChange }: HousekeepingBoardProps) {
  const cleaning = rooms.filter((r) => r.status === "CLEANING")
  const maintenance = rooms.filter((r) => r.status === "MAINTENANCE")
  const available = rooms.filter((r) => r.status === "AVAILABLE")
  const occupied = rooms.filter((r) => r.status === "OCCUPIED")

  const columns = [
    { title: "Pendientes de Limpieza", items: cleaning, emptyMsg: "Sin habitaciones pendientes" },
    { title: "En Mantenimiento", items: maintenance, emptyMsg: "Sin mantenimiento" },
    { title: "Disponibles", items: available, emptyMsg: "Sin disponibles" },
    { title: "Ocupadas", items: occupied, emptyMsg: "Sin ocupadas" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {columns.map(({ title, items, emptyMsg }) => (
        <div key={title} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-sm font-bold text-navy-900">{title}</h3>
            <span className="font-sans text-xs text-slate-400 bg-ivory-100 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          {items.length === 0 ? (
            <p className="font-sans text-xs text-slate-400 text-center py-8">{emptyMsg}</p>
          ) : (
            items.map((room) => (
              <RoomStatusCard
                key={room.id}
                roomNumber={room.number}
                floor={room.floor}
                typeName={room.type.name}
                status={room.status}
                notes={room.notes}
                onStatusChange={(newStatus) => onStatusChange(room.id, newStatus)}
              />
            ))
          )}
        </div>
      ))}
    </div>
  )
}
