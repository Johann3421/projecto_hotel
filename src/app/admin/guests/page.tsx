"use client"

import { useEffect, useState } from "react"
import Badge from "@/components/ui/Badge"
import Skeleton from "@/components/ui/Skeleton"
import { Search, ChevronLeft, ChevronRight, User } from "lucide-react"

interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  documentType: string
  documentNumber: string
  nationality: string
  _count: { reservations: number }
  reservations: {
    id: string
    confirmationCode: string
    status: string
    checkIn: string
    checkOut: string
    totalAmount: string
  }[]
}

export default function AdminGuestsPage() {
  const [guests, setGuests] = useState<Guest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetchGuests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function fetchGuests() {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: "15" })
    if (search) params.set("search", search)

    const res = await fetch(`/api/admin/guests?${params}`)
    if (res.ok) {
      const data = await res.json()
      setGuests(data.guests || [])
      setPagination(data.pagination || { total: 0, totalPages: 1 })
    }
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchGuests()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Huéspedes</h1>
        <p className="font-sans text-sm text-slate-500">{pagination.total} huéspedes registrados</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-6 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, email, documento..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ivory-300 text-sm font-sans focus:ring-2 focus:ring-gold-300 focus:border-gold-400 outline-none"
        />
      </form>

      {loading ? (
        <Skeleton variant="card" className="h-96" />
      ) : (
        <div className="space-y-3">
          {guests.map((g) => (
            <div key={g.id} className="rounded-xl border border-ivory-200 bg-white overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === g.id ? null : g.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-ivory-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-navy-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-navy-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-sans text-sm font-bold text-navy-900">
                      {g.firstName} {g.lastName}
                    </p>
                    <p className="font-sans text-xs text-slate-400">{g.email} · {g.documentType} {g.documentNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="gold" size="sm">{g._count.reservations} reserva(s)</Badge>
                  <span className="font-sans text-xs text-slate-400">{g.nationality}</span>
                </div>
              </button>

              {expandedId === g.id && g.reservations.length > 0 && (
                <div className="border-t border-ivory-200 px-5 py-3 bg-ivory-50">
                  <p className="font-sans text-xs font-bold text-navy-700 mb-2">Historial de reservas</p>
                  <div className="space-y-2">
                    {g.reservations.map((r) => (
                      <div key={r.id} className="flex items-center justify-between text-xs font-sans">
                        <span className="text-gold-600 font-bold">{r.confirmationCode}</span>
                        <span className="text-slate-500">
                          {new Date(r.checkIn).toLocaleDateString("es-PE")} → {new Date(r.checkOut).toLocaleDateString("es-PE")}
                        </span>
                        <Badge variant={r.status === "CHECKED_OUT" ? "warning" : r.status === "CONFIRMED" ? "info" : "success"} size="sm">
                          {r.status}
                        </Badge>
                        <span className="font-bold text-navy-900">S/ {Number(r.totalAmount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="font-sans text-xs text-slate-500">
            Página {page} de {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg border border-ivory-200 disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg border border-ivory-200 disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
