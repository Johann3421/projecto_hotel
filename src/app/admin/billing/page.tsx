"use client"

import { useEffect, useState } from "react"
import Badge from "@/components/ui/Badge"
import Skeleton from "@/components/ui/Skeleton"
import { Search, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react"

export default function AdminBillingPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reservations?limit=30")
      .then((r) => r.json())
      .then((d) => setReservations(d.reservations || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const totalRevenue = reservations.reduce((sum, r) => {
    const paid = r.payments?.reduce((s: number, p: any) => p.status === "COMPLETED" ? s + Number(p.amount) : s, 0) || 0
    return sum + paid
  }, 0)

  const pendingPayments = reservations.filter((r) =>
    r.payments?.some((p: any) => p.status === "PENDING")
  ).length

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-900">Facturación</h1>
        <p className="font-sans text-sm text-slate-500">Control de pagos y facturación</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-5 rounded-xl border border-ivory-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-gold-500" />
            <p className="font-sans text-xs text-slate-500">Ingresos totales</p>
          </div>
          <p className="font-serif text-2xl font-bold text-navy-900">S/ {totalRevenue.toLocaleString("es-PE", { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="p-5 rounded-xl border border-ivory-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="font-sans text-xs text-slate-500">Pagos completados</p>
          </div>
          <p className="font-serif text-2xl font-bold text-navy-900">{reservations.length - pendingPayments}</p>
        </div>
        <div className="p-5 rounded-xl border border-ivory-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="font-sans text-xs text-slate-500">Pagos pendientes</p>
          </div>
          <p className="font-serif text-2xl font-bold text-navy-900">{pendingPayments}</p>
        </div>
      </div>

      {/* Billing Table */}
      {loading ? (
        <Skeleton variant="card" className="h-96" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ivory-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="bg-ivory-50 border-b border-ivory-200">
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Código</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Huésped</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Método</th>
                <th className="px-4 py-3 text-left text-xs font-sans font-medium text-slate-500">Estado Pago</th>
                <th className="px-4 py-3 text-right text-xs font-sans font-medium text-slate-500">Subtotal</th>
                <th className="px-4 py-3 text-right text-xs font-sans font-medium text-slate-500">IGV</th>
                <th className="px-4 py-3 text-right text-xs font-sans font-medium text-slate-500">Total</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r: any) => {
                const payment = r.payments?.[0]
                return (
                  <tr key={r.id} className="border-b border-ivory-100 hover:bg-ivory-50">
                    <td className="px-4 py-3 font-sans text-xs font-bold text-gold-600">{r.confirmationCode}</td>
                    <td className="px-4 py-3 font-sans text-sm text-navy-900">{r.guest.firstName} {r.guest.lastName}</td>
                    <td className="px-4 py-3 font-sans text-xs text-slate-600">{payment?.method || "N/A"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={payment?.status === "COMPLETED" ? "success" : payment?.status === "PENDING" ? "warning" : "danger"}
                        size="sm"
                      >
                        {payment?.status || "N/A"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-sans text-sm text-slate-600">S/ {Number(r.subtotal).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-sans text-sm text-slate-600">S/ {Number(r.taxAmount).toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-sans text-sm font-bold text-navy-900">S/ {Number(r.totalAmount).toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
