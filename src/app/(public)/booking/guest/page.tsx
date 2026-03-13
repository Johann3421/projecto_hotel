"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useBookingStore } from "@/store/booking"
import BookingStepIndicator from "@/components/public/BookingStepIndicator"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { useBooking } from "@/hooks/useBooking"

const DOCUMENT_TYPES = [
  { value: "DNI", label: "DNI" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "CE", label: "Carné de Extranjería" },
  { value: "RUC", label: "RUC" },
]

export default function BookingGuestPage() {
  const router = useRouter()
  const { canProceedToGuest } = useBooking()
  const setGuestData = useBookingStore((s) => s.setGuestData)
  const guestData = useBookingStore((s) => s.guestData)

  const [form, setForm] = useState({
    firstName: guestData?.firstName || "",
    lastName: guestData?.lastName || "",
    email: guestData?.email || "",
    phone: guestData?.phone || "",
    documentType: guestData?.documentType || "DNI",
    documentNumber: guestData?.documentNumber || "",
    nationality: guestData?.nationality || "PE",
    specialRequests: guestData?.specialRequests || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!canProceedToGuest) {
      router.replace("/booking")
    }
  }, [canProceedToGuest, router])

  if (!canProceedToGuest) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.firstName.trim()) errs.firstName = "Nombre es requerido"
    if (!form.lastName.trim()) errs.lastName = "Apellido es requerido"
    if (!form.email.trim()) errs.email = "Email es requerido"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email inválido"
    if (!form.phone.trim()) errs.phone = "Teléfono es requerido"
    if (!form.documentNumber.trim()) errs.documentNumber = "Número de documento es requerido"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setGuestData(form)
    router.push("/booking/extras")
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <BookingStepIndicator currentStep={2} />

        <div className="mt-10 text-center">
          <h1 className="font-serif text-3xl font-medium italic text-navy-900 mb-2">
            Datos del huésped principal
          </h1>
          <p className="font-sans text-slate-600">
            Ingresa los datos del titular de la reserva.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="p-6 rounded-2xl border border-ivory-200 bg-white shadow-sm space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Nombre *"
                value={form.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                error={errors.firstName}
                placeholder="Juan"
              />
              <Input
                label="Apellido *"
                value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                error={errors.lastName}
                placeholder="Pérez"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input
                label="Email *"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
                placeholder="juan@correo.com"
              />
              <Input
                label="Teléfono *"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                error={errors.phone}
                placeholder="+51 999 999 999"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block font-sans text-sm font-medium text-navy-900 mb-1.5">
                  Tipo de documento *
                </label>
                <select
                  value={form.documentType}
                  onChange={(e) => updateField("documentType", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-ivory-300 bg-white font-sans text-sm text-navy-900 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 outline-none transition-all"
                >
                  {DOCUMENT_TYPES.map((dt) => (
                    <option key={dt.value} value={dt.value}>{dt.label}</option>
                  ))}
                </select>
              </div>
              <Input
                label="N° Documento *"
                value={form.documentNumber}
                onChange={(e) => updateField("documentNumber", e.target.value)}
                error={errors.documentNumber}
                placeholder="12345678"
              />
              <Input
                label="Nacionalidad"
                value={form.nationality}
                onChange={(e) => updateField("nationality", e.target.value)}
                placeholder="PE"
              />
            </div>

            <div>
              <label className="block font-sans text-sm font-medium text-navy-900 mb-1.5">
                Solicitudes especiales
              </label>
              <textarea
                value={form.specialRequests}
                onChange={(e) => updateField("specialRequests", e.target.value)}
                rows={3}
                placeholder="Alguna solicitud especial para tu estadía..."
                className="w-full px-4 py-2.5 rounded-lg border border-ivory-300 bg-white font-sans text-sm text-navy-900 placeholder:text-slate-400 focus:ring-2 focus:ring-gold-300 focus:border-gold-400 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              ← Volver
            </Button>
            <Button type="submit" variant="gold">
              Continuar a extras →
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
