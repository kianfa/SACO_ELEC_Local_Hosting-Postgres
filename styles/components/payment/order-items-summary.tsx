import { PackageCheck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentOrderItem, formatToman } from "@/lib/payment-data"

interface OrderItemsSummaryProps {
  items: PaymentOrderItem[]
}

export function OrderItemsSummary({ items }: OrderItemsSummaryProps) {
  const total = items.reduce((sum, item) => sum + item.total, 0)
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Card className="rounded-3xl border-border bg-card shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-extrabold text-foreground">
          <PackageCheck className="h-5 w-5 text-primary" />
          اقلام سفارش
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-muted/30 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold leading-7 text-foreground">{item.name}</p>
                <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary">
                  × {item.quantity.toLocaleString("fa-IR")}
                </span>
              </div>
              <p className="mt-2 text-xs font-bold text-muted-foreground">{formatToman(item.total)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>تعداد کالاها</span>
            <span>{quantity.toLocaleString("fa-IR")} عدد</span>
          </div>
          <div className="flex items-center justify-between font-extrabold text-primary">
            <span>جمع سفارش</span>
            <span>{formatToman(total)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
