"use client"

import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { BedDouble, ArrowRight } from "lucide-react"

interface RoomStatusCardProps {
  roomNumber: string
  floor: number
  typeName: string
  status: string
  notes?: string | null
  onStatusChange?: (newStatus: string) => void
}

const STATUS_CONFIG: Record<string, { variant: "success" | "warning" | "danger" | "info" | "gold" | "default"; label: string; color: string }> = {
  AVAILABLE: { variant: "success", label: "Disponible", color: "bg-green-50 border-green-200" },
  OCCUPIED: { variant: "info", label: "Ocupada", color: "bg-blue-50 border-blue-200" },
  HOUSEKEEPING: { variant: "warning", label: "Limpieza", color: "bg-amber-50 border-amber-200" },
  MAINTENANCE: { variant: "danger", label: "Mantenimiento", color: "bg-red-50 border-red-200" },
  OUT_OF_ORDER: { variant: "default", label: "Fuera de servicio", color: "bg-slate-50 border-slate-200" },
}

const NEXT_STATUS: Record<string, string> = {
  HOUSEKEEPING: "AVAILABLE",
  MAINTENANCE: "AVAILABLE",
  OUT_OF_ORDER: "AVAILABLE",
  AVAILABLE: "HOUSEKEEPING",
  OCCUPIED: "HOUSEKEEPING",
}

export default function RoomStatusCard({ roomNumber, floor, typeName, status, notes, onStatusChange }: RoomStatusCardProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.AVAILABLE

  return (
    <div className={`p-4 rounded-xl border ${config.color} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <BedDouble className="w-5 h-5 text-navy-700" />
          <span className="font-sans font-bold text-lg text-navy-900">{roomNumber}</span>
        </div>
        <Badge variant={config.variant} size="sm">{config.label}</Badge>
      </div>
      <p className="font-sans text-xs text-slate-500 mb-1">Piso {floor} · {typeName}</p>
      {notes && <p className="font-sans text-xs text-slate-400 italic mb-2">{notes}</p>}

      {onStatusChange && NEXT_STATUS[status] && (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={() => onStatusChange(NEXT_STATUS[status])}
        >
          Cambiar a {STATUS_CONFIG[NEXT_STATUS[status]]?.label || NEXT_STATUS[status]}
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      )}
    </div>
  )
}
