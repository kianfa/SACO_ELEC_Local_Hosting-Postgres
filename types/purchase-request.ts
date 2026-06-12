export type PurchaseRequestStatus =
  | "new"
  | "contacted"
  | "message_sent_waiting_response"
  | "follow_up_required"
  | "price_confirmed"
  | "waiting_for_payment"
  | "payment_received"
  | "completed"
  | "cancelled"

export const purchaseRequestStatusLabels: Record<PurchaseRequestStatus, string> = {
  new: "جدید",
  contacted: "تماس گرفته شد",
  message_sent_waiting_response: "پیام ارسال شد؛ در انتظار پاسخ مشتری",
  follow_up_required: "نیازمند پیگیری مجدد",
  price_confirmed: "موجودی و قیمت تأیید شد",
  waiting_for_payment: "در انتظار واریز",
  payment_received: "واریز انجام شد",
  completed: "خرید تکمیل شد",
  cancelled: "لغو شد",
}

export const purchaseRequestStatuses = Object.keys(purchaseRequestStatusLabels) as PurchaseRequestStatus[]

export type PurchaseRequestItem = {
  id: string
  purchaseRequestId: string
  productId: string | null
  productName: string
  productModel: string | null
  productSku: string | null
  brandName: string | null
  variantId: string | null
  variantGroupTitle: string | null
  variantLabel: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  mainImageUrl: string | null
  createdAt: string
}

export type PurchaseRequestActivity = {
  id: string
  purchaseRequestId: string
  action: string
  note: string | null
  createdBy: string | null
  createdAt: string
}

export type PurchaseRequest = {
  id: string
  requestNumber: string
  customerName: string
  phone: string
  description: string | null
  preferredContactTime: string | null
  preferredContactTimeNote: string | null
  source: "checkout"
  status: PurchaseRequestStatus
  estimatedTotal: number
  adminNote: string | null
  nextFollowUpAt: string | null
  lastContactedAt: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  itemCount: number
  items: PurchaseRequestItem[]
  activities: PurchaseRequestActivity[]
}

export type PurchaseRequestListItem = Omit<PurchaseRequest, "items" | "activities"> & {
  itemCount: number
}

export type PurchaseRequestCreateInput = {
  customerName: string
  phone: string
  description: string | null
  preferredContactTime: string
  preferredContactTimeNote: string | null
}

export type PurchaseRequestCartItemInput = {
  productId: string
  variantId?: string | null
  quantity: number
}

export type PurchaseRequestFilters = {
  query?: string
  status?: PurchaseRequestStatus | "all"
  followUpToday?: boolean
  date?: string
  sort?: "newest" | "oldest" | "nearest-follow-up"
}

export type PurchaseRequestActionState = {
  ok: boolean
  message: string
  requestId?: string
  requestNumber?: string
  createdAt?: string
}

export type PublicPurchaseRequestResult = {
  requestId: string
  requestNumber: string
  createdAt: string
}
