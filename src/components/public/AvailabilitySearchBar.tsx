"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Users, CalendarDays } from "lucide-react"
import DatePicker from "@/components/ui/DatePicker"
import Button from "@/components/ui/Button"
import { format } from "date-fns"

interface AvailabilitySearchBarProps {
  defaultCheckIn?: Date | null
  defaultCheckOut?: Date | null
  defaultAdults?: number
  className?: string
}

export default function AvailabilitySearchBar({
  defaultCheckIn = null,
  defaultCheckOut = null,
  defaultAdults = 2,
  className,
}: AvailabilitySearchBarProps) {
  const router = useRouter()
  const [checkIn, setCheckIn] = useState<Date | null>(defaultCheckIn)
  const [checkOut, setCheckOut] = useState<Date | null>(defaultCheckOut)
  const [adults, setAdults] = useState(defaultAdults)

  const handleSearch = () => {
    if (!checkIn || !checkOut) return
    const params = new URLSearchParams({
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      adults: String(adults),
    })
    router.push(`/rooms?${params}`)
  }

  return (
    <div className={`bg-white/95 backdrop-blur rounded-2xl shadow-luxury p-4 lg:p-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-4 items-end">
        {/* Date Picker */}
        <div>
          <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            <CalendarDays className="inline h-3.5 w-3.5 mr-1" />
            Fechas
          </label>
          <DatePicker
            checkIn={checkIn}
            checkOut={checkOut}
            onDateChange={(ci, co) => {
              setCheckIn(ci)
              setCheckOut(co)
            }}
          />
        </div>

        {/* Guests */}
        <div>
          <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">
            <Users className="inline h-3.5 w-3.5 mr-1" />
            Huéspedes
          </label>
          <select
            value={adults}
            onChange={(e) => setAdults(Number(e.target.value))}
            className="w-full md:w-32 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 font-sans focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "huésped" : "huéspedes"}
              </option>
            ))}
          </select>
        </div>

        {/* Search Button */}
        <Button
          variant="gold"
          size="lg"
          onClick={handleSearch}
          disabled={!checkIn || !checkOut}
          className="w-full md:w-auto"
        >
          <Search className="h-4 w-4" />
          Ver disponibilidad
        </Button>
      </div>
      <p className="mt-2 text-center md:text-left font-sans text-xs text-slate-400">
        Mejor precio garantizado en reserva directa
      </p>
    </div>
  )
}
