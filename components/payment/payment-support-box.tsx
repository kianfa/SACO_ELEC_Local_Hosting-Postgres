"use client"

import { Clock, Headphones, MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentResultData } from "@/lib/payment-data"
import { storeContactConfig } from "@/lib/store-contact-config"
import { useContactInfo } from "@/components/site-settings-provider"

interface PaymentSupportBoxProps {
  data: PaymentResultData
  compact?: boolean
}

export function PaymentSupportBox({ data, compact = false }: PaymentSupportBoxProps) {
  const contact = useContactInfo()
  const supportPhone = contact.supportPhone || contact.mobile || data.supportPhone || storeContactConfig.mobile
  const telegramUsername = contact.telegramUsername || data.supportMessenger
  const workingHours = contact.workingHours || data.supportHours
  return (
    <Card className="overflow-hidden rounded-3xl border-primary/15 bg-primary text-primary-foreground shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-extrabold">
          <Headphones className="h-5 w-5 text-secondary" />
          نیاز به پیگیری سفارش دارید؟
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-7 text-primary-foreground/80">
          برای پیگیری سفارش، هماهنگی ارسال یا دریافت مشاوره فنی با پشتیبانی تماس بگیرید.
        </p>

        <div className="space-y-2 rounded-2xl bg-primary-foreground/10 p-4 text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-secondary" />
            <span>{supportPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-secondary" />
            <span>{telegramUsername}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-secondary" />
            <span>{workingHours}</span>
          </div>
        </div>

        {!compact && (
          <Button asChild className="h-11 w-full rounded-xl bg-secondary font-extrabold text-secondary-foreground hover:bg-secondary/90">
            <a href={`tel:${supportPhone}`}>تماس با پشتیبانی فروش</a>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
