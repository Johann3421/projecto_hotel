import Image from "next/image"
import Link from "next/link"
import { fallbackRoomTypes } from "@/lib/fallback-room-types"
import { prisma } from "@/lib/prisma"
import { getPrimaryRoomImage, HOTEL_HERO_IMAGE } from "@/lib/room-stock-images"
import { generateHotelJsonLd } from "@/lib/seo"
import AvailabilitySearchBar from "@/components/public/AvailabilitySearchBar"
import RoomCard from "@/components/public/RoomCard"
import AmenityCard from "@/components/public/AmenityCard"
import TestimonialSlider from "@/components/public/TestimonialSlider"
import FloatingOrbsShell from "@/components/three/FloatingOrbsShell"
import HotelKeySceneShell from "@/components/three/HotelKeySceneShell"
import RoomTourSceneShell from "@/components/three/RoomTourSceneShell"
import StarRating from "@/components/ui/StarRating"
import Button from "@/components/ui/Button"
import { Waves, Flower2, UtensilsCrossed, Dumbbell, Wifi, HeadphonesIcon } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let roomTypes: any[] = fallbackRoomTypes
  let usingFallbackRooms = false

  try {
    roomTypes = await prisma.roomType.findMany({
      orderBy: { basePrice: "desc" },
      include: {
        images: { take: 1, orderBy: { position: "asc" } },
        amenities: { take: 4, include: { amenity: true } },
      },
    })
  } catch {
    usingFallbackRooms = true
  }

  const jsonLd = generateHotelJsonLd()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image with Ken Burns */}
        <div className="absolute inset-0 animate-room-pan">
          <Image
            src={HOTEL_HERO_IMAGE}
            alt="Alturas Grand Hotel - Fachada colonial iluminada al atardecer"
            fill
            priority
            quality={90}
            className="object-cover"
            sizes="100vw"
          />
        </div>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/80 via-navy-900/50 to-transparent" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-28">
          <div className="grid w-full grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            {/* Text Content */}
            <div className="animate-fade-luxury">
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={4.8} />
                <span className="font-sans text-sm text-ivory-200">4.8/5 · 312 huéspedes satisfechos</span>
              </div>
              <h1 className="font-serif text-5xl lg:text-7xl font-bold italic leading-tight tracking-tight text-white mb-6">
                Donde la historia abraza el confort moderno.
              </h1>
              <p className="font-sans text-lg text-ivory-200 leading-relaxed max-w-lg mb-8">
                Descubre Alturas Grand Hotel, un refugio boutique de 4 estrellas en el corazón de Huánuco.
                Arquitectura colonial restaurada, piscina temperada y vistas al majestuoso río Huallaga.
              </p>
              <Link href="/booking">
                <Button variant="gold" size="lg">
                  Reservar Ahora
                </Button>
              </Link>
            </div>

            {/* 3D Key Scene */}
            <div className="hidden lg:block h-[420px] w-full">
              <HotelKeySceneShell />
            </div>
          </div>
        </div>

      </section>

      <div className="relative z-20 mx-auto -mt-12 max-w-4xl px-4 sm:-mt-14 sm:px-6 lg:-mt-16 lg:px-8">
        <AvailabilitySearchBar className="border border-white/60 shadow-[0_30px_80px_rgba(15,23,42,0.18)]" />
      </div>

      {/* Featured Rooms */}
      <section className="px-4 pb-20 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {usingFallbackRooms && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <p className="font-sans text-sm text-amber-900">
                No se pudo conectar a la base de datos. Mostramos habitaciones de demostración mientras corriges `DATABASE_URL`.
              </p>
            </div>
          )}
          <div className="text-center mb-12">
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-2">Habitaciones & Suites</p>
            <h2 className="font-serif text-2xl lg:text-3xl font-medium italic text-navy-900">
              Espacios diseñados para el descanso perfecto
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {roomTypes.map((rt: any, i: number) => (
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
                featured={i === 0}
              />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/rooms">
              <Button variant="outline" size="lg">Ver todas las habitaciones</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3D Room Tour */}
      <section className="py-20 bg-navy-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">Recorrido Virtual</p>
              <h2 className="font-serif text-2xl lg:text-3xl font-medium italic text-white mb-6">
                Explora nuestra Suite Presidencial en 360°
              </h2>
              <p className="font-sans text-slate-400 leading-relaxed mb-6">
                La joya de Alturas Grand Hotel. 90m² de opulencia refinada con vistas panorámicas
                al río Huallaga y las montañas. Servicio de mayordomo personal incluido.
              </p>
              <ul className="space-y-3 mb-8">
                {["Vista panorámica 270°", "Baño de mármol Carrara", "Comedor privado", "Terraza exclusiva"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-slate-300 font-sans text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="font-sans text-xs text-slate-500 mb-4">Arrastra para explorar · 360°</p>
              <Link href="/rooms/suite-presidencial">
                <Button variant="gold">Reservar esta suite</Button>
              </Link>
            </div>
            <div className="h-[400px] rounded-2xl overflow-hidden border border-navy-700">
              <RoomTourSceneShell />
            </div>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section className="relative py-20 bg-ivory-100 overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <FloatingOrbsShell />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-2">Servicios</p>
            <h2 className="font-serif text-2xl lg:text-3xl font-medium italic text-navy-900">
              Todo lo que necesitas para una estadía perfecta
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AmenityCard iconName="Waves" title="Piscina Temperada" description="Piscina climatizada al aire libre con vista al jardín, ideal para nadar bajo el sol huanuqueño." />
            <AmenityCard iconName="Flower2" title="Spa & Masajes" description="Centro de bienestar con tratamientos relajantes, aromaterapia y masajes profesionales." />
            <AmenityCard iconName="UtensilsCrossed" title="Restaurante Panorámico" description="Cocina regional e internacional con productos locales frescos y vista al río Huallaga." />
            <AmenityCard iconName="Dumbbell" title="Gimnasio Equipado" description="Equipamiento moderno disponible 24/7 para mantener tu rutina de ejercicio durante la estadía." />
            <AmenityCard iconName="Wifi" title="WiFi 5G" description="Conexión de alta velocidad en todas las áreas del hotel para trabajo y entretenimiento." />
            <AmenityCard iconName="Headphones" title="Concierge 24h" description="Nuestro equipo de concierge está disponible las 24 horas para atender cualquier solicitud." />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-2">Testimonios</p>
            <h2 className="font-serif text-2xl lg:text-3xl font-medium italic text-navy-900">
              Lo que dicen nuestros huéspedes
            </h2>
          </div>
          <TestimonialSlider />
        </div>
      </section>

      {/* Location & Map */}
      <section className="py-20 bg-ivory-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <p className="font-sans text-xs font-bold uppercase tracking-widest text-gold-500 mb-2">Ubicación</p>
              <h2 className="font-serif text-2xl lg:text-3xl font-medium italic text-navy-900 mb-6">
                En el corazón de Huánuco
              </h2>
              <p className="font-sans text-slate-600 leading-relaxed mb-8">
                Alturas Grand Hotel se encuentra en una ubicación privilegiada en el centro histórico de Huánuco,
                sobre el Jr. Huallaga con acceso directo a las principales atracciones de la ciudad y vistas
                al río que le da nombre a nuestra calle.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-500 shrink-0">📍</span>
                  <div>
                    <p className="font-sans font-bold text-sm text-navy-900">Dirección</p>
                    <p className="font-sans text-sm text-slate-600">Jr. Huallaga 520, Huánuco 10001, Perú</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-500 shrink-0">📞</span>
                  <div>
                    <p className="font-sans font-bold text-sm text-navy-900">Teléfono</p>
                    <p className="font-sans text-sm text-slate-600">+51 62 000 0000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-500 shrink-0">✉️</span>
                  <div>
                    <p className="font-sans font-bold text-sm text-navy-900">Email</p>
                    <p className="font-sans text-sm text-slate-600">reservas@alturasgrand.pe</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-luxury h-[400px]">
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${process.env.NEXT_PUBLIC_HOTEL_LNG || "-76.2404"}!3d${process.env.NEXT_PUBLIC_HOTEL_LAT || "-9.9270"}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwNTUnMzcuMiJTIDc2wrAxNCcyNS40Ilc!5e0!3m2!1ses!2spe!4v1234567890`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Alturas Grand Hotel"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
