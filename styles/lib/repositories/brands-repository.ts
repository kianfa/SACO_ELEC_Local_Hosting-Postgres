import { getReadDbClient } from "@/lib/supabase/get-db-client"
import type { Brand } from "@/types/brand"

type RawBrandRow = {
  id: string | number
  name: string | null
  slug: string | null
  logo_url?: string | null
  logoUrl?: string | null
  description?: string | null
  logo_alt_text?: string | null
  is_active?: boolean | null
  created_at?: string | null
}

type ProductBrandRow = {
  brand_id?: string | number | null
}

function isMissingColumnError(message: string): boolean {
  const lower = message.toLowerCase()
  return lower.includes("does not exist") || lower.includes("schema cache")
}

function createFallbackSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
}

function mapBrand(row: RawBrandRow): Brand {
  const name = row.name ?? "برند بدون نام"

  return {
    id: String(row.id),
    name,
    slug: row.slug || createFallbackSlug(name),
    logoUrl: row.logo_url ?? row.logoUrl ?? null,
    description: row.description ?? null,
    logoAltText: row.logo_alt_text?.trim() || (name ? `لوگوی برند ${name}` : null),
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? null,
    productCount: 0,
  }
}

function attachProductCounts(brands: Brand[], counts: Record<string, number>): Brand[] {
  return brands.map((brand) => ({ ...brand, productCount: counts[brand.id] ?? 0 }))
}

// Repository boundary: Supabase-specific brand queries belong here only.
// To migrate away from Supabase later, replace this repository implementation and
// keep the Brand type and brands-service API unchanged.
export async function fetchBrands(): Promise<Brand[]> {
  const supabase = await getReadDbClient()

  const primaryResult = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, logo_alt_text, description, is_active, created_at")
    .eq("is_active", true)
    .order("name", { ascending: true })

  if (!primaryResult.error) {
    return ((primaryResult.data ?? []) as RawBrandRow[]).map(mapBrand)
  }

  if (!isMissingColumnError(primaryResult.error.message)) {
    throw new Error(`Failed to fetch brands: ${primaryResult.error.message}`)
  }

  const fallbackResult = await supabase
    .from("brands")
    .select("id, name, slug, logo_url, description, created_at")
    .order("name", { ascending: true })

  if (!fallbackResult.error) {
    return ((fallbackResult.data ?? []) as RawBrandRow[]).map(mapBrand)
  }

  if (!isMissingColumnError(fallbackResult.error.message)) {
    throw new Error(`Failed to fetch brands: ${fallbackResult.error.message}`)
  }

  const minimalResult = await supabase.from("brands").select("id, name, slug").order("name", { ascending: true })

  if (minimalResult.error) {
    throw new Error(`Failed to fetch brands: ${minimalResult.error.message}`)
  }

  return ((minimalResult.data ?? []) as RawBrandRow[]).map(mapBrand)
}

export async function fetchBrandProductCounts(): Promise<Record<string, number>> {
  const supabase = await getReadDbClient()

  const activeResult = await supabase.from("products").select("brand_id").eq("is_active", true)
  const result = !activeResult.error
    ? activeResult
    : isMissingColumnError(activeResult.error.message)
      ? await supabase.from("products").select("brand_id")
      : activeResult

  if (result.error) {
    if (isMissingColumnError(result.error.message)) return {}
    throw new Error(`Failed to fetch brand product counts: ${result.error.message}`)
  }

  return ((result.data ?? []) as ProductBrandRow[]).reduce<Record<string, number>>((acc, row) => {
    if (row.brand_id == null) return acc
    const key = String(row.brand_id)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

export async function fetchBrandsWithProductCounts(): Promise<Brand[]> {
  const [brands, counts] = await Promise.all([fetchBrands(), fetchBrandProductCounts().catch((): Record<string, number> => ({}))])
  return attachProductCounts(brands, counts)
}
