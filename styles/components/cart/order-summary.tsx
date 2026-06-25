import Link from "next/link"
import { ArrowLeft, PackagePlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/data"

interface OrderSummaryProps {
  itemCount: number
  subtotal: number
  discount: number
  payable: number
  compact?: boolean
  hasUnavailable?: boolean
}

export function OrderSummary({
  itemCount,
  subtotal,
  discount,
  payable,
  compact = false,
  hasUnavailable = false,
}: OrderSummaryProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 md:p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">خلاصه سفارش</h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          {itemCount.toLocaleString("fa-IR")} کالا
        </span>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">تعداد کالاها</span>
          <span className="font-medium persian-num">{itemCount.toLocaleString("fa-IR")}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">جمع کالاها</span>
          <span className="font-medium">{formatPrice(subtotal)} تومان</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-green-700">
          <span>تخفیف کالاها</span>
          <span className="font-medium">{discount > 0 ? `${formatPrice(discount)} تومان` : "—"}</span>
        </div>
        <div className="flex items-start justify-between gap-4">
          <span className="text-muted-foreground">هزینه ارسال</span>
          <span className="text-left text-xs leading-6 text-muted-foreground">
            در مرحله checkout محاسبه می‌شود
          </span>
        </div>
      </div>

      <Separator className="my-4" />

      <div className="mb-5 flex items-center justify-between gap-4">
        <span className="font-bold text-foreground">مبلغ قابل پرداخت</span>
        <div className="text-left">
          <span className="block text-xl font-extrabold text-primary">{formatPrice(payable)}</span>
          <span className="text-xs text-muted-foreground">تومان</span>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          asChild
          className="h-12 w-full rounded-xl bg-primary text-base hover:bg-primary/90 disabled:opacity-60"
          aria-disabled={hasUnavailable || itemCount === 0}
        >
          <Link href="/checkout" className={hasUnavailable || itemCount === 0 ? "pointer-events-none opacity-60" : ""}>
            ادامه فرایند خرید
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
        {!compact && (
          <Button asChild variant="outline" className="h-11 w-full rounded-xl gap-2">
            <Link href="/products">
              <PackagePlus className="h-4 w-4" />
              افزودن محصولات بیشتر
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
