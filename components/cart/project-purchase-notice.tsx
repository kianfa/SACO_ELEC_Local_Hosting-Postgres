"use client"

import { FileText, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import { storeContactConfig } from "@/lib/store-contact-config"
import { useContactInfo } from "@/components/site-settings-provider"

export function ProjectPurchaseNotice() {
  const contact = useContactInfo()
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  return (
    <div className="rounded-2xl border border-primary/15 bg-primary/[0.03] p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h2 className="mb-2 text-lg font-bold text-foreground">خرید پروژه‌ای یا تعداد بالا؟</h2>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              برای سفارش عمده، دریافت پیش‌فاکتور رسمی یا هماهنگی ارسال پروژه‌ای با کارشناسان ما تماس بگیرید.
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
          <a href={`tel:${supportPhone}`}>
            <PhoneCall className="ml-2 h-4 w-4" />
            درخواست پیش‌فاکتور
          </a>
        </Button>
      </div>
    </div>
  )
}
