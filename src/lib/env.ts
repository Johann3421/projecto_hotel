const DEFAULT_PUBLIC_URL =
  process.env.NODE_ENV === "production"
    ? "https://alturasgrand.pe"
    : "http://localhost:3000"

function normalizeUrl(url: string) {
  return url.endsWith("/") ? url.slice(0, -1) : url
}

export function getPublicAppUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_PUBLIC_URL

  try {
    return normalizeUrl(new URL(rawUrl).toString())
  } catch {
    return DEFAULT_PUBLIC_URL
  }
}

export function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}