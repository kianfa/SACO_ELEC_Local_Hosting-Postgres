"use client"

import Link from "next/link"
import { ReactNode } from "react"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { CartItemCard } from "@/components/cart/cart-item-card"
import { EmptyCart } from "@/components/cart/empty-cart"
import { CartWarnings } from "@/components/cart/cart-warnings"
import { formatPrice } from "@/lib/data"
import { useCart } from "@/lib/cart/cart-store"

interface CartDrawerProps {
  trigger?: ReactNode
}

export function CartDrawer({ trigger }: CartDrawerProps) {
  const { items, totals, updateQuantity, removeFromCart } = useCart()
  const hasOutOfStock = items.some((item) => item.stockQuantity === 0)
  const priceUpdated = false

  const handleQuantityChange = (lineId: string, quantity: number) => {
    updateQuantity(lineId, quantity)
  }

  const handleRemove = (lineId: string) => {
    removeFromCart(lineId)
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="icon" className="relative rounded-xl">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
              {totals.totalQuantity.toLocaleString("fa-IR")}
            </span>
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="left" className="w-full gap-0 p-0 sm:max-w-md" dir="rtl">
        <SheetHeader className="border-b border-border p-5 text-right">
          <SheetDescription className="sr-only">محصولات موجود در سبد خرید، تعداد کالاها و مسیر ادامه فرایند خرید.</SheetDescription>
          <div className="flex items-center gap-3">
            <SheetTitle className="text-xl font-bold">سبد خرید</SheetTitle>
            <Badge className="rounded-full bg-accent text-accent-foreground">
              {totals.totalQuantity.toLocaleString("fa-IR")} کالا
            </Badge>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="px-5">
            <EmptyCart compact />
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-5 py-4">
              <div className="space-y-4 pb-4">
                <CartWarnings priceUpdated={priceUpdated} hasOutOfStock={hasOutOfStock} />
                {items.map((item) => (
                  <CartItemCard
                    key={item.lineId}
                    item={item}
                    compact
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-border bg-card p-5 shadow-[0_-10px_30px_rgba(15,23,42,0.06)]">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">جمع جزء</span>
                  <span className="font-bold">{formatPrice(totals.subtotal)} تومان</span>
                </div>
                <div className="flex items-center justify-between text-green-700">
                  <span>تخفیف</span>
                  <span className="font-bold">{formatPrice(totals.discount)} تومان</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">هزینه ارسال</span>
                  <span className="text-xs text-muted-foreground">محاسبه در مرحله بعد</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="mb-4 flex items-center justify-between">
                <span className="font-bold">مبلغ قابل پرداخت</span>
                <div className="text-left">
                  <span className="block text-xl font-extrabold text-primary">{formatPrice(totals.payable)}</span>
                  <span className="text-xs text-muted-foreground">تومان</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button asChild className="h-12 w-full rounded-xl bg-primary text-base hover:bg-primary/90">
                  <Link href="/checkout" className={hasOutOfStock ? "pointer-events-none opacity-60" : ""}>
                    ادامه فرایند خرید
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full rounded-xl text-primary">
                  <Link href="/cart">مشاهده سبد خرید</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
