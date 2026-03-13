"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useBookingStore } from "@/store/booking"
import { useBooking } from "@/hooks/useBooking"
import BookingStepIndicator from "@/components/public/BookingStepIndicator"
import BookingSummary from "@/components/public/BookingSummary"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import { CalendarDays, User, CreditCard, ShieldCheck } from "lucide-react"

const PAYMENT_METHODS = [
  { value: "CREDIT_CARD", label: "Tarjeta de Crédito", icon: CreditCard },
  { value: "DEBIT_CARD", label: "Tarjeta de Débito", icon: CreditCard },
  { value: "BANK_TRANSFER", label: "Transferencia Bancaria", icon: ShieldCheck },
]

export default function BookingSummaryPage() {
  const router = useRouter()
  const { canProceedToSummary } = useBooking()
  const store = useBookingStore()
  const [paymentMethod, setPaymentMethod] = useState("CREDIT_CARD")
  const [loading, setLoading] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!canProceedToSummary) {
      router.replace("/booking/extras")
    }
  }, [canProceedToSummary, router])

  if (!canProceedToSummary) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  async function handleConfirm() {
    if (!acceptedTerms) {
      setError("Debes aceptar los términos y condiciones.")
      return
    }
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomTypeId: store.roomTypeId,
          checkIn: store.checkIn,
          checkOut: store.checkOut,
          adults: store.adults,
          children: store.children,
          guestData: store.guestData,
          extras: store.selectedExtras.map((e) => ({
            extraId: e.extraId,
            quantity: e.quantity,
          })),
          paymentMethod,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al crear la reserva")
      }

      const data = await res.json()
      store.clearBooking()
      router.push(`/booking/confirmation?code=${data.confirmationCode}`)
    } catch (err: any) {
      setError(err.message || "Ocurrió un error. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <BookingStepIndicator currentStep={4} />

        <div className="mt-10 text-center">
          <h1 className="font-serif text-3xl font-medium italic text-navy-900 mb-2">
            Resumen de tu reserva
          </h1>
          <p className="font-sans text-slate-600">
            Revisa los detalles antes de confirmar.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {/* Reservation Details */}
            <div className="p-6 rounded-2xl border border-ivory-200 bg-white shadow-sm">
              <h2 className="font-serif text-lg font-medium text-navy-900 mb-4 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-gold-500" />
                Detalles de la reserva
              </h2>
              <div className="grid grid-cols-2 gap-4 font-sans text-sm">
                <div>
                  <p className="text-slate-500">Habitación</p>
                  <p className="font-bold text-navy-900">{store.roomTypeName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Noches</p>
                  <p className="font-bold text-navy-900">{store.nights}</p>
                </div>
                <div>
                  <p className="text-slate-500">Check-in</p>
                  <p className="font-bold text-navy-900">{store.checkIn}</p>
                </div>
                <div>
                  <p className="text-slate-500">Check-out</p>
                  <p className="font-bold text-navy-900">{store.checkOut}</p>
                </div>
                <div>
                  <p className="text-slate-500">Adultos</p>
                  <p className="font-bold text-navy-900">{store.adults}</p>
                </div>
                <div>
                  <p className="text-slate-500">Niños</p>
                  <p className="font-bold text-navy-900">{store.children}</p>
                </div>
              </div>
            </div>

            {/* Guest Data */}
            <div className="p-6 rounded-2xl border border-ivory-200 bg-white shadow-sm">
              <h2 className="font-serif text-lg font-medium text-navy-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gold-500" />
                Datos del huésped
              </h2>
              <div className="grid grid-cols-2 gap-4 font-sans text-sm">
                <div>
                  <p className="text-slate-500">Nombre completo</p>
                  <p className="font-bold text-navy-900">{store.guestData?.firstName} {store.guestData?.lastName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-bold text-navy-900">{store.guestData?.email}</p>
                </div>
                <div>
                  <p className="text-slate-500">Teléfono</p>
                  <p className="font-bold text-navy-900">{store.guestData?.phone}</p>
                </div>
                <div>
                  <p className="text-slate-500">Documento</p>
                  <p className="font-bold text-navy-900">{store.guestData?.documentType} {store.guestData?.documentNumber}</p>
                </div>
              </div>
              {store.guestData?.specialRequests && (
                <div className="mt-4">
                  <p className="font-sans text-sm text-slate-500">Solicitudes especiales</p>
                  <p className="font-sans text-sm text-navy-900 mt-1">{store.guestData.specialRequests}</p>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="p-6 rounded-2xl border border-ivory-200 bg-white shadow-sm">
              <h2 className="font-serif text-lg font-medium text-navy-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gold-500" />
                Método de pago (simulado)
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === value
                        ? "border-gold-400 bg-gold-50 ring-1 ring-gold-200"
                        : "border-ivory-200 bg-white hover:border-ivory-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="sr-only"
                    />
                    <Icon className="w-5 h-5 text-gold-500" />
                    <span className="font-sans text-sm font-medium text-navy-900">{label}</span>
                    {paymentMethod === value && (
                      <Badge variant="gold" className="ml-auto">Seleccionado</Badge>
                    )}
                  </label>
                ))}
              </div>

              <div className="mt-6 p-4 rounded-lg bg-ivory-50 border border-ivory-200">
                <p className="font-sans text-xs text-slate-500 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  Este es un entorno de demostración. No se realizará ningún cargo real.
                  La reserva se confirmará instantáneamente.
                </p>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => {
                  setAcceptedTerms(e.target.checked)
                  if (error) setError("")
                }}
                className="mt-1 w-4 h-4 rounded border-navy-300 text-gold-500 focus:ring-gold-300"
              />
              <span className="font-sans text-sm text-slate-600">
                Acepto los{" "}
                <span className="text-gold-600 underline">términos y condiciones</span>{" "}
                y la{" "}
                <span className="text-gold-600 underline">política de cancelación</span>{" "}
                de Alturas Grand Hotel.
              </span>
            </label>

            {error && (
              <p className="font-sans text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                ← Volver
              </Button>
              <Button variant="gold" size="lg" onClick={handleConfirm} loading={loading}>
                Confirmar Reserva
              </Button>
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingSummary showFullBreakdown />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
