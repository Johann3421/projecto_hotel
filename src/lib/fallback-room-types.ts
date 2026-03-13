import { getRoomStockImages } from "@/lib/room-stock-images"

export interface FallbackRoomType {
  id: string
  name: string
  slug: string
  description: string
  shortDesc: string
  basePrice: number
  maxGuests: number
  bedConfiguration: string
  sizeSqm: number
  images: Array<{ url: string; alt?: string }>
  amenities: Array<{ amenity: { id: string; name: string } }>
  extras: Array<{ extra: { id: string; name: string; description: string; price: number; priceType: "PER_NIGHT" | "PER_STAY" } }>
  rooms: Array<{ id: string; number: string; status: string }>
  seasonalPrices: Array<{ id: string; name: string; startDate: string; endDate: string; price: number }>
}

export const fallbackRoomTypes: FallbackRoomType[] = [
  {
    id: "fallback-estandar",
    name: "Estándar",
    slug: "estandar",
    description: "Una habitación acogedora con detalles cálidos, cama queen y todo lo necesario para una estadía cómoda en el centro de Huánuco.",
    shortDesc: "Comodidad esencial con diseño cálido y funcional.",
    basePrice: 180,
    maxGuests: 2,
    bedConfiguration: "1 cama queen",
    sizeSqm: 24,
    images: getRoomStockImages("estandar", "Estándar"),
    amenities: ["WiFi", "TV", "Aire Acondicionado", "Vista al Río"].map((name, index) => ({ amenity: { id: `amenity-estandar-${index}`, name } })),
    extras: [
      { extra: { id: "extra-breakfast", name: "Desayuno buffet", description: "Desayuno americano con opciones regionales.", price: 35, priceType: "PER_NIGHT" } },
    ],
    rooms: [
      { id: "room-101", number: "101", status: "AVAILABLE" },
      { id: "room-102", number: "102", status: "AVAILABLE" },
    ],
    seasonalPrices: [],
  },
  {
    id: "fallback-superior",
    name: "Superior Vista Río",
    slug: "superior-vista-rio",
    description: "Habitación luminosa con ventanales amplios y una vista privilegiada al río Huallaga, ideal para viajes de descanso o negocio.",
    shortDesc: "Más amplitud y una vista abierta al río.",
    basePrice: 260,
    maxGuests: 3,
    bedConfiguration: "1 cama king + sofá cama",
    sizeSqm: 32,
    images: getRoomStockImages("superior-vista-rio", "Superior Vista Río"),
    amenities: ["WiFi", "TV", "Aire Acondicionado", "Minibar", "Vista al Río"].map((name, index) => ({ amenity: { id: `amenity-superior-${index}`, name } })),
    extras: [
      { extra: { id: "extra-airport", name: "Traslado aeropuerto", description: "Recojo privado ida o vuelta.", price: 60, priceType: "PER_STAY" } },
    ],
    rooms: [
      { id: "room-201", number: "201", status: "AVAILABLE" },
      { id: "room-202", number: "202", status: "AVAILABLE" },
    ],
    seasonalPrices: [],
  },
  {
    id: "fallback-familiar",
    name: "Familiar",
    slug: "familiar",
    description: "Espacio pensado para familias, con distribución amplia, zona de descanso y capacidad para varios huéspedes sin perder confort.",
    shortDesc: "La opción ideal para familias que necesitan amplitud.",
    basePrice: 320,
    maxGuests: 5,
    bedConfiguration: "2 camas dobles + sofá cama",
    sizeSqm: 40,
    images: getRoomStockImages("familiar", "Familiar"),
    amenities: ["WiFi", "TV", "Aire Acondicionado", "Minibar"].map((name, index) => ({ amenity: { id: `amenity-familiar-${index}`, name } })),
    extras: [],
    rooms: [
      { id: "room-301", number: "301", status: "AVAILABLE" },
    ],
    seasonalPrices: [],
  },
  {
    id: "fallback-suite-ejecutiva",
    name: "Suite Ejecutiva",
    slug: "suite-ejecutiva",
    description: "Una suite pensada para viajes premium, con sala privada, escritorio ejecutivo y acabados sobrios de estilo contemporáneo.",
    shortDesc: "Confort premium y área ejecutiva integrada.",
    basePrice: 480,
    maxGuests: 3,
    bedConfiguration: "1 cama king",
    sizeSqm: 55,
    images: getRoomStockImages("suite-ejecutiva", "Suite Ejecutiva"),
    amenities: ["WiFi", "TV", "Aire Acondicionado", "Minibar", "Bañera"].map((name, index) => ({ amenity: { id: `amenity-suite-${index}`, name } })),
    extras: [],
    rooms: [
      { id: "room-401", number: "401", status: "AVAILABLE" },
    ],
    seasonalPrices: [],
  },
  {
    id: "fallback-suite-presidencial",
    name: "Suite Presidencial",
    slug: "suite-presidencial",
    description: "La suite insignia del hotel: espacios amplios, acabados nobles, comedor privado y vistas panorámicas al río y la ciudad.",
    shortDesc: "La experiencia más exclusiva del hotel.",
    basePrice: 850,
    maxGuests: 4,
    bedConfiguration: "1 cama king + lounge privado",
    sizeSqm: 90,
    images: getRoomStockImages("suite-presidencial", "Suite Presidencial"),
    amenities: ["WiFi", "TV", "Aire Acondicionado", "Minibar", "Bañera", "Vista al Río"].map((name, index) => ({ amenity: { id: `amenity-presidencial-${index}`, name } })),
    extras: [
      { extra: { id: "extra-butler", name: "Mayordomo privado", description: "Atención dedicada para experiencias premium.", price: 180, priceType: "PER_STAY" } },
    ],
    rooms: [
      { id: "room-pres-1", number: "PRES-01", status: "AVAILABLE" },
    ],
    seasonalPrices: [
      { id: "season-high", name: "Temporada alta", startDate: "2026-07-01", endDate: "2026-08-31", price: 980 },
    ],
  },
]

export function getFallbackRoomType(slug: string) {
  return fallbackRoomTypes.find((roomType) => roomType.slug === slug)
}