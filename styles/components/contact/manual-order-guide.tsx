"use client"

import type { ReactNode } from "react"
import { Camera, CheckCircle2, CreditCard, MessageCircle, PackageCheck } from "lucide-react"
import { useManualCheckoutSettings } from "@/components/site-settings-provider"

const steps = [
  "محصولات مورد نیاز خود را به سبد خرید اضافه کنید.",
  "از خلاصه سبد خرید اسکرین‌شات بگیرید.",
  "تصویر را از طریق تلگرام، واتساپ، بله یا روبیکا ارسال کنید.",
  "موجودی، قیمت نهایی و شرایط ارسال توسط کارشناسان تأیید می‌شود.",
  "پس از پرداخت کارت‌به‌کارت، سفارش آماده پردازش و ارسال خواهد شد.",
]

const icons = [PackageCheck, Camera, MessageCircle, CheckCircle2, CreditCard]

export function ManualOrderGuide() {
  const manual = useManualCheckoutSettings()
  return (
    <section className="rounded-3xl bg-primary p-1 shadow-xl shadow-primary/10">
      <div className="overflow-hidden rounded-[1.35rem] bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.22),transparent_34%),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary))/0.92)] p-6 text-primary-foreground md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <BadgeLike>پرداخت دستی و هماهنگی سفارش</BadgeLike>
            <h2 className="mt-4 text-2xl font-black md:text-3xl">راهنمای ثبت سفارش از طریق پیام‌رسان</h2>
            <p className="mt-4 text-sm leading-8 text-primary-foreground/82 md:text-base">{manual.explanationText}</p>
          </div>

          <ol className="grid gap-3">
            {steps.map((step, index) => {
              const Icon = icons[index]
              return (
                <li key={step} className="flex gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-primary-foreground/60">مرحله {index + 1}</span>
                    <p className="mt-1 text-sm font-semibold leading-7 text-primary-foreground">{step}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}

function BadgeLike({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-accent px-4 py-2 text-xs font-extrabold text-accent-foreground shadow-lg shadow-accent/20">
      {children}
    </span>
  )
}
