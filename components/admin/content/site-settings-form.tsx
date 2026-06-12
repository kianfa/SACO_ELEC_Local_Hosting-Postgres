"use client"

import { useActionState } from "react"
import { saveSiteSettingsAction } from "@/lib/actions/site-content-actions"
import type { SiteContentActionState, SiteSettingsBundle } from "@/types/site-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { AdminSubmitButton } from "@/components/admin/content/admin-submit-button"
import { ContentActionMessage } from "@/components/admin/content/content-action-message"
import { manualCheckoutExplanation, manualCheckoutHelperText, storeContactConfig } from "@/lib/store-contact-config"

const initialState: SiteContentActionState = { ok: false, message: "" }

export function SiteSettingsForm({ settings }: { settings: SiteSettingsBundle }) {
  const [state, formAction] = useActionState(saveSiteSettingsAction, initialState)
  return (
    <form action={formAction} className="space-y-6">
      <ContentActionMessage state={state} />
      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>اطلاعات تماس</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>نام فروشگاه</Label><Input name="brandName" defaultValue={settings.contactInfo.brandName ?? storeContactConfig.brandName} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>شماره تماس ثابت</Label><Input name="phone" defaultValue={settings.contactInfo.landline ?? settings.contactInfo.phone ?? storeContactConfig.landline} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>موبایل / پشتیبانی</Label><Input name="supportPhone" defaultValue={settings.contactInfo.supportPhone ?? settings.contactInfo.mobile ?? storeContactConfig.mobile} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>آیدی تلگرام</Label><Input name="telegramUsername" dir="ltr" defaultValue={settings.contactInfo.telegramUsername ?? storeContactConfig.telegram.username} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>لینک تلگرام</Label><Input name="telegramUrl" dir="ltr" defaultValue={settings.contactInfo.telegramUrl ?? storeContactConfig.telegram.url} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>شماره تلگرام</Label><Input name="telegramPhone" defaultValue={settings.contactInfo.telegramPhone ?? settings.contactInfo.supportPhone ?? storeContactConfig.mobile} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>لینک واتساپ</Label><Input name="whatsappUrl" dir="ltr" defaultValue={settings.contactInfo.whatsappUrl ?? storeContactConfig.whatsapp.url} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>ایمیل</Label><Input name="email" dir="ltr" defaultValue={settings.contactInfo.email ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>آیدی بله</Label><Input name="baleUsername" dir="ltr" defaultValue={settings.contactInfo.baleUsername ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>شماره بله</Label><Input name="balePhone" defaultValue={settings.contactInfo.balePhone ?? storeContactConfig.mobile} className="rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2"><Label>آدرس</Label><Textarea name="address" defaultValue={settings.contactInfo.address ?? ""} className="rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2"><Label>ساعات پاسخگویی</Label><Input name="workingHours" defaultValue={settings.contactInfo.workingHours ?? storeContactConfig.workingHours} className="rounded-xl" /></div>
        <div className="rounded-2xl bg-muted/40 p-4 text-sm leading-7 md:col-span-2">
          <p className="font-bold text-foreground">پیش‌نمایش داده ذخیره‌شده</p>
          <p className="text-muted-foreground">تلفن: {settings.contactInfo.landline ?? settings.contactInfo.phone ?? storeContactConfig.landline}</p>
          <p className="text-muted-foreground">پشتیبانی: {settings.contactInfo.supportPhone ?? settings.contactInfo.mobile ?? storeContactConfig.mobile}</p>
          <p className="text-muted-foreground">تلگرام: {settings.contactInfo.telegramUsername ?? storeContactConfig.telegram.username}</p>
          <p className="text-muted-foreground">آدرس: {settings.contactInfo.address ?? "هنوز ثبت نشده است"}</p>
        </div>
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>فوتر و شبکه‌های اجتماعی</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <input type="hidden" name="trustBadgeImageUrl" defaultValue={settings.footerInfo.trustBadgeImageUrl ?? ""} />
        <div className="space-y-2 md:col-span-2"><Label>توضیح کوتاه فروشگاه</Label><Textarea name="footerDescription" defaultValue={settings.footerInfo.description ?? storeContactConfig.defaultFooterDescription} className="rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2"><Label>متن کپی‌رایت</Label><Input name="copyright" defaultValue={settings.footerInfo.copyright ?? storeContactConfig.defaultCopyright} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>Instagram URL</Label><Input name="instagramUrl" dir="ltr" defaultValue={settings.footerInfo.instagramUrl ?? ""} className="rounded-xl" /><label className="flex items-center gap-2 text-sm text-muted-foreground"><Switch name="instagramIsActive" defaultChecked={settings.footerInfo.instagramIsActive ?? Boolean(settings.footerInfo.instagramUrl)} /> نمایش در فوتر</label></div>
        <div className="space-y-2"><Label>Telegram URL</Label><Input name="footerTelegramUrl" dir="ltr" defaultValue={settings.footerInfo.telegramUrl ?? storeContactConfig.telegram.url} className="rounded-xl" /><label className="flex items-center gap-2 text-sm text-muted-foreground"><Switch name="footerTelegramIsActive" defaultChecked={settings.footerInfo.telegramIsActive ?? true} /> نمایش در فوتر</label></div>
        <div className="space-y-2"><Label>Bale URL</Label><Input name="baleUrl" dir="ltr" defaultValue={settings.footerInfo.baleUrl ?? ""} className="rounded-xl" /><label className="flex items-center gap-2 text-sm text-muted-foreground"><Switch name="baleIsActive" defaultChecked={settings.footerInfo.baleIsActive ?? Boolean(settings.footerInfo.baleUrl)} /> نمایش در فوتر</label></div>
        <div className="space-y-2"><Label>LinkedIn URL</Label><Input name="linkedinUrl" dir="ltr" defaultValue={settings.footerInfo.linkedinUrl ?? ""} className="rounded-xl" /><label className="flex items-center gap-2 text-sm text-muted-foreground"><Switch name="linkedinIsActive" defaultChecked={settings.footerInfo.linkedinIsActive ?? Boolean(settings.footerInfo.linkedinUrl)} /> نمایش در فوتر</label></div>
        <div className="space-y-2 md:col-span-2"><Label>تصویر نماد/اعتماد</Label><Input name="trustBadgeImage" type="file" accept="image/jpeg,image/png,image/webp" className="rounded-xl" /></div>
        <div className="space-y-2 md:col-span-2">
          <Label>متن جایگزین تصویر اعتماد (ALT)</Label>
          <Input
            name="trustBadgeImageAltText"
            maxLength={150}
            defaultValue={settings.footerInfo.trustBadgeImageAltText ?? "نشان اعتماد ساکو الکتریک"}
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">در صورت بارگذاری‌نشدن تصویر، این متن به‌صورت جایگزین نمایش داده می‌شود.</p>
        </div>
      </CardContent></Card>

      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>متن پرداخت دستی</CardTitle></CardHeader><CardContent className="space-y-4">
        <div className="space-y-2"><Label>توضیح تلگرام/واتساپ/بله/روبیکا</Label><Textarea name="manualExplanationText" defaultValue={settings.manualCheckout.explanationText ?? manualCheckoutExplanation} className="min-h-28 rounded-xl" /></div>
        <div className="space-y-2"><Label>متن کوتاه کنار دکمه‌ها</Label><Textarea name="manualHelperText" defaultValue={settings.manualCheckout.helperText ?? manualCheckoutHelperText} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>مراحل کارت‌به‌کارت</Label><Textarea name="cardToCardInstructionText" defaultValue={settings.manualCheckout.cardToCardInstructionText ?? ""} className="min-h-32 rounded-xl" /></div>
        <div className="space-y-2"><Label>متن غیرفعال بودن پرداخت اینترنتی</Label><Textarea name="onlinePaymentDisabledText" defaultValue={settings.manualCheckout.onlinePaymentDisabledText ?? ""} className="rounded-xl" /></div>
      </CardContent></Card>

      <div className="sticky bottom-4 flex justify-end rounded-2xl border bg-card/95 p-3 shadow-lg backdrop-blur sm:p-4 [&_button]:w-full sm:[&_button]:w-auto"><AdminSubmitButton>ذخیره تنظیمات سایت</AdminSubmitButton></div>
    </form>
  )
}
