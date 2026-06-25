import { getServerDbClient } from "@/lib/supabase/get-db-client"
import { createRequestTimeoutSignal, withExternalRequestTimeout, withServerTiming } from "@/lib/performance/server-timing"
import { toSafePathSegment } from "@/lib/security/file-upload"
import { deleteMediaByPublicUrl, isManagedMediaUrl, storagePathFromPublicUrl as mediaStoragePathFromPublicUrl, uploadMedia, uploadProductDocumentMedia } from "@/lib/storage/media-storage"
import type { AdminProduct, AdminProductDocument, AdminProductFormInput, AdminProductImage, AdminProductSpec, AdminProductVariant } from "@/types/admin-product"
import type { Product } from "@/types/product"


// Admin write operations are intentionally centralized here.
// When tightening Supabase RLS for production, restrict INSERT/UPDATE/DELETE
// on products, inventory, product_images, and product_specs
// to authenticated users whose profiles.role = 'admin'. Media files are handled by the server-only storage module.

type Relation<T> = T | T[] | null

type RawAdminImageRow = {
  id: string | number
  image_url?: string | null
  url?: string | null
  alt_text?: string | null
  sort_order?: number | string | null
  is_main?: boolean | null
}

type RawAdminDocumentRow = {
  id: string | number
  title?: string | null
  file_name?: string | null
  file_url?: string | null
  storage_path?: string | null
  file_size?: number | string | null
  mime_type?: string | null
  sort_order?: number | string | null
  created_at?: string | null
}

type RawAdminVariantRow = {
  id?: string | number
  label?: string | null
  price?: number | string | null
  sku?: string | null
  sort_order?: number | string | null
  is_active?: boolean | null
}

type RawAdminSpecRow = {
  id?: string | number
  spec_name?: string | null
  spec_value?: string | null
  name?: string | null
  label?: string | null
  value?: string | null
  sort_order?: number | string | null
}

type RawAdminProductRow = {
  id: string | number
  name: string | null
  slug: string | null
  model?: string | null
  sku?: string | null
  short_description?: string | null
  description?: string | null
  price?: number | string | null
  old_price?: number | string | null
  discount_percent?: number | string | null
  warranty?: string | null
  origin_country?: string | null
  option_group_title?: string | null
  brand_id?: string | null
  category_id?: string | null
  is_active?: boolean | null
  is_featured?: boolean | null
  has_warranty?: boolean | null
  brands?: Relation<{ name: string | null }>
  categories?: Relation<{ name: string | null }>
  inventory?: Relation<{
    quantity?: number | string | null
    stock_quantity?: number | string | null
    low_stock_threshold?: number | string | null
  }>
  product_images?: Relation<RawAdminImageRow>
  product_documents?: Relation<RawAdminDocumentRow>
  product_specs?: Relation<RawAdminSpecRow>
  product_variants?: Relation<RawAdminVariantRow>
}

const ADMIN_PRODUCT_SELECT = `
  id,
  name,
  slug,
  model,
  sku,
  short_description,
  description,
  price,
  old_price,
  discount_percent,
  warranty,
  origin_country,
  option_group_title,
  brand_id,
  category_id,
  is_active,
  is_featured,
  has_warranty,
  brands(name),
  categories(name),
  inventory(quantity, stock_quantity, low_stock_threshold),
  product_images(id, image_url, url, alt_text, sort_order, is_main),
  product_documents(id, title, file_name, file_url, storage_path, file_size, mime_type, sort_order, created_at),
  product_specs(id, spec_name, spec_value, name, label, value, sort_order),
  product_variants(id, label, price, sku, sort_order, is_active)
`

const ADMIN_PRODUCT_SELECT_FALLBACK = `
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
  has_warranty,
  option_group_title,
  brands(name),
  categories(name),
  inventory(quantity, stock_quantity),
  product_images(id, url, image_url, alt_text, sort_order, is_main),
  product_specs(id, spec_name, spec_value, name, label, value, sort_order),
  product_variants(id, label, price, sku, sort_order, is_active)
`

// The admin table only needs summary columns. Edit pages keep using the richer
// select above; the list no longer transfers descriptions or technical specs.
const ADMIN_PRODUCT_LIST_SELECT = `
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
  has_warranty,
  brands(name),
  categories(name),
  inventory(quantity, stock_quantity),
  product_images(id, image_url, url, alt_text, sort_order, is_main),
  product_variants(id, label, price, sku, sort_order, is_active)
`

const ADMIN_PRODUCT_LIST_SELECT_FALLBACK = `
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
  has_warranty,
  brands(name),
  categories(name),
  inventory(quantity, stock_quantity),
  product_images(id, url, alt_text, sort_order, is_main),
  product_variants(id, label, price, sku, sort_order, is_active)
`

