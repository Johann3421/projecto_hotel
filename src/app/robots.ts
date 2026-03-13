import type { MetadataRoute } from "next"
import { getPublicAppUrl } from "@/lib/env"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicAppUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
