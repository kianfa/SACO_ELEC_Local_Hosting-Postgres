"use server"

import { revalidatePath } from "next/cache"
import { requireAdminAccess } from "@/lib/auth/admin-auth"
import {
  addPurchaseRequestActivity,
  changePurchaseRequestStatus,
  createCheckoutPurchaseRequest,
  schedulePurchaseRequestFollowUp,
  updatePurchaseRequestNote,
} from "@/lib/services/purchase-requests-service"
import type { PurchaseRequestActionState, PurchaseRequestCartItemInput, PurchaseRequestCreateInput } from "@/types/purchase-request"

const emptyState: PurchaseRequestActionState = { ok: false, message: "" }

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim()
}

function nullableText(formData: FormData, key: string): string | null {
  return text(formData, key) || null
}

function parseCartItems(value: FormDataEntryValue | null): PurchaseRequestCartItemInput[] {
  if (typeof value !== "string" || !value.trim()) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => ({ productId: String(item?.productId ?? ""), variantId: item?.variantId ? String(item.variantId) : null, quantity: Number(item?.quantity ?? 0) }))
      .filter((item) => item.productId && Number.isInteger(item.quantity) && item.quantity > 0)
  } catch {
    return []
  }
}

export async function createPurchaseRequestAction(
  _prevState: PurchaseRequestActionState = emptyState,
  formData: FormData
): Promise<PurchaseRequestActionState> {
  const input: PurchaseRequestCreateInput = {
    customerName: text(formData, "customerName"),
    phone: text(formData, "phone"),
    description: nullableText(formData, "description"),
    preferredContactTime: text(formData, "preferredContactTime") || "در اولین فرصت",
    preferredContactTimeNote: nullableText(formData, "preferredContactTimeNote"),
  }
  return createCheckoutPurchaseRequest(input, parseCartItems(formData.get("cartItemsJson")))
}

export async function updatePurchaseRequestStatusAction(formData: FormData) {
  const admin = await requireAdminAccess()
  const id = text(formData, "id")
  await changePurchaseRequestStatus(id, text(formData, "status"), admin.id, nullableText(formData, "note"))
  revalidatePath("/admin/purchase-requests")
  revalidatePath(`/admin/purchase-requests/${id}`)
}

export async function updatePurchaseRequestNoteAction(formData: FormData) {
  const admin = await requireAdminAccess()
  const id = text(formData, "id")
  await updatePurchaseRequestNote(id, nullableText(formData, "adminNote"), admin.id)
  revalidatePath("/admin/purchase-requests")
  revalidatePath(`/admin/purchase-requests/${id}`)
}

export async function schedulePurchaseRequestFollowUpAction(formData: FormData) {
  const admin = await requireAdminAccess()
  const id = text(formData, "id")
  await schedulePurchaseRequestFollowUp(id, nullableText(formData, "nextFollowUpAt"), nullableText(formData, "note"), admin.id)
  revalidatePath("/admin/purchase-requests")
  revalidatePath(`/admin/purchase-requests/${id}`)
}

export async function addPurchaseRequestActivityAction(formData: FormData) {
  const admin = await requireAdminAccess()
  const id = text(formData, "id")
  await addPurchaseRequestActivity(id, text(formData, "action"), nullableText(formData, "note"), admin.id)
  revalidatePath("/admin/purchase-requests")
  revalidatePath(`/admin/purchase-requests/${id}`)
}