function toArray<T>(value: Relation<T>): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (value === null || value === undefined || value === "") return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function relationName(value: Relation<{ name: string | null }> | undefined): string | null {
  return toArray(value ?? null)[0]?.name ?? null
}

function isMissingColumnError(message: string): boolean {
  return message.toLowerCase().includes("does not exist")
}

function sortImages(images: RawAdminProductRow["product_images"]): RawAdminImageRow[] {
  return toArray(images ?? null).sort((a, b) => {
    const aMain = Boolean(a?.is_main)
    const bMain = Boolean(b?.is_main)
    if (aMain && !bMain) return -1
    if (!aMain && bMain) return 1
    return toNumber(a?.sort_order, 999) - toNumber(b?.sort_order, 999)
  })
}

function sortDocuments(documents: RawAdminProductRow["product_documents"]): RawAdminDocumentRow[] {
  return toArray(documents ?? null).sort((a, b) => {
    const orderDiff = toNumber(a?.sort_order, 999) - toNumber(b?.sort_order, 999)
    if (orderDiff !== 0) return orderDiff
    return String(a?.created_at ?? "").localeCompare(String(b?.created_at ?? ""))
  })
}

function mapAdminProduct(row: RawAdminProductRow): AdminProduct {
  const inventory = toArray(row.inventory)[0]
  const images: AdminProductImage[] = sortImages(row.product_images).map((image, index) => ({
    id: String(image.id),
    imageUrl: image.image_url || image.url || "",
    altText: image.alt_text ?? null,
    sortOrder: toNumber(image.sort_order, index + 1),
    isMain: Boolean(image.is_main ?? index === 0),
  }))

  const documents: AdminProductDocument[] = sortDocuments(row.product_documents).map((document, index) => ({
    id: String(document.id),
    title: document.title || document.file_name || "فایل PDF محصول",
    fileName: document.file_name || document.title || `document-${index + 1}.pdf`,
    fileUrl: document.file_url || "",
    storagePath: document.storage_path ?? storagePathFromPublicUrl(document.file_url || ""),
    fileSize: toNumber(document.file_size, 0),
    mimeType: document.mime_type || "application/pdf",
    sortOrder: toNumber(document.sort_order, index + 1),
    createdAt: document.created_at ?? null,
  })).filter((document) => Boolean(document.fileUrl))

  const specs: AdminProductSpec[] = toArray(row.product_specs)
    .sort((a, b) => toNumber(a?.sort_order, 999) - toNumber(b?.sort_order, 999))
    .map((spec, index) => ({
      id: spec?.id ? String(spec.id) : undefined,
      specName: spec?.spec_name ?? spec?.name ?? spec?.label ?? "",
      specValue: spec?.spec_value ?? spec?.value ?? "",
      sortOrder: toNumber(spec?.sort_order, index + 1),
    }))

  const variants: AdminProductVariant[] = toArray(row.product_variants)
    .sort((a, b) => toNumber(a?.sort_order, 999) - toNumber(b?.sort_order, 999))
    .map((variant, index) => ({
      id: variant?.id ? String(variant.id) : undefined,
      label: variant?.label ?? "",
      price: toNumber(variant?.price),
      sku: variant?.sku ?? null,
      sortOrder: toNumber(variant?.sort_order, index + 1),
      isActive: Boolean(variant?.is_active ?? true),
    }))

  return {
    id: String(row.id),
    name: row.name ?? "محصول بدون نام",
    slug: row.slug ?? "",
    model: row.model ?? null,
    sku: row.sku ?? null,
    shortDescription: row.short_description ?? null,
    description: row.description ?? null,
    price: toNumber(row.price),
    oldPrice: toNumber(row.old_price, 0) || null,
    discountPercent: toNumber(row.discount_percent, 0),
    warranty: row.warranty ?? null,
    originCountry: row.origin_country ?? null,
    brandId: row.brand_id ?? null,
    brandName: relationName(row.brands),
    categoryId: row.category_id ?? null,
    categoryName: relationName(row.categories),
    quantity: toNumber(inventory?.quantity ?? inventory?.stock_quantity, 0),
    lowStockThreshold: toNumber(inventory?.low_stock_threshold, 0) || null,
    isActive: Boolean(row.is_active ?? true),
    isFeatured: Boolean(row.is_featured),
    hasWarranty: Boolean(row.has_warranty ?? true),
    images,
    documents,
    specs,
    optionGroupTitle: row.option_group_title ?? null,
    variants,
  }
}

