import Link from "next/link"
import { AlertCircle, CheckCircle2, Download, Headphones, RotateCcw, ShoppingBag, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PaymentResultData, PaymentStatus, formatToman } from "@/lib/payment-data"

interface PaymentStatusCardProps {
  status: PaymentStatus
  data: PaymentResultData
}

export function PaymentStatusCard({ status, data }: PaymentStatusCardProps) {
  const isSuccess = status === "success"

  return (
    <Card className="overflow-hidden rounded-3xl border-border bg-card shadow-sm">
      <CardContent className="p-0">
        <div className={isSuccess ? "h-2 bg-emerald-500" : "h-2 bg-destructive"} />
        <div className="grid gap-6 p-5 md:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-right">
            <div
              className={
                isSuccess
                  ? "mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/70"
                  : "mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5"
              }
            >
              {isSuccess ? <CheckCircle2 className="h-11 w-11" /> : <AlertCircle className="h-11 w-11" />}
            </div>

            <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
              {isSuccess ? "پرداخت با موفقیت انجام شد" : "پرداخت ناموفق بود"}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              {isSuccess
                ? "سفارش شما با موفقیت ثبت شد و در حال بررسی توسط تیم فروش است."
                : "پرداخت شما تکمیل نشد یا توسط درگاه بانکی تایید نشد."}
            </p>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
                شماره سفارش: {data.orderNumber}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                مبلغ سفارش: {formatToman(data.paidAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 md:min-w-72">
            {isSuccess ? (
              <>
                <Button asChild className="h-12 rounded-xl bg-primary font-extrabold hover:bg-primary/90">
                  <Link href="#order-info">
                    <ShoppingBag className="h-4 w-4" />
                    مشاهده جزئیات سفارش
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-xl bg-card font-bold">
                  <Link href="/products">
                    <ShoppingCart className="h-4 w-4" />
                    ادامه خرید
                  </Link>
                </Button>
                <Button variant="outline" className="h-12 rounded-xl bg-card font-bold">
                  <Download className="h-4 w-4" />
                  دریافت فاکتور / پیش‌فاکتور
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="h-12 rounded-xl bg-secondary font-extrabold text-secondary-foreground hover:bg-secondary/90">
                  <Link href="/checkout">
                    <RotateCcw className="h-4 w-4" />
                    تلاش مجدد برای پرداخت
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-12 rounded-xl bg-card font-bold">
                  <Link href="/cart">
                    <ShoppingCart className="h-4 w-4" />
                    بازگشت به سبد خرید
                  </Link>
                </Button>
                <Button variant="outline" className="h-12 rounded-xl bg-card font-bold">
                  <Headphones className="h-4 w-4" />
                  تماس با پشتیبانی
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
