import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { generateSEOMetadata, generateRoomJsonLd } from "@/lib/seo"
import RoomGallery from "@/components/public/RoomGallery"
import AvailabilityCalendar from "@/components/public/AvailabilityCalendar"
import RoomTourWrapper from "@/components/public/RoomTourWrapper"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Link from "next/link"
import { Users, Maximize2, BedDouble, Wifi, Wind, Coffee, Bath, Tv, Mountain } from "lucide-react"

export async function generateStaticParams() {
  try {
    const types = await prisma.roomType.findMany({ select: { slug: true } })
    return types.map((t: any) => ({ slug: t.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const rt = await prisma.roomType.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })
  if (!rt) return {}
  return generateSEOMetadata({
    title: rt.name,
    description: rt.description.slice(0, 160),
    path: `/rooms/${slug}`,
  })
}

export default async function RoomDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const roomType = await prisma.roomType.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: "asc" } },
      amenities: { include: { amenity: true } },
      extras: { include: { extra: true } },
      rooms: { select: { id: true, number: true, status: true } },
      seasonalPrices: true,
    },
  })

  if (!roomType) notFound()

  const jsonLd = generateRoomJsonLd({
    name: roomType.name,
    description: roomType.description,
    slug: roomType.slug,
    basePrice: Number(roomType.basePrice),
    images: roomType.images.map((img: any) => img.url),
  })

  const availableCount = roomType.rooms.filter((r: any) => r.status === "AVAILABLE").length

  const amenityIcons: Record<string, React.ReactNode> = {
    "WiFi": <Wifi className="w-4 h-4" />,
    "Aire Acondicionado": <Wind className="w-4 h-4" />,
    "Minibar": <Coffee className="w-4 h-4" />,
    "Bañera": <Bath className="w-4 h-4" />,
    "TV": <Tv className="w-4 h-4" />,
    "Vista al Río": <Mountain className="w-4 h-4" />,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Breadcrumbs */}
          <nav className="mb-6 font-sans text-sm text-slate-500">
            <Link href="/" className="hover:text-navy-900 transition-colors">Inicio</Link>
            <span className="mx-2">/</span>
            <Link href="/rooms" className="hover:text-navy-900 transition-colors">Habitaciones</Link>
            <span className="mx-2">/</span>
            <span className="text-navy-900 font-medium">{roomType.name}</span>
          </nav>

          {/* Gallery */}
          <RoomGallery
            images={roomType.images.map((img: any) => ({
              url: img.url,
              alt: img.alt || roomType.name,
            }))}
          />

          {/* Content Grid */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Title & Quick Stats */}
              <div>
                <h1 className="font-serif text-3xl lg:text-4xl font-bold text-navy-900 mb-3">
                  {roomType.name}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm font-sans text-slate-600">
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gold-500" /> Hasta {roomType.maxGuests} huéspedes</span>
                  <span className="flex items-center gap-1.5"><Maximize2 className="w-4 h-4 text-gold-500" /> {roomType.sizeSqm}m²</span>
                  <span className="flex items-center gap-1.5"><BedDouble className="w-4 h-4 text-gold-500" /> {roomType.bedConfiguration}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="font-serif text-xl font-medium text-navy-900 mb-3">Descripción</h2>
                <p className="font-sans text-slate-600 leading-relaxed whitespace-pre-line">
                  {roomType.description}
                </p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="font-serif text-xl font-medium text-navy-900 mb-4">Comodidades incluidas</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {roomType.amenities.map(({ amenity }: { amenity: any }) => (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-2.5 p-3 rounded-lg bg-ivory-50 border border-ivory-200 text-sm font-sans text-navy-800"
                    >
                      {amenityIcons[amenity.name] || <span className="w-4 h-4 rounded-full bg-gold-300" />}
                      {amenity.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Extras */}
              {roomType.extras.length > 0 && (
                <div>
                  <h2 className="font-serif text-xl font-medium text-navy-900 mb-4">Servicios adicionales</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {roomType.extras.map(({ extra }: { extra: any }) => (
                      <div key={extra.id} className="p-4 rounded-xl border border-ivory-200 bg-white">
                        <p className="font-sans font-bold text-sm text-navy-900">{extra.name}</p>
                        <p className="font-sans text-xs text-slate-500 mt-1">{extra.description}</p>
                        <p className="font-sans text-sm font-bold text-gold-600 mt-2">
                          S/ {Number(extra.price).toFixed(2)} / {extra.priceType === "PER_NIGHT" ? "noche" : "estadía"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3D Tour */}
              {roomType.slug === "suite-presidencial" && (
                <div>
                  <h2 className="font-serif text-xl font-medium text-navy-900 mb-4">Recorrido Virtual 360°</h2>
                  <div className="h-[350px] rounded-xl overflow-hidden border border-navy-200">
                    <RoomTourWrapper />
                  </div>
                  <p className="mt-2 font-sans text-xs text-slate-400">Arrastra para explorar el espacio.</p>
                </div>
              )}

              {/* Seasonal Prices */}
              {roomType.seasonalPrices.length > 0 && (
                <div>
                  <h2 className="font-serif text-xl font-medium text-navy-900 mb-4">Precios por temporada</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full font-sans text-sm">
                      <thead>
                        <tr className="bg-ivory-100">
                          <th className="p-3 text-left font-medium text-navy-900">Temporada</th>
                          <th className="p-3 text-left font-medium text-navy-900">Desde</th>
                          <th className="p-3 text-left font-medium text-navy-900">Hasta</th>
                          <th className="p-3 text-right font-medium text-navy-900">Precio/noche</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roomType.seasonalPrices.map((sp: any) => (
                          <tr key={sp.id} className="border-b border-ivory-200">
                            <td className="p-3 text-navy-800">{sp.name}</td>
                            <td className="p-3 text-slate-600">{new Date(sp.startDate).toLocaleDateString("es-PE")}</td>
                            <td className="p-3 text-slate-600">{new Date(sp.endDate).toLocaleDateString("es-PE")}</td>
                            <td className="p-3 text-right font-bold text-gold-600">S/ {Number(sp.price).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="p-6 rounded-2xl border border-ivory-200 shadow-luxury bg-white">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="font-serif text-3xl font-bold text-navy-900">
                      S/ {Number(roomType.basePrice).toFixed(0)}
                    </span>
                    <span className="font-sans text-sm text-slate-500">/noche</span>
                  </div>
                  <p className="font-sans text-xs text-slate-400 mb-4">
                    IGV (18%) no incluido · Tarifas sujetas a temporada
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant={availableCount > 2 ? "success" : availableCount > 0 ? "warning" : "danger"}>
                      {availableCount > 0 ? `${availableCount} disponible(s)` : "Agotado"}
                    </Badge>
                  </div>

                  {/* Calendar */}
                  <div className="mb-4">
                    <AvailabilityCalendar roomTypeId={roomType.id} checkIn={null} checkOut={null} onDateChange={() => {}} />
                  </div>

                  <Link href={`/booking?roomType=${roomType.slug}`}>
                    <Button variant="gold" size="lg" className="w-full">
                      Reservar ahora
                    </Button>
                  </Link>
                </div>

                {/* Quick info card */}
                <div className="p-5 rounded-xl bg-navy-900 text-white">
                  <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-400 mb-3">¿Necesitas ayuda?</p>
                  <p className="font-sans text-sm text-slate-300 mb-3">
                    Nuestro equipo está disponible 24/7 para asistirte con tu reserva.
                  </p>
                  <p className="font-sans text-sm font-bold text-white">📞 +51 62 000 0000</p>
                  <p className="font-sans text-xs text-slate-400 mt-1">reservas@alturasgrand.pe</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
