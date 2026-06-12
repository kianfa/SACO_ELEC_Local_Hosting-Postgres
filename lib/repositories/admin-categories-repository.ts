import { getServerDbClient } from "@/lib/supabase/get-db-client"
import { createRequestTimeoutSignal, performanceDebugEnabled, safePerformanceError, withExternalRequestTimeout, withServerTiming } from "@/lib/performance/server-timing"
import type { AdminCategoryInput, Category } from "@/types/category"

type RawCategory = {
  id: string | number
  name: string | null
  slug: string | null
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  parent_id?: string | number | null
  homepage_title?: string | null
  homepage_image_url?: string | null
  homepage_image_alt_text?: string | null
  homepage_icon_url?: string | null
  homepage_icon_alt_text?: string | null
  homepage_url?: string | null
  show_on_homepage?: boolean | null
  homepage_sort_order?: number | string | null
  is_active?: boolean | null
  created_at?: string | null
}

type ProductCategory = { category_id?: string | number | null }

const CATEGORY_SELECT = "id, name, slug, description, image_url, image_alt_text, parent_id, homepage_title, homepage_image_url, homepage_image_alt_text, homepage_icon_url, homepage_icon_alt_text, homepage_url, show_on_homepage, homepage_sort_order, is_active, created_at"

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeMediaUrl(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const trimmed = value.trim()
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  if (!base) return trimmed
  const path = trimmed.replace(/^site-media\//, "").replace(/^\/+/, "")
  return `${base}/storage/v1/object/public/site-media/${path}`
}

function mapCategory(row: RawCategory, parentName: string | null, productCount = 0, childCount = 0): Category {
  const name = row.name?.trim() || "دسته‌بندی بدون نام"
  const imageUrl = normalizeMediaUrl(row.image_url)
  const homepageImageUrl = normalizeMediaUrl(row.homepage_image_url)
  const homepageIconUrl = normalizeMediaUrl(row.homepage_icon_url)
  const homepageImageAltText = row.homepage_image_alt_text?.trim() || null
  const homepageIconAltText = row.homepage_icon_alt_text?.trim() || null
  const displayImageUrl = homepageImageUrl ?? imageUrl ?? homepageIconUrl ?? null
  return {
    id: String(row.id),
    name,
    slug: row.slug?.trim() || "category",
    description: row.description ?? null,
    imageUrl,
    imageAltText: row.image_alt_text?.trim() || (imageUrl ? `تصویر دسته‌بندی ${name}` : null),
    parentId: row.parent_id == null ? null : String(row.parent_id),
    parentName,
    homepageTitle: row.homepage_title ?? null,
    homepageImageUrl,
    homepageImageAltText,
    homepageIconUrl,
    homepageIconAltText,
    displayImageUrl,
    displayImageAltText: (homepageImageUrl ? homepageImageAltText : null) ?? (imageUrl ? row.image_alt_text?.trim() || `تصویر دسته‌بندی ${name}` : null) ?? (homepageIconUrl ? homepageIconAltText : null) ?? `تصویر دسته‌بندی ${name}`,
    homepageUrl: row.homepage_url ?? null,
    showOnHomepage: row.show_on_homepage ?? true,
    homepageSortOrder: toNumber(row.homepage_sort_order),
    isActive: row.is_active ?? true,
    createdAt: row.created_at ?? null,
    productCount,
    childCount,
  }
}

async function productCounts(): Promise<Record<string, number>> {
  const supabase = await getServerDbClient()
  const { data, error } = await supabase.from("products").select("category_id")
  if (error) throw new Error(`Failed to count category products: ${error.message}`)
  return ((data ?? []) as ProductCategory[]).reduce<Record<string, number>>((acc, row) => {
    if (row.category_id == null) return acc
    const id = String(row.category_id)
    acc[id] = (acc[id] ?? 0) + 1
    return acc
  }, {})
}

function decorate(rows: RawCategory[], counts: Record<string, number>): Category[] {
  const nameMap = new Map(rows.map((row) => [String(row.id), row.name?.trim() || "دسته‌بندی بدون نام"]))
  const childCounts = rows.reduce<Record<string, number>>((acc, row) => {
    if (row.parent_id == null) return acc
    const id = String(row.parent_id)
    acc[id] = (acc[id] ?? 0) + 1
    return acc
  }, {})
  return rows.map((row) => mapCategory(row, row.parent_id == null ? null : nameMap.get(String(row.parent_id)) ?? null, counts[String(row.id)] ?? 0, childCounts[String(row.id)] ?? 0))
}

export async function fetchAdminCategories(): Promise<Category[]> {
  const supabase = await getServerDbClient()
  const [{ data, error }, counts] = await Promise.all([
    supabase.from("categories").select(CATEGORY_SELECT).order("homepage_sort_order", { ascending: true }).order("name", { ascending: true }),
    productCounts().catch((): Record<string, number> => ({})),
  ])
  if (error) throw new Error(`Failed to fetch admin categories: ${error.message}`)
  return decorate((data ?? []) as RawCategory[], counts)
}

// Product-list filters only need identifiers and names; avoid the category
// management page's product-count scan and large media metadata payload.
export async function fetchAdminCategoryOptions(caller = "unspecified"): Promise<Category[]> {
  const startedAt = performance.now()
  if (performanceDebugEnabled() && caller === "admin-new-product") {
    console.log("[admin-new-product] categories query started")
  }
  const supabase = await getServerDbClient()
  try {
    const result = await withServerTiming("admin category options query", async () => {
      const { data, error } = await withExternalRequestTimeout(
        "admin categories lookup",
        (signal) => supabase.from("categories").select("id, name, slug, is_active").order("name", { ascending: true }).abortSignal(signal),
      )
      if (error) throw new Error(`Failed to fetch admin category options: ${error.message}`)
      return ((data ?? []) as RawCategory[]).map((row) => mapCategory(row, null))
    })
    if (performanceDebugEnabled() && caller === "admin-new-product") {
      console.log(`[admin-new-product] categories query completed durationMs=${Math.round(performance.now() - startedAt)}`)
    }
    return result
  } catch (error) {
    if (performanceDebugEnabled() && caller === "admin-new-product") {
      console.log(`[admin-new-product] failed stage=categories-query durationMs=${Math.round(performance.now() - startedAt)} safeMessage=${safePerformanceError(error)}`)
    }
    throw error
  }
}

export async function fetchAdminCategoryById(id: string): Promise<Category | null> {
  const rows = await fetchAdminCategories()
  return rows.find((item) => item.id === id) ?? null
}

export async function categorySlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await getServerDbClient()
  let query = supabase.from("categories").select("id").eq("slug", slug).limit(1)
  if (excludeId) query = query.neq("id", excludeId)
  const { data, error } = await query.abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to validate category slug: ${error.message}`)
  return Boolean(data?.length)
}

async function createsCycle(id: string, parentId: string | null | undefined): Promise<boolean> {
  if (!parentId) return false
  if (id === parentId) return true
  const supabase = await getServerDbClient()
  let current: string | null = parentId
  const seen = new Set<string>()
  while (current && !seen.has(current)) {
    if (current === id) return true
    seen.add(current)
    const result: { data: { parent_id?: string | null } | null; error: { message: string } | null } = await supabase.from("categories").select("parent_id").eq("id", current).abortSignal(createRequestTimeoutSignal("adminMutation")).maybeSingle()
    if (result.error) throw new Error(`Failed to validate parent category: ${result.error.message}`)
    current = result.data?.parent_id ? String(result.data.parent_id) : null
  }
  return false
}

function payload(input: AdminCategoryInput) {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description || null,
    parent_id: input.parentId || null,
    image_url: input.imageUrl || null,
    image_alt_text: input.imageAltText || null,
    homepage_title: input.homepageTitle || null,
    homepage_image_url: input.homepageImageUrl || null,
    homepage_image_alt_text: input.homepageImageAltText || null,
    homepage_icon_url: input.homepageIconUrl || null,
    homepage_icon_alt_text: input.homepageIconAltText || null,
    homepage_url: input.homepageUrl || null,
    show_on_homepage: input.showOnHomepage,
    homepage_sort_order: input.homepageSortOrder,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  }
}

export async function insertCategory(input: AdminCategoryInput): Promise<Category> {
  const supabase = await getServerDbClient()
  const { data, error } = await supabase.from("categories").insert(payload(input)).select(CATEGORY_SELECT).abortSignal(createRequestTimeoutSignal("adminMutation")).single()
  if (error) throw new Error(`Failed to create category: ${error.message}`)
  return mapCategory(data as RawCategory, null)
}

export async function patchCategory(id: string, input: AdminCategoryInput): Promise<Category> {
  if (await createsCycle(id, input.parentId)) throw new Error("دسته‌بندی والد نمی‌تواند باعث حلقه در ساختار دسته‌بندی‌ها شود")
  const supabase = await getServerDbClient()
  const { data, error } = await supabase.from("categories").update(payload(input)).eq("id", id).select(CATEGORY_SELECT).abortSignal(createRequestTimeoutSignal("adminMutation")).single()
  if (error) throw new Error(`Failed to update category: ${error.message}`)
  return mapCategory(data as RawCategory, null)
}

export async function removeCategory(id: string): Promise<void> {
  const supabase = await getServerDbClient()
  const detachProducts = await supabase.from("products").update({ category_id: null }).eq("category_id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (detachProducts.error) throw new Error(`Failed to detach category products: ${detachProducts.error.message}`)
  const detachChildren = await supabase.from("categories").update({ parent_id: null }).eq("parent_id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (detachChildren.error) throw new Error(`Failed to detach child categories: ${detachChildren.error.message}`)
  const { error } = await supabase.from("categories").delete().eq("id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to delete category: ${error.message}`)
}

export async function setCategoryActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await getServerDbClient()
  const { error } = await supabase.from("categories").update({ is_active: isActive, updated_at: new Date().toISOString() }).eq("id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to update category status: ${error.message}`)
}

export async function setCategoryHomepageVisibility(id: string, showOnHomepage: boolean): Promise<void> {
  const supabase = await getServerDbClient()
  const { error } = await supabase.from("categories").update({ show_on_homepage: showOnHomepage, updated_at: new Date().toISOString() }).eq("id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to update category homepage visibility: ${error.message}`)
}
