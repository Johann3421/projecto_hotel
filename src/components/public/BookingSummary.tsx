"use client"
import Image from "next/image"
import { CalendarDays, Moon, Users } from "lucide-react"
import { useBookingStore } from "@/store/booking"
import { cn, formatPrice, formatDate } from "@/lib/utils"

interface BookingSummaryProps {
  className?: string
  showFullBreakdown?: boolean
}

export default function BookingSummary({ className }: BookingSummaryProps) {
  const {
    roomTypeName,
    roomTypeImage,
    checkIn,
    checkOut,
    nights,
    adults,
    children,
    pricePerNight,
    roomCost,
    selectedExtras,
    extrasCost,
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
  } = useBookingStore()

  const hasRoom = !!roomTypeName

  if (!hasRoom) {
    return (
      <div className={cn("rounded-2xl border border-slate-100 bg-white p-6 shadow-sm", className)}>
        <h3 className="font-serif text-lg font-semibold text-slate-900 mb-3">Resumen</h3>
        <p className="font-sans text-sm text-slate-400">
          Selecciona una habitación para ver el resumen de tu reserva.
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Room image + name */}
      {roomTypeImage && (
        <div className="relative aspect-[16/9] w-full">
          <Image
            src={roomTypeImage}
            alt={roomTypeName ?? "Habitación"}
            fill
            sizes="(max-width: 768px) 100vw, 360px"
            className="object-cover"
            quality={80}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/70 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="font-serif text-lg font-semibold text-white">{roomTypeName}</h3>
          </div>
        </div>
      )}

      {!roomTypeImage && (
        <div className="bg-navy-50 px-6 py-4">
          <h3 className="font-serif text-lg font-semibold text-navy-900">{roomTypeName}</h3>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Dates & guests */}
        <div className="space-y-3">
          {checkIn && (
            <div className="flex items-center gap-3 font-sans text-sm text-slate-600">
              <CalendarDays className="h-4 w-4 text-navy-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Check-in:</span>{" "}
                {formatDate(checkIn, "short")}
              </div>
            </div>
          )}
          {checkOut && (
            <div className="flex items-center gap-3 font-sans text-sm text-slate-600">
              <CalendarDays className="h-4 w-4 text-navy-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">Check-out:</span>{" "}
                {formatDate(checkOut, "short")}
              </div>
            </div>
          )}
          {nights > 0 && (
            <div className="flex items-center gap-3 font-sans text-sm text-slate-600">
              <Moon className="h-4 w-4 text-navy-500 shrink-0" />
              <span>
                <span className="font-bold text-slate-800">{nights}</span> noche
                {nights > 1 ? "s" : ""}
              </span>
            </div>
          )}
          <div className="flex items-center gap-3 font-sans text-sm text-slate-600">
            <Users className="h-4 w-4 text-navy-500 shrink-0" />
            <span>
              <span className="font-bold text-slate-800">{adults}</span> adulto
              {adults > 1 ? "s" : ""}
              {children > 0 && (
                <>
                  {", "}
                  <span className="font-bold text-slate-800">{children}</span> niño
                  {children > 1 ? "s" : ""}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* Price breakdown */}
        <div className="space-y-2.5">
          <h4 className="font-sans text-xs font-bold text-slate-400 uppercase tracking-wider">
            Desglose de precio
          </h4>

          {/* Room cost */}
          <div className="flex items-center justify-between font-sans text-sm">
            <span className="text-slate-600">
              Habitación ({formatPrice(pricePerNight)} × {nights} noche{nights > 1 ? "s" : ""})
            </span>
            <span className="font-bold text-slate-800">{formatPrice(roomCost)}</span>
          </div>

          {/* Extras */}
          {selectedExtras.length > 0 && (
            <>
              {selectedExtras.map((extra) => (
                <div
                  key={extra.extraId}
                  className="flex items-center justify-between font-sans text-sm"
                >
                  <span className="text-slate-600 truncate mr-2">
                    {extra.name}
                    {extra.quantity > 1 && (
                      <span className="text-slate-400"> ×{extra.quantity}</span>
                    )}
                  </span>
                  <span className="font-bold text-slate-800 shrink-0">
                    {formatPrice(extra.unitPrice * extra.quantity)}
                  </span>
                </div>
              ))}
            </>
          )}

          {extrasCost > 0 && (
            <div className="flex items-center justify-between font-sans text-sm text-slate-500">
              <span>Total extras</span>
              <span className="font-bold">{formatPrice(extrasCost)}</span>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* Totals */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-sans text-sm">
            <span className="text-slate-600">Subtotal</span>
            <span className="font-bold text-slate-800">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between font-sans text-sm">
            <span className="text-slate-600">IGV ({Math.round(taxRate * 100)}%)</span>
            <span className="font-bold text-slate-800">{formatPrice(taxAmount)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200">
            <span className="font-serif text-base font-semibold text-navy-900">Total</span>
            <span className="font-serif text-xl font-bold text-navy-900">
              {formatPrice(totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
