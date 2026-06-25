import {
  deleteProductRecord,
  ensureSkuIsUnique,
  ensureSlugIsUnique,
  fetchAdminProductById,
  fetchAdminProducts,
  insertProduct,
  normalizeMainImage,
  replaceProductSpecs,
  replaceProductVariants,
  toggleProductActiveRecord,
  updateExistingDocuments,
  updateExistingImages,
  updateProductRecord,
  uploadMultipleProductDocuments,
  uploadMultipleProductImages,
  upsertInventory,
  type ProductDocumentUploadInput,
  type ProductImageUploadInput,
} from "@/lib/repositories/admin-products-repository"
import type { AdminProduct, AdminProductFormInput, AdminProductImage } from "@/types/admin-product"
import type { Product } from "@/types/product"

// Admin service boundary. UI/server actions call this file, not Supabase directly.
// To migrate later, replace the repository implementation and keep this API stable.
export async function getAdminProducts(): Promise<Product[]> {
  return fetchAdminProducts()
}

export async function getAdminProductById(id: string): Promise<AdminProduct | null> {
  return fetchAdminProductById(id)
}

export async function validateAdminProductInput(input: AdminProductFormInput, productId?: string) {
  const fieldErrors: Record<string, string> = {}

  if (!input.name.trim()) fieldErrors.name = "نام محصول الزامی است."
  if (!input.slug.trim()) fieldErrors.slug = "Slug الزامی است."
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug)) {
    fieldErrors.slug = "Slug فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد."
  }
  if (!Number.isFinite(input.price) || input.price <= 0) fieldErrors.price = "قیمت باید عددی و بزرگ‌تر از صفر باشد."
  if (!input.categoryId) fieldErrors.categoryId = "انتخاب دسته‌بندی الزامی است."
  if (!Number.isFinite(input.quantity) || input.quantity < 0) fieldErrors.quantity = "موجودی باید عددی و صفر یا بیشتر باشد."

  const activeLabels = new Set<string>()
  if (input.variants.length) {
    if (!input.optionGroupTitle?.trim()) fieldErrors.optionGroupTitle = "عنوان گروه گزینه‌ها الزامی است."
    input.variants.forEach((variant, index) => {
      const key = variant.label.trim().toLocaleLowerCase("fa")
      if (!key) fieldErrors[`variants.${index}.label`] = "عنوان گزینه الزامی است."
      if (!Number.isFinite(variant.price) || variant.price < 0) fieldErrors[`variants.${index}.price`] = "قیمت گزینه باید عددی و صفر یا بیشتر باشد."
      if (key && activeLabels.has(key)) fieldErrors[`variants.${index}.label`] = "عنوان گزینه‌ها در یک محصول باید یکتا باشد."
      if (key) activeLabels.add(key)
    })
  }

  if (!fieldErrors.slug) {
    const isSlugUnique = await ensureSlugIsUnique(input.slug, productId)
    if (!isSlugUnique) fieldErrors.slug = "این slug قبلاً برای محصول دیگری ثبت شده است."
  }

  if (input.sku?.trim()) {
    const isSkuUnique = await ensureSkuIsUnique(input.sku.trim(), productId)
    if (!isSkuUnique) fieldErrors.sku = "این SKU قبلاً ثبت شده است."
  }

  return fieldErrors
}

function defaultImageAlt(input: AdminProductFormInput): string {
  return `${input.name}${input.model ? ` ${input.model}` : ""}`.trim() || "تصویر محصول"
}

function buildNewImageUploads(input: AdminProductFormInput, imageFiles: File[], startingSortOrder = 0): ProductImageUploadInput[] {
  const fallbackAlt = defaultImageAlt(input)
  return imageFiles
    .filter((file) => file && file.size > 0)
    .map((file, index) => {
      const metadata = input.newImagesMetadata?.[index]
      return {
        file,
        altText: metadata?.altText?.trim() || input.newImageAltTexts?.[index]?.trim() || fallbackAlt,
        isMain: Boolean(metadata?.isMain),
        sortOrder: metadata?.sortOrder || startingSortOrder + index,
      }
    })
}

function buildNewDocumentUploads(input: AdminProductFormInput, documentFiles: File[], startingSortOrder = 0): ProductDocumentUploadInput[] {
  return documentFiles
    .filter((file) => file && file.size > 0)
    .map((file, index) => {
      const metadata = input.newDocumentsMetadata?.[index]
      return {
        file,
        title: metadata?.title?.trim() || file.name.replace(/\.pdf$/i, "").trim() || "فایل PDF محصول",
        sortOrder: metadata?.sortOrder || startingSortOrder + index,
      }
    })
}

