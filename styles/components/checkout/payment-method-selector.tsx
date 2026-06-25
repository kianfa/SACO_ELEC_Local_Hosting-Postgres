"use client"

import { CheckCircle2, Headphones, LockKeyhole } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useManualCheckoutSettings } from "@/components/site-settings-provider"

export type PaymentMethod = "manual" | ""

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (value: PaymentMethod) => void
  showWarning?: boolean
}

export function PaymentMethodSelector({ value, onChange, showWarning = false }: PaymentMethodSelectorProps) {
  const manualSelected = value === "manual"
  const manual = useManualCheckoutSettings()

  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold text-foreground">روش پرداخت</h2>
        <p className="mt-1 text-sm leading-7 text-muted-foreground">
          پرداخت اینترنتی فعلاً غیرفعال است و ثبت سفارش از طریق هماهنگی با فروش انجام می‌شود.
        </p>
      </div>

      {showWarning && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          لطفاً روش هماهنگی خرید را انتخاب کنید.
        </div>
      )}

      <div className="grid gap-3">
        <div className="cursor-not-allowed rounded-2xl border border-border bg-muted/40 p-4 opacity-75">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-extrabold text-muted-foreground">پرداخت اینترنتی</h3>
                <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
                  غیرفعال
                </Badge>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {manual.onlinePaymentDisabledText}
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onChange("manual")}
          className={cn(
            "flex w-full items-start gap-4 rounded-2xl border bg-background p-4 text-right transition-all hover:border-primary/50 hover:shadow-sm",
            manualSelected ? "border-primary ring-2 ring-primary/10" : "border-border",
          )}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Headphones className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-foreground">هماهنگی خرید از طریق پیام‌رسان</h3>
                <Badge className="rounded-full bg-secondary/10 text-secondary hover:bg-secondary/10">روش فعال</Badge>
              </div>
              {manualSelected && <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />}
            </div>
            <p className="mt-1 text-sm leading-7 text-muted-foreground">
{manual.explanationText}
            </p>
          </div>
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-7 text-amber-800">
        وضعیت پرداخت: در انتظار هماهنگی و کارت به کارت
      </div>
    </section>
  )
}
