"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, ImageIcon, ShieldCheck, SlidersHorizontal, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"
import type { HeroSliderImage } from "@/types/site-content"

type HeroImageSliderProps = {
  images: HeroSliderImage[]
  fallbackImageUrl?: string | null
  fallbackMobileImageUrl?: string | null
  fallbackAlt?: string
  className?: string
}

function normalizeImages(images: HeroSliderImage[], fallbackImageUrl?: string | null, fallbackMobileImageUrl?: string | null, fallbackAlt?: string) {
  const activeImages = images
    .filter((image) => image.isActive && image.desktopUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (activeImages.length) return activeImages
  if (fallbackImageUrl) {
    return [{ desktopUrl: fallbackImageUrl, mobileUrl: fallbackMobileImageUrl ?? null, altText: fallbackAlt ?? "تصویر هیرو", sortOrder: 0, isActive: true }]
  }
  return []
}

export function HeroImageSlider({ images, fallbackImageUrl, fallbackMobileImageUrl, fallbackAlt, className }: HeroImageSliderProps) {
  const slides = useMemo(() => normalizeImages(images, fallbackImageUrl, fallbackMobileImageUrl, fallbackAlt), [images, fallbackImageUrl, fallbackMobileImageUrl, fallbackAlt])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (slides.length <= 1 || paused) return
    const interval = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % slides.length)
    }, 5000)
    return () => window.clearInterval(interval)
  }, [slides.length, paused])

  useEffect(() => {
    setCurrentIndex(0)
    setFailedSlides({})
  }, [slides.length])

  const canNavigate = slides.length > 1
  const currentSlide = slides[currentIndex]
  const previous = () => setCurrentIndex((current) => (current - 1 + slides.length) % slides.length)
  const next = () => setCurrentIndex((current) => (current + 1) % slides.length)

  if (!slides.length) {
    return (
      <div className={cn("relative w-full max-w-[700px]", className)}>
        <div className="pointer-events-none absolute -inset-6 rounded-[3rem] bg-[radial-gradient(circle_at_35%_25%,rgba(59,130,246,0.22),transparent_45%),radial-gradient(circle_at_70%_75%,rgba(245,130,32,0.18),transparent_34%)] blur-2xl" />
        <div className="relative overflow-hidden rounded-[2.2rem] border border-white/18 bg-white/[0.09] p-3 shadow-[0_34px_95px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
          <div className="grid aspect-[4/3] grid-cols-2 gap-4 rounded-[1.45rem] bg-gradient-to-br from-white via-slate-100 to-slate-200 p-5">
            {[[Zap, "تابلو برق"], [SlidersHorizontal, "اتوماسیون"], [ShieldCheck, "حفاظت"], [ImageIcon, "تجهیزات"]].map(([Icon, label]) => {
              const LucideIcon = Icon as typeof Zap
              return (
                <div key={label as string} className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 p-4 text-primary shadow-sm">
                  <div className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                      <LucideIcon className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-bold">{label as string}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("group relative w-full max-w-[720px]", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Large ghost duplicate of the active slide. It adds the deep layered look from the reference image without changing admin data. */}
      {currentSlide && !failedSlides[currentIndex] ? (
        <div className="pointer-events-none absolute -right-24 -top-12 z-0 hidden h-[112%] w-[118%] overflow-hidden rounded-[3rem] opacity-60 mix-blend-screen blur-[0.2px] lg:block xl:-right-32 xl:w-[128%]">
          <img
            src={currentSlide.desktopUrl}
            alt=""
            aria-hidden="true"
            onError={() => setFailedSlides((previous) => ({ ...previous, [currentIndex]: true }))}
            className="h-full w-full scale-[1.34] object-contain object-right opacity-[0.22] saturate-[1.15] contrast-[1.05] transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-[#071d3d]/20 via-[#071d3d]/70 to-[#071d3d]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_45%,rgba(59,130,246,0.22),transparent_42%)]" />
        </div>
      ) : null}

      <div className="pointer-events-none absolute -inset-5 z-0 rounded-[3rem] bg-gradient-to-tr from-accent/22 via-white/6 to-blue-400/18 blur-2xl transition duration-500 group-hover:from-accent/30" />
      <div className="pointer-events-none absolute -left-8 bottom-8 z-0 h-28 w-28 rounded-full bg-accent/18 blur-2xl" />

      <div className="relative z-10 overflow-hidden rounded-[2.15rem] border border-white/22 bg-white/[0.105] p-3 shadow-[0_34px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl transition duration-500 group-hover:-translate-y-1 group-hover:border-white/34 group-hover:shadow-[0_42px_120px_rgba(0,0,0,0.5)]">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-white/75 to-transparent" />
        <div className="pointer-events-none absolute inset-y-8 right-0 w-px bg-gradient-to-b from-transparent via-white/35 to-transparent" />

        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.45rem] bg-[radial-gradient(circle_at_48%_42%,#ffffff_0%,#f4f7fb_45%,#dfe7f1_100%)] md:aspect-[16/11]">
          <div className="absolute inset-0 opacity-[0.30] [background-image:linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="absolute -right-16 top-8 h-52 w-52 rounded-full bg-blue-200/70 blur-3xl" />
          <div className="absolute -left-16 bottom-4 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />

          {slides.map((slide, index) => (
            <picture key={`${slide.desktopUrl}-${slide.sortOrder}`}>
              {slide.mobileUrl ? <source media="(max-width: 767px)" srcSet={slide.mobileUrl} /> : null}
              <img
                src={slide.desktopUrl}
                alt={slide.altText || fallbackAlt || "تصویر تجهیزات برق صنعتی"}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                onError={() => setFailedSlides((previous) => ({ ...previous, [index]: true }))}
                className={cn(
                  "absolute inset-0 h-full w-full object-contain p-1 transition-all duration-700 ease-out sm:p-2 md:p-3 lg:p-2",
                  index === currentIndex ? "scale-[1.13] opacity-100 drop-shadow-[0_24px_34px_rgba(15,23,42,0.23)]" : "scale-[1.18] opacity-0",
                  failedSlides[index] ? "hidden" : "",
                )}
              />
            </picture>
          ))}

          {failedSlides[currentIndex] ? (
            <SafeImageWithFallback
              src={null}
              altText={currentSlide?.altText || fallbackAlt || "تصویر تجهیزات برق صنعتی"}
              fallbackText={currentSlide?.altText || fallbackAlt || "تصویر تجهیزات برق صنعتی"}
              className="absolute inset-0"
            />
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-primary/16 to-transparent" />
          <div className="absolute right-4 top-4 rounded-full border border-primary/10 bg-white/78 px-3 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur-md">
            تجهیزات صنعتی
          </div>
          <div className="absolute bottom-4 left-4 rounded-full border border-accent/20 bg-accent/12 px-3 py-1.5 text-xs font-bold text-primary shadow-sm backdrop-blur-md">
            تأمین پروژه‌ای
          </div>
        </div>

        {canNavigate ? (
          <>
            <button
              type="button"
              aria-label="تصویر قبلی"
              onClick={previous}
              className="absolute right-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-primary/42 text-white shadow-lg backdrop-blur transition hover:border-accent/70 hover:bg-primary/78 focus:outline-none focus:ring-2 focus:ring-accent lg:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="تصویر بعدی"
              onClick={next}
              className="absolute left-5 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-primary/42 text-white shadow-lg backdrop-blur transition hover:border-accent/70 hover:bg-primary/78 focus:outline-none focus:ring-2 focus:ring-accent lg:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="relative z-20 mt-4 flex items-center justify-center gap-2.5">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={`${slide.desktopUrl}-dot-${slide.sortOrder}`}
              aria-label={`نمایش تصویر ${index + 1}`}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-accent/70",
                index === currentIndex ? "w-10 bg-accent shadow-[0_0_18px_rgba(245,130,32,0.65)]" : "w-2.5 bg-white/38 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      ) : (
        <div className="relative z-20 mt-4 flex justify-center">
          <span className="h-1.5 w-14 rounded-full bg-accent shadow-[0_0_18px_rgba(245,130,32,0.55)]" />
        </div>
      )}
    </div>
  )
}