function productPayload(input: AdminProductFormInput, includeOptionalColumns = true) {
  const payload: Record<string, unknown> = {
    name: input.name,
    slug: input.slug,
    model: input.model,
    sku: input.sku,
    price: input.price,
    old_price: input.oldPrice,
    discount_percent: input.discountPercent,
    brand_id: input.brandId,
    category_id: input.categoryId,
    is_active: input.isActive,
    is_featured: input.isFeatured || input.showInHomepage,
    has_warranty: input.hasWarranty,
    rating: 0,
    review_count: 0,
    option_group_title: input.variants.length ? input.optionGroupTitle : null,
  }

  if (includeOptionalColumns) {
    payload.short_description = input.shortDescription
    payload.description = input.description
    payload.warranty = input.warranty
    payload.origin_country = input.originCountry
  }

  return payload
}

function mapAdminProductListItem(row: RawAdminProductRow): Product {
  const product = mapAdminProduct(row)
  const mainImage = product.images.find((image) => image.isMain) ?? product.images[0]

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    model: product.model,
    sku: product.sku,
    shortDescription: product.shortDescription,
    description: product.description,
    price: product.price,
    oldPrice: product.oldPrice,
    discountPercent: product.discountPercent,
    brandName: product.brandName,
    categoryName: product.categoryName,
    stockQuantity: product.quantity,
    mainImageUrl: mainImage?.imageUrl || null,
    mainImageAlt: mainImage?.altText ?? null,
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    rating: 0,
    reviewCount: 0,
    hasWarranty: product.hasWarranty,
    specs: product.specs
      .map((spec) => [spec.specName, spec.specValue].filter(Boolean).join(": "))
      .filter(Boolean),
  }
}

export async function fetchAdminProducts(): Promise<Product[]> {
  const supabase = await getServerDbClient()
  return withServerTiming("admin product list query", async () => {
    const primaryResult = await withExternalRequestTimeout(
      "admin product list query",
      supabase.from("products").select(ADMIN_PRODUCT_LIST_SELECT).order("id", { ascending: false }),
    )

    if (!primaryResult.error) {
      return ((primaryResult.data ?? []) as RawAdminProductRow[]).map(mapAdminProductListItem)
    }

    if (!isMissingColumnError(primaryResult.error.message)) {
      throw new Error(`خطا در دریافت فهرست محصولات: ${primaryResult.error.message}`)
    }

    const fallbackResult = await withExternalRequestTimeout(
      "admin product list fallback query",
      supabase.from("products").select(ADMIN_PRODUCT_LIST_SELECT_FALLBACK).order("id", { ascending: false }),
    )

    if (fallbackResult.error) {
      throw new Error(`خطا در دریافت فهرست محصولات: ${fallbackResult.error.message}`)
    }

    return ((fallbackResult.data ?? []) as RawAdminProductRow[]).map(mapAdminProductListItem)
  })
}

export async function fetchAdminProductById(id: string): Promise<AdminProduct | null> {
  const supabase = await getServerDbClient()
  const result = await supabase.from("products").select(ADMIN_PRODUCT_SELECT).eq("id", id).maybeSingle()

  if (!result.error) {
    return result.data ? mapAdminProduct(result.data as RawAdminProductRow) : null
  }

  if (!isMissingColumnError(result.error.message)) {
    throw new Error(`Failed to fetch admin product: ${result.error.message}`)
  }

  const fallback = await supabase.from("products").select(ADMIN_PRODUCT_SELECT_FALLBACK).eq("id", id).maybeSingle()
  if (fallback.error) throw new Error(`Failed to fetch admin product: ${fallback.error.message}`)
  return fallback.data ? mapAdminProduct(fallback.data as RawAdminProductRow) : null
}

export async function ensureSlugIsUnique(slug: string, excludeProductId?: string): Promise<boolean> {
  const supabase = await getServerDbClient()
  let query = supabase.from("products").select("id").eq("slug", slug).limit(1)
  if (excludeProductId) query = query.neq("id", excludeProductId)
  const { data, error } = await query
  if (error) throw new Error(`Failed to validate slug: ${error.message}`)
  return (data ?? []).length === 0
}

export async function ensureSkuIsUnique(sku: string, excludeProductId?: string): Promise<boolean> {
  const supabase = await getServerDbClient()
  let query = supabase.from("products").select("id").eq("sku", sku).limit(1)
  if (excludeProductId) query = query.neq("id", excludeProductId)
  const { data, error } = await query
  if (error) throw new Error(`Failed to validate SKU: ${error.message}`)
  return (data ?? []).length === 0
}

export async function insertProduct(input: AdminProductFormInput): Promise<string> {
  const supabase = await getServerDbClient()
  const primary = await supabase.from("products").insert(productPayload(input, true)).select("id").abortSignal(createRequestTimeoutSignal("adminMutation")).single()

  if (!primary.error) return String(primary.data.id)
  if (!isMissingColumnError(primary.error.message)) {
    throw new Error(`Failed to create product: ${primary.error.message}`)
  }

  const fallback = await supabase.from("products").insert(productPayload(input, false)).select("id").abortSignal(createRequestTimeoutSignal("adminMutation")).single()
  if (fallback.error) throw new Error(`Failed to create product: ${fallback.error.message}`)
  return String(fallback.data.id)
}

