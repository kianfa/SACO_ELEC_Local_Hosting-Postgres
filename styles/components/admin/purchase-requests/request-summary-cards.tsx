import { CheckCircle2, Clock3, MessageCircleMore, PhoneForwarded, WalletCards } from "lucide-react"
import type { PurchaseRequestListItem } from "@/types/purchase-request"
import { Card, CardContent } from "@/components/ui/card"

export function RequestSummaryCards({ requests }: { requests: PurchaseRequestListItem[] }) {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime()
  const cards = [
    { label: "درخواست‌های جدید", value: requests.filter((r) => r.status === "new").length, icon: PhoneForwarded },
    { label: "نیازمند پیگیری امروز", value: requests.filter((r) => r.nextFollowUpAt && new Date(r.nextFollowUpAt).getTime() >= start && new Date(r.nextFollowUpAt).getTime() < end).length, icon: Clock3 },
    { label: "در انتظار پاسخ مشتری", value: requests.filter((r) => r.status === "message_sent_waiting_response").length, icon: MessageCircleMore },
    { label: "در انتظار واریز", value: requests.filter((r) => r.status === "waiting_for_payment").length, icon: WalletCards },
    { label: "خریدهای تکمیل‌شده", value: requests.filter((r) => r.status === "completed").length, icon: CheckCircle2 },
  ]

  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{cards.map((card) => { const Icon = card.icon; return <Card key={card.label} className="rounded-2xl py-4 shadow-sm"><CardContent className="flex items-center gap-3 px-4"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><div><div className="text-2xl font-black text-primary">{card.value.toLocaleString("fa-IR")}</div><div className="text-xs font-semibold text-muted-foreground">{card.label}</div></div></CardContent></Card> })}</div>
}
