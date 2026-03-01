import Image from "next/image"
import Link from "next/link"
import { Users, Maximize2, BedDouble } from "lucide-react"
import Badge from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { formatPrice } from "@/lib/utils"

interface RoomCardProps {
  name: string
  slug: string
  shortDesc?: string | null
  basePrice: number
  maxGuests: number
  sizeSqm?: number | null
  bedConfiguration: string
  imageUrl: string
  amenities: string[]
  availableCount?: number
  pricePerNight?: number
  totalPrice?: number
  nights?: number
  checkIn?: string
  checkOut?: string
  featured?: boolean
}

export default function RoomCard({
  name,
  slug,
  shortDesc,
  basePrice,
  maxGuests,
  sizeSqm,
  bedConfiguration,
  imageUrl,
  amenities,
  availableCount,
  pricePerNight,
  totalPrice,
  nights,
  checkIn,
  checkOut,
  featured,
}: RoomCardProps) {
  const displayPrice = pricePerNight || basePrice
  const hasAvailability = availableCount !== undefined

  const bookingUrl = checkIn && checkOut
    ? `/booking?roomTypeSlug=${slug}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${maxGuests}`
    : `/rooms/${slug}`

  return (
    <div className="group rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-sm hover:shadow-luxury-hover transition-shadow duration-500">
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-[12s] ease-in-out group-hover:scale-105"
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/40 to-transparent" />
        {featured && (
          <Badge variant="gold" className="absolute top-3 left-3">★ Mejor valorada</Badge>
        )}
        {hasAvailability && availableCount !== undefined && availableCount <= 2 && (
          <Badge variant="danger" className="absolute top-3 right-3">
            Solo {availableCount} disponible{availableCount > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-5 space-y-3">
        <h3 className="font-serif text-xl font-semibold text-slate-900">{name}</h3>
        {shortDesc && (
          <p className="font-sans text-sm text-slate-500 line-clamp-2">{shortDesc}</p>
        )}

        {/* Specs */}
        <div className="flex items-center gap-4 text-sm text-slate-500 font-sans">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" /> {maxGuests} huéspedes
          </span>
          {sizeSqm && (
            <span className="flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5" /> {sizeSqm}m²
            </span>
          )}
          <span className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5" /> {bedConfiguration}
          </span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5">
          {amenities.slice(0, 4).map((a) => (
            <span key={a} className="px-2 py-0.5 rounded-full bg-ivory-100 text-xs text-slate-600 font-sans">
              {a}
            </span>
          ))}
          {amenities.length > 4 && (
            <span className="px-2 py-0.5 rounded-full bg-ivory-100 text-xs text-slate-500 font-sans">
              +{amenities.length - 4} más
            </span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-end justify-between pt-2 border-t border-slate-50">
          <div>
            {nights && totalPrice ? (
              <>
                <p className="font-sans text-2xl font-bold text-navy-900">
                  {formatPrice(totalPrice)}
                </p>
                <p className="font-sans text-xs text-slate-500">
                  {formatPrice(displayPrice)}/noche · {nights} noche{nights > 1 ? "s" : ""}
                </p>
              </>
            ) : (
              <>
                <p className="font-sans text-xs text-slate-500">Desde</p>
                <p className="font-sans text-2xl font-bold text-navy-900">
                  {formatPrice(displayPrice)}
                  <span className="text-sm font-normal text-slate-500">/noche</span>
                </p>
              </>
            )}
          </div>
          <Link href={bookingUrl}>
            <Button variant={checkIn ? "gold" : "outline"} size="sm">
              {checkIn ? "Reservar" : "Ver detalle"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
