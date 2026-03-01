"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { CheckCircle, Download, CalendarDays, User, Home, Phone } from "lucide-react"

interface ConfirmationData {
  confirmationCode: string
  roomTypeName: string
  checkIn: string
  checkOut: string
  nights: number
  adults: number
  children: number
  guestName: string
  guestEmail: string
  subtotal: number
  tax: number
  total: number
  extras: { name: string; total: number }[]
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get("code")
  const [data, setData] = useState<ConfirmationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    if (code) fetchConfirmation()
    else setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code])

  async function fetchConfirmation() {
    try {
      const res = await fetch(`/api/reservations/${code}`)
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch {
      console.error("Error fetching confirmation")
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadPdf() {
    if (!code) return
    setDownloadingPdf(true)
    try {
      const res = await fetch(`/api/invoices/${code}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `reserva-${code}.pdf`
        document.body.appendChild(a)
        a.click()
        URL.revokeObjectURL(url)
        a.remove()
      }
    } catch {
      console.error("Error downloading PDF")
    } finally {
      setDownloadingPdf(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  if (!code || !data) {
    return (
      <div className="py-20 text-center px-4">
        <h1 className="font-serif text-2xl text-navy-900 mb-4">Reserva no encontrada</h1>
        <p className="font-sans text-slate-600 mb-6">No se pudo encontrar la confirmación de reserva.</p>
        <Link href="/">
          <Button variant="gold">Volver al inicio</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Success header */}
        <div className="text-center animate-fade-luxury">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-navy-900 mb-2">
            ¡Reserva Confirmada!
          </h1>
          <p className="font-sans text-slate-600 mb-4">
            Tu reserva ha sido procesada exitosamente.
          </p>
          <Badge variant="gold" size="lg">
            Código: {data.confirmationCode}
          </Badge>
        </div>

        {/* Confirmation Card */}
        <div className="mt-10 p-8 rounded-2xl border border-ivory-200 bg-white shadow-luxury">
          {/* Reservation Details */}
          <div className="border-b border-ivory-200 pb-6 mb-6">
            <h2 className="font-serif text-lg font-medium text-navy-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-gold-500" />
              Detalles de la reserva
            </h2>
            <div className="grid grid-cols-2 gap-4 font-sans text-sm">
              <div>
                <p className="text-slate-500">Habitación</p>
                <p className="font-bold text-navy-900">{data.roomTypeName}</p>
              </div>
              <div>
                <p className="text-slate-500">Noches</p>
                <p className="font-bold text-navy-900">{data.nights}</p>
              </div>
              <div>
                <p className="text-slate-500">Check-in</p>
                <p className="font-bold text-navy-900">{data.checkIn}</p>
              </div>
              <div>
                <p className="text-slate-500">Check-out</p>
                <p className="font-bold text-navy-900">{data.checkOut}</p>
              </div>
              <div>
                <p className="text-slate-500">Huéspedes</p>
                <p className="font-bold text-navy-900">{data.adults} adulto(s){data.children > 0 ? `, ${data.children} niño(s)` : ""}</p>
              </div>
            </div>
          </div>

          {/* Guest Info */}
          <div className="border-b border-ivory-200 pb-6 mb-6">
            <h2 className="font-serif text-lg font-medium text-navy-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gold-500" />
              Huésped
            </h2>
            <div className="grid grid-cols-2 gap-4 font-sans text-sm">
              <div>
                <p className="text-slate-500">Nombre</p>
                <p className="font-bold text-navy-900">{data.guestName}</p>
              </div>
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-bold text-navy-900">{data.guestEmail}</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div>
            <h2 className="font-serif text-lg font-medium text-navy-900 mb-4">Desglose de pago</h2>
            <div className="space-y-2 font-sans text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal ({data.nights} noches)</span>
                <span className="text-navy-900">S/ {data.subtotal.toFixed(2)}</span>
              </div>
              {data.extras.map((e, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-slate-600">{e.name}</span>
                  <span className="text-navy-900">S/ {e.total.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between">
                <span className="text-slate-600">IGV (18%)</span>
                <span className="text-navy-900">S/ {data.tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-ivory-200 pt-2 flex justify-between font-bold">
                <span className="text-navy-900">Total</span>
                <span className="text-gold-600 text-lg">S/ {data.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="gold" onClick={handleDownloadPdf} loading={downloadingPdf}>
            <Download className="w-4 h-4 mr-2" />
            Descargar Comprobante PDF
          </Button>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-10 text-center p-6 rounded-xl bg-ivory-50 border border-ivory-200">
          <p className="font-sans text-sm text-slate-600 mb-2">
            Hemos enviado una confirmación a <strong>{data.guestEmail}</strong>
          </p>
          <p className="font-sans text-xs text-slate-500 flex items-center justify-center gap-1">
            <Phone className="w-3.5 h-3.5" />
            ¿Necesitas ayuda? Llámanos al +51 62 000 0000
          </p>
        </div>
      </div>
    </div>
  )
}
