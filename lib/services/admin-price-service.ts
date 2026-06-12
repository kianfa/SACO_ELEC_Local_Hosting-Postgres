import {
  applyBulkPriceUpdate,
  calculateBulkPricePreview,
  fetchBulkPriceProducts,
} from "@/lib/repositories/admin-price-repository"
import type { BulkPriceApplyResult, BulkPricePreviewResult, BulkPriceRequest } from "@/types/admin-price"

// Service boundary for admin price workflows. UI/actions should not know about Supabase.
// Future migration can replace the repository while preserving these functions.

export function validateBulkPriceRequest(request: BulkPriceRequest): Record<string, string> {
  const errors: Record<string, string> = {}

  if (!request.targetType) errors.targetType = "روش انتخاب محصولات الزامی است."
  if (request.targetType === "brand" && !request.brandId) errors.brandId = "برند را انتخاب کنید."
  if (request.targetType === "category" && !request.categoryId) errors.categoryId = "دسته‌بندی را انتخاب کنید."
  if (request.targetType === "manual" && request.selectedProductIds.length === 0) errors.selectedProductIds = "حداقل یک محصول را انتخاب کنید."

  if (!Number.isFinite(request.percent) || request.percent < 0) errors.percent = "درصد تغییر باید صفر یا بیشتر باشد."
  if (request.changeType === "decrease" && request.percent >= 100) errors.percent = "کاهش قیمت ۱۰۰٪ یا بیشتر مجاز نیست."

  return errors
}

export async function generateBulkPricePreview(request: BulkPriceRequest): Promise<BulkPricePreviewResult> {
  const errors = validateBulkPriceRequest(request)
  if (Object.keys(errors).length) {
    return { ok: false, message: Object.values(errors)[0] ?? "لطفاً فرم را بررسی کنید.", items: [], affectedCount: 0 }
  }

  const products = await fetchBulkPriceProducts(request)
  const items = calculateBulkPricePreview(products, request)

  return {
    ok: true,
    message: items.length ? "پیش‌نمایش تغییرات آماده است." : "محصولی با این فیلترها پیدا نشد",
    items,
    affectedCount: items.length,
  }
}

export async function confirmBulkPriceUpdate(params: {
  adminUserId: string | null
  request: BulkPriceRequest
  targetLabel: string | null
}): Promise<BulkPriceApplyResult> {
  const preview = await generateBulkPricePreview(params.request)
  if (!preview.ok) return { ok: false, message: preview.message, affectedCount: 0 }
  if (!preview.items.length) return { ok: false, message: "محصولی با این فیلترها پیدا نشد", affectedCount: 0 }

  await applyBulkPriceUpdate({
    adminUserId: params.adminUserId,
    request: params.request,
    previewItems: preview.items,
    targetLabel: params.targetLabel,
  })

  return { ok: true, message: "قیمت محصولات با موفقیت به‌روزرسانی شد", affectedCount: preview.items.length }
}
