import Link from "next/link"
import { ArrowLeft, BadgeCheck, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroImageSlider } from "@/components/hero-image-slider"
import { HeroWarpBackground } from "@/components/ui/hero-warp-background"
import type { HeroSliderImage, HomepageSection } from "@/types/site-content"

const defaultTrustPoints = ["کیفیت برتر", "برندهای معتبر", "قیمت رقابتی", "پشتیبانی فنی تخصصی"]
function getTrustPoints(section?: HomepageSection | null): string[] {
  const points = section?.metadata?.trustPoints
  return Array.isArray(points) && points.length ? points.map(String).filter(Boolean) : defaultTrustPoints
}

function getHeroImages(section?: HomepageSection | null): HeroSliderImage[] {
  const rawImages = section?.metadata?.heroImages
  if (!Array.isArray(rawImages)) return []

  return rawImages
    .map((item, index) => {
      const image = item as Partial<HeroSliderImage>
      return {
        desktopUrl: typeof image.desktopUrl === "string" ? image.desktopUrl : "",
        mobileUrl: typeof image.mobileUrl === "string" ? image.mobileUrl : null,
        altText: typeof image.altText === "string" ? image.altText : `تصویر تجهیزات برق صنعتی ${index + 1}`,
        sortOrder: Number.isFinite(Number(image.sortOrder)) ? Number(image.sortOrder) : index,
        isActive: image.isActive !== false,
      }
    })
    .filter((image) => image.desktopUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

function HeroTrustBadges({ items }: { items: string[] }) {
  const icons = [ShieldCheck, BadgeCheck, Zap, Sparkles]

  return (
    <div className="grid w-full grid-cols-2 gap-2.5 lg:grid-cols-4">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length]
        return (
          <span
            key={`${item}-${index}`}
            className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-[#061a3a]/55 px-3 text-center text-xs font-semibold leading-5 text-blue-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_26px_rgba(2,8,23,0.26)] backdrop-blur-md transition hover:border-cyan-100/28 hover:bg-[#0b2a5a]/62 sm:text-sm lg:h-11 lg:px-2.5"
          >
            <Icon className="h-4 w-4 shrink-0 text-accent drop-shadow-[0_0_12px_rgba(245,130,32,0.45)]" />
            <span className="truncate">{item}</span>
          </span>
        )
      })}
    </div>
  )
}

function HeroCTAButtons({
  primaryText,
  primaryUrl,
  secondaryText,
  secondaryUrl,
}: {
  primaryText: string
  primaryUrl: string
  secondaryText: string
  secondaryUrl: string
}) {
  return (
    <div className="w-full">
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:gap-4">
        <Button
          asChild
          size="lg"
          className="h-14 rounded-2xl bg-accent px-7 text-base font-bold text-accent-foreground shadow-[0_18px_42px_rgba(245,130,32,0.36),inset_0_1px_0_rgba(255,255,255,0.26)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_24px_58px_rgba(245,130,32,0.46),inset_0_1px_0_rgba(255,255,255,0.34)] lg:h-16 lg:px-9 lg:text-lg"
        >
          <Link href={primaryUrl} aria-label={primaryText} className="flex h-full w-full items-center justify-center gap-2">
            {primaryText}
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-14 rounded-2xl border-cyan-100/28 bg-[#061a3a]/35 px-7 text-base font-semibold text-blue-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_10px_30px_rgba(2,8,23,0.22)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/46 hover:bg-[#0b2a5a]/54 hover:text-white lg:h-16 lg:px-9 lg:text-lg"
        >
          <Link href={secondaryUrl} aria-label={secondaryText} className="flex h-full w-full items-center justify-center">
            {secondaryText}
          </Link>
        </Button>
      </div>
      <p className="mt-3 flex items-center justify-center gap-2 text-center text-sm text-blue-50/72 lg:mt-6 lg:text-base">
        <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_18px_rgba(245,130,32,0.85)]" />
        مناسب خرید پروژه‌ای و تأمین تجهیزات صنعتی
      </p>
    </div>
  )
}

