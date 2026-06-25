"use client"

import { Check, CheckCircle2, Circle, LockKeyhole, MessageCircle, PhoneCall } from "lucide-react"
import type { CartItem } from "@/lib/cart/cart-store"
import { CallbackRequestCard } from "@/components/checkout/callback-request-card"
import { ManualCheckoutContactSection } from "@/components/checkout/manual-checkout-contact-section"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type CheckoutFinalizationMethod = "messaging" | "callback"

type MethodCardProps = {
  method: CheckoutFinalizationMethod
  selected: boolean
  onSelect: (method: CheckoutFinalizationMethod) => void
  title: string
  badge: string
  description: string
  helper: string
  icon: typeof MessageCircle
}

function MethodCard({ method, selected, onSelect, title, badge, description, helper, icon: Icon }: MethodCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(method)}
      className={cn(
        "group relative min-w-0 overflow-hidden rounded-3xl border-2 p-5 text-right transition-all duration-300 md:p-6",
        selected
          ? "border-secondary bg-primary text-primary-foreground shadow-[0_18px_50px_rgba(15,23,42,0.24)] ring-4 ring-secondary/15"
          : "border-border bg-background text-foreground shadow-sm hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg",
      )}
    >
      {selected ? <span className="absolute inset-x-0 top-0 h-1 bg-secondary" /> : null}

      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300",
            selected
              ? "border-secondary/40 bg-secondary text-secondary-foreground shadow-[0_8px_22px_rgba(249,115,22,0.28)]"
              : "border-primary/10 bg-primary/10 text-primary",
          )}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-extrabold transition-all",
            selected
              ? "border-secondary/40 bg-secondary/15 text-secondary"
              : "border-border bg-muted/50 text-muted-foreground",
          )}
        >
          {selected ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
          {selected ? "روش انتخاب‌شده" : "انتخاب این روش"}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <h3 className={cn("text-lg font-extrabold leading-8 md:text-xl", selected ? "text-primary-foreground" : "text-foreground")}>{title}</h3>
        <Badge
          className={cn(
            "rounded-full border-0 px-2.5 py-1 text-[11px] font-extrabold",
            selected
              ? "bg-secondary text-secondary-foreground hover:bg-secondary"
              : "bg-muted text-muted-foreground hover:bg-muted",
          )}
        >
          {badge}
        </Badge>
      </div>

      <p className={cn("mt-3 text-sm font-medium leading-8 md:text-base", selected ? "text-primary-foreground/85" : "text-muted-foreground")}>{description}</p>
      <p
        className={cn(
          "mt-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold leading-7",
          selected
            ? "border-primary-foreground/10 bg-primary-foreground/[0.07] text-primary-foreground/85"
            : "border-transparent bg-muted/45 text-muted-foreground",
        )}
      >
        {helper}
      </p>

      <div
        className={cn(
          "mt-4 flex items-center gap-2 text-xs font-extrabold",
          selected ? "text-secondary" : "text-primary/75",
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded-full border",
            selected ? "border-secondary bg-secondary text-secondary-foreground" : "border-primary/25 bg-primary/5",
          )}
        >
          {selected ? <Check className="h-3.5 w-3.5" /> : null}
        </span>
        {selected ? "این مسیر برای نهایی‌سازی خرید فعال است" : "برای انتخاب این مسیر کلیک کنید"}
      </div>
    </button>
  )
}

interface CheckoutFinalizationMethodsProps {
  items: CartItem[]
  method: CheckoutFinalizationMethod
  onMethodChange: (method: CheckoutFinalizationMethod) => void
}

export function checkoutMethodNeedsShipping(method: CheckoutFinalizationMethod) {
  return method !== "messaging" && method !== "callback"
}

export function CheckoutFinalizationMethods({ items, method, onMethodChange }: CheckoutFinalizationMethodsProps) {
  const isMessaging = method === "messaging"

  return (
    <section id="checkout-finalization" className="scroll-mt-28 rounded-3xl border border-primary/10 bg-card p-5 shadow-sm md:p-7">
      <div className="mb-6">
        <h2 className="text-xl font-extrabold text-foreground md:text-2xl">نحوه نهایی‌سازی خرید</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">
          برای بررسی موجودی، تأیید قیمت نهایی و هماهنگی ارسال، یکی از روش‌های زیر را انتخاب کنید.
        </p>
      </div>

      <div role="radiogroup" aria-label="انتخاب روش نهایی‌سازی خرید" className="grid gap-4 lg:grid-cols-2">
        <MethodCard
          method="messaging"
          selected={isMessaging}
          onSelect={onMethodChange}
          title="خودم پیام می‌دهم"
          badge="پیشنهاد سریع‌تر"
          icon={MessageCircle}
          description="سبد خرید را از طریق پیام‌رسان برای کارشناسان فروش ارسال کنید تا موجودی و قیمت نهایی بررسی شود."
          helper="در این روش نیازی به ثبت آدرس در checkout نیست."
        />
        <MethodCard
          method="callback"
          selected={!isMessaging}
          onSelect={onMethodChange}
          title="با من تماس بگیرید"
          badge="بدون نیاز به ارسال پیام"
          icon={PhoneCall}
          description="شماره تماس خود را ثبت کنید تا کارشناسان فروش برای بررسی سفارش و هماهنگی خرید با شما تماس بگیرند."
          helper="فقط نام و شماره تماس لازم است؛ آدرس در این مرحله دریافت نمی‌شود."
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-primary/10 bg-background shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/35 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-foreground">
            <CheckCircle2 className="h-5 w-5 text-secondary" />
            روش فعال: {isMessaging ? "ارسال پیام مستقیم" : "درخواست تماس کارشناسان فروش"}
          </div>
          <span className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-extrabold text-secondary">قابل تغییر در هر زمان</span>
        </div>
        <div className="p-4 md:p-6">
          {isMessaging ? <ManualCheckoutContactSection /> : <CallbackRequestCard items={items} />}
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-2xl border border-border bg-muted/35 px-4 py-3 text-sm font-semibold leading-7 text-muted-foreground">
        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
        پرداخت اینترنتی در حال حاضر غیرفعال است. پرداخت کارت‌به‌کارت فقط پس از بررسی سفارش و تأیید کارشناسان فروش انجام می‌شود.
      </div>
    </section>
  )
}
