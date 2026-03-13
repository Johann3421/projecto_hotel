export interface RoomStockImage {
  url: string
  alt: string
  caption?: string
}

const IMAGE_PARAMS = "auto=format&fit=crop&w=1600&q=80"

export const HOTEL_HERO_IMAGE = `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?${IMAGE_PARAMS}`

const ROOM_STOCK_IMAGES: Record<string, RoomStockImage[]> = {
  estandar: [
    {
      url: `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?${IMAGE_PARAMS}`,
      alt: "Habitacion estandar con cama queen y decoracion calida",
      caption: "Habitacion estandar con luz natural y acabado contemporaneo",
    },
    {
      url: `https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?${IMAGE_PARAMS}`,
      alt: "Dormitorio de hotel boutique con textiles claros",
      caption: "Detalle de dormitorio boutique con estilo sobrio",
    },
    {
      url: `https://images.unsplash.com/photo-1505692952047-1a78307da8f2?${IMAGE_PARAMS}`,
      alt: "Habitacion comoda para una estadia urbana",
      caption: "Espacio funcional ideal para una escapada urbana",
    },
  ],
  "superior-vista-rio": [
    {
      url: `https://images.unsplash.com/photo-1566073771259-6a8506099945?${IMAGE_PARAMS}`,
      alt: "Habitacion superior con ventanales amplios y vista abierta",
      caption: "Suite luminosa con ventanales y ambiente relajado",
    },
    {
      url: `https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?${IMAGE_PARAMS}`,
      alt: "Habitacion premium con ventanal panoramico",
      caption: "Ambiente premium con amplitud y vista exterior",
    },
    {
      url: `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?${IMAGE_PARAMS}`,
      alt: "Habitacion superior con cama king y tonos naturales",
      caption: "Dormitorio superior con acabados elegantes",
    },
  ],
  familiar: [
    {
      url: `https://images.unsplash.com/photo-1590490360182-c33d57733427?${IMAGE_PARAMS}`,
      alt: "Habitacion familiar amplia con varias camas",
      caption: "Distribucion amplia pensada para familias",
    },
    {
      url: `https://images.unsplash.com/photo-1578683010236-d716f9a3f461?${IMAGE_PARAMS}`,
      alt: "Suite familiar con sala y camas adicionales",
      caption: "Ambiente confortable para grupos y familias",
    },
    {
      url: `https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?${IMAGE_PARAMS}`,
      alt: "Habitacion grande de hotel con area de descanso",
      caption: "Habitacion amplia con zona de descanso integrada",
    },
  ],
  "suite-ejecutiva": [
    {
      url: `https://images.unsplash.com/photo-1445019980597-93fa8acb246c?${IMAGE_PARAMS}`,
      alt: "Suite ejecutiva con cama king y sala privada",
      caption: "Suite ejecutiva con espacio para trabajo y descanso",
    },
    {
      url: `https://images.unsplash.com/photo-1455587734955-081b22074882?${IMAGE_PARAMS}`,
      alt: "Suite ejecutiva con escritorio y acabados premium",
      caption: "Area ejecutiva con estilo contemporaneo",
    },
    {
      url: `https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?${IMAGE_PARAMS}`,
      alt: "Dormitorio ejecutivo de hotel boutique",
      caption: "Dormitorio ejecutivo con confort premium",
    },
  ],
  "suite-presidencial": [
    {
      url: `https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?${IMAGE_PARAMS}`,
      alt: "Suite presidencial de lujo con acabados exclusivos",
      caption: "Suite insignia con atmosfera lujosa y presencia escenica",
    },
    {
      url: `https://images.unsplash.com/photo-1501117716987-c8e1ecb210b3?${IMAGE_PARAMS}`,
      alt: "Sala privada de suite presidencial en hotel de lujo",
      caption: "Area social privada con mobiliario de alta gama",
    },
    {
      url: `https://images.unsplash.com/photo-1571896349842-33c89424de2d?${IMAGE_PARAMS}`,
      alt: "Habitacion principal presidencial con vista panoramica",
      caption: "Dormitorio principal con escala y elegancia superior",
    },
    {
      url: `https://images.unsplash.com/photo-1566665797739-1674de7a421a?${IMAGE_PARAMS}`,
      alt: "Bano de suite premium con acabados de lujo",
      caption: "Bano premium acorde a una suite de alta categoria",
    },
  ],
}

const DEFAULT_STOCK_IMAGES: RoomStockImage[] = [
  {
    url: `https://images.unsplash.com/photo-1522798514-97ceb8c4f1c8?${IMAGE_PARAMS}`,
    alt: "Interior de hotel boutique",
    caption: "Interior de hotel boutique con atmosfera acogedora",
  },
]

function normalizeSlug(slug?: string | null) {
  return (slug?.trim().toLowerCase() ?? "").replace(/^habitacion-/, "")
}

export function isRoomImageUsable(imageUrl?: string | null) {
  if (!imageUrl) return false

  const normalized = imageUrl.trim().toLowerCase()
  if (!normalized) return false
  if (normalized.includes("/images/rooms/placeholder")) return false
  if (normalized.startsWith("/images/rooms/")) return false
  if (normalized.includes("source.unsplash.com")) return false

  return true
}

export function getRoomStockImages(slug?: string | null, roomName?: string | null) {
  const catalog = ROOM_STOCK_IMAGES[normalizeSlug(slug)] ?? DEFAULT_STOCK_IMAGES
  if (!roomName) return catalog

  return catalog.map((image, index) => ({
    ...image,
    alt: index === 0 ? roomName : image.alt,
  }))
}

export function getPrimaryRoomImage(slug?: string | null, roomName?: string | null, imageUrl?: string | null) {
  if (isRoomImageUsable(imageUrl)) return imageUrl as string
  return getRoomStockImages(slug, roomName)[0].url
}

export function getRoomGalleryImages(
  slug?: string | null,
  roomName?: string | null,
  images?: Array<{ url: string; alt?: string | null; caption?: string | null }>
) {
  const usableImages = (images ?? [])
    .filter((image) => isRoomImageUsable(image?.url))
    .map((image) => ({
      url: image.url,
      alt: image.alt || roomName || "Habitacion del hotel",
      caption: image.caption || undefined,
    }))

  if (usableImages.length > 0) return usableImages
  return getRoomStockImages(slug, roomName)
}