export function HeroSection({ section }: { section?: HomepageSection | null }) {
  const trustPoints = getTrustPoints(section)
  const title = section?.title || "راهکار حرفه‌ای برق صنعتی"
  const subtitle = section?.subtitle || "تجهیزات مطمئن برای صنعت و اتوماسیون"
  const description = section?.description || "انتخاب، استعلام و تأمین تجهیزات برق صنعتی از برندهای معتبر با پشتیبانی تخصصی الکتروساکو."
  const primaryText = section?.primaryButtonText || "مشاهده محصولات"
  const primaryUrl = section?.primaryButtonUrl || "/products"
  const secondaryText = section?.secondaryButtonText || "استعلام قیمت"
  const secondaryUrl = section?.secondaryButtonUrl || "/contact"
  const heroImages = getHeroImages(section)
  const fallbackImageUrl = section?.imageUrl || null
  const fallbackMobileImageUrl = section?.mobileImageUrl || null

  return (
    <section className="relative overflow-hidden py-5 md:py-7 lg:py-9" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-cyan-100/14 bg-[#081225] text-white shadow-[0_38px_110px_rgba(2,8,23,0.45),0_12px_34px_rgba(11,42,90,0.18)] ring-1 ring-white/8 lg:rounded-[2.5rem]">
          <HeroWarpBackground />

          <div className="pointer-events-none absolute inset-x-8 top-0 z-[1] h-px bg-gradient-to-l from-transparent via-cyan-100/56 to-transparent" />
          <div className="pointer-events-none absolute inset-y-12 right-0 z-[1] w-px bg-gradient-to-b from-transparent via-cyan-100/20 to-transparent" />
          <div className="pointer-events-none absolute inset-y-12 left-0 z-[1] w-px bg-gradient-to-b from-transparent via-blue-200/16 to-transparent" />

          <div className="relative z-10 grid min-h-[560px] items-center gap-8 px-5 py-8 sm:px-7 md:py-10 lg:min-h-[590px] lg:grid-cols-[minmax(0,0.51fr)_minmax(0,0.49fr)] lg:gap-12 lg:px-10 xl:gap-14 xl:px-12">
            <div className="relative order-1 flex flex-col items-center justify-center text-center lg:order-1 lg:items-center lg:pr-2 xl:pr-4">
              <div className="pointer-events-none absolute -inset-x-5 -inset-y-6 -z-10 rounded-[2rem] bg-[radial-gradient(circle_at_78%_26%,rgba(14,165,233,0.13),transparent_34%),linear-gradient(90deg,rgba(2,8,23,0.08),rgba(2,8,23,0.48)_42%,rgba(2,8,23,0.66))] opacity-95 blur-[1px] lg:-inset-x-8 lg:-inset-y-10" />

              <div className="mb-4 flex w-full max-w-[640px] justify-center lg:mb-5">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/35 bg-[#061a3a]/58 px-3.5 py-2 text-xs font-semibold text-orange-100 shadow-[0_10px_30px_rgba(2,8,23,0.22),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md md:text-sm">
                  <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_rgba(245,130,32,0.75)]" />
                  الکتروساکو، تأمین‌کننده تجهیزات برق صنعتی
                </div>
              </div>

              <h1 className="w-full max-w-[640px] text-balance text-3xl font-black leading-[1.32] tracking-[-0.025em] text-white drop-shadow-[0_12px_28px_rgba(2,8,23,0.48)] md:text-4xl lg:text-5xl xl:text-[3.35rem]">
                {title}
              </h1>
              <p className="mt-4 w-full max-w-[640px] text-lg font-semibold leading-8 text-cyan-50 md:text-xl lg:text-2xl">{subtitle}</p>
              {description ? <p className="mt-3 w-full max-w-[560px] text-sm leading-8 text-blue-50/78 md:text-base lg:max-w-[580px] lg:leading-9">{description}</p> : null}

              <div className="mt-6 w-full max-w-[640px]">
                <HeroTrustBadges items={trustPoints} />
              </div>

              <div className="mt-7 w-full max-w-[520px] lg:mt-8 lg:max-w-[640px]">
                <HeroCTAButtons primaryText={primaryText} primaryUrl={primaryUrl} secondaryText={secondaryText} secondaryUrl={secondaryUrl} />
              </div>
            </div>

            <div className="order-2 flex items-center justify-center lg:order-2 lg:justify-start">
              <div className="relative w-full max-w-[560px] lg:max-w-[520px] xl:max-w-[548px]">
                <HeroImageSlider
                  images={heroImages}
                  fallbackImageUrl={fallbackImageUrl}
                  fallbackMobileImageUrl={fallbackMobileImageUrl}
                  fallbackAlt={title}
                  className="mx-auto lg:mx-0 lg:-translate-x-12 xl:-translate-x-20 2xl:-translate-x-24"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
