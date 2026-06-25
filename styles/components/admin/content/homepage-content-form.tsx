"use client"

import { useActionState } from "react"
import { saveHomepageContentAction } from "@/lib/actions/site-content-actions"
import type { HeroSliderImage, HomepageSection, SiteContentActionState } from "@/types/site-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"
import { AdminSubmitButton } from "@/components/admin/content/admin-submit-button"
import { ContentActionMessage } from "@/components/admin/content/content-action-message"

const initialState: SiteContentActionState = { ok: false, message: "" }

function findSection(sections: HomepageSection[], key: string) {
  return sections.find((section) => section.sectionKey === key)
}

function trustPointsText(section?: HomepageSection) {
  const points = section?.metadata?.trustPoints
  return Array.isArray(points) ? points.join("\n") : "کیفیت برتر\nبرندهای معتبر\nقیمت رقابتی\nپشتیبانی فنی تخصصی"
}

function getHeroSlides(section?: HomepageSection): HeroSliderImage[] {
  const rawSlides = section?.metadata?.heroImages
  const slides = Array.isArray(rawSlides) ? rawSlides : []

  return Array.from({ length: 4 }).map((_, index) => {
    const raw = slides.find((item) => Number((item as Partial<HeroSliderImage>).sortOrder) === index) ?? slides[index]
    const slide = raw as Partial<HeroSliderImage> | undefined
    return {
      desktopUrl: typeof slide?.desktopUrl === "string" ? slide.desktopUrl : "",
      mobileUrl: typeof slide?.mobileUrl === "string" ? slide.mobileUrl : "",
      altText: typeof slide?.altText === "string" ? slide.altText : `تصویر تجهیزات برق صنعتی ${index + 1}`,
      sortOrder: index,
      isActive: slide?.isActive !== false,
    }
  })
}

function ImagePreview({ url, label }: { url?: string | null; label: string }) {
  return (
    <SafeImageWithFallback
      src={url}
      altText={label}
      fallbackText={label}
      objectFit="cover"
      className="aspect-video w-full rounded-xl border bg-muted"
    />
  )
}

