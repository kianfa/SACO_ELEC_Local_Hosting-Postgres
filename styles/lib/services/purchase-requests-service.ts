import {
  fetchAdminPurchaseRequestById,
  fetchAdminPurchaseRequests,
  insertPublicPurchaseRequest,
  insertPurchaseRequestActivityRecord,
  schedulePurchaseRequestFollowUpRecord,
  updatePurchaseRequestNoteRecord,
  updatePurchaseRequestStatusRecord,
} from "@/lib/repositories/purchase-requests-repository"
import { purchaseRequestStatuses } from "@/types/purchase-request"
import type {
  PurchaseRequestCartItemInput,
  PurchaseRequestCreateInput,
  PurchaseRequestFilters,
  PurchaseRequestStatus,
} from "@/types/purchase-request"

const iranianMobilePattern = /^09\d{9}$/

function getSafeServerErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") {
    return { message: String(error ?? "Unknown request error") }
  }

  const value = error as Record<string, unknown>
  return {
    name: typeof value.name === "string" ? value.name : "Error",
    message: typeof value.message === "string" ? value.message : "Unknown request error",
    code: typeof value.code === "string" ? value.code : undefined,
    schema: typeof value.schema === "string" ? value.schema : undefined,
    table: typeof value.table === "string" ? value.table : undefined,
    constraint: typeof value.constraint === "string" ? value.constraint : undefined,
    routine: typeof value.routine === "string" ? value.routine : undefined,
  }
}

export function validatePurchaseRequestInput(input: PurchaseRequestCreateInput, cartItems: PurchaseRequestCartItemInput[]) {
  if (!input.customerName.trim()) return "نام و نام خانوادگی الزامی است."
  if (!iranianMobilePattern.test(input.phone.trim())) return "شماره موبایل معتبر نیست. شماره را به‌صورت 09xxxxxxxxx وارد کنید."
  if (!cartItems.length) return "سبد خرید شما خالی است."
  if (cartItems.some((item) => !item.productId || !Number.isInteger(item.quantity) || item.quantity < 1)) {
    return "اطلاعات سبد خرید معتبر نیست."
  }
  return null
}

export async function createCheckoutPurchaseRequest(input: PurchaseRequestCreateInput, cartItems: PurchaseRequestCartItemInput[]) {
  const validationError = validatePurchaseRequestInput(input, cartItems)
  if (validationError) return { ok: false as const, message: validationError }

  try {
    const result = await insertPublicPurchaseRequest(input, cartItems)
    return {
      ok: true as const,
      requestId: result.requestId,
      requestNumber: result.requestNumber,
      createdAt: result.createdAt,
      message: "درخواست شما با موفقیت ثبت شد.",
    }
  } catch (error) {
    const details = getSafeServerErrorDetails(error)
    console.error("[purchase-request] checkout submission failed", details)

    if (details.message.includes("duplicate_request")) {
      return { ok: false as const, message: "درخواست مشابه شما به‌تازگی ثبت شده است. کارشناسان فروش با شما تماس خواهند گرفت." }
    }
    return { ok: false as const, message: "ثبت درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید یا از طریق پیام‌رسان با ما در ارتباط باشید." }
  }
}

export async function getAdminPurchaseRequests(filters: PurchaseRequestFilters = {}) {
  return fetchAdminPurchaseRequests(filters)
}

export async function getAdminPurchaseRequestById(id: string) {
  return fetchAdminPurchaseRequestById(id)
}

export async function changePurchaseRequestStatus(id: string, status: string, adminId: string, note?: string | null) {
  if (!purchaseRequestStatuses.includes(status as PurchaseRequestStatus)) throw new Error("وضعیت انتخاب‌شده معتبر نیست.")
  return updatePurchaseRequestStatusRecord(id, status as PurchaseRequestStatus, adminId, note)
}

export async function updatePurchaseRequestNote(id: string, note: string | null, adminId: string) {
  return updatePurchaseRequestNoteRecord(id, note, adminId)
}

export async function schedulePurchaseRequestFollowUp(id: string, nextFollowUpAt: string | null, note: string | null, adminId: string) {
  return schedulePurchaseRequestFollowUpRecord(id, nextFollowUpAt, note, adminId)
}

export async function addPurchaseRequestActivity(id: string, action: string, note: string | null, adminId: string) {
  if (!action.trim()) throw new Error("عنوان فعالیت الزامی است.")
  return insertPurchaseRequestActivityRecord(id, action.trim(), note, adminId)
}
