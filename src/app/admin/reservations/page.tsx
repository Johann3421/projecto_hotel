"use client"

import { useEffect, useState } from "react"
import { canManageReservations } from "@/lib/admin-permissions"
import { useCurrentRole } from "@/hooks/useCurrentRole"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

interface Reservation {
  id: string
  confirmationCode: string
  guest: { firstName: string; lastName: string; email: string }
  rooms?: { room: { number: string; type: { name: string } } }[]
  assignedRooms?: { room: { number: string; roomType?: { name: string } } }[]
  checkIn: string
  checkOut: string
  status: string
  totalAmount: number
  payments: { status: string }[]
}

const STATUS_BADGE: Record<string, { variant: "success" | "warning" | "danger" | "info" | "gold"; label: string }> = {
  CONFIRMED: { variant: "info", label: "Confirmada" },
  CHECKED_IN: { variant: "success", label: "Check-in" },
  CHECKED_OUT: { variant: "warning", label: "Check-out" },
  CANCELLED: { variant: "danger", label: "Cancelada" },
  NO_SHOW: { variant: "danger", label: "No Show" },
}

export default function AdminReservationsPage() {
  const { role } = useCurrentRole()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [pageError, setPageError] = useState("")

  useEffect(() => {
    fetchReservations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter])

  async function fetchReservations() {
    setLoading(true)
    setPageError("")
    const params = new URLSearchParams({ page: String(page), limit: "15" })
    if (statusFilter) params.set("status", statusFilter)
    if (search) params.set("search", search)

    const res = await fetch(`/api/reservations?${params}`)
    const data = await res.json().catch(() => null)
    if (res.ok) {
      setReservations(data?.reservations || [])
      setPagination(data?.pagination || { total: 0, totalPages: 1 })
    } else {
      setReservations([])
      setPagination({ total: 0, totalPages: 1 })
      setPageError(data?.error || "No se pudieron cargar las reservas")
    }
    setLoading(false)
  }

  async function handleStatusUpdate(code: string, newStatus: string) {
    const res = await fetch(`/api/reservations/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) fetchReservations()
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchReservations()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Reservas</h1>
        <p className="font-sans text-sm text-slate-500">{pagination.total} reservas totales</p>
      </div>

      {!loading && pageError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="font-sans text-sm text-amber-900">{pageError}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por código, nombre..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ivory-300 text-sm font-sans focus:ring-2 focus:ring-gold-300 focus:border-gold-400 outline-none"
          />
        </form>
        <div className="flex gap-2">
          {["", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT", "CANCELLED"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors ${
                statusFilter === s ? "bg-navy-900 text-white" : "bg-ivory-100 text-slate-600 hover:bg-ivory-200"
              }`}
            >
              {!s ? "Todas" : STATUS_BADGE[s]?.label || s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton variant="card" className="h-96" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ivory-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="bg-ivory-50 border-b border-ivory-200">
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Código</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Huésped</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Habitación</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Fechas</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Estado</th>
                <th className="px-4 py-3 text-right text-xs font-sans font-medium text-slate-500">Total</th>
                <th className="px-4 py-3 text-center text-xs font-sans font-medium text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => {
                const roomAssignments = Array.isArray(r.rooms) ? r.rooms : Array.isArray(r.assignedRooms) ? r.assignedRooms : []
                const room = roomAssignments[0]?.room
                const statusInfo = STATUS_BADGE[r.status] || { variant: "default" as const, label: r.status }
                return (
                  <tr key={r.id} className="border-b border-ivory-100 hover:bg-ivory-50 transition-colors">
                    <td className="px-4 py-3 font-sans text-xs font-bold text-gold-600">{r.confirmationCode}</td>
                    <td className="px-4 py-3">
                      <p className="font-sans text-sm text-navy-900">{r.guest.firstName} {r.guest.lastName}</p>
                      <p className="font-sans text-xs text-slate-400">{r.guest.email}</p>
                    </td>
                    <td className="px-4 py-3 font-sans text-sm text-slate-600">
                      {room ? `${room.number} · ${"type" in room && room.type ? room.type.name : room.roomType?.name || "Sin tipo"}` : "N/A"}
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-slate-600">
                      {new Date(r.checkIn).toLocaleDateString("es-PE")} → {new Date(r.checkOut).toLocaleDateString("es-PE")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusInfo.variant} size="sm">{statusInfo.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-sans text-sm font-bold text-navy-900">
                      S/ {Number(r.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {canManageReservations(role) && r.status === "CONFIRMED" && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(r.confirmationCode, "CHECKED_IN")}>
                            Check-in
                          </Button>
                        )}
                        {canManageReservations(role) && r.status === "CHECKED_IN" && (
                          <Button size="sm" variant="outline" onClick={() => handleStatusUpdate(r.confirmationCode, "CHECKED_OUT")}>
                            Check-out
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="font-sans text-xs text-slate-500">
            Página {page} de {pagination.totalPages} · {pagination.total} registros
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
