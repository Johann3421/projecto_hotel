"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import BookingStepIndicator from "@/components/public/BookingStepIndicator"
import AvailabilitySearchBar from "@/components/public/AvailabilitySearchBar"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Skeleton from "@/components/ui/Skeleton"
import { getPrimaryRoomImage } from "@/lib/room-stock-images"
import { useBookingStore } from "@/store/booking"
import { Users, Maximize2, BedDouble } from "lucide-react"

interface RoomTypeResult {
  id: string
  name: string
  slug: string
  shortDesc: string
  basePrice: number
  maxGuests: number
  sizeSqm: number
  bedConfiguration: string
  availableCount: number
  imageUrl: string
  amenities: string[]
}

export default function BookingStep1Page() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const setRoomSelection = useBookingStore((s) => s.setRoomSelection)

  const [results, setResults] = useState<RoomTypeResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const checkIn = searchParams.get("checkIn")
  const checkOut = searchParams.get("checkOut")
  const adults = searchParams.get("adults") || "2"
  const children = searchParams.get("children") || "0"
  const preselectedType = searchParams.get("roomType")

  useEffect(() => {
    if (checkIn && checkOut) {
      fetchAvailability()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIn, checkOut, adults])

  async function fetchAvailability() {
    if (!checkIn || !checkOut) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/availability?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&children=${children}`
      )
      if (res.ok) {
        const data = await res.json()
        setResults(data.roomTypes || [])
      }
    } catch {
      console.error("Error fetching availability")
    } finally {
      setLoading(false)
      setSearched(true)
    }
  }

  function handleSelectRoom(rt: RoomTypeResult) {
    const nights = Math.ceil(
      (new Date(checkOut!).getTime() - new Date(checkIn!).getTime()) / (1000 * 60 * 60 * 24)
    )
    setRoomSelection({
      roomTypeId: rt.id,
      roomTypeName: rt.name,
      roomTypeSlug: rt.slug,
      checkIn: checkIn!,
      checkOut: checkOut!,
      adults: parseInt(adults),
      children: parseInt(children || "0"),
      nights,
      pricePerNight: rt.basePrice,
      roomCost: rt.basePrice * nights,
    })
    router.push("/booking/guest")
  }

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <BookingStepIndicator currentStep={1} />

        <div className="mt-10 text-center">
          <h1 className="font-serif text-3xl font-medium italic text-navy-900 mb-2">
            Selecciona tus fechas y habitación
          </h1>
          <p className="font-sans text-slate-600">
            Elige las fechas de tu estadía y la habitación que más te guste.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-8 max-w-3xl mx-auto">
          <AvailabilitySearchBar />
        </div>

        {/* Results */}
        <div className="mt-12">
          {loading && (
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="card" className="h-48" />
              ))}
            </div>
          )}

          {!loading && searched && results.length === 0 && (
            <div className="text-center py-16">
              <p className="font-serif text-xl text-navy-900 mb-2">No hay disponibilidad</p>
              <p className="font-sans text-sm text-slate-500">
                No encontramos habitaciones disponibles para las fechas seleccionadas.
                Intenta con otras fechas.
              </p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-6">
              {results.map((rt) => (
                <div
                  key={rt.id}
                  className={`flex flex-col md:flex-row gap-6 p-6 rounded-2xl border bg-white shadow-sm transition-all hover:shadow-luxury ${
                    preselectedType === rt.slug ? "border-gold-400 ring-2 ring-gold-200" : "border-ivory-200"
                  }`}
                >
                  {/* Image */}
                  <div className="w-full md:w-48 h-36 rounded-xl overflow-hidden bg-ivory-100 shrink-0">
                    <img
                      src={getPrimaryRoomImage(rt.slug, rt.name, rt.imageUrl)}
                      alt={rt.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-xl font-bold text-navy-900">{rt.name}</h3>
                        <p className="font-sans text-sm text-slate-500 mt-1">{rt.shortDesc}</p>
                      </div>
                      <Badge variant={rt.availableCount > 2 ? "success" : rt.availableCount > 0 ? "warning" : "danger"}>
                        {rt.availableCount} disponible(s)
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mt-3 text-xs font-sans text-slate-600">
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-gold-500" /> {rt.maxGuests} huéspedes</span>
                      <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5 text-gold-500" /> {rt.sizeSqm}m²</span>
                      <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5 text-gold-500" /> {rt.bedConfiguration}</span>
                    </div>

                    {rt.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {rt.amenities.slice(0, 4).map((a) => (
                          <span key={a} className="px-2 py-0.5 text-xs rounded-full bg-ivory-100 text-navy-700">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <div className="text-right">
                      <p className="font-serif text-2xl font-bold text-navy-900">S/ {rt.basePrice.toFixed(0)}</p>
                      <p className="text-xs font-sans text-slate-400">/noche · IGV no incl.</p>
                    </div>
                    <Button
                      variant="gold"
                      onClick={() => handleSelectRoom(rt)}
                      disabled={rt.availableCount === 0}
                    >
                      Seleccionar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
