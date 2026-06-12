import { getServerDbClient } from "@/lib/supabase/get-db-client"
import type {
  PurchaseRequest,
  PurchaseRequestActivity,
  PurchaseRequestCartItemInput,
  PurchaseRequestCreateInput,
  PurchaseRequestFilters,
  PurchaseRequestItem,
  PurchaseRequestListItem,
  PublicPurchaseRequestResult,
  PurchaseRequestStatus,
} from "@/types/purchase-request"
import { purchaseRequestStatusLabels } from "@/types/purchase-request"
import { normalizeDateTimeValue } from "@/lib/date-time"

type RawRequest = Record<string, unknown> & {
  id: string
  request_number?: string | null
  customer_name: string
  phone: string
  description: string | null
  preferred_contact_time: string | null
  preferred_contact_time_note: string | null
  source: string
  status: PurchaseRequestStatus
  estimated_total: number | string | null
  admin_note: string | null
  next_follow_up_at: unknown
  last_contacted_at: unknown
  completed_at: unknown
  created_at: unknown
  updated_at: unknown
  purchase_request_items?: RawItem[] | null
}

type RawItem = {
  id: string
  purchase_request_id: string
  product_id: string | null
  product_name: string
  product_model: string | null
  product_sku: string | null
  brand_name: string | null
  variant_id?: string | null
  variant_group_title?: string | null
  variant_label?: string | null
  quantity: number | string
  unit_price: number | string
  total_price: number | string
  created_at: unknown
  products?: { product_images?: RawProductImage[] | null } | { product_images?: RawProductImage[] | null }[] | null
}

type RawProductImage = {
  image_url?: string | null
  url?: string | null
  is_main?: boolean | null
  sort_order?: number | null
}

type RawActivity = {
  id: string
  purchase_request_id: string
  action: string
  note: string | null
  created_by: string | null
  created_at: unknown
}

