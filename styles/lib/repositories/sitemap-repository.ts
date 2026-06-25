import "server-only"

import { unstable_cache } from "next/cache"
import { getServerDbClient } from "@/lib/supabase/get-db-client"

type SitemapProductRow = {
  slug: string | null
  updated_at: string | null
  is_active: boolean | null
}

type SitemapCategoryRow = {
  slug: string | null
  updated_at: string | null
  is_active: boolean | null
}

export type SitemapProduct = {
  slug: string
  updatedAt: string | null
}

export type SitemapCategory = {
  slug: string
  updatedAt: string | null
}

export type SitemapData = {
  products: SitemapProduct[]
  categories: SitemapCategory[]
}

function normalizeSlug(value: string | null | undefined): string | null {
  const slug = value?.trim()
  return slug ? slug : null
}

async function fetchSitemapDataUncached(): Promise<SitemapData> {
  const supabase = await getServerDbClient()
  const [productsResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("slug, updated_at, is_active").eq("is_active", true),
    supabase.from("categories").select("slug, updated_at, is_active").eq("is_active", true),
  ])

  if (productsResult.error) {
    throw new Error(`Failed to load public product sitemap rows: ${productsResult.error.message}`)
  }

  if (categoriesResult.error) {
    throw new Error(`Failed to load public category sitemap rows: ${categoriesResult.error.message}`)
  }

  const products = ((productsResult.data ?? []) as SitemapProductRow[])
    .map((row) => ({ slug: normalizeSlug(row.slug), updatedAt: row.updated_at ?? null }))
    .filter((row): row is SitemapProduct => Boolean(row.slug))

  const categories = ((categoriesResult.data ?? []) as SitemapCategoryRow[])
    .map((row) => ({ slug: normalizeSlug(row.slug), updatedAt: row.updated_at ?? null }))
    .filter((row): row is SitemapCategory => Boolean(row.slug))

  return { products, categories }
}

export const getSitemapData = unstable_cache(fetchSitemapDataUncached, ["sitemap-data"], {
  tags: ["sitemap-data"],
  revalidate: 3600,
})
