import { getReadDbClient } from "@/lib/supabase/get-db-client"
import type { Product, ProductDetail, ProductDocument, ProductListResult, ProductQueryOptions, ProductSearchSuggestion, ProductVariant } from "@/types/product"

type SupabaseRelation<T> = T | T[] | null

type RawProductRow = {
  id: string | number
  name: string | null
  slug: string | null
  model: string | null
  sku: string | null
  price: number | string | null
  old_price?: number | string | null
  oldPrice?: number | string | null
  discount_percent?: number | string | null
  discountPercent?: number | string | null
  is_featured?: boolean | null
  is_active?: boolean | null
  isFeatured?: boolean | null
  has_warranty?: boolean | null
  rating?: number | string | null
  review_count?: number | string | null
  short_description?: string | null
  description?: string | null
  warranty?: string | null
  origin_country?: string | null
  option_group_title?: string | null
  brands?: SupabaseRelation<{ name: string | null; slug?: string | null }>
  brand?: SupabaseRelation<{ name: string | null; slug?: string | null }>
  categories?: SupabaseRelation<{ name: string | null; slug?: string | null }>
  category?: SupabaseRelation<{ name: string | null; slug?: string | null }>
  inventory?: SupabaseRelation<{
    stock_quantity?: number | string | null
    quantity?: number | string | null
  }>
  product_images?: SupabaseRelation<{
    id?: string | number | null
    url?: string | null
    image_url?: string | null
    alt_text?: string | null
    is_main?: boolean | null
    sort_order?: number | string | null
  }>
  product_documents?: SupabaseRelation<{
    id?: string | number | null
    title?: string | null
    file_name?: string | null
    file_url?: string | null
    file_size?: number | string | null
    mime_type?: string | null
    sort_order?: number | string | null
    created_at?: string | null
  }>
  product_variants?: SupabaseRelation<{
    id?: string | number | null
    label?: string | null
    price?: number | string | null
    sku?: string | null
    sort_order?: number | string | null
    is_active?: boolean | null
  }>
  product_specs?: SupabaseRelation<{
    spec_name?: string | null
    spec_value?: string | null
    label?: string | null
    name?: string | null
    value?: string | null
    sort_order?: number | string | null
  }>
}

function createProductListSelect(_options: ProductQueryOptions, includeVariants = true): string {
  const variantRelation = includeVariants ? ",\n  product_variants(id, label, price, sort_order, is_active)" : ""

  // Lightweight list payload: no descriptions, specs, documents, or full image gallery.
  // Product variants are reduced to the minimum fields needed to preserve option-price behavior.
  // The products page and header suggestions should not move
  // rich product-detail data through memory.
  return `
  id,
  name,
  slug,
  model,
  sku,
  price,
  old_price,
  discount_percent,
  is_featured,
  is_active,
  has_warranty,
  rating,
  review_count,
  brands(name, slug),
  categories(name, slug),
  inventory(stock_quantity, quantity)${variantRelation}
`
}

const PRODUCT_SEARCH_SUGGESTIONS_SELECT = `
  id,
  name,
  slug,
  model,
  sku,
  price,
  brands(name, slug),
  categories(name, slug)
`

const PRODUCT_DETAIL_SELECT = `
  id,
  name,
  slug,
  model,
  sku,
  price,
  old_price,
  discount_percent,
  is_featured,
  is_active,
  has_warranty,
  rating,
  review_count,
  short_description,
  description,
  warranty,
  origin_country,
  option_group_title,
  brands(name, slug),
  categories(name, slug),
  inventory(stock_quantity, quantity),
  product_images(id, url, image_url, alt_text, is_main, sort_order),
  product_documents(id, title, file_name, file_url, file_size, mime_type, sort_order, created_at),
  product_variants(id, label, price, sku, sort_order, is_active),
  product_specs(spec_name, spec_value, label, name, value, sort_order)
`

// Fallback for schemas that have not added optional detail columns yet.
// This keeps /products/[slug] working while the database evolves.
const PRODUCT_DETAIL_SELECT_FALLBACK = `
  id,
  name,
  slug,
  model,
  sku,
  price,
  old_price,
  discount_percent,
  is_featured,
  is_active,
  has_warranty,
  rating,
  review_count,
  option_group_title,
  brands(name, slug),
  categories(name, slug),
  inventory(stock_quantity, quantity),
  product_images(id, url, image_url, alt_text, is_main, sort_order),
  product_variants(id, label, price, sku, sort_order, is_active),
  product_specs(spec_name, spec_value, label, name, value, sort_order)
`

