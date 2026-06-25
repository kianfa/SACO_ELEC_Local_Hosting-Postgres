import Link from "next/link"
import { ArrowLeft, BadgeCheck, ChevronLeft, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroImageSlider } from "@/components/hero-image-slider"
import { HeroWarpBackground } from "@/components/ui/hero-warp-background"
import type { HeroSliderImage, HomepageSection } from "@/types/site-content"

const defaultTrustPoints = ["کیفیت برتر", "برندهای معتبر", "قیمت رقابتی", "پشتیبانی فنی"]

function getTrustPoints(section?: HomepageSection | null): string[] {
  const points = section?.metadata?.trustPoints
  return Array.isArray(points) && points.length
    ? points
        .map(String)
        .map((point) => (point === ["پشتیبانی", "فنی", "تخصصی"].join(" ") ? "پشتیبانی فنی" : point))
        .filter(Boolean)
    : defaultTrustPoints
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
    <div className="mx-auto grid w-full max-w-[300px] grid-cols-2 gap-2 sm:max-w-[340px] lg:max-w-none lg:grid-cols-4 lg:gap-3 xl:gap-4">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length]
        return (
          <span
            key={`${item}-${index}`}
            className="flex h-9 min-w-0 items-center justify-center gap-1 rounded-2xl border border-white/12 bg-[#061a3a]/55 px-2 text-center text-xs font-semibold leading-5 text-blue-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_12px_26px_rgba(2,8,23,0.26)] backdrop-blur-md transition hover:border-cyan-100/28 hover:bg-[#0b2a5a]/62 sm:h-11 sm:gap-2 sm:px-3 sm:text-sm lg:h-14 lg:px-4 xl:h-12 xl:px-5"
          >
            <Icon className="h-3.5 w-3.5 shrink-0 text-accent drop-shadow-[0_0_12px_rgba(245,130,32,0.45)] sm:h-4 sm:w-4" />
            <span className="min-w-0 leading-5">{item}</span>
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
          className="h-[58px] min-h-[58px] rounded-2xl bg-accent px-9 py-4 text-base font-bold text-accent-foreground shadow-[0_18px_42px_rgba(245,130,32,0.36),inset_0_1px_0_rgba(255,255,255,0.26)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_24px_58px_rgba(245,130,32,0.46),inset_0_1px_0_rgba(255,255,255,0.34)] lg:h-16 lg:px-9 lg:text-lg"
        >
          <Link href={primaryUrl} aria-label={primaryText} className="flex min-h-[58px] w-full items-center justify-center gap-2 lg:min-h-0 lg:h-full">
            {primaryText}
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-[58px] min-h-[58px] rounded-2xl border-cyan-100/28 bg-[#061a3a]/35 px-9 py-4 text-base font-semibold text-blue-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_10px_30px_rgba(2,8,23,0.22)] backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-cyan-100/46 hover:bg-[#0b2a5a]/54 hover:text-white lg:h-16 lg:px-9 lg:text-lg"
        >
          <Link href={secondaryUrl} aria-label={secondaryText} className="flex min-h-[58px] w-full items-center justify-center lg:min-h-0 lg:h-full">
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
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-blue-300/25 bg-[#061328] text-white shadow-[0_34px_100px_rgba(4,13,31,0.34)] ring-1 ring-white/5 lg:rounded-[2.5rem]" data-visible-homepage-hero="warp-shader-active">
          <HeroWarpBackground />

          <div className="relative z-10 grid min-h-[520px] items-center gap-8 px-5 py-7 sm:px-7 md:py-9 lg:min-h-[540px] lg:grid-cols-[0.45fr_0.55fr] lg:gap-8 lg:px-10 xl:px-12">
            <div className="order-1 flex flex-col justify-center lg:order-1">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3.5 py-2 text-xs font-semibold text-accent shadow-[0_10px_30px_rgba(245,130,32,0.08)] backdrop-blur-md md:text-sm">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_rgba(245,130,32,0.8)]" />
                الکتروساکو، تأمین‌کننده تجهیزات برق صنعتی
              </div>

              <h1 className="max-w-2xl text-balance text-3xl font-black leading-[1.32] tracking-tight text-white md:text-4xl lg:text-5xl xl:text-[3.35rem]">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-white/90 md:text-xl lg:text-2xl">{subtitle}</p>
              {description ? <p className="mt-3 max-w-lg text-sm leading-8 text-white/74 md:text-base">{description}</p> : null}

              <div className="mt-6 w-full max-w-[640px] lg:max-w-[720px]">
                <HeroTrustBadges items={trustPoints} />
              </div>

              <div className="mt-7 w-full max-w-[520px] lg:mt-8 lg:max-w-[720px]">
                <HeroCTAButtons primaryText={primaryText} primaryUrl={primaryUrl} secondaryText={secondaryText} secondaryUrl={secondaryUrl} />
              </div>
            </div>

            <div className="order-2 flex items-center justify-center lg:order-2 lg:-mr-3 xl:-mr-6">
              <div className="relative w-full max-w-[730px]">
                <div className="absolute -right-4 top-12 hidden rounded-2xl border border-white/12 bg-white/[0.08] px-3 py-2 text-xs font-semibold text-white/80 shadow-xl backdrop-blur-md lg:block">
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-accent" />
                  آماده تأمین پروژه‌ای
                </div>
                <div className="absolute -left-3 bottom-16 hidden rounded-2xl border border-white/12 bg-white/[0.08] px-3 py-2 text-xs font-semibold text-white/80 shadow-xl backdrop-blur-md lg:block">
                  مشاوره فنی تخصصی
                  <ChevronLeft className="mr-1 inline h-3.5 w-3.5 text-accent" />
                </div>
                <HeroImageSlider
                  images={heroImages}
                  fallbackImageUrl={fallbackImageUrl}
                  fallbackMobileImageUrl={fallbackMobileImageUrl}
                  fallbackAlt={title}
                  className="mx-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
