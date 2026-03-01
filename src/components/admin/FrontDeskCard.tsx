"use client"

import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { CalendarDays, User, BedDouble, ArrowRight } from "lucide-react"

interface FrontDeskCardProps {
  confirmationCode: string
  guestName: string
  roomType: string
  roomNumber: string
  checkIn: string
  checkOut: string
  status: string
  total: number
  onAction?: () => void
  actionLabel?: string
}

const STATUS_MAP: Record<string, { variant: "success" | "warning" | "info" | "danger" | "gold"; label: string }> = {
  CONFIRMED: { variant: "info", label: "Confirmada" },
  CHECKED_IN: { variant: "success", label: "Check-in" },
  CHECKED_OUT: { variant: "warning", label: "Check-out" },
  CANCELLED: { variant: "danger", label: "Cancelada" },
  NO_SHOW: { variant: "danger", label: "No Show" },
}

export default function FrontDeskCard({
  confirmationCode,
  guestName,
  roomType,
  roomNumber,
  checkIn,
  checkOut,
  status,
  total,
  onAction,
  actionLabel,
}: FrontDeskCardProps) {
  const statusInfo = STATUS_MAP[status] || { variant: "default" as const, label: status }

  return (
    <div className="p-4 rounded-xl border border-ivory-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-sans text-xs text-slate-400">{confirmationCode}</p>
          <p className="font-sans font-bold text-sm text-navy-900 flex items-center gap-1.5 mt-0.5">
            <User className="w-3.5 h-3.5 text-gold-500" />
            {guestName}
          </p>
        </div>
        <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-sans mb-3">
        <div className="flex items-center gap-1 text-slate-500">
          <BedDouble className="w-3.5 h-3.5" />
          {roomType} · {roomNumber}
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <CalendarDays className="w-3.5 h-3.5" />
          {checkIn} → {checkOut}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-sans text-sm font-bold text-gold-600">S/ {total.toFixed(2)}</p>
        {onAction && actionLabel && (
          <Button variant="outline" size="sm" onClick={onAction}>
            {actionLabel} <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>
    </div>
  )
}
