"use client"

import { CreditCard, ShieldCheck } from "lucide-react"

import { useManualCheckoutSettings } from "@/components/site-settings-provider"

export function CardToCardInstructions() {
  const manual = useManualCheckoutSettings()
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">مراحل پرداخت کارت به کارت</h2>
          <p className="text-sm text-muted-foreground">پرداخت فقط پس از تایید نهایی فروش انجام می‌شود.</p>
        </div>
      </div>

      <div className="rounded-2xl bg-muted/35 p-4 text-sm font-medium leading-8 text-foreground">
        {manual.cardToCardInstructionText || manual.explanationText}
      </div>

      <div className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs font-semibold leading-6 text-emerald-700">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        برای خریدهای پروژه‌ای، سفارش عمده و دریافت پیش‌فاکتور رسمی، هماهنگی از طریق پیام‌رسان یا تماس تلفنی انجام می‌شود.
      </div>
    </section>
  )
}