export async function updateProductRecord(id: string, input: AdminProductFormInput): Promise<void> {
  const supabase = await getServerDbClient()
  const primary = await supabase.from("products").update(productPayload(input, true)).eq("id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))

  if (!primary.error) return
  if (!isMissingColumnError(primary.error.message)) {
    throw new Error(`Failed to update product: ${primary.error.message}`)
  }

  const fallback = await supabase.from("products").update(productPayload(input, false)).eq("id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (fallback.error) throw new Error(`Failed to update product: ${fallback.error.message}`)
}

export async function upsertInventory(productId: string, quantity: number, lowStockThreshold: number | null): Promise<void> {
  const supabase = await getServerDbClient()
  const { data: existing, error: findError } = await supabase
    .from("inventory")
    .select("id")
    .eq("product_id", productId)
    .maybeSingle()

  if (findError) throw new Error(`Failed to read inventory: ${findError.message}`)

  const payloadWithThreshold = {
    product_id: productId,
    quantity,
    stock_quantity: quantity,
    low_stock_threshold: lowStockThreshold ?? 3,
  }
  const payload = {
    product_id: productId,
    quantity,
    stock_quantity: quantity,
  }

  const result = existing?.id
    ? await supabase.from("inventory").update(payloadWithThreshold).eq("id", existing.id)
    : await supabase.from("inventory").insert(payloadWithThreshold)

  if (!result.error) return

  if (!isMissingColumnError(result.error.message)) {
    throw new Error(`Failed to save inventory: ${result.error.message}`)
  }

  const fallback = existing?.id
    ? await supabase.from("inventory").update(payload).eq("id", existing.id)
    : await supabase.from("inventory").insert(payload)

  if (fallback.error) throw new Error(`Failed to save inventory: ${fallback.error.message}`)
}

export async function replaceProductSpecs(productId: string, specs: AdminProductSpec[]): Promise<void> {
  const supabase = await getServerDbClient()
  const deleteResult = await supabase.from("product_specs").delete().eq("product_id", productId).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (deleteResult.error) throw new Error(`Failed to clear specs: ${deleteResult.error.message}`)

  const rows = specs
    .filter((spec) => spec.specName.trim() || spec.specValue.trim())
    .map((spec, index) => ({
      product_id: productId,
      spec_name: spec.specName.trim(),
      spec_value: spec.specValue.trim(),
      name: spec.specName.trim(),
      label: spec.specName.trim(),
      value: spec.specValue.trim(),
      sort_order: spec.sortOrder || index + 1,
    }))

  if (!rows.length) return

  const result = await supabase.from("product_specs").insert(rows).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (result.error) throw new Error(`Failed to save specs: ${result.error.message}`)
}

export async function replaceProductVariants(productId: string, variants: AdminProductVariant[]): Promise<void> {
  const supabase = await getServerDbClient()
  const existingResult = await supabase.from("product_variants").select("id").eq("product_id", productId)
  if (existingResult.error) throw new Error(`Failed to read product variants: ${existingResult.error.message}`)

  const submittedIds = new Set(variants.flatMap((variant) => variant.id ? [variant.id] : []))
  const existingRows = (existingResult.data ?? []) as { id: string | number }[]
  const removedIds = existingRows.map((row) => String(row.id)).filter((id) => !submittedIds.has(id))
  if (removedIds.length) {
    const deleteResult = await supabase.from("product_variants").delete().in("id", removedIds).abortSignal(createRequestTimeoutSignal("adminMutation"))
    if (deleteResult.error) throw new Error(`Failed to remove product variants: ${deleteResult.error.message}`)
  }

  for (const [index, variant] of variants.entries()) {
    const payload = {
      product_id: productId,
      label: variant.label.trim(),
      price: variant.price,
      sku: variant.sku?.trim() || null,
      sort_order: Number.isFinite(variant.sortOrder) ? variant.sortOrder : index + 1,
      is_active: variant.isActive,
    }
    const result = variant.id
      ? await supabase.from("product_variants").update(payload).eq("id", variant.id).eq("product_id", productId).abortSignal(createRequestTimeoutSignal("adminMutation"))
      : await supabase.from("product_variants").insert(payload).abortSignal(createRequestTimeoutSignal("adminMutation"))
    if (result.error) throw new Error(`Failed to save product variants: ${result.error.message}`)
  }
}

export type ProductImageUploadInput = {
  file: File
  altText: string
  isMain: boolean
  sortOrder: number
}

export type UploadedProductImage = {
  publicUrl: string
  storagePath: string
  altText: string
  isMain: boolean
  sortOrder: number
}

function storagePathFromPublicUrl(url: string): string | null {
  return mediaStoragePathFromPublicUrl(url)
}

/**
 * Upload one product image with a unique, slug-safe file name.
 * Database writes remain outside UI components and are centralized in this repository.
 */
export async function uploadProductImageFile(file: File, productSlug: string, index: number): Promise<{ publicUrl: string; storagePath: string }> {
  const safeSlug = toSafePathSegment(productSlug, "product")
  const uploaded = await uploadMedia(file, {
    folder: `products/${safeSlug}`,
    preferredBaseName: `image-${index + 1}`,
  })
  return { publicUrl: uploaded.publicUrl, storagePath: uploaded.storagePath }
}

/** Backwards-compatible wrapper kept for older service callers. */
export async function uploadProductImage(file: File, productSlug: string, fileName: string): Promise<string> {
  const numericIndex = Number(fileName.match(/(\d+)/)?.[1] ?? 0)
  return (await uploadProductImageFile(file, productSlug, numericIndex)).publicUrl
}

export async function insertProductImages(productId: string, images: Omit<AdminProductImage, "id">[]): Promise<AdminProductImage[]> {
  if (!images.length) return []
  const supabase = await getServerDbClient()

  const normalized = normalizeMainImage(images)
  const rows = normalized.map((image, index) => ({
    product_id: productId,
    url: image.imageUrl,
    image_url: image.imageUrl,
    alt_text: image.altText,
    sort_order: Number.isFinite(image.sortOrder) ? image.sortOrder : index,
    is_main: image.isMain,
  }))

  const result = await supabase
    .from("product_images")
    .insert(rows)
    .select("id, url, image_url, alt_text, sort_order, is_main")
    .abortSignal(createRequestTimeoutSignal("adminMutation"))

  if (result.error) {
    throw new Error(`Failed to save product images: ${result.error.message}`)
  }

  const insertedRows = (result.data ?? []).map((row: {
    id: string | number
    url?: string | null
    image_url?: string | null
    alt_text?: string | null
    sort_order?: number | string | null
    is_main?: boolean | null
  }, index: number) => ({
    id: String(row.id),
    imageUrl: row.image_url || row.url || rows[index]?.image_url || "",
    altText: row.alt_text ?? rows[index]?.alt_text ?? null,
    sortOrder: toNumber(row.sort_order, rows[index]?.sort_order ?? index),
    isMain: Boolean(row.is_main),
  }))

  if (process.env.NODE_ENV === "development") {
    console.log("Inserted product image rows:", insertedRows)
  }

  return insertedRows
}

/**
 * Upload and persist multiple images one-by-one.
 * If a later upload fails, earlier successful rows stay saved and the error clearly
 * reports a partial save so an admin can retry without silently losing work.
 */
export async function uploadMultipleProductImages(productId: string, productSlug: string, images: ProductImageUploadInput[]): Promise<UploadedProductImage[]> {
  const validImages = images.filter((image) => image.file && image.file.size > 0)
  if (!validImages.length) return []

  const normalizedInputs = normalizeMainImage(validImages)
  const uploadedImages: UploadedProductImage[] = []

  for (let index = 0; index < normalizedInputs.length; index += 1) {
    const image = normalizedInputs[index]

    try {
      const uploaded = await uploadProductImageFile(image.file, productSlug, index)
      uploadedImages.push({
        ...uploaded,
        altText: image.altText,
        isMain: image.isMain,
        sortOrder: Number.isFinite(image.sortOrder) ? image.sortOrder : index,
      })
    } catch (error) {
      if (uploadedImages.length) {
        await insertProductImages(
          productId,
          uploadedImages.map((image) => ({
            imageUrl: image.publicUrl,
            altText: image.altText,
            isMain: image.isMain,
            sortOrder: image.sortOrder,
          }))
        )
      }

      const suffix = uploadedImages.length
        ? ` ${uploadedImages.length} تصویر قبلی با موفقیت ذخیره شد؛ لطفاً تصاویر باقی‌مانده را دوباره آپلود کنید.`
        : ""
      const message = error instanceof Error ? error.message : "خطا در آپلود تصاویر محصول"
      throw new Error(`${message}${suffix}`)
    }
  }

  await insertProductImages(
    productId,
    uploadedImages.map((image) => ({
      imageUrl: image.publicUrl,
      altText: image.altText,
      isMain: image.isMain,
      sortOrder: image.sortOrder,
    }))
  )

  if (process.env.NODE_ENV === "development") {
    console.log("Uploaded product images:", uploadedImages)
  }

  return uploadedImages
}

export type ProductDocumentUploadInput = {
  file: File
  title: string
  sortOrder: number
}

export type UploadedProductDocument = {
  publicUrl: string
  storagePath: string
  title: string
  fileName: string
  fileSize: number
  mimeType: string
  sortOrder: number
}

function getDocumentTitle(file: File, title: string): string {
  const trimmedTitle = title.trim()
  if (trimmedTitle) return trimmedTitle
  return file.name.replace(/\.pdf$/i, "").trim() || "فایل PDF محصول"
}

export async function uploadProductDocumentFile(file: File, productId: string, preferredTitle: string, index: number): Promise<{ publicUrl: string; storagePath: string }> {
  const safeProductId = toSafePathSegment(productId, "product")
  const safeTitle = preferredTitle || file.name || `document-${index + 1}`
  const uploaded = await uploadProductDocumentMedia(file, {
    folder: `products/${safeProductId}/documents`,
    preferredBaseName: safeTitle,
  })
  return { publicUrl: uploaded.publicUrl, storagePath: uploaded.storagePath }
}

export async function insertProductDocuments(productId: string, documents: Omit<AdminProductDocument, "id" | "createdAt">[]): Promise<AdminProductDocument[]> {
  if (!documents.length) return []
  const supabase = await getServerDbClient()

  const rows = documents.map((document, index) => ({
    product_id: productId,
    title: document.title,
    file_name: document.fileName,
    file_url: document.fileUrl,
    storage_path: document.storagePath,
    file_size: document.fileSize,
    mime_type: document.mimeType,
    sort_order: Number.isFinite(document.sortOrder) ? document.sortOrder : index + 1,
  }))

  const result = await supabase
    .from("product_documents")
    .insert(rows)
    .select("id, title, file_name, file_url, storage_path, file_size, mime_type, sort_order, created_at")
    .abortSignal(createRequestTimeoutSignal("adminMutation"))

  if (result.error) {
    throw new Error(`Failed to save product documents: ${result.error.message}`)
  }

  return (result.data ?? []).map((row: {
    id: string | number
    title?: string | null
    file_name?: string | null
    file_url?: string | null
    storage_path?: string | null
    file_size?: number | string | null
    mime_type?: string | null
    sort_order?: number | string | null
    created_at?: string | null
  }, index: number) => ({
    id: String(row.id),
    title: row.title || rows[index]?.title || "فایل PDF محصول",
    fileName: row.file_name || rows[index]?.file_name || `document-${index + 1}.pdf`,
    fileUrl: row.file_url || rows[index]?.file_url || "",
    storagePath: row.storage_path ?? rows[index]?.storage_path ?? null,
    fileSize: toNumber(row.file_size, rows[index]?.file_size ?? 0),
    mimeType: row.mime_type || rows[index]?.mime_type || "application/pdf",
    sortOrder: toNumber(row.sort_order, rows[index]?.sort_order ?? index + 1),
    createdAt: row.created_at ?? null,
  }))
}

export async function uploadMultipleProductDocuments(productId: string, documents: ProductDocumentUploadInput[]): Promise<UploadedProductDocument[]> {
  const validDocuments = documents.filter((document) => document.file && document.file.size > 0)
  if (!validDocuments.length) return []

  const uploadedDocuments: UploadedProductDocument[] = []

  for (let index = 0; index < validDocuments.length; index += 1) {
    const document = validDocuments[index]
    const title = getDocumentTitle(document.file, document.title)

    try {
      const uploaded = await uploadProductDocumentFile(document.file, productId, title, index)
      uploadedDocuments.push({
        ...uploaded,
        title,
        fileName: document.file.name || `${title}.pdf`,
        fileSize: document.file.size,
        mimeType: document.file.type || "application/pdf",
        sortOrder: Number.isFinite(document.sortOrder) ? document.sortOrder : index + 1,
      })
    } catch (error) {
      if (uploadedDocuments.length) {
        await insertProductDocuments(
          productId,
          uploadedDocuments.map((document) => ({
            title: document.title,
            fileName: document.fileName,
            fileUrl: document.publicUrl,
            storagePath: document.storagePath,
            fileSize: document.fileSize,
            mimeType: document.mimeType,
            sortOrder: document.sortOrder,
          }))
        )
      }

      const suffix = uploadedDocuments.length
        ? ` ${uploadedDocuments.length} فایل قبلی با موفقیت ذخیره شد؛ لطفاً فایل‌های باقی‌مانده را دوباره آپلود کنید.`
        : ""
      const message = error instanceof Error ? error.message : "خطا در آپلود فایل‌های PDF محصول"
      throw new Error(`${message}${suffix}`)
    }
  }

  await insertProductDocuments(
    productId,
    uploadedDocuments.map((document) => ({
      title: document.title,
      fileName: document.fileName,
      fileUrl: document.publicUrl,
      storagePath: document.storagePath,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      sortOrder: document.sortOrder,
    }))
  )

  return uploadedDocuments
}

export async function deleteProductDocuments(documentIds: string[]): Promise<void> {
  if (!documentIds.length) return
  const supabase = await getServerDbClient()
  const existing = await supabase.from("product_documents").select("id, file_url").in("id", documentIds)
  if (existing.error) throw new Error(`Failed to read product documents before deletion: ${existing.error.message}`)

  for (const document of existing.data ?? []) {
    const publicUrl = String((document as { file_url?: string | null }).file_url || "")
    if (isManagedMediaUrl(publicUrl)) {
      await deleteMediaByPublicUrl(publicUrl)
    }
  }

  const removeRows = await supabase.from("product_documents").delete().in("id", documentIds).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (removeRows.error) throw new Error(`Failed to remove product documents: ${removeRows.error.message}`)
}

export async function updateExistingDocuments(options: {
  productId: string
  existingDocuments: AdminProductDocument[]
  removedDocumentIds: string[]
}): Promise<void> {
  if (options.removedDocumentIds.length) await deleteProductDocuments(options.removedDocumentIds)

  const remaining = options.existingDocuments.filter((document) => !options.removedDocumentIds.includes(document.id))
  const supabase = await getServerDbClient()

  for (const [index, document] of remaining.entries()) {
    const title = document.title.trim() || document.fileName || "فایل PDF محصول"
    const update = await supabase
      .from("product_documents")
      .update({ title, sort_order: Number.isFinite(document.sortOrder) ? document.sortOrder : index + 1 })
      .eq("id", document.id)
      .eq("product_id", options.productId)
      .abortSignal(createRequestTimeoutSignal("adminMutation"))

    if (update.error) throw new Error(`Failed to update product document: ${update.error.message}`)
  }
}

export function normalizeMainImage<T extends { isMain: boolean; sortOrder: number; markedForDeletion?: boolean }>(images: T[]): T[] {
  const activeImages = images
    .filter((image) => !image.markedForDeletion)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (!activeImages.length) return []

  const firstSelectedIndex = activeImages.findIndex((image) => image.isMain)
  const mainIndex = firstSelectedIndex >= 0 ? firstSelectedIndex : 0

  return activeImages.map((image, index) => ({
    ...image,
    isMain: index === mainIndex,
  }))
}

export async function updateProductImageMetadata(productId: string, images: AdminProductImage[]): Promise<void> {
  const supabase = await getServerDbClient()
  for (const image of normalizeMainImage(images)) {
    const update = await supabase
      .from("product_images")
      .update({ alt_text: image.altText, sort_order: image.sortOrder, is_main: image.isMain })
      .eq("id", image.id)
      .eq("product_id", productId)

    if (update.error) throw new Error(`Failed to update image: ${update.error.message}`)
  }
}

export async function deleteProductImages(imageIds: string[]): Promise<void> {
  if (!imageIds.length) return
  const supabase = await getServerDbClient()
  const existing = await supabase.from("product_images").select("id, image_url, url").in("id", imageIds)
  if (existing.error) throw new Error(`Failed to read images before deletion: ${existing.error.message}`)

  for (const image of existing.data ?? []) {
    const publicUrl = String((image as { image_url?: string | null; url?: string | null }).image_url || (image as { url?: string | null }).url || "")
    if (isManagedMediaUrl(publicUrl)) {
      await deleteMediaByPublicUrl(publicUrl)
    }
  }

  const removeRows = await supabase.from("product_images").delete().in("id", imageIds).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (removeRows.error) throw new Error(`Failed to remove images: ${removeRows.error.message}`)
}

export async function updateExistingImages(options: {
  productId: string
  existingImages: AdminProductImage[]
  removedImageIds: string[]
  mainExistingImageId: string | null
}): Promise<void> {
  if (options.removedImageIds.length) await deleteProductImages(options.removedImageIds)

  const remaining = options.existingImages
    .filter((image) => !options.removedImageIds.includes(image.id))
    .map((image) => ({
      ...image,
      isMain: options.mainExistingImageId ? image.id === options.mainExistingImageId : image.isMain,
    }))

  // When a newly uploaded image is selected as main, all existing images arrive with isMain=false.
  // Preserve that intentionally; normalize only when at least one existing image is marked main.
  if (remaining.some((image) => image.isMain)) {
    await updateProductImageMetadata(options.productId, remaining)
    return
  }

  const supabase = await getServerDbClient()
  for (const image of remaining) {
    const update = await supabase
      .from("product_images")
      .update({ alt_text: image.altText, sort_order: image.sortOrder, is_main: false })
      .eq("id", image.id)
      .eq("product_id", options.productId)
    if (update.error) throw new Error(`Failed to update image: ${update.error.message}`)
  }
}

export async function toggleProductActiveRecord(id: string): Promise<void> {
  const supabase = await getServerDbClient()
  const current = await supabase.from("products").select("is_active").eq("id", id).maybeSingle()
  if (current.error) throw new Error(`Failed to read product status: ${current.error.message}`)

  const update = await supabase.from("products").update({ is_active: !Boolean(current.data?.is_active) }).eq("id", id)
  if (update.error) throw new Error(`Failed to toggle product status: ${update.error.message}`)
}

function logDeleteProductFailure(productId: string, stage: string, error: unknown): void {
  const databaseError = error as { code?: string; message?: string }
  console.error("Product deletion failed", {
    productId,
    stage,
    code: databaseError?.code ?? "UNKNOWN",
    message: databaseError?.message ?? "Unknown product deletion error",
  })
}

export async function deleteProductRecord(id: string): Promise<void> {
  const supabase = await getServerDbClient()

  const productResult = await supabase.from("products").select("id").eq("id", id).abortSignal(createRequestTimeoutSignal("adminMutation")).maybeSingle()
  if (productResult.error) {
    logDeleteProductFailure(id, "read-product", productResult.error)
    throw new Error("خواندن اطلاعات محصول پیش از حذف ناموفق بود.")
  }
  if (!productResult.data) throw new Error("محصول موردنظر پیدا نشد.")

  const imageRows = await supabase
    .from("product_images")
    .select("id, image_url, url")
    .eq("product_id", id)
    .abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (imageRows.error) {
    logDeleteProductFailure(id, "read-images", imageRows.error)
    throw new Error("خواندن تصاویر محصول پیش از حذف ناموفق بود.")
  }

  try {
    for (const image of imageRows.data ?? []) {
      const publicUrl = String(image.image_url || image.url || "")
      await deleteMediaByPublicUrl(publicUrl)
    }
  } catch (error) {
    logDeleteProductFailure(id, "delete-managed-images", error)
    throw new Error("حذف فایل‌های تصویر محصول ناموفق بود؛ رکوردهای دیتابیس برای بررسی مدیر حفظ شدند.")
  }

  const documentRows = await supabase
    .from("product_documents")
    .select("id, file_url")
    .eq("product_id", id)
    .abortSignal(createRequestTimeoutSignal("adminMutation"))

  if (documentRows.error && !isMissingColumnError(documentRows.error.message)) {
    logDeleteProductFailure(id, "read-documents", documentRows.error)
    throw new Error("خواندن مستندات محصول پیش از حذف ناموفق بود.")
  }

  try {
    for (const document of documentRows.error ? [] : (documentRows.data ?? [])) {
      const publicUrl = String((document as { file_url?: string | null }).file_url || "")
      await deleteMediaByPublicUrl(publicUrl)
    }
  } catch (error) {
    logDeleteProductFailure(id, "delete-managed-documents", error)
    throw new Error("حذف فایل‌های PDF محصول ناموفق بود؛ رکوردهای دیتابیس برای بررسی مدیر حفظ شدند.")
  }

  if (!documentRows.error) {
    const deleteDocuments = await supabase.from("product_documents").delete().eq("product_id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
    if (deleteDocuments.error) {
      logDeleteProductFailure(id, "delete-document-rows", deleteDocuments.error)
      throw new Error("فایل‌های PDF حذف شدند، اما حذف رکورد مستندات از دیتابیس ناموفق بود.")
    }
  }

  const deleteImages = await supabase.from("product_images").delete().eq("product_id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (deleteImages.error) {
    logDeleteProductFailure(id, "delete-image-rows", deleteImages.error)
    throw new Error("فایل‌های تصویر حذف شدند، اما حذف رکورد تصاویر از دیتابیس ناموفق بود.")
  }

  const deleteSpecs = await supabase.from("product_specs").delete().eq("product_id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (deleteSpecs.error) {
    logDeleteProductFailure(id, "delete-specs", deleteSpecs.error)
    throw new Error("تصاویر حذف شدند، اما حذف مشخصات فنی محصول ناموفق بود.")
  }

  const deleteInventory = await supabase.from("inventory").delete().eq("product_id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (deleteInventory.error) {
    logDeleteProductFailure(id, "delete-inventory", deleteInventory.error)
    throw new Error("تصاویر حذف شدند، اما حذف اطلاعات موجودی محصول ناموفق بود.")
  }

  const deleteProduct = await supabase.from("products").delete().eq("id", id).select("id").abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (deleteProduct.error) {
    logDeleteProductFailure(id, "delete-product", deleteProduct.error)
    throw new Error("حذف رکورد محصول ناموفق بود. وابستگی‌های دیتابیس را بررسی کنید.")
  }
  if (!(deleteProduct.data ?? []).length) {
    throw new Error("محصول موردنظر پیدا نشد یا حذف نشد.")
  }
}