function toArray<T>(value: SupabaseRelation<T>): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function firstRelationName(value: SupabaseRelation<{ name: string | null; slug?: string | null }> | undefined): string | null {
  return toArray(value ?? null)[0]?.name ?? null
}

function firstRelationSlug(value: SupabaseRelation<{ name: string | null; slug?: string | null }> | undefined): string | null {
  return toArray(value ?? null)[0]?.slug ?? null
}

function createFallbackSlug(name: string, model: string | null): string {
  return `${name}-${model ?? ""}`
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u0600-\u06FF-]/g, "")
}

export function resolveProductImageUrl(image: { image_url?: string | null; url?: string | null } | null | undefined): string | null {
  const resolved = image?.image_url?.trim() || image?.url?.trim() || ""
  return resolved || null
}

function pickMainImage(images: RawProductRow["product_images"]): { url: string | null; alt: string | null } {
  const sorted = sortImages(images)
  const firstImage = sorted[0]
  return {
    url: resolveProductImageUrl(firstImage),
    alt: firstImage?.alt_text ?? null,
  }
}

function sortImages(images: RawProductRow["product_images"]) {
  return toArray(images).sort((imageA, imageB) => {
    const aIsMain = Boolean(imageA?.is_main)
    const bIsMain = Boolean(imageB?.is_main)
    if (aIsMain && !bIsMain) return -1
    if (!aIsMain && bIsMain) return 1
    return toNumber(imageA?.sort_order, 999) - toNumber(imageB?.sort_order, 999)
  })
}

function sortSpecs(specs: RawProductRow["product_specs"]) {
  return toArray(specs).sort(
    (specA, specB) => toNumber(specA?.sort_order, 999) - toNumber(specB?.sort_order, 999)
  )
}

