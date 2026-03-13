import { fallbackRoomTypes } from "@/lib/fallback-room-types"
import { prisma } from "@/lib/prisma"
import { getPrimaryRoomImage } from "@/lib/room-stock-images"
import { generateSEOMetadata } from "@/lib/seo"
import RoomCard from "@/components/public/RoomCard"

export const dynamic = "force-dynamic"

export const metadata = generateSEOMetadata({
  title: "Habitaciones & Suites",
  description: "Descubre nuestras 22 habitaciones y suites de lujo en Alturas Grand Hotel. Desde acogedoras estándar hasta la exclusiva Suite Presidencial con vista al río Huallaga.",
  path: "/rooms",
})

interface RoomsPageProps {
  searchParams: Promise<{
    checkIn?: string
    checkOut?: string
    adults?: string
    children?: string
  }>
}

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const params = await searchParams
  let roomTypes: any[] = fallbackRoomTypes
  let usingFallbackRooms = false

  try {
    roomTypes = await prisma.roomType.findMany({
      orderBy: { basePrice: "asc" },
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        amenities: { take: 5, include: { amenity: true } },
        rooms: { select: { id: true } },
      },
    })
  } catch {
    usingFallbackRooms = true
  }

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-2">
            Nuestras Habitaciones
          </p>
          <h1 className="font-serif text-3xl lg:text-4xl font-medium italic text-navy-900 mb-4">
            Encuentra tu espacio ideal
          </h1>
          <p className="font-sans text-slate-600 max-w-2xl mx-auto">
            Cada una de nuestras habitaciones ha sido diseñada para ofrecer
            la máxima comodidad y una experiencia inolvidable en Huánuco.
          </p>
        </div>

        {/* Search context banner */}
        {params.checkIn && params.checkOut && (
          <div className="mb-10 p-4 rounded-xl bg-gold-50 border border-gold-200 text-center">
            <p className="font-sans text-sm text-navy-900">
              Mostrando disponibilidad para{" "}
              <strong>{params.checkIn}</strong> → <strong>{params.checkOut}</strong>
              {params.adults && <> · {params.adults} adulto(s)</>}
              {params.children && <> · {params.children} niño(s)</>}
            </p>
          </div>
        )}

        {usingFallbackRooms && (
          <div className="mb-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
            <p className="font-sans text-sm text-amber-900">
              El catálogo se está mostrando con datos de demostración porque la conexión a PostgreSQL no es válida en este entorno.
            </p>
          </div>
        )}

        {/* Room Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {roomTypes.map((rt: any) => (
            <RoomCard
              key={rt.id}
              name={rt.name}
              slug={rt.slug}
              shortDesc={rt.shortDesc}
              basePrice={Number(rt.basePrice)}
              maxGuests={rt.maxGuests}
              sizeSqm={rt.sizeSqm}
              bedConfiguration={rt.bedConfiguration}
              imageUrl={getPrimaryRoomImage(rt.slug, rt.name, rt.images[0]?.url)}
              amenities={rt.amenities.map((a: any) => a.amenity.name)}
            />
          ))}
        </div>

        {/* Bottom info strip */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6 rounded-xl bg-ivory-100 border border-ivory-200">
            <p className="font-serif text-2xl font-bold text-navy-900 mb-1">22</p>
            <p className="font-sans text-xs uppercase tracking-widest text-slate-500">Habitaciones</p>
          </div>
          <div className="p-6 rounded-xl bg-ivory-100 border border-ivory-200">
            <p className="font-serif text-2xl font-bold text-navy-900 mb-1">5</p>
            <p className="font-sans text-xs uppercase tracking-widest text-slate-500">Categorías</p>
          </div>
          <div className="p-6 rounded-xl bg-ivory-100 border border-ivory-200">
            <p className="font-serif text-2xl font-bold text-navy-900 mb-1">90m²</p>
            <p className="font-sans text-xs uppercase tracking-widest text-slate-500">Suite más grande</p>
          </div>
        </div>
      </div>
    </div>
  )
}
