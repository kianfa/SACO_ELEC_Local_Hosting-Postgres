import type { MetadataRoute } from "next"
import { getSitemapData, type SitemapData } from "@/lib/repositories/sitemap-repository"
import { absoluteSiteUrl } from "@/lib/seo/site-url"

const STATIC_PUBLIC_ROUTES: MetadataRoute.Sitemap = [
  { url: absoluteSiteUrl("/"), changeFrequency: "daily", priority: 1 },
  { url: absoluteSiteUrl("/products"), changeFrequency: "daily", priority: 0.9 },
  { url: absoluteSiteUrl("/categories"), changeFrequency: "weekly", priority: 0.8 },
  { url: absoluteSiteUrl("/brands"), changeFrequency: "weekly", priority: 0.7 },
  { url: absoluteSiteUrl("/blog"), changeFrequency: "monthly", priority: 0.5 },
  { url: absoluteSiteUrl("/projects"), changeFrequency: "monthly", priority: 0.5 },
  { url: absoluteSiteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 },
]

function safeLastModified(value: string | null): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { products, categories }: SitemapData = await getSitemapData()
    const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
      url: absoluteSiteUrl(`/products/${encodeURIComponent(product.slug)}`),
      lastModified: safeLastModified(product.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }))
    const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
      // The storefront currently links categories to a real filtered products page.
      // There is intentionally no invented /categories/[slug] route.
      url: absoluteSiteUrl(`/products?category=${encodeURIComponent(category.slug)}`),
      lastModified: safeLastModified(category.updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }))

    return [...STATIC_PUBLIC_ROUTES, ...productRoutes, ...categoryRoutes]
  } catch (error) {
    console.error("Failed to load dynamic sitemap rows; returning static sitemap routes only", {
      message: error instanceof Error ? error.message : "Unknown sitemap data error",
    })
    return STATIC_PUBLIC_ROUTES
  }
}
