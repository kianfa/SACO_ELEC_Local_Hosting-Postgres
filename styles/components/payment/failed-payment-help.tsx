import { Banknote, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FailedPaymentHelpProps {
  orderNumber: string
}

export function FailedPaymentHelp({ orderNumber }: FailedPaymentHelpProps) {
  return (
    <Card className="rounded-3xl border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <Banknote className="h-5 w-5 text-primary" />
          اگر مبلغ از حساب شما کسر شده است
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-8 text-muted-foreground">
          در صورت کسر وجه، معمولاً مبلغ طی ۷۲ ساعت کاری توسط بانک به حساب شما بازمی‌گردد. در صورت نیاز، با کد پیگیری سفارش با پشتیبانی تماس بگیرید.
        </p>
        <div className="flex items-start gap-3 rounded-2xl border border-secondary/30 bg-secondary/10 p-4 text-sm leading-7 text-foreground">
          <Info className="mt-1 h-5 w-5 shrink-0 text-secondary" />
          <div>
            <p className="font-extrabold">کد سفارش برای پیگیری</p>
            <p className="text-muted-foreground">{orderNumber}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
