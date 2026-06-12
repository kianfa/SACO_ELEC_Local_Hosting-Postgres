"use client"

import { ExternalLink, MessageCircle, Phone, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useContactInfo, useFooterInfo } from "@/components/site-settings-provider"
import { storeContactConfig } from "@/lib/store-contact-config"

export function ManualCheckoutContactSection() {
  const contact = useContactInfo()
  const footer = useFooterInfo()
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  const landline = contact.landline || storeContactConfig.landline
  const telegramUrl = contact.telegramUrl || storeContactConfig.telegram.url
  const whatsappUrl = contact.whatsappUrl || storeContactConfig.whatsapp.url
  const baleUrl = footer.baleUrl || null

  const channels = [
    { id: "telegram", title: "تلگرام", url: telegramUrl, icon: Send },
    { id: "whatsapp", title: "واتساپ", url: whatsappUrl, icon: MessageCircle },
    { id: "bale", title: "بله", url: baleUrl, icon: MessageCircle },
    { id: "rubika", title: "روبیکا", url: null, icon: MessageCircle },
  ]

  return (
    <div className="rounded-2xl border border-primary/10 bg-background p-4 shadow-sm md:p-5">
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-extrabold text-foreground">ارسال سبد خرید از طریق پیام‌رسان</h3>
          <Badge className="rounded-full bg-secondary/10 text-secondary hover:bg-secondary/10">روش انتخاب‌شده</Badge>
        </div>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          از خلاصه سفارش اسکرین‌شات بگیرید و از طریق یکی از پیام‌رسان‌های زیر ارسال کنید.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {channels.map((channel) => {
          const Icon = channel.icon
          const href = channel.url ?? `tel:${supportPhone}`
          return (
            <Button
              key={channel.id}
              asChild
              variant={channel.url ? "default" : "outline"}
              className={channel.url ? "h-12 rounded-xl bg-secondary font-extrabold text-secondary-foreground hover:bg-secondary/90" : "h-12 rounded-xl bg-transparent font-extrabold"}
            >
              <a href={href} target={channel.url ? "_blank" : undefined} rel={channel.url ? "noreferrer" : undefined}>
                <Icon className="h-4 w-4" />
                {channel.url ? channel.title : `${channel.title} — ${supportPhone}`}
                {channel.url ? <ExternalLink className="h-3.5 w-3.5" /> : null}
              </a>
            </Button>
          )
        })}
      </div>

      <div className="mt-4 grid gap-3 rounded-xl bg-muted/40 p-3 text-sm sm:grid-cols-2">
        <a href={`tel:${landline}`} className="flex items-center gap-2 font-bold text-foreground hover:text-primary">
          <Phone className="h-4 w-4 text-primary" />
          <span>تلفن ثابت:</span>
          <span dir="ltr">{landline}</span>
        </a>
        <a href={`tel:${supportPhone}`} className="flex items-center gap-2 font-bold text-foreground hover:text-primary">
          <Phone className="h-4 w-4 text-primary" />
          <span>موبایل / پشتیبانی:</span>
          <span dir="ltr">{supportPhone}</span>
        </a>
      </div>

      <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-7 text-orange-900">
        <p className="font-extrabold">راهنمای سریع</p>
        <ol className="mt-2 list-decimal space-y-1 pr-5">
          <li>سبد خرید خود را بررسی کنید.</li>
          <li>از خلاصه سفارش اسکرین‌شات بگیرید.</li>
          <li>تصویر را در پیام‌رسان ارسال کنید.</li>
          <li>پس از تأیید موجودی و قیمت نهایی، اطلاعات پرداخت برای شما ارسال می‌شود.</li>
        </ol>
      </div>
    </div>
  )
}