function formatDocumentSize(size: number): string {
  if (!Number.isFinite(size) || size <= 0) return "نامشخص"
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toLocaleString("en-US", { maximumFractionDigits: 1 })} MB`
  return `${Math.ceil(size / 1024).toLocaleString("en-US")} KB`
}

function mapDocuments(documents: RawProductRow["product_documents"]): ProductDocument[] {
  return toArray(documents)
    .sort((a, b) => {
      const orderDiff = toNumber(a?.sort_order, 999) - toNumber(b?.sort_order, 999)
      if (orderDiff !== 0) return orderDiff
      return String(a?.created_at ?? "").localeCompare(String(b?.created_at ?? ""))
    })
    .map((document, index) => ({
      id: String(document?.id ?? `document-${index}`),
      name: document?.title || document?.file_name || "فایل PDF محصول",
      type: "PDF",
      size: formatDocumentSize(toNumber(document?.file_size, 0)),
      fileUrl: document?.file_url || "",
    }))
    .filter((document) => Boolean(document.fileUrl))
}

function mapVariants(variants: RawProductRow["product_variants"]): ProductVariant[] {
  return toArray(variants)
    .filter((variant) => Boolean(variant?.is_active ?? true))
    .sort((a, b) => toNumber(a?.sort_order, 999) - toNumber(b?.sort_order, 999))
    .map((variant, index) => ({
      id: String(variant?.id ?? `variant-${index}`),
      label: variant?.label ?? "",
      price: toNumber(variant?.price),
      sku: variant?.sku ?? null,
      sortOrder: toNumber(variant?.sort_order, index + 1),
      isActive: Boolean(variant?.is_active ?? true),
    }))
    .filter((variant) => Boolean(variant.label))
}

function mapSpecs(specs: RawProductRow["product_specs"]): string[] {
  return sortSpecs(specs)
    .map((spec) => {
      const title = spec?.label ?? spec?.name ?? spec?.spec_name ?? ""
      const value = spec?.value ?? spec?.spec_value ?? ""
      return title && value ? `${title}: ${value}` : title || value
    })
    .filter((spec): spec is string => Boolean(spec))
}

function mapProduct(row: RawProductRow): Product {
  const name = row.name ?? "محصول بدون نام"
  const model = row.model ?? null
  const inventory = toArray(row.inventory)[0]
  const mainImage = pickMainImage(row.product_images)
  const variants = mapVariants(row.product_variants)
  const displayPrice = variants.length ? Math.min(...variants.map((variant) => variant.price)) : toNumber(row.price)

  return {
    id: String(row.id),
    name,
    slug: row.slug || createFallbackSlug(name, model),
    model,
    sku: row.sku ?? null,
    shortDescription: row.short_description ?? null,
    description: row.description ?? null,
    price: displayPrice,
    oldPrice: variants.length ? null : (toNumber(row.old_price ?? row.oldPrice, 0) || null),
    discountPercent: variants.length ? 0 : toNumber(row.discount_percent ?? row.discountPercent, 0),
    brandName: firstRelationName(row.brands ?? row.brand),
    brandSlug: firstRelationSlug(row.brands ?? row.brand),
    categoryName: firstRelationName(row.categories ?? row.category),
    categorySlug: firstRelationSlug(row.categories ?? row.category),
    stockQuantity: toNumber(inventory?.stock_quantity ?? inventory?.quantity, 0),
    mainImageUrl: mainImage.url,
    mainImageAlt: mainImage.alt,
    isFeatured: Boolean(row.is_featured ?? row.isFeatured),
    isActive: Boolean(row.is_active ?? true),
    rating: toNumber(row.rating, 4.8),
    reviewCount: toNumber(row.review_count, 0),
    hasWarranty: Boolean(row.has_warranty ?? true),
    specs: mapSpecs(row.product_specs),
    optionGroupTitle: row.option_group_title ?? null,
    variants,
  }
}

function mapProductDetail(row: RawProductRow): ProductDetail {
  const product = mapProduct(row)
  const mappedImages = sortImages(row.product_images)
    .map((image, index) => ({
      id: image?.id ? String(image.id) : `image-${index}`,
      imageUrl: resolveProductImageUrl(image) || "",
      altText: image?.alt_text ?? null,
      isMain: Boolean(image?.is_main ?? index === 0),
      sortOrder: toNumber(image?.sort_order, index),
    }))
    .filter((image) => Boolean(image.imageUrl))

  if (process.env.DEBUG_PERFORMANCE === "true") {
    console.log(`[perf] mapped public product detail images productId=${product.id} count=${mappedImages.length}`)
  }

  const detailSpecs = sortSpecs(row.product_specs)
    .map((spec) => ({
      name: spec?.name ?? spec?.label ?? spec?.spec_name ?? "",
      value: spec?.value ?? spec?.spec_value ?? "",
      sortOrder: toNumber(spec?.sort_order, 999),
    }))
    .filter((spec) => spec.name || spec.value)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    model: product.model,
    sku: product.sku,
    shortDescription:
      row.short_description ??
      (product.model
        ? `${product.name} مدل ${product.model}، مناسب استفاده در پروژه‌های برق صنعتی و تابلو برق.`
        : `${product.name}، مناسب استفاده در پروژه‌های برق صنعتی و تابلو برق.`),
    description:
      row.description ??
      "اطلاعات تکمیلی این محصول به‌زودی تکمیل می‌شود. برای دریافت دیتاشیت، مشاوره فنی یا استعلام موجودی پروژه‌ای با کارشناسان فروش تماس بگیرید.",
    price: product.price,
    oldPrice: product.oldPrice,
    discountPercent: product.discountPercent,
    warranty:
      row.warranty ??
      (product.hasWarranty ? "ضمانت اصالت و سلامت کالا" : null),
    originCountry: row.origin_country ?? null,
    brandName: product.brandName,
    categoryName: product.categoryName,
    stockQuantity: product.stockQuantity,
    images: mappedImages,
    specs: detailSpecs,
    optionGroupTitle: row.option_group_title ?? null,
    variants: product.variants ?? [],
    documents: mapDocuments(row.product_documents),
    rating: product.rating,
    reviewCount: product.reviewCount,
    hasWarranty: product.hasWarranty,
  }
}

// Repository boundary: Supabase-specific query syntax belongs here only.
// To migrate to self-hosted PostgreSQL, a REST API, or another provider, replace the
// methods in this file and keep the Product/ProductDetail types and service API unchanged.
function normalizeSearchValue(value: string | null | undefined): string {
  return (value ?? "")
    .toString()
    .trim()
    .toLowerCase()
}

function normalizeFilterList(values: Array<string | null | undefined>): string[] {
  return values
    .flatMap((value) => (value ?? "").split(","))
    .map(normalizeSearchValue)
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
}

function normalizePositiveInteger(value: number | null | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

function normalizePriceFilter(value: number | null | undefined): number | null {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function normalizeAvailabilityFilter(value: ProductQueryOptions["availability"]): "in-stock" | "out-of-stock" | null {
  if (value === true || value === "in-stock" || value === "available" || value === "true") return "in-stock"
  if (value === false || value === "out-of-stock" || value === "unavailable" || value === "false") return "out-of-stock"
  return null
}

function createIlikePattern(value: string): string {
  return `%${value.replace(/[%,()]/g, " ").trim()}%`
}

function sortProductsQuery<T extends { order: (column: string, options?: { ascending?: boolean; foreignTable?: string }) => T }>(query: T, sort: string | null | undefined): T {
  switch (sort) {
    case "cheapest":
      return query.order("price", { ascending: true }).order("id", { ascending: false })
    case "expensive":
      return query.order("price", { ascending: false }).order("id", { ascending: false })
    case "discount":
      return query.order("discount_percent", { ascending: false }).order("id", { ascending: false })
    case "newest":
      return query.order("id", { ascending: false })
    default:
      return query.order("review_count", { ascending: false }).order("id", { ascending: false })
  }
}

async function resolveIdsBySlugs(
  table: "brands" | "categories",
  slugs: string[],
): Promise<string[]> {
  if (!slugs.length) return []

  const supabase = await getReadDbClient()
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .in("slug", slugs)

  if (error) {
    throw new Error(`Failed to resolve ${table} filters: ${error.message}`)
  }

  return ((data ?? []) as Array<{ id?: string | number | null }>)
    .map((row) => row.id)
    .filter((id): id is string | number => id !== null && id !== undefined)
    .map(String)
}

async function resolveInventoryProductIds(availability: "in-stock" | "out-of-stock" | null): Promise<string[] | null> {
  if (!availability) return null

  const supabase = await getReadDbClient()
  let query = supabase
    .from("inventory")
    .select("product_id")

  query = availability === "in-stock"
    ? query.gt("stock_quantity", 0)
    : query.lte("stock_quantity", 0)

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to resolve inventory filters: ${error.message}`)
  }

  return ((data ?? []) as Array<{ product_id?: string | number | null }>)
    .map((row) => row.product_id)
    .filter((id): id is string | number => id !== null && id !== undefined)
    .map(String)
}

