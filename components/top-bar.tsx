"use client"

import { Clock, FileText, MessageCircle, Phone } from "lucide-react"
import { useContactInfo } from "@/components/site-settings-provider"
import { storeContactConfig } from "@/lib/store-contact-config"

export function TopBar() {
  const contact = useContactInfo()
  const brandName = contact.brandName || storeContactConfig.brandName
  const landline = contact.landline || storeContactConfig.landline
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile

  return (
    <div className="overflow-hidden bg-primary py-2 text-xs text-primary-foreground sm:text-sm">
      <div className="container mx-auto flex max-w-full flex-wrap items-center justify-between gap-2 px-3 sm:px-4">
        <div className="flex items-center gap-1">
          <span>به فروشگاه {brandName} خوش آمدید</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-4">
          <a href="/projects" className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <FileText className="w-4 h-4" />
            <span>اطلاعات پروژه‌شما</span>
          </a>
          <a href={`tel:${landline}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
            <Phone className="w-4 h-4" />
            <span dir="ltr">{landline}</span>
          </a>
          <a href={`tel:${supportPhone}`} className="hidden items-center gap-1.5 hover:text-accent transition-colors sm:flex">
            <MessageCircle className="w-4 h-4" />
            <span dir="ltr">{supportPhone}</span>
          </a>
          <div className="hidden items-center gap-1.5 md:flex">
            <Clock className="w-4 h-4" />
            <span>{contact.workingHours || "پشتیبانی فروش و پروژه"}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
