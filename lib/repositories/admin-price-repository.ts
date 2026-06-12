import { getServerDbClient } from "@/lib/supabase/get-db-client"
import type {
  BulkOldPriceBehavior,
  BulkPriceFilters,
  BulkPricePreviewItem,
  BulkPriceProduct,
  BulkPriceRequest,
  BulkPriceRoundingMode,
} from "@/types/admin-price"

// Admin bulk price repository. Supabase-specific query/update logic belongs here only.
// To migrate away from Supabase later, replace this file and keep the service/action APIs stable.
// RLS for products, inventory, product_price_history, and admin_price_update_logs should be
// restricted to authenticated users whose profiles.role = 'admin'.

type Relation<T> = T | T[] | null

type RawBulkProductRow = {
  id: string | number
  name: string | null
  slug: string | null
  model?: string | null
  sku?: string | null
  price?: number | string | null
  old_price?: number | string | null
  discount_percent?: number | string | null
  brand_id?: string | null
  category_id?: string | null
  is_active?: boolean | null
  is_featured?: boolean | null
  brands?: Relation<{ id?: string | number | null; name: string | null }>
  categories?: Relation<{ id?: string | number | null; name: string | null }>
  inventory?: Relation<{ quantity?: number | string | null; stock_quantity?: number | string | null }>
  product_images?: Relation<{
    image_url?: string | null
    url?: string | null
    alt_text?: string | null
    sort_order?: number | string | null
    is_main?: boolean | null
  }>
}

const BULK_PRODUCT_SELECT = `
  id,
  name,
  slug,
  model,
  sku,
  price,
  old_price,
  discount_percent,
  brand_id,
  category_id,
  is_active,
  is_featured,
  brands(id, name),
  categories(id, name),
  inventory(quantity, stock_quantity),
  product_images(image_url, url, alt_text, sort_order, is_main)
`