function toNumber(value: unknown): number {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

function toArray<T>(value: T[] | T | null | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function resolveItemImage(item: RawItem): string | null {
  const product = toArray(item.products)[0]
  const images = [...toArray(product?.product_images)].sort((a, b) => {
    if (a.is_main && !b.is_main) return -1
    if (!a.is_main && b.is_main) return 1
    return (a.sort_order ?? 999) - (b.sort_order ?? 999)
  })
  const main = images[0]
  return main?.image_url ?? main?.url ?? null
}

function mapItem(row: RawItem): PurchaseRequestItem {
  return {
    id: row.id,
    purchaseRequestId: row.purchase_request_id,
    productId: row.product_id,
    productName: row.product_name,
    productModel: row.product_model,
    productSku: row.product_sku,
    brandName: row.brand_name,
    variantId: row.variant_id ?? null,
    variantGroupTitle: row.variant_group_title ?? null,
    variantLabel: row.variant_label ?? null,
    quantity: toNumber(row.quantity),
    unitPrice: toNumber(row.unit_price),
    totalPrice: toNumber(row.total_price),
    mainImageUrl: resolveItemImage(row),
    createdAt: normalizeDateTimeValue(row.created_at) ?? "",
  }
}

function mapActivity(row: RawActivity): PurchaseRequestActivity {
  return {
    id: row.id,
    purchaseRequestId: row.purchase_request_id,
    action: row.action,
    note: row.note,
    createdBy: row.created_by,
    createdAt: normalizeDateTimeValue(row.created_at) ?? "",
  }
}

function mapBase(row: RawRequest): PurchaseRequestListItem {
  return {
    id: row.id,
    requestNumber: row.request_number || `REQ-${row.id.slice(0, 8).toUpperCase()}`,
    customerName: row.customer_name,
    phone: row.phone,
    description: row.description,
    preferredContactTime: row.preferred_contact_time,
    preferredContactTimeNote: row.preferred_contact_time_note,
    source: "checkout",
    status: row.status,
    estimatedTotal: toNumber(row.estimated_total),
    adminNote: row.admin_note,
    nextFollowUpAt: normalizeDateTimeValue(row.next_follow_up_at),
    lastContactedAt: normalizeDateTimeValue(row.last_contacted_at),
    completedAt: normalizeDateTimeValue(row.completed_at),
    createdAt: normalizeDateTimeValue(row.created_at) ?? "",
    updatedAt: normalizeDateTimeValue(row.updated_at) ?? "",
    itemCount: toArray(row.purchase_request_items).length,
  }
}

export async function insertPublicPurchaseRequest(
  input: PurchaseRequestCreateInput,
  cartItems: PurchaseRequestCartItemInput[]
): Promise<PublicPurchaseRequestResult> {
  const supabase = await getServerDbClient()
  const { data, error } = await supabase.rpc("create_purchase_request", {
    p_customer_name: input.customerName,
    p_phone: input.phone,
    p_description: input.description,
    p_preferred_contact_time: input.preferredContactTime,
    p_preferred_contact_time_note: input.preferredContactTimeNote,
    p_items: cartItems,
  })

  if (error) throw new Error(`Failed to create purchase request: ${error.message}`)

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const payload = data as Record<string, unknown>
    const requestId = String(payload.id ?? payload.requestId ?? "")
    if (!requestId) throw new Error("Failed to create purchase request: missing request id")
    return {
      requestId,
      requestNumber: String(payload.requestNumber ?? payload.request_number ?? `REQ-${requestId.slice(0, 8).toUpperCase()}`),
      createdAt: String(payload.createdAt ?? payload.created_at ?? new Date().toISOString()),
    }
  }

  // Backward-compatible fallback for deployments that have not yet run the incremental migration.
  const requestId = String(data ?? "")
  if (!requestId) throw new Error("Failed to create purchase request: missing request id")
  return {
    requestId,
    requestNumber: `REQ-${requestId.slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  }
}

export async function fetchAdminPurchaseRequests(filters: PurchaseRequestFilters = {}): Promise<PurchaseRequestListItem[]> {
  const supabase = await getServerDbClient()
  let query = supabase
    .from("purchase_requests")
    .select("*, purchase_request_items(id)")

  if (filters.query?.trim()) {
    const value = filters.query.trim().replace(/,/g, " ")
    query = query.or(`customer_name.ilike.%${value}%,phone.ilike.%${value}%,request_number.ilike.%${value}%`)
  }
  if (filters.status && filters.status !== "all") query = query.eq("status", filters.status)

  if (filters.followUpToday) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
    query = query.gte("next_follow_up_at", start).lt("next_follow_up_at", end)
  }
  if (filters.date) {
    const start = new Date(`${filters.date}T00:00:00`).toISOString()
    const endDate = new Date(`${filters.date}T00:00:00`)
    endDate.setDate(endDate.getDate() + 1)
    query = query.gte("created_at", start).lt("created_at", endDate.toISOString())
  }

  if (filters.sort === "oldest") query = query.order("created_at", { ascending: true })
  else if (filters.sort === "nearest-follow-up") query = query.order("next_follow_up_at", { ascending: true, nullsFirst: false })
  else query = query.order("created_at", { ascending: false })

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch purchase requests: ${error.message}`)
  return (data ?? []).map((row) => mapBase(row as RawRequest))
}

export async function fetchAdminPurchaseRequestById(id: string): Promise<PurchaseRequest | null> {
  const supabase = await getServerDbClient()
  const { data: request, error: requestError } = await supabase
    .from("purchase_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (requestError) throw new Error(`Failed to fetch purchase request: ${requestError.message}`)
  if (!request) return null

  const { data: items, error: itemsError } = await supabase
    .from("purchase_request_items")
    .select("*, products(product_images(image_url, url, is_main, sort_order))")
    .eq("purchase_request_id", id)
    .order("created_at", { ascending: true })

  if (itemsError) throw new Error(`Failed to fetch purchase request items: ${itemsError.message}`)

  const { data: activities, error: activitiesError } = await supabase
    .from("purchase_request_activities")
    .select("*")
    .eq("purchase_request_id", id)
    .order("created_at", { ascending: false })

  if (activitiesError) throw new Error(`Failed to fetch purchase request activities: ${activitiesError.message}`)

  const base = mapBase(request as RawRequest)
  return {
    ...base,
    items: (items ?? []).map((row) => mapItem(row as RawItem)),
    activities: (activities ?? []).map((row) => mapActivity(row as RawActivity)),
  }
}

export async function updatePurchaseRequestStatusRecord(
  id: string,
  status: PurchaseRequestStatus,
  adminId: string,
  note?: string | null
): Promise<void> {
  const supabase = await getServerDbClient()
  const now = new Date().toISOString()
  const payload: Record<string, unknown> = { status, updated_at: now }
  if (status === "contacted" || status === "message_sent_waiting_response") payload.last_contacted_at = now
  if (status === "completed") payload.completed_at = now

  const { error } = await supabase.from("purchase_requests").update(payload).eq("id", id)
  if (error) throw new Error(`Failed to update purchase request status: ${error.message}`)

  await insertPurchaseRequestActivityRecord(id, `وضعیت درخواست تغییر کرد: ${purchaseRequestStatusLabels[status]}`, note ?? null, adminId)
}

export async function updatePurchaseRequestNoteRecord(id: string, note: string | null, adminId: string): Promise<void> {
  const supabase = await getServerDbClient()
  const { error } = await supabase.from("purchase_requests").update({ admin_note: note, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error(`Failed to update purchase request note: ${error.message}`)
  await insertPurchaseRequestActivityRecord(id, "یادداشت داخلی به‌روزرسانی شد", note, adminId)
}

export async function schedulePurchaseRequestFollowUpRecord(id: string, nextFollowUpAt: string | null, note: string | null, adminId: string): Promise<void> {
  const supabase = await getServerDbClient()
  const { error } = await supabase.from("purchase_requests").update({ next_follow_up_at: nextFollowUpAt, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) throw new Error(`Failed to schedule follow-up: ${error.message}`)
  await insertPurchaseRequestActivityRecord(id, "زمان پیگیری بعدی ثبت شد", note, adminId)
}

export async function insertPurchaseRequestActivityRecord(id: string, action: string, note: string | null, adminId: string | null): Promise<void> {
  const supabase = await getServerDbClient()
  const { error } = await supabase.from("purchase_request_activities").insert({
    purchase_request_id: id,
    action,
    note,
    created_by: adminId,
  })
  if (error) throw new Error(`Failed to create purchase request activity: ${error.message}`)
}
