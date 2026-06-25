import { getServerDbClient } from "@/lib/supabase/get-db-client"
import { createRequestTimeoutSignal, performanceDebugEnabled, safePerformanceError, withExternalRequestTimeout, withServerTiming } from "@/lib/performance/server-timing"
import type { AdminBrandInput, Brand } from "@/types/brand"

type RawBrand = {
  id: string | number
  name: string | null
  slug: string | null
  description?: string | null
  logo_url?: string | null
  logo_alt_text?: string | null
  is_active?: boolean | null
  created_at?: string | null
}

type ProductBrand = { brand_id?: string | number | null }

function normalizeMediaUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  if (!base) return trimmed
  const path = trimmed.replace(/^site-media\//, "").replace(/^\/+/, "")
  return `${base}/storage/v1/object/public/site-media/${path}`
}

function mapBrand(row: RawBrand, productCount = 0): Brand {
  const name = row.name?.trim() || "برند بدون نام"
  return {
    id: String(row.id),
    name,
    slug: row.slug?.trim() || "brand",
    description: row.description ?? null,
    logoUrl: normalizeMediaUrl(row.logo_url),
    logoAltText: row.logo_alt_text?.trim() || `لوگوی برند ${name}`,
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? null,
    productCount,
  }
}

async function getCounts(): Promise<Record<string, number>> {
  const supabase = await getServerDbClient()
  const { data, error } = await supabase.from("products").select("brand_id")
  if (error) throw new Error(`Failed to count brand products: ${error.message}`)
  return ((data ?? []) as ProductBrand[]).reduce<Record<string, number>>((acc, row) => {
    if (row.brand_id == null) return acc
    const key = String(row.brand_id)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

const BRAND_SELECT = "id, name, slug, description, logo_url, logo_alt_text, is_active, created_at"

export async function fetchAdminBrands(): Promise<Brand[]> {
  const supabase = await getServerDbClient()
  const [{ data, error }, counts] = await Promise.all([
    supabase.from("brands").select(BRAND_SELECT).order("name", { ascending: true }),
    getCounts().catch((): Record<string, number> => ({})),
  ])
  if (error) throw new Error(`Failed to fetch admin brands: ${error.message}`)
  return ((data ?? []) as RawBrand[]).map((row) => mapBrand(row, counts[String(row.id)] ?? 0))
}

// Product-list filters do not need expensive product-count scans.
export async function fetchAdminBrandOptions(caller = "unspecified"): Promise<Brand[]> {
  const startedAt = performance.now()
  if (performanceDebugEnabled() && caller === "admin-new-product") {
    console.log("[admin-new-product] brands query started")
  }
  const supabase = await getServerDbClient()
  try {
    const result = await withServerTiming("admin brand options query", async () => {
      const { data, error } = await withExternalRequestTimeout(
        "admin brands lookup",
        (signal) => supabase.from("brands").select("id, name, slug, is_active").order("name", { ascending: true }).abortSignal(signal),
      )
      if (error) throw new Error(`Failed to fetch admin brand options: ${error.message}`)
      return ((data ?? []) as RawBrand[]).map((row) => mapBrand(row))
    })
    if (performanceDebugEnabled() && caller === "admin-new-product") {
      console.log(`[admin-new-product] brands query completed durationMs=${Math.round(performance.now() - startedAt)}`)
    }
    return result
  } catch (error) {
    if (performanceDebugEnabled() && caller === "admin-new-product") {
      console.log(`[admin-new-product] failed stage=brands-query durationMs=${Math.round(performance.now() - startedAt)} safeMessage=${safePerformanceError(error)}`)
    }
    throw error
  }
}

export async function fetchAdminBrandById(id: string): Promise<Brand | null> {
  const supabase = await getServerDbClient()
  const { data, error } = await supabase.from("brands").select(BRAND_SELECT).eq("id", id).maybeSingle()
  if (error) throw new Error(`Failed to fetch brand: ${error.message}`)
  if (!data) return null
  const counts = await getCounts().catch((): Record<string, number> => ({}))
  return mapBrand(data as RawBrand, counts[id] ?? 0)
}

export async function brandSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await getServerDbClient()
  let query = supabase.from("brands").select("id").eq("slug", slug).limit(1)
  if (excludeId) query = query.neq("id", excludeId)
  const { data, error } = await query.abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to validate brand slug: ${error.message}`)
  return Boolean(data?.length)
}

export async function insertBrand(input: AdminBrandInput): Promise<Brand> {
  const supabase = await getServerDbClient()
  const payload = {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    logo_url: input.logoUrl || null,
    logo_alt_text: input.logoAltText || null,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from("brands").insert(payload).select(BRAND_SELECT).abortSignal(createRequestTimeoutSignal("adminMutation")).single()
  if (error) throw new Error(`Failed to create brand: ${error.message}`)
  return mapBrand(data as RawBrand)
}

export async function patchBrand(id: string, input: AdminBrandInput): Promise<Brand> {
  const supabase = await getServerDbClient()
  const payload = {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    logo_url: input.logoUrl || null,
    logo_alt_text: input.logoAltText || null,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from("brands").update(payload).eq("id", id).select(BRAND_SELECT).abortSignal(createRequestTimeoutSignal("adminMutation")).single()
  if (error) throw new Error(`Failed to update brand: ${error.message}`)
  return mapBrand(data as RawBrand)
}

export async function removeBrand(id: string): Promise<void> {
  const supabase = await getServerDbClient()
  const detach = await supabase.from("products").update({ brand_id: null }).eq("brand_id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (detach.error) throw new Error(`Failed to detach brand products: ${detach.error.message}`)
  const { error } = await supabase.from("brands").delete().eq("id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to delete brand: ${error.message}`)
}

export async function setBrandActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await getServerDbClient()
  const { error } = await supabase.from("brands").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to update brand status: ${error.message}`)
}