export async function createAdminProduct(input: AdminProductFormInput, imageFiles: File[], documentFiles: File[] = []) {
  const fieldErrors = await validateAdminProductInput(input)
  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "لطفاً خطاهای فرم را بررسی کنید.", fieldErrors }
  }

  const productId = await insertProduct(input)
  await upsertInventory(productId, input.quantity, input.lowStockThreshold)
  await replaceProductVariants(productId, input.variants)

  const uploads = normalizeMainImage(buildNewImageUploads(input, imageFiles, 0))
  try {
    await uploadMultipleProductImages(productId, input.slug, uploads)
  } catch (error) {
    const details = error instanceof Error ? error.message : "خطا در آپلود تصاویر محصول"
    throw new Error(`محصول ذخیره شد، اما ثبت تصاویر با خطا مواجه شد. لطفاً تصاویر را دوباره بارگذاری کنید. ${details}`)
  }
  const documentUploads = buildNewDocumentUploads(input, documentFiles, 1)
  try {
    await uploadMultipleProductDocuments(productId, documentUploads)
  } catch (error) {
    const details = error instanceof Error ? error.message : "خطا در آپلود فایل‌های PDF محصول"
    throw new Error(`محصول ذخیره شد، اما ثبت دیتاشیت/مستندات با خطا مواجه شد. لطفاً فایل‌های PDF را دوباره بارگذاری کنید. ${details}`)
  }

  await replaceProductSpecs(productId, input.specs)

  const uploadMessages = [
    uploads.length ? `${uploads.length.toLocaleString("fa-IR")} تصویر` : "",
    documentUploads.length ? `${documentUploads.length.toLocaleString("fa-IR")} فایل PDF` : "",
  ].filter(Boolean)

  return {
    ok: true,
    message: uploadMessages.length
      ? `محصول و ${uploadMessages.join(" و ")} آن با موفقیت ثبت شدند`
      : "محصول با موفقیت ثبت شد",
    productId,
  }
}

export async function updateAdminProduct(id: string, input: AdminProductFormInput, imageFiles: File[], documentFiles: File[] = []) {
  const fieldErrors = await validateAdminProductInput(input, id)
  if (Object.keys(fieldErrors).length) {
    return { ok: false, message: "لطفاً خطاهای فرم را بررسی کنید.", fieldErrors }
  }

  await updateProductRecord(id, input)
  await upsertInventory(id, input.quantity, input.lowStockThreshold)
  await replaceProductVariants(id, input.variants)

  const removedIds = input.removedImageIds ?? []
  const existingImages = (input.existingImages ?? []).filter((image) => !removedIds.includes(image.id))
  const maxExistingSortOrder = existingImages.reduce((max, image) => Math.max(max, image.sortOrder || 0), 0)
  const newUploads = buildNewImageUploads(input, imageFiles, maxExistingSortOrder + 1)

  const normalizedCombined = normalizeMainImage([
    ...existingImages.map((image) => ({ ...image, kind: "existing" as const })),
    ...newUploads.map((image) => ({ ...image, kind: "new" as const })),
  ])

  const normalizedExisting = normalizedCombined
    .filter((image) => image.kind === "existing")
    .map(({ kind: _kind, ...image }) => image as AdminProductImage)

  const normalizedNewUploads = normalizedCombined
    .filter((image) => image.kind === "new")
    .map(({ kind: _kind, ...image }) => image as ProductImageUploadInput)

  await updateExistingImages({
    productId: id,
    existingImages: normalizedExisting,
    removedImageIds: removedIds,
    mainExistingImageId: normalizedExisting.find((image) => image.isMain)?.id ?? null,
  })

  try {
    await uploadMultipleProductImages(id, input.slug, normalizedNewUploads)
  } catch (error) {
    const details = error instanceof Error ? error.message : "خطا در آپلود تصاویر محصول"
    throw new Error(`محصول ذخیره شد، اما ثبت تصاویر جدید با خطا مواجه شد. لطفاً تصاویر را دوباره بارگذاری کنید. ${details}`)
  }
  const removedDocumentIds = input.removedDocumentIds ?? []
  const existingDocuments = (input.existingDocuments ?? []).filter((document) => !removedDocumentIds.includes(document.id))
  const maxDocumentSortOrder = existingDocuments.reduce((max, document) => Math.max(max, document.sortOrder || 0), 0)
  const newDocumentUploads = buildNewDocumentUploads(input, documentFiles, maxDocumentSortOrder + 1)

  await updateExistingDocuments({
    productId: id,
    existingDocuments,
    removedDocumentIds,
  })

  try {
    await uploadMultipleProductDocuments(id, newDocumentUploads)
  } catch (error) {
    const details = error instanceof Error ? error.message : "خطا در آپلود فایل‌های PDF محصول"
    throw new Error(`محصول ذخیره شد، اما ثبت دیتاشیت/مستندات جدید با خطا مواجه شد. لطفاً فایل‌های PDF را دوباره بارگذاری کنید. ${details}`)
  }

  await replaceProductSpecs(id, input.specs)

  const updateMessages = [
    normalizedNewUploads.length ? `${normalizedNewUploads.length.toLocaleString("fa-IR")} تصویر جدید` : "",
    newDocumentUploads.length ? `${newDocumentUploads.length.toLocaleString("fa-IR")} فایل PDF جدید` : "",
  ].filter(Boolean)

  return {
    ok: true,
    message: updateMessages.length
      ? `محصول و ${updateMessages.join(" و ")} آن با موفقیت به‌روزرسانی شدند`
      : "محصول با موفقیت به‌روزرسانی شد",
    productId: id,
  }
}

export async function deleteAdminProduct(id: string): Promise<void> {
  await deleteProductRecord(id)
}

export async function toggleAdminProductActive(id: string): Promise<void> {
  await toggleProductActiveRecord(id)
}
