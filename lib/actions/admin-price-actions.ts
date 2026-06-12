"use server"

import { revalidatePath } from "next/cache"
import { requireAdminAccess } from "@/lib/auth/admin-auth"
import { confirmBulkPriceUpdate, generateBulkPricePreview } from "@/lib/services/admin-price-service"
import type { BulkPriceApplyResult, BulkPricePreviewResult, BulkPriceRequest } from "@/types/admin-price"

export async function previewBulkPriceAction(request: BulkPriceRequest): Promise<BulkPricePreviewResult> {
  await requireAdminAccess()
  try {
    return await generateBulkPricePreview(request)
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "خطا در ایجاد پیش‌نمایش تغییر قیمت",
      items: [],
      affectedCount: 0,
    }
  }
}

export async function applyBulkPriceAction(request: BulkPriceRequest, targetLabel: string | null): Promise<BulkPriceApplyResult> {
  const admin = await requireAdminAccess()
  try {
    const result = await confirmBulkPriceUpdate({ adminUserId: admin.id, request, targetLabel })
    if (result.ok) {
      revalidatePath("/")
      revalidatePath("/products")
      revalidatePath("/admin/products")
      revalidatePath("/admin/products/bulk-price-update")
    }
    return result
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "خطا در به‌روزرسانی قیمت محصولات",
      affectedCount: 0,
    }
  }
}
