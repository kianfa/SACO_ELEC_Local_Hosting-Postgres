const LOCAL_DEVELOPMENT_URL = "http://localhost:3000"

function normalizeBaseUrl(value: string): string {
  const normalized = value.trim().replace(/\/+$/, "")
  const parsed = new URL(normalized)

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_SITE_URL must use http or https")
  }

  return parsed.toString().replace(/\/+$/, "")
}

export function getCanonicalSiteUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (configuredUrl) return normalizeBaseUrl(configuredUrl)

  if (process.env.NODE_ENV !== "production") {
    return LOCAL_DEVELOPMENT_URL
  }

  const authUrl = process.env.BETTER_AUTH_URL?.trim()
  if (authUrl) return normalizeBaseUrl(authUrl)

  throw new Error("Missing NEXT_PUBLIC_SITE_URL for production sitemap and robots metadata")
}

export function absoluteSiteUrl(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `${getCanonicalSiteUrl()}${path}`
}
