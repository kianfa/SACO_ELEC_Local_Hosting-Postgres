"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, ChevronLeft, Home, PackageOpen } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TopBar } from "@/components/top-bar"
import { CheckoutSteps } from "@/components/checkout/checkout-steps"
import { CustomerInfoForm } from "@/components/checkout/customer-info-form"
import { ShippingAddressForm } from "@/components/checkout/shipping-address-form"
import { CheckoutOrderSummary } from "@/components/checkout/checkout-order-summary"
import { ProjectOrderNotice } from "@/components/checkout/project-order-notice"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { CheckoutFinalizationMethods, checkoutMethodNeedsShipping, type CheckoutFinalizationMethod } from "@/components/checkout/checkout-finalization-methods"
import { useCart } from "@/lib/cart/cart-store"
import { formatPrice } from "@/lib/data"

function CheckoutSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <section className="space-y-6 lg:order-1">
        {[1, 2, 3].map((item) => (
          <div key={item} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="grid gap-3 md:grid-cols-2">
              <div className="h-11 animate-pulse rounded-xl bg-muted" />
              <div className="h-11 animate-pulse rounded-xl bg-muted" />
              <div className="h-11 animate-pulse rounded-xl bg-muted" />
              <div className="h-11 animate-pulse rounded-xl bg-muted" />
            </div>
          </div>
        ))}
      </section>
      <aside className="lg:sticky lg:top-28 lg:order-2 lg:max-h-[calc(100vh-7rem)]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="space-y-3">
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
            <div className="h-16 animate-pulse rounded-xl bg-muted" />
            <div className="h-12 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </aside>
    </div>
  )
}

function EmptyCheckoutState() {
  return (
    <div className="rounded-3xl border border-border bg-card px-5 py-12 text-center shadow-sm md:px-8">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-primary">
        <PackageOpen className="h-8 w-8" />
      </div>
      <h2 className="mb-3 text-xl font-extrabold text-foreground">سبد خرید شما خالی است</h2>
      <p className="mx-auto mb-6 max-w-xl text-sm leading-7 text-muted-foreground">
        برای ادامه ثبت سفارش، ابتدا محصولات مورد نیاز خود را به سبد خرید اضافه کنید.
      </p>
      <Button asChild className="h-11 rounded-xl bg-primary px-6 font-bold hover:bg-primary/90">
        <Link href="/products">بازگشت به محصولات</Link>
      </Button>
    </div>
  )
}

export function CheckoutPage() {
  const { items, totals, isHydrated } = useCart()
  const [checkoutMethod, setCheckoutMethod] = useState<CheckoutFinalizationMethod>("messaging")
  const hasOutOfStock = items.some((item) => item.stockQuantity === 0)
  const needsShippingAddress = checkoutMethodNeedsShipping(checkoutMethod)
  const shippingLabel = needsShippingAddress ? "پس از ثبت آدرس" : "در هماهنگی با کارشناس"

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <TopBar />
      <Header />

      <main className="bg-gradient-to-b from-muted/35 via-background to-background pb-32 lg:pb-12">
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
                  <BreadcrumbLink asChild>
                    <Link href="/cart" className="text-muted-foreground hover:text-primary">
                      سبد خرید
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">تسویه حساب</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-10">
          <div className="mb-6 overflow-hidden rounded-3xl border border-primary/10 bg-card p-5 shadow-sm md:mb-8 md:p-7">
            <div className="max-w-3xl">
              <p className="mb-2 text-sm font-extrabold text-secondary">تکمیل سفارش</p>
              <h1 className="mb-3 text-2xl font-black leading-10 text-foreground md:text-4xl">تسویه حساب</h1>
              <p className="text-base font-medium leading-8 text-muted-foreground md:text-lg">
                روش نهایی‌سازی خرید را انتخاب کنید و سفارش خود را از مسیر مناسب ادامه دهید.
              </p>
            </div>
          </div>

          <div className="mb-6">
            <CheckoutSteps />
          </div>

          {!isHydrated ? (
            <CheckoutSkeleton />
          ) : items.length === 0 ? (
            <EmptyCheckoutState />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
              <section className="space-y-6 lg:order-1">
                {hasOutOfStock && (
                  <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm leading-7 text-destructive">
                    <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
                    <div>
                      <p className="font-extrabold">یک یا چند کالا در حال حاضر موجود نیست.</p>
                      <p>برای ادامه خرید، موجودی کالاهای پروژه‌ای را از فروشگاه استعلام کنید.</p>
                    </div>
                  </div>
                )}

                <CheckoutFinalizationMethods items={items} method={checkoutMethod} onMethodChange={setCheckoutMethod} />
                {needsShippingAddress ? (
                  <>
                    <CustomerInfoForm showErrors={false} />
                    <ShippingAddressForm showErrors={false} />
                  </>
                ) : null}
                <ProjectOrderNotice />
              </section>

              <aside className="lg:sticky lg:top-28 lg:order-2 lg:max-h-[calc(100vh-7rem)]">
                <CheckoutOrderSummary
                  items={items}
                  subtotal={totals.subtotal}
                  discount={totals.discount}
                  payable={totals.payable}
                  shippingLabel={shippingLabel}
                  itemCount={totals.totalQuantity}
                />
              </aside>
            </div>
          )}
        </div>
      </main>

      {isHydrated && items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
          <div className="container mx-auto flex items-center justify-between gap-3 px-1">
            <div>
              <p className="text-xs text-muted-foreground">مبلغ تقریبی سبد خرید</p>
              <p className="text-lg font-extrabold text-primary">{formatPrice(totals.payable)} تومان</p>
            </div>
            <Button asChild className="h-12 rounded-xl bg-secondary px-4 text-xs font-extrabold text-secondary-foreground hover:bg-secondary/90">
              <a href="#checkout-finalization">انتخاب روش نهایی‌سازی</a>
            </Button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
