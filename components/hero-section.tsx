import Link from "next/link"
import { ArrowLeft, BadgeCheck, ChevronLeft, ShieldCheck, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HeroImageSlider } from "@/components/hero-image-slider"
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
    <div className="flex flex-wrap gap-2.5">
      {items.map((item, index) => {
        const Icon = icons[index % icons.length]
        return (
          <span
            key={`${item}-${index}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.08] px-3.5 py-2 text-xs font-medium text-white/85 shadow-sm backdrop-blur-md transition hover:border-accent/40 hover:bg-white/[0.12] md:text-sm"
          >
            <Icon className="h-4 w-4 text-accent" />
            {item}
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          asChild
          size="lg"
          className="h-12 rounded-2xl bg-accent px-6 text-base font-bold text-accent-foreground shadow-[0_18px_45px_rgba(245,130,32,0.28)] transition hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-[0_22px_55px_rgba(245,130,32,0.35)]"
        >
          <Link href={primaryUrl} aria-label={primaryText}>
            {primaryText}
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 rounded-2xl border-white/25 bg-white/[0.06] px-6 text-base font-semibold text-white shadow-sm backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/45 hover:bg-white/12 hover:text-white"
        >
          <Link href={secondaryUrl} aria-label={secondaryText}>{secondaryText}</Link>
        </Button>
      </div>
      <p className="flex items-center gap-2 text-sm text-white/65">
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
  const description = section?.description || "انتخاب، استعلام و تأمین تجهیزات برق صنعتی از برندهای معتبر با پشتیبانی تخصصی ساکو الکتریک."
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
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-blue-300/25 bg-[#061328] text-white shadow-[0_34px_100px_rgba(4,13,31,0.34)] ring-1 ring-white/5 lg:rounded-[2.5rem]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(245,130,32,0.20),transparent_29%),radial-gradient(circle_at_42%_35%,rgba(59,130,246,0.24),transparent_34%),linear-gradient(135deg,#041026_0%,#08224a_48%,#0d2b58_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,16,38,0.08)_0%,rgba(5,18,42,0.54)_48%,rgba(4,13,31,0.94)_100%)]" />
          <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
          <div className="absolute inset-0 opacity-[0.12] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.45)_1px,transparent_1.5px)] [background-size:22px_22px]" />
          <div className="absolute inset-y-0 right-0 w-2/3 bg-[radial-gradient(circle_at_72%_50%,rgba(15,67,132,0.55),transparent_48%)]" />
          <div className="absolute -right-24 top-12 h-80 w-80 rounded-full bg-accent/18 blur-3xl" />
          <div className="absolute -bottom-28 left-5 h-96 w-96 rounded-full bg-blue-400/18 blur-3xl" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-white/45 to-transparent" />

          <div className="relative grid min-h-[520px] items-center gap-8 px-5 py-7 sm:px-7 md:py-9 lg:min-h-[540px] lg:grid-cols-[0.45fr_0.55fr] lg:gap-8 lg:px-10 xl:px-12">
            <div className="order-1 flex flex-col justify-center lg:order-1">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3.5 py-2 text-xs font-semibold text-accent shadow-[0_10px_30px_rgba(245,130,32,0.08)] backdrop-blur-md md:text-sm">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_16px_rgba(245,130,32,0.8)]" />
                ساکو الکتریک، تأمین‌کننده تجهیزات برق صنعتی
              </div>

              <h1 className="max-w-2xl text-balance text-3xl font-black leading-[1.35] tracking-tight text-white md:text-4xl lg:text-5xl xl:text-[3.35rem]">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-lg font-semibold leading-8 text-white/90 md:text-xl lg:text-2xl">{subtitle}</p>
              {description ? <p className="mt-4 max-w-xl text-sm leading-8 text-white/74 md:text-base">{description}</p> : null}

              <div className="mt-6">
                <HeroTrustBadges items={trustPoints} />
              </div>

              <div className="mt-7">
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
