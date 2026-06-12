"use client"

import Link from "next/link"
import { ChevronLeft, Home } from "lucide-react"
import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CartItemCard } from "@/components/cart/cart-item-card"
import { CartWarnings } from "@/components/cart/cart-warnings"
import { EmptyCart } from "@/components/cart/empty-cart"
import { OrderSummary } from "@/components/cart/order-summary"
import { ProjectPurchaseNotice } from "@/components/cart/project-purchase-notice"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useCart } from "@/lib/cart/cart-store"

export function CartPage() {
  const { items, totals, updateQuantity, removeFromCart, clearCart } = useCart()
  const hasOutOfStock = items.some((item) => item.stockQuantity === 0)
  const priceUpdated = false

  const handleQuantityChange = (lineId: string, quantity: number) => {
    updateQuantity(lineId, quantity)
  }

  const handleRemove = (lineId: string) => {
    removeFromCart(lineId)
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <main className="pb-28 lg:pb-12">
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <Home className="h-4 w-4" />
                      صفحه اصلی
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">سبد خرید</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-10">
          <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="mb-2 text-2xl font-extrabold text-foreground md:text-3xl">سبد خرید</h1>
              <p className="text-sm leading-7 text-muted-foreground md:text-base">
                تجهیزات انتخاب‌شده را بررسی کنید، تعداد را تغییر دهید و برای ادامه خرید اقدام کنید.
              </p>
            </div>
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="w-fit rounded-xl border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
              >
                خالی کردن سبد خرید
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <EmptyCart />
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <section className="space-y-4 lg:order-1">
                <CartWarnings priceUpdated={priceUpdated} hasOutOfStock={hasOutOfStock} />
                {items.map((item) => (
                  <CartItemCard
                    key={item.lineId}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
                <ProjectPurchaseNotice />
              </section>

              <aside className="lg:sticky lg:top-32 lg:order-2">
                <OrderSummary
                  itemCount={totals.totalQuantity}
                  subtotal={totals.subtotal}
                  discount={totals.discount}
                  payable={totals.payable}
                  hasUnavailable={hasOutOfStock}
                />
              </aside>
            </div>
          )}
        </div>
      </main>

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
          <div className="container mx-auto flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-xs text-muted-foreground">مبلغ قابل پرداخت</p>
              <p className="text-lg font-extrabold text-primary">{totals.payable.toLocaleString("fa-IR")} تومان</p>
            </div>
            <Link
              href="/checkout"
              className={`flex h-12 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground ${hasOutOfStock ? "pointer-events-none opacity-60" : ""}`}
            >
              ادامه فرایند خرید
            </Link>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
