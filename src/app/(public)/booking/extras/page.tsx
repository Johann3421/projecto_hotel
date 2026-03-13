"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useBookingStore } from "@/store/booking"
import { useBooking } from "@/hooks/useBooking"
import BookingStepIndicator from "@/components/public/BookingStepIndicator"
import ExtraCard from "@/components/public/ExtraCard"
import BookingSummary from "@/components/public/BookingSummary"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"

interface ExtraData {
  id: string
  name: string
  description: string
  price: number
  priceType: "PER_NIGHT" | "PER_STAY"
  iconName: string
  maxQuantity: number
}

export default function BookingExtrasPage() {
  const router = useRouter()
  const { canProceedToExtras } = useBooking()
  const addExtra = useBookingStore((s) => s.addExtra)
  const removeExtra = useBookingStore((s) => s.removeExtra)
  const updateExtraQuantity = useBookingStore((s) => s.updateExtraQuantity)
  const selectedExtras = useBookingStore((s) => s.selectedExtras)
  const roomTypeId = useBookingStore((s) => s.roomTypeId)

  const [extras, setExtras] = useState<ExtraData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!canProceedToExtras) {
      router.replace("/booking/guest")
      return
    }

    fetchExtras()
  }, [canProceedToExtras, roomTypeId, router])

  async function fetchExtras() {
    try {
      const res = await fetch(`/api/extras?roomTypeId=${roomTypeId}`)
      if (res.ok) {
        const data = await res.json()
        setExtras(data.extras || [])
      }
    } catch {
      console.error("Error fetching extras")
    } finally {
      setLoading(false)
    }
  }

  function isSelected(extraId: string) {
    return selectedExtras.some((e) => e.extraId === extraId)
  }

  function getQuantity(extraId: string) {
    return selectedExtras.find((e) => e.extraId === extraId)?.quantity || 0
  }

  function handleToggle(extra: ExtraData) {
    if (isSelected(extra.id)) {
      removeExtra(extra.id)
    } else {
      addExtra({
        extraId: extra.id,
        name: extra.name,
        unitPrice: extra.price,
        price: extra.price,
        priceType: extra.priceType,
        quantity: 1,
      })
    }
  }

  function handleQuantityChange(extraId: string, quantity: number) {
    if (quantity <= 0) {
      removeExtra(extraId)
    } else {
      updateExtraQuantity(extraId, quantity)
    }
  }

  if (!canProceedToExtras) {
    return (
      <div className="py-20 text-center">
        <div className="w-8 h-8 border-2 border-gold-400 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    )
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <BookingStepIndicator currentStep={3} />

        <div className="mt-10 text-center">
          <h1 className="font-serif text-3xl font-medium italic text-navy-900 mb-2">
            Personaliza tu estadía
          </h1>
          <p className="font-sans text-slate-600">
            Añade servicios extras para hacer de tu visita una experiencia inolvidable.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Extras List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              [1, 2, 3, 4].map((i) => <Skeleton key={i} variant="card" className="h-28" />)
            ) : extras.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-sans text-slate-500">No hay extras disponibles para este tipo de habitación.</p>
              </div>
            ) : (
              extras.map((extra) => (
                <ExtraCard
                  key={extra.id}
                  extra={{
                    id: extra.id,
                    name: extra.name,
                    description: extra.description,
                    icon: extra.iconName,
                    unitPrice: extra.price,
                    priceType: extra.priceType,
                    maxQuantity: extra.maxQuantity,
                  }}
                  selected={isSelected(extra.id)}
                  quantity={getQuantity(extra.id)}
                  onToggle={() => handleToggle(extra)}
                  onQuantityChange={handleQuantityChange}
                />
              ))
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingSummary />
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-between">
          <Button variant="outline" onClick={() => router.back()}>
            ← Volver
          </Button>
          <Button variant="gold" onClick={() => router.push("/booking/summary")}>
            Ver resumen →
          </Button>
        </div>
      </div>
    </div>
  )
}
