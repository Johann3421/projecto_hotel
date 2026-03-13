import { getPublicAppUrl } from "@/lib/env"

export function generateSEOMetadata({
  title,
  description,
  path = "",
  image,
}: {
  title: string
  description: string
  path?: string
  image?: string
}) {
  const baseUrl = getPublicAppUrl()
  const url = `${baseUrl}${path}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Alturas Grand Hotel",
      locale: "es_PE",
      type: "website",
      ...(image && { images: [{ url: image, width: 1200, height: 630, alt: title }] }),
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      ...(image && { images: [image] }),
    },
    alternates: {
      canonical: url,
    },
  }
}

export function generateHotelJsonLd() {
  const baseUrl = getPublicAppUrl()

  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: process.env.NEXT_PUBLIC_HOTEL_NAME,
    description:
      "Hotel boutique 4 estrellas en Huánuco con piscina temperada, spa y arquitectura colonial.",
    url: baseUrl,
    telephone: process.env.NEXT_PUBLIC_HOTEL_PHONE,
    email: process.env.NEXT_PUBLIC_HOTEL_EMAIL,
    starRating: {
      "@type": "Rating",
      ratingValue: process.env.NEXT_PUBLIC_HOTEL_STARS,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jr. Huallaga 520",
      addressLocality: "Huánuco",
      addressRegion: "Huánuco",
      postalCode: "10001",
      addressCountry: "PE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: process.env.NEXT_PUBLIC_HOTEL_LAT,
      longitude: process.env.NEXT_PUBLIC_HOTEL_LNG,
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Piscina temperada", value: true },
      { "@type": "LocationFeatureSpecification", name: "Spa", value: true },
      { "@type": "LocationFeatureSpecification", name: "WiFi gratuito", value: true },
      { "@type": "LocationFeatureSpecification", name: "Restaurante", value: true },
    ],
  }
}

export function generateRoomJsonLd(room: {
  name: string
  description: string
  images: string[]
  basePrice: number
  slug: string
}) {
  const baseUrl = getPublicAppUrl()
  return {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description: room.description,
    image: room.images,
    url: `${baseUrl}/rooms/${room.slug}`,
    offers: {
      "@type": "Offer",
      priceCurrency: "PEN",
      price: room.basePrice,
      availability: "https://schema.org/InStock",
    },
    containedInPlace: {
      "@type": "Hotel",
      name: process.env.NEXT_PUBLIC_HOTEL_NAME,
      url: baseUrl,
    },
  }
}
