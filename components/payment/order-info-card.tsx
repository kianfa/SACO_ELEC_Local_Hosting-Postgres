import { AlertTriangle, BadgeCheck, CalendarDays, CreditCard, Hash, Info, ReceiptText, ShieldCheck, WalletCards, type LucideIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentResultData, PaymentStatus, formatToman } from "@/lib/payment-data"

interface OrderInfoCardProps {
  status: PaymentStatus
  data: PaymentResultData
}

type OrderInfoRow = {
  label: string
  value: string
  icon: LucideIcon
  highlight?: boolean
  danger?: boolean
}

export function OrderInfoCard({ status, data }: OrderInfoCardProps) {
  const isSuccess = status === "success"
  const rows: OrderInfoRow[] = isSuccess
    ? [
        { label: "شماره سفارش", value: data.orderNumber, icon: ReceiptText },
        { label: "کد پیگیری پرداخت", value: data.paymentTrackingCode, icon: Hash },
        { label: "تاریخ ثبت سفارش", value: data.orderDate, icon: CalendarDays },
        { label: "وضعیت سفارش", value: data.orderStatus, icon: BadgeCheck, highlight: true },
        { label: "روش پرداخت", value: data.paymentMethod, icon: CreditCard },
        { label: "مبلغ پرداخت شده", value: formatToman(data.paidAmount), icon: WalletCards, highlight: true },
      ]
    : [
        { label: "شماره سفارش", value: data.orderNumber, icon: ReceiptText },
        { label: "وضعیت پرداخت", value: data.paymentStatus, icon: AlertTriangle, danger: true },
        { label: "مبلغ سفارش", value: formatToman(data.paidAmount), icon: WalletCards },
        { label: "دلیل احتمالی", value: data.failureReason, icon: Info },
      ]

  return (
    <Card id="order-info" className="rounded-3xl border-border bg-card shadow-sm scroll-mt-28">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          {isSuccess ? <ShieldCheck className="h-5 w-5 text-emerald-600" /> : <AlertTriangle className="h-5 w-5 text-destructive" />}
          {isSuccess ? "اطلاعات سفارش و پرداخت" : "اطلاعات پرداخت"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((row) => {
            const Icon = row.icon
            return (
              <div key={row.label} className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted-foreground">
                  <Icon className={row.danger ? "h-4 w-4 text-destructive" : "h-4 w-4 text-primary"} />
                  {row.label}
                </div>
                <p
                  className={
                    row.danger
                      ? "text-sm font-extrabold text-destructive"
                      : row.highlight
                        ? "text-sm font-extrabold text-primary"
                        : "text-sm font-bold leading-7 text-foreground"
                  }
                >
                  {row.value}
                </p>
              </div>
            )
          })}
        </div>

        {!isSuccess && (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-7 text-destructive">
            سفارش شما هنوز نهایی نشده است. می‌توانید دوباره پرداخت را امتحان کنید یا با واحد فروش هماهنگ شوید.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
