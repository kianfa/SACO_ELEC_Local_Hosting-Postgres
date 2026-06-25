import { ClipboardCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { paymentNextSteps } from "@/lib/payment-data"

export function PaymentNextSteps() {
  return (
    <Card className="rounded-3xl border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          مراحل بعدی سفارش
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {paymentNextSteps.map((step, index) => (
            <div key={step} className="flex items-start gap-3 rounded-2xl border border-border bg-muted/30 p-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-extrabold text-secondary-foreground">
                {(index + 1).toLocaleString("fa-IR")}
              </span>
              <div>
                <p className="text-sm font-extrabold text-foreground">{step}</p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">تیم فروش وضعیت این مرحله را از طریق تماس یا پیامک اطلاع‌رسانی می‌کند.</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