export function HomepageContentForm({ sections }: { sections: HomepageSection[] }) {
  const [state, formAction] = useActionState(saveHomepageContentAction, initialState)
  const hero = findSection(sections, "hero")
  const promo = findSection(sections, "promo_banner")
  const notice = findSection(sections, "homepage_notice")
  const heroSlides = getHeroSlides(hero)

  return (
    <form action={formAction} className="space-y-6">
      <ContentActionMessage state={state} />

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>Hero صفحه اصلی</CardTitle>
          <CardDescription>متن، دکمه‌ها، نکات اعتماد و تصاویر اسلایدر هیرو را مدیریت کنید.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="heroImageUrl" defaultValue={hero?.imageUrl ?? ""} />
          <input type="hidden" name="heroMobileImageUrl" defaultValue={hero?.mobileImageUrl ?? ""} />
          <div className="space-y-2 md:col-span-2">
            <Label>عنوان اصلی</Label>
            <Input name="heroTitle" required defaultValue={hero?.title ?? "راهکار حرفه‌ای برق صنعتی"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>زیرعنوان</Label>
            <Input name="heroSubtitle" defaultValue={hero?.subtitle ?? "تجهیزات مطمئن برای صنعت و اتوماسیون"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>فعال</Label>
            <div className="flex h-10 items-center gap-3"><Switch name="heroIsActive" defaultChecked={hero?.isActive ?? true} /> <span className="text-sm text-muted-foreground">نمایش در سایت</span></div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>توضیح کوتاه</Label>
            <Textarea name="heroDescription" defaultValue={hero?.description ?? ""} className="min-h-24 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>متن دکمه اصلی</Label>
            <Input name="heroPrimaryButtonText" defaultValue={hero?.primaryButtonText ?? "مشاهده محصولات"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>لینک دکمه اصلی</Label>
            <Input name="heroPrimaryButtonUrl" dir="ltr" defaultValue={hero?.primaryButtonUrl ?? "/products"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>متن دکمه دوم</Label>
            <Input name="heroSecondaryButtonText" defaultValue={hero?.secondaryButtonText ?? "استعلام قیمت"} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>لینک دکمه دوم</Label>
            <Input name="heroSecondaryButtonUrl" dir="ltr" defaultValue={hero?.secondaryButtonUrl ?? "/checkout"} className="rounded-xl" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>نکات اعتماد، هر مورد در یک خط</Label>
            <Textarea name="heroTrustPoints" defaultValue={trustPointsText(hero)} className="min-h-28 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>تصویر قدیمی دسکتاپ hero، برای سازگاری</Label>
            <Input name="heroImage" type="file" accept="image/*" className="rounded-xl" />
            {hero?.imageUrl ? <p className="break-all text-xs text-muted-foreground" dir="ltr">{hero.imageUrl}</p> : null}
          </div>
          <div className="space-y-2">
            <Label>تصویر قدیمی موبایل hero، برای سازگاری</Label>
            <Input name="heroMobileImage" type="file" accept="image/*" className="rounded-xl" />
            {hero?.mobileImageUrl ? <p className="break-all text-xs text-muted-foreground" dir="ltr">{hero.mobileImageUrl}</p> : null}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>تصاویر اسلایدر هیرو</CardTitle>
          <CardDescription>تا ۴ تصویر برای هیرو آپلود کنید. اگر فقط یک تصویر فعال باشد، اسلایدر ثابت نمایش داده می‌شود.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {heroSlides.map((slide, index) => {
            const slideNumber = index + 1
            return (
              <div key={slideNumber} className="space-y-4 rounded-2xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant="secondary" className="rounded-full">تصویر {slideNumber}</Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch name={`heroSlide${slideNumber}IsActive`} defaultChecked={slide.isActive} />
                    فعال
                  </div>
                </div>

                <input type="hidden" name={`heroSlide${slideNumber}DesktopUrl`} defaultValue={slide.desktopUrl} />
                <input type="hidden" name={`heroSlide${slideNumber}MobileUrl`} defaultValue={slide.mobileUrl ?? ""} />
                <input type="hidden" name={`heroSlide${slideNumber}SortOrder`} defaultValue={index} />

                <div className="space-y-2">
                  <Label>پیش‌نمایش دسکتاپ</Label>
                  <ImagePreview url={slide.desktopUrl} label={`تصویر دسکتاپ ${slideNumber}`} />
                  <Input name={`heroSlide${slideNumber}Desktop`} type="file" accept="image/*" className="rounded-xl" />
                  {slide.desktopUrl ? <p className="break-all text-[10px] text-muted-foreground" dir="ltr">{slide.desktopUrl}</p> : null}
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox name={`heroSlide${slideNumber}ClearDesktop`} /> حذف تصویر دسکتاپ
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>پیش‌نمایش موبایل</Label>
                  <ImagePreview url={slide.mobileUrl} label={`تصویر موبایل ${slideNumber}`} />
                  <Input name={`heroSlide${slideNumber}Mobile`} type="file" accept="image/*" className="rounded-xl" />
                  {slide.mobileUrl ? <p className="break-all text-[10px] text-muted-foreground" dir="ltr">{slide.mobileUrl}</p> : null}
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox name={`heroSlide${slideNumber}ClearMobile`} /> حذف تصویر موبایل
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>متن جایگزین تصویر</Label>
                  <Input
                    name={`heroSlide${slideNumber}AltText`}
                    maxLength={150}
                    defaultValue={slide.altText ?? `تصویر تجهیزات برق صنعتی ${slideNumber}`}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">متن ALT کوتاه و توصیفی وارد کنید؛ مثال: PLC دلتا مناسب اتوماسیون صنعتی</p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle>بنر تبلیغاتی صفحه اصلی</CardTitle></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="promoImageUrl" defaultValue={promo?.imageUrl ?? ""} />
          <div className="space-y-2"><Label>عنوان بنر</Label><Input name="promoTitle" defaultValue={promo?.title ?? "فروش ویژه تجهیزات برق صنعتی"} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>زیرعنوان</Label><Input name="promoSubtitle" defaultValue={promo?.subtitle ?? "تخفیف‌های استثنایی مخصوص پروژه‌ها و خریداران عمده"} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>متن Badge</Label><Input name="promoBadgeText" defaultValue={String(promo?.metadata?.badgeText ?? "تا ۲۰٪ تخفیف پروژه‌ای")} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>متن دکمه</Label><Input name="promoButtonText" defaultValue={promo?.primaryButtonText ?? "مشاهده پیشنهادها"} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>لینک دکمه</Label><Input name="promoButtonUrl" dir="ltr" defaultValue={promo?.primaryButtonUrl ?? "/products"} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>فعال</Label><div className="flex h-10 items-center gap-3"><Switch name="promoIsActive" defaultChecked={promo?.isActive ?? true} /><span className="text-sm text-muted-foreground">نمایش بنر</span></div></div>
          <div className="space-y-2 md:col-span-2"><Label>توضیح</Label><Textarea name="promoDescription" defaultValue={promo?.description ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2 md:col-span-2"><Label>تصویر بنر</Label><Input name="promoImage" type="file" accept="image/jpeg,image/png,image/webp" className="rounded-xl" /></div>
          <div className="space-y-2 md:col-span-2">
            <Label>متن ALT تصویر بنر</Label>
            <Input
              name="promoImageAltText"
              maxLength={150}
              defaultValue={String(promo?.metadata?.imageAltText ?? promo?.title ?? "بنر الکتروساکو")}
              className="rounded-xl"
            />
            <p className="text-xs text-muted-foreground">برای دسترس‌پذیری، سئو و نمایش جایگزین در صورت خطای تصویر استفاده می‌شود.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm">
        <CardHeader><CardTitle>اعلان کوچک صفحه اصلی</CardTitle></CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <input type="hidden" name="noticeImageUrl" defaultValue={notice?.imageUrl ?? ""} />
          <div className="space-y-2"><Label>عنوان</Label><Input name="noticeTitle" defaultValue={notice?.title ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>متن دکمه</Label><Input name="noticeButtonText" defaultValue={notice?.primaryButtonText ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>لینک</Label><Input name="noticeButtonUrl" dir="ltr" defaultValue={notice?.primaryButtonUrl ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2"><Label>فعال</Label><div className="flex h-10 items-center gap-3"><Switch name="noticeIsActive" defaultChecked={notice?.isActive ?? false} /><span className="text-sm text-muted-foreground">نمایش اعلان</span></div></div>
          <div className="space-y-2 md:col-span-2"><Label>توضیح</Label><Textarea name="noticeDescription" defaultValue={notice?.description ?? ""} className="rounded-xl" /></div>
          <div className="space-y-2 md:col-span-2"><Label>تصویر اختیاری</Label><Input name="noticeImage" type="file" accept="image/*" className="rounded-xl" /></div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 z-10 flex justify-end rounded-2xl border bg-card/95 p-4 shadow-lg backdrop-blur">
        <AdminSubmitButton>ذخیره محتوای صفحه اصلی</AdminSubmitButton>
      </div>
    </form>
  )
}