async function attachMainImagesToRows(rows: RawProductRow[]): Promise<RawProductRow[]> {
  const productIds = rows
    .map((row) => row.id)
    .filter((id): id is string | number => id !== null && id !== undefined)
    .map(String)

  if (!productIds.length) return rows

  const supabase = await getReadDbClient()
  const { data, error } = await supabase
    .from("product_images")
    .select("product_id, id, url, image_url, alt_text, is_main, sort_order")
    .in("product_id", productIds)
    .eq("is_main", true)
    .order("sort_order", { ascending: true })

  if (error) {
    if (isMissingColumnError(error.message)) return rows
    throw new Error(`Failed to fetch product main images: ${error.message}`)
  }

  const groupedImages = new Map<string, NonNullable<RawProductRow["product_images"]>>()
  for (const image of (data ?? []) as Array<{ product_id?: string | number | null; id?: string | number | null; url?: string | null; image_url?: string | null; alt_text?: string | null; is_main?: boolean | null; sort_order?: number | string | null }>) {
    if (image.product_id === null || image.product_id === undefined) continue
    const productId = String(image.product_id)
    const currentImages = toArray(groupedImages.get(productId) ?? null)
    groupedImages.set(productId, [...currentImages, image])
  }

  return rows.map((row) => ({
    ...row,
    product_images: groupedImages.get(String(row.id)) ?? [],
  }))
}

