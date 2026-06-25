import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { purchaseRequestStatusLabels, type PurchaseRequestStatus } from "@/types/purchase-request"

const statusClasses: Record<PurchaseRequestStatus, string> = {
  new: "border-blue-200 bg-blue-50 text-blue-700",
  contacted: "border-cyan-200 bg-cyan-50 text-cyan-700",
  message_sent_waiting_response: "border-amber-200 bg-amber-50 text-amber-700",
  follow_up_required: "border-orange-200 bg-orange-50 text-orange-700",
  price_confirmed: "border-violet-200 bg-violet-50 text-violet-700",
  waiting_for_payment: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  payment_received: "border-emerald-200 bg-emerald-50 text-emerald-700",
  completed: "border-green-200 bg-green-50 text-green-700",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600",
}

export function PurchaseRequestStatusBadge({ status }: { status: PurchaseRequestStatus }) {
  return <Badge variant="outline" className={cn("whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold", statusClasses[status])}>{purchaseRequestStatusLabels[status]}</Badge>
}
