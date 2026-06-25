"use client"

import Link from "next/link"
import { ArrowRight, Info, LockKeyhole, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ProductImage } from "@/components/common/product-image"
import { formatPrice } from "@/lib/data"
import type { CartItem } from "@/lib/cart/cart-store"

interface CheckoutOrderSummaryProps {
  items: CartItem[]
  subtotal: number
  discount: number
  payable: number
  shippingLabel: string
  itemCount: number
}

function PriceRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={highlight ? "text-lg font-extrabold text-primary" : "font-bold text-foreground"}>{value}</span>
    </div>
  )
}

export function CheckoutOrderSummary({ items, subtotal, discount, payable, shippingLabel, itemCount }: CheckoutOrderSummaryProps) {
  return (
    <section className="flex max-h-none flex-col overflow-hidden rounded-3xl border border-border bg-card p-4 shadow-sm md:p-5 lg:max-h-[calc(100vh-7rem)]">
      <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold leading-8 text-foreground md:text-xl">خلاصه سفارش</h2>
          <p className="text-sm text-muted-foreground">اطلاعات سبد خرید برای هماهنگی فروش</p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
          {itemCount.toLocaleString("fa-IR")} کالا
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-muted/35 p-3 md:p-4 lg:max-h-[min(42vh,28rem)] lg:overscroll-contain lg:pr-3">
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.lineId} className="flex items-start justify-between gap-3 text-sm">
              <div className="flex min-w-0 gap-3">
                <ProductImage src={item.mainImageUrl} alt={item.name} size="cart" className="h-14 w-14" />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-bold leading-7 text-foreground">{item.name}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs leading-6 text-muted-foreground">
                    <span dir="ltr">{item.model ?? item.sku ?? "—"}</span>
                    <span>{item.brandName ?? "برند نامشخص"}</span>
                    {item.variantLabel ? <span>{item.variantGroupTitle ?? "گزینه"}: {item.variantLabel}</span> : null}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.quantity.toLocaleString("fa-IR")} × {formatPrice(item.price)} تومان
                  </p>
                </div>
              </div>
              <span className="shrink-0 font-extrabold text-primary">{formatPrice(item.price * item.quantity)} تومان</span>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4 shrink-0" />

      <div className="shrink-0 space-y-3">
        <PriceRow label="تعداد کالاها" value={`${itemCount.toLocaleString("fa-IR")} عدد`} />
        <PriceRow label="جمع کالاها" value={`${formatPrice(subtotal)} تومان`} />
        <PriceRow label="تخفیف کالاها" value={`${formatPrice(discount)} تومان`} />
        <PriceRow label="هزینه ارسال" value={shippingLabel} />
      </div>

      <Separator className="my-4 shrink-0" />

      <div className="shrink-0">
        <PriceRow label="مبلغ تقریبی سبد خرید" value={`${formatPrice(payable)} تومان`} highlight />
      </div>

      <div className="mt-4 flex shrink-0 items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 text-xs font-semibold leading-6 text-orange-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>مبلغ نهایی سفارش پس از بررسی موجودی، قیمت کالاها و شرایط ارسال توسط کارشناسان فروش تأیید خواهد شد.</span>
      </div>
      <div className="mt-3 flex shrink-0 items-start gap-2 rounded-xl bg-muted/50 px-3 py-3 text-xs font-semibold leading-6 text-muted-foreground">
        <ShoppingCart className="mt-0.5 h-4 w-4 shrink-0" />
        <span>در هر دو روش، اطلاعات سبد خرید شما برای بررسی سفارش استفاده می‌شود.</span>
      </div>

      <div className="mt-5 shrink-0 space-y-3">
        <Button asChild className="h-12 w-full rounded-xl bg-secondary text-sm font-extrabold text-secondary-foreground hover:bg-secondary/90">
          <a href="#checkout-finalization">انتخاب روش نهایی‌سازی خرید</a>
        </Button>
        <Button asChild variant="ghost" className="h-10 w-full rounded-xl">
          <Link href="/cart"><ArrowRight className="h-4 w-4" />بازگشت به سبد خرید</Link>
        </Button>
      </div>

      <div className="mt-4 flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
        <LockKeyhole className="h-4 w-4" />
        پرداخت آنلاین در این مرحله غیرفعال است و هیچ تراکنش بانکی ثبت نمی‌شود.
      </div>
    </section>
  )
}