function toArray<T>(value: Relation<T> | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstRelationName(value: Relation<{ name: string | null }> | undefined): string | null {
  return toArray(value)[0]?.name ?? null
}

function mainImage(row: RawBulkProductRow): { url: string | null; alt: string | null } {
  const images = toArray(row.product_images).sort((a, b) => {
    const aMain = Boolean(a?.is_main)
    const bMain = Boolean(b?.is_main)
    if (aMain && !bMain) return -1
    if (!aMain && bMain) return 1
    return toNumber(a?.sort_order, 999) - toNumber(b?.sort_order, 999)
  })
  const image = images[0]
  return { url: image?.image_url || image?.url || null, alt: image?.alt_text ?? null }
}

function mapBulkProduct(row: RawBulkProductRow): BulkPriceProduct {
  const inventory = toArray(row.inventory)[0]
  const image = mainImage(row)

  return {
    id: String(row.id),
    name: row.name ?? "محصول بدون نام",
    slug: row.slug ?? "",
    model: row.model ?? null,
    sku: row.sku ?? null,
    price: toNumber(row.price),
    oldPrice: toNumber(row.old_price, 0) || null,
    discountPercent: toNumber(row.discount_percent, 0),
    brandId: row.brand_id ?? null,
    brandName: firstRelationName(row.brands),
    categoryId: row.category_id ?? null,
    categoryName: firstRelationName(row.categories),
    stockQuantity: toNumber(inventory?.quantity ?? inventory?.stock_quantity, 0),
    mainImageUrl: image.url,
    mainImageAlt: image.alt,
    isActive: Boolean(row.is_active ?? true),
    isFeatured: Boolean(row.is_featured),
  }
}

function roundPrice(value: number, roundingMode: BulkPriceRoundingMode): number {
  const safeValue = Math.max(0, value)
  if (roundingMode === "none") return Math.round(safeValue)
  const step = Number(roundingMode)
  if (!Number.isFinite(step) || step <= 0) return Math.round(safeValue)
  return Math.round(safeValue / step) * step
}

function calculateDiscountPercent(oldPrice: number | null, newPrice: number): number {
  if (!oldPrice || oldPrice <= newPrice) return 0
  return Math.max(0, Math.round(((oldPrice - newPrice) / oldPrice) * 100))
}

export function calculateBulkPricePreview(products: BulkPriceProduct[], request: BulkPriceRequest): BulkPricePreviewItem[] {
  const multiplier = request.changeType === "increase" ? 1 + request.percent / 100 : 1 - request.percent / 100

  return products.map((product) => {
    const newPrice = roundPrice(product.price * multiplier, request.roundingMode)
    const newOldPrice = getNewOldPrice(product.oldPrice, product.price, request.oldPriceBehavior)
    const newDiscountPercent = calculateDiscountPercent(newOldPrice, newPrice)

    return {
      ...product,
      newPrice,
      changeAmount: newPrice - product.price,
      newOldPrice,
      newDiscountPercent,
    }
  })
}

function getNewOldPrice(currentOldPrice: number | null, currentPrice: number, behavior: BulkOldPriceBehavior): number | null {
  if (behavior === "current_to_old") return currentPrice
  if (behavior === "clear") return null
  return currentOldPrice
}

export async function fetchBulkPriceProducts(filters: BulkPriceFilters): Promise<BulkPriceProduct[]> {
  const supabase = await getServerDbClient()
  let query = supabase.from("products").select(BULK_PRODUCT_SELECT)

  if (filters.targetType === "brand" && filters.brandId) query = query.eq("brand_id", filters.brandId)
  if (filters.targetType === "category" && filters.categoryId) query = query.eq("category_id", filters.categoryId)
  if (filters.targetType === "manual" && filters.selectedProductIds.length) query = query.in("id", filters.selectedProductIds)
  if (filters.onlyActive) query = query.eq("is_active", true)
  if (filters.onlyFeatured) query = query.eq("is_featured", true)

  const { data, error } = await query.order("name", { ascending: true })

  if (error) throw new Error(`Failed to fetch bulk price products: ${error.message}`)

  let products = ((data ?? []) as RawBulkProductRow[]).map(mapBulkProduct)
  if (filters.onlyInStock) products = products.filter((product) => product.stockQuantity > 0)
  return products
}

async function updateProductPrice(product: BulkPricePreviewItem) {
  const supabase = await getServerDbClient()
  const payload = {
    price: product.newPrice,
    old_price: product.newOldPrice,
    discount_percent: product.newDiscountPercent,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("products").update(payload).eq("id", product.id)
  if (!error) return

  if (error.message.toLowerCase().includes("updated_at") && error.message.toLowerCase().includes("does not exist")) {
    const { error: fallbackError } = await supabase
      .from("products")
      .update({ price: product.newPrice, old_price: product.newOldPrice, discount_percent: product.newDiscountPercent })
      .eq("id", product.id)
    if (fallbackError) throw new Error(`Failed to update product ${product.name}: ${fallbackError.message}`)
    return
  }

  throw new Error(`Failed to update product ${product.name}: ${error.message}`)
}

export async function applyBulkPriceUpdate(params: {
  adminUserId: string | null
  request: BulkPriceRequest
  previewItems: BulkPricePreviewItem[]
  targetLabel: string | null
}) {
  const supabase = await getServerDbClient()

  for (const item of params.previewItems) {
    await updateProductPrice(item)
  }

  const logPayload = {
    admin_user_id: params.adminUserId,
    change_type: params.request.changeType,
    percent: params.request.percent,
    target_type: params.request.targetType,
    target_value: params.targetLabel,
    affected_count: params.previewItems.length,
    rounding_mode: params.request.roundingMode,
    old_price_behavior: params.request.oldPriceBehavior,
    metadata: {
      filters: {
        brandId: params.request.brandId,
        categoryId: params.request.categoryId,
        onlyActive: params.request.onlyActive,
        onlyFeatured: params.request.onlyFeatured,
        onlyInStock: params.request.onlyInStock,
        selectedProductIds: params.request.selectedProductIds,
      },
      products: params.previewItems.map((item) => ({
        id: item.id,
        name: item.name,
        oldPrice: item.price,
        newPrice: item.newPrice,
      })),
    },
  }

  const { error: logError } = await supabase.from("admin_price_update_logs").insert(logPayload)
  if (logError && !logError.message.toLowerCase().includes("does not exist")) {
    throw new Error(`Prices updated, but audit log failed: ${logError.message}`)
  }

  const historyRows = params.previewItems.map((item) => ({
    product_id: item.id,
    old_price: item.price,
    new_price: item.newPrice,
    changed_by: params.adminUserId,
    reason: `bulk_${params.request.changeType}_${params.request.percent}%`,
  }))

  const { error: historyError } = await supabase.from("product_price_history").insert(historyRows)
  if (historyError && !historyError.message.toLowerCase().includes("does not exist")) {
    throw new Error(`Prices updated, but product history failed: ${historyError.message}`)
  }
}