async function runProductListQuery(options: ProductQueryOptions, includeVariants = true) {
  const supabase = await getReadDbClient()
  const pageSize = Math.min(normalizePositiveInteger(options.pageSize ?? options.limit, 12), 48)
  const page = normalizePositiveInteger(options.page, 1)
  const offset = (page - 1) * pageSize
  const brandFilters = normalizeFilterList([...(options.brands ?? []), options.brand])
  const categoryFilters = normalizeFilterList([...(options.categories ?? []), options.category])
  const searchFilter = normalizeSearchValue(options.search)
  const minPrice = normalizePriceFilter(options.minPrice)
  const maxPrice = normalizePriceFilter(options.maxPrice)
  const availability = normalizeAvailabilityFilter(options.availability)
  const [brandIds, categoryIds, availabilityProductIds] = await Promise.all([
    resolveIdsBySlugs("brands", brandFilters),
    resolveIdsBySlugs("categories", categoryFilters),
    resolveInventoryProductIds(availability),
  ])

  let query = supabase
    .from("products")
    .select(createProductListSelect(options, includeVariants), { count: "exact" })

  if (options.active !== undefined) {
    query = query.eq("is_active", options.active)
  }

  if (options.featured !== undefined) {
    query = query.eq("is_featured", options.featured)
  }

  if (brandFilters.length > 0) {
    query = query.in("brand_id", brandIds)
  }

  if (categoryFilters.length > 0) {
    query = query.in("category_id", categoryIds)
  }

  if (availabilityProductIds) {
    query = query.in("id", availabilityProductIds)
  }

  if (searchFilter) {
    const pattern = createIlikePattern(searchFilter)
    query = query.or(`name.ilike.${pattern},model.ilike.${pattern},sku.ilike.${pattern}`)
  }

  if (minPrice !== null && minPrice > 0) {
    query = query.gte("price", minPrice)
  }

  if (maxPrice !== null && maxPrice > 0) {
    query = query.lte("price", maxPrice)
  }

  query = sortProductsQuery(query, options.sort)
  return query.range(offset, offset + pageSize - 1)
}

export async function fetchProductList(options: ProductQueryOptions = {}): Promise<ProductListResult> {
  const pageSize = Math.min(normalizePositiveInteger(options.pageSize ?? options.limit, 12), 48)
  const page = normalizePositiveInteger(options.page, 1)
  let { data, error, count } = await runProductListQuery(options, true)

  if (error && isMissingColumnError(error.message)) {
    const fallbackResult = await runProductListQuery(options, false)
    data = fallbackResult.data
    error = fallbackResult.error
    count = fallbackResult.count
  }

  if (error) {
    throw new Error(`Failed to fetch product list: ${error.message}`)
  }

  const rowsWithMainImages = await attachMainImagesToRows((data ?? []) as unknown as RawProductRow[])
  const products = rowsWithMainImages.map(mapProduct)
  const total = count ?? products.length

  if (process.env.DEBUG_PERFORMANCE === "true") {
    console.log(`[perf] public product list mapped count=${products.length} total=${total}`)
  }

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  }
}

export async function fetchProducts(options: ProductQueryOptions = {}): Promise<Product[]> {
  const result = await fetchProductList({ ...options, page: 1, pageSize: options.limit ?? options.pageSize ?? 24 })
  return result.products
}

function isMissingColumnError(message: string): boolean {
  return message.toLowerCase().includes("does not exist")
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = await getReadDbClient()

  const firstResult = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (!firstResult.error) {
    return firstResult.data ? mapProductDetail(firstResult.data as RawProductRow) : null
  }

  if (!isMissingColumnError(firstResult.error.message)) {
    throw new Error(`Failed to fetch product by slug: ${firstResult.error.message}`)
  }

  const fallbackResult = await supabase
    .from("products")
    .select(PRODUCT_DETAIL_SELECT_FALLBACK)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle()

  if (fallbackResult.error) {
    throw new Error(`Failed to fetch product by slug: ${fallbackResult.error.message}`)
  }

  return fallbackResult.data ? mapProductDetail(fallbackResult.data as RawProductRow) : null
}

export async function fetchProductSearchSuggestions(
  query: string,
  limit = 6
): Promise<ProductSearchSuggestion[]> {
  const normalizedQuery = query.trim()

  if (normalizedQuery.length < 2) {
    return []
  }

  const supabase = await getReadDbClient()
  const pattern = createIlikePattern(normalizeSearchValue(normalizedQuery))
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SEARCH_SUGGESTIONS_SELECT)
    .eq("is_active", true)
    .eq("product_images.is_main", true)
    .or(`name.ilike.${pattern},model.ilike.${pattern},sku.ilike.${pattern}`)
    .order("review_count", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 10))

  if (error) {
    throw new Error(`Failed to fetch product suggestions: ${error.message}`)
  }

  const rowsWithMainImages = await attachMainImagesToRows((data ?? []) as unknown as RawProductRow[])

  return rowsWithMainImages.map((row) => {
    const product = mapProduct(row)
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      model: product.model,
      sku: product.sku,
      price: product.price,
      brandName: product.brandName,
      categoryName: product.categoryName,
      mainImageUrl: product.mainImageUrl,
      mainImageAlt: product.mainImageAlt,
    }
  })
}
