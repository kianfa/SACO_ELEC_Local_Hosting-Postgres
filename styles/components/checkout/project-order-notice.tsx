"use client"

import { Headphones, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import { storeContactConfig } from "@/lib/store-contact-config"
import { useContactInfo } from "@/components/site-settings-provider"

export function ProjectOrderNotice() {
  const contact = useContactInfo()
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  return (
    <section className="rounded-3xl border border-primary/15 bg-primary p-5 text-primary-foreground shadow-sm md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
          <Headphones className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold leading-8 md:text-xl">سفارش پروژه‌ای دارید؟</h2>
          <p className="mt-2 text-sm font-medium leading-8 text-primary-foreground/85 md:text-base">
            برای سفارش تعداد بالا، دریافت پیش‌فاکتور رسمی، هماهنگی ارسال باربری یا مشاوره فنی با کارشناسان ما در ارتباط باشید.
          </p>
          <Button asChild className="mt-4 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <a href={`tel:${supportPhone}`}>
              <PhoneCall className="h-4 w-4" />
              درخواست تماس کارشناس
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
