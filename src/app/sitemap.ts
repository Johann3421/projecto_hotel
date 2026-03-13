import type { MetadataRoute } from "next"
import { getPublicAppUrl } from "@/lib/env"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getPublicAppUrl()

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${baseUrl}/rooms`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${baseUrl}/amenities`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/booking`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
  ]

  const roomSlugs = [
    "estandar",
    "superior-vista-rio",
    "familiar",
    "suite-ejecutiva",
    "suite-presidencial",
  ]

  const roomPages = roomSlugs.map((slug) => ({
    url: `${baseUrl}/rooms/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }))

  return [...staticPages, ...roomPages]
}
