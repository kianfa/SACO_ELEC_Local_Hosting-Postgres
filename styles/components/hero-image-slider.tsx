"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react"
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

type StagePanelSlot = "left" | "center" | "right"
type StageIncomingSlot = "incomingLeft" | "incomingRight"
type StagePanelRenderSlot = StagePanelSlot | StageIncomingSlot
type StagePanelPosition =
  | "left"
  | "center"
  | "right"
  | "leftExit"
  | "rightExit"
  | "incomingLeft"
  | "incomingRight"
type StageMotionDirection = "next" | "previous"

const STAGE_ROTATION_DURATION_MS = 600
const DEFAULT_STAGE_POSITIONS: Record<StagePanelSlot, StagePanelPosition> = {
  left: "left",
  center: "center",
  right: "right",
}
const ANIMATED_STAGE_POSITIONS: Record<
  StageMotionDirection,
  Record<StagePanelSlot, StagePanelPosition>
> = {
  next: {
    left: "leftExit",
    center: "left",
    right: "center",
  },
  previous: {
    left: "center",
    center: "right",
    right: "rightExit",
  },
}
const INCOMING_STAGE_PANELS: Record<
  StageMotionDirection,
  {
    slot: StageIncomingSlot
    initialPosition: StagePanelPosition
    animatedPosition: StagePanelPosition
    getSlideIndexOffset: number
  }
> = {
  next: {
    slot: "incomingRight",
    initialPosition: "incomingRight",
    animatedPosition: "right",
    getSlideIndexOffset: 2,
  },
  previous: {
    slot: "incomingLeft",
    initialPosition: "incomingLeft",
    animatedPosition: "left",
    getSlideIndexOffset: -2,
  },
}

function normalizeImages(
  images: HeroSliderImage[],
  fallbackImageUrl?: string | null,
  fallbackMobileImageUrl?: string | null,
  fallbackAlt?: string,
) {
  const activeImages = images
    .filter((image) => image.isActive && image.desktopUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  if (activeImages.length) return activeImages
  if (fallbackImageUrl) {
    return [
      {
        desktopUrl: fallbackImageUrl,
        mobileUrl: fallbackMobileImageUrl ?? null,
        altText: fallbackAlt ?? "تصویر هیرو",
        sortOrder: 0,
        isActive: true,
      },
    ]
  }
  return []
}

function HeroPanelPlaceholder({ compact = false }: { compact?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(150deg,rgba(248,250,252,0.98),rgba(226,232,240,0.95)_56%,rgba(203,213,225,0.96))] p-5">
      <div className="text-center text-slate-600">
        <div
          className={cn(
            "mx-auto mb-3 flex items-center justify-center rounded-2xl bg-slate-200 text-slate-500 shadow-inner",
            compact ? "h-11 w-11" : "h-16 w-16",
          )}
        >
          <ImageIcon className={cn(compact ? "h-6 w-6" : "h-8 w-8")} />
        </div>
        <span className={cn("font-bold", compact ? "text-[11px]" : "text-sm")}>
          تصویر تجهیزات برق صنعتی
        </span>
      </div>
    </div>
  )
}

function HeroStagePanel({
  slot,
  position,
  slide,
  slideIndex,
  fallbackAlt,
  failed,
  isTransitioning = false,
  isResetting = false,
  onImageError,
}: {
  slot: StagePanelRenderSlot
  position: StagePanelPosition
  slide?: HeroSliderImage
  slideIndex: number
  fallbackAlt?: string
  failed?: boolean
  isTransitioning?: boolean
  isResetting?: boolean
  onImageError: (index: number) => void
}) {
  const isCenter = position === "center"
  const isPeripheral = !isCenter
  const panelAlt = slide?.altText || fallbackAlt || "تصویر تجهیزات برق صنعتی"

  return (
    <div
      className={cn(
        "hero-stage-panel absolute left-1/2 top-1/2 h-[300px] w-[76%] max-w-[430px] overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,rgba(219,234,254,0.24),rgba(125,211,252,0.09)_46%,rgba(255,255,255,0.10)_100%)] p-px shadow-[0_30px_78px_rgba(2,8,23,0.50)] will-change-transform sm:h-[350px] sm:w-[66%] md:h-[372px] lg:h-[392px] lg:max-w-[462px]",
        `hero-stage-panel--${position}`,
        isResetting ? "hero-stage-panel--resetting" : null,
        isCenter && !isTransitioning ? "hero-product-float" : null,
      )}
      aria-hidden={!isCenter}
      data-slot={slot}
    >
      <div
        className={cn(
          "relative h-full overflow-hidden border border-cyan-100/14 bg-[linear-gradient(145deg,rgba(7,22,45,0.84),rgba(6,26,58,0.58)_56%,rgba(8,18,37,0.80))] shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-20px_48px_rgba(2,8,23,0.38)] backdrop-blur-xl",
          isCenter ? "rounded-[1.7rem] p-2 md:p-2.5" : "rounded-[1.7rem] p-1.5",
        )}
      >
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-l from-transparent via-cyan-100/58 to-transparent" />
        <div className="pointer-events-none absolute -right-10 top-4 h-32 w-32 rounded-full bg-cyan-300/7 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 bottom-2 h-36 w-36 rounded-full bg-blue-500/7 blur-2xl" />

        <div
          className={cn(
            "relative h-full overflow-hidden rounded-[1.35rem]",
            isCenter
              ? "border border-transparent bg-transparent shadow-none"
              : "border border-white/[0.12] bg-[linear-gradient(150deg,rgba(248,250,252,0.98),rgba(226,232,240,0.95)_56%,rgba(203,213,225,0.96))] shadow-[inset_0_1px_0_rgba(255,255,255,0.78),inset_0_-24px_58px_rgba(15,23,42,0.10)]",
          )}
        >
          {isPeripheral ? (
            <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_42%_24%,rgba(255,255,255,0.46),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.08),transparent_50%,rgba(15,23,42,0.08))]" />
          ) : null}
          {isPeripheral ? (
            <div className="pointer-events-none absolute z-0 rounded-full bg-slate-900/18 blur-2xl inset-x-[12%] bottom-8 h-8" />
          ) : null}
          {isPeripheral ? (
            <div className="pointer-events-none absolute z-0 rounded-full bg-cyan-950/10 blur-md inset-x-[22%] bottom-11 h-2" />
          ) : null}

          {slide && !failed ? (
            <picture>
              {slide.mobileUrl ? (
                <source media="(max-width: 767px)" srcSet={slide.mobileUrl} />
              ) : null}
              <img
                src={slide.desktopUrl}
                alt={panelAlt}
                loading={isCenter ? "eager" : "lazy"}
                decoding="async"
                onError={() => onImageError(slideIndex)}
                className={cn(
                  "absolute inset-0 z-10 h-full w-full origin-center object-contain",
                  isResetting
                    ? "transition-none"
                    : "transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isCenter
                    ? "scale-[1.22] p-0 opacity-100 drop-shadow-[0_30px_26px_rgba(15,23,42,0.34)]"
                    : "scale-[1.04] p-3 opacity-90 saturate-[0.92] drop-shadow-[0_20px_20px_rgba(15,23,42,0.24)]",
                )}
              />
            </picture>
          ) : failed ? (
            <SafeImageWithFallback
              src={null}
              altText={panelAlt}
              fallbackText={panelAlt}
              className="absolute inset-0"
              fallbackClassName="bg-transparent"
            />
          ) : (
            <HeroPanelPlaceholder compact={isPeripheral} />
          )}

          {isPeripheral ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-16 bg-gradient-to-t from-slate-900/14 to-transparent" />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function HeroImageSlider({
  images,
  fallbackImageUrl,
  fallbackMobileImageUrl,
  fallbackAlt,
  className,
}: HeroImageSliderProps) {
  const slides = useMemo(
    () =>
      normalizeImages(
        images,
        fallbackImageUrl,
        fallbackMobileImageUrl,
        fallbackAlt,
      ),
    [images, fallbackImageUrl, fallbackMobileImageUrl, fallbackAlt],
  )
  const normalizeSlideIndex = useCallback(
    (index: number) =>
      slides.length ? (index + slides.length) % slides.length : 0,
    [slides.length],
  )
  const getPanelIndexes = useCallback(
    (index: number): Record<StagePanelSlot, number> => ({
      left: normalizeSlideIndex(index - 1),
      center: normalizeSlideIndex(index),
      right: normalizeSlideIndex(index + 1),
    }),
    [normalizeSlideIndex],
  )
  const [currentIndex, setCurrentIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isAnimatingStage, setIsAnimatingStage] = useState(false)
  const [isResettingStage, setIsResettingStage] = useState(false)
  const [stageMotionDirection, setStageMotionDirection] =
    useState<StageMotionDirection | null>(null)
  const [stagedIncomingDirection, setStagedIncomingDirection] =
    useState<StageMotionDirection | null>(null)
  const targetIndexRef = useRef(0)
  const stageStartRafRef = useRef<number | null>(null)
  const stageTransitionTimeoutRef = useRef<number | null>(null)
  const stageResetRafRef = useRef<number | null>(null)
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({})
  const panelIndexes = useMemo(
    () => getPanelIndexes(currentIndex),
    [currentIndex, getPanelIndexes],
  )
  const panelPositions = stageMotionDirection
    ? ANIMATED_STAGE_POSITIONS[stageMotionDirection]
    : DEFAULT_STAGE_POSITIONS
  const incomingStagePanel = stagedIncomingDirection
    ? INCOMING_STAGE_PANELS[stagedIncomingDirection]
    : null
  const incomingStagePosition = incomingStagePanel
    ? stageMotionDirection === stagedIncomingDirection
      ? incomingStagePanel.animatedPosition
      : incomingStagePanel.initialPosition
    : null
  const incomingSlideIndex = incomingStagePanel
    ? normalizeSlideIndex(
        currentIndex + incomingStagePanel.getSlideIndexOffset,
      )
    : 0

  const clearStageTimers = useCallback(() => {
    if (stageStartRafRef.current) {
      window.cancelAnimationFrame(stageStartRafRef.current)
      stageStartRafRef.current = null
    }

    if (stageTransitionTimeoutRef.current) {
      window.clearTimeout(stageTransitionTimeoutRef.current)
      stageTransitionTimeoutRef.current = null
    }

    if (stageResetRafRef.current) {
      window.cancelAnimationFrame(stageResetRafRef.current)
      stageResetRafRef.current = null
    }
  }, [])

  const resetStageInstantly = useCallback(
    (index: number) => {
      setIsResettingStage(true)
      setIsAnimatingStage(false)
      setStageMotionDirection(null)
      setStagedIncomingDirection(null)
      setCurrentIndex(normalizeSlideIndex(index))

      stageResetRafRef.current = window.requestAnimationFrame(() => {
        stageResetRafRef.current = window.requestAnimationFrame(() => {
          setIsResettingStage(false)
          stageResetRafRef.current = null
        })
      })
    },
    [normalizeSlideIndex],
  )

  const rotateStage = useCallback(
    (targetIndex: number, direction: StageMotionDirection) => {
      if (!slides.length || isAnimatingStage) return

      const normalizedTargetIndex = normalizeSlideIndex(targetIndex)
      if (normalizedTargetIndex === currentIndex) return

      clearStageTimers()
      targetIndexRef.current = normalizedTargetIndex
      setIsResettingStage(false)
      setIsAnimatingStage(true)
      setStageMotionDirection(null)
      setStagedIncomingDirection(direction)

      stageStartRafRef.current = window.requestAnimationFrame(() => {
        stageStartRafRef.current = window.requestAnimationFrame(() => {
          stageStartRafRef.current = null
          setStageMotionDirection(direction)

          stageTransitionTimeoutRef.current = window.setTimeout(() => {
            resetStageInstantly(targetIndexRef.current)
            stageTransitionTimeoutRef.current = null
          }, STAGE_ROTATION_DURATION_MS)
        })
      })
    },
    [
      clearStageTimers,
      currentIndex,
      isAnimatingStage,
      normalizeSlideIndex,
      resetStageInstantly,
      slides.length,
    ],
  )

  useEffect(() => {
    if (slides.length <= 1 || paused || isAnimatingStage) return
    const interval = window.setInterval(() => {
      rotateStage(currentIndex + 1, "next")
    }, 5400)
    return () => window.clearInterval(interval)
  }, [currentIndex, isAnimatingStage, paused, rotateStage, slides.length])

  useEffect(() => {
    clearStageTimers()
    targetIndexRef.current = 0
    setCurrentIndex(0)
    setStageMotionDirection(null)
    setStagedIncomingDirection(null)
    setIsAnimatingStage(false)
    setIsResettingStage(false)
    setFailedSlides({})
  }, [clearStageTimers, slides.length])

  useEffect(() => {
    return () => {
      clearStageTimers()
    }
  }, [clearStageTimers])

  const canNavigate = slides.length > 1
  const previous = () => rotateStage(currentIndex - 1, "previous")
  const next = () => rotateStage(currentIndex + 1, "next")
  const selectSlide = (index: number) => {
    if (index === currentIndex || isAnimatingStage) return
    const forwardDistance =
      (index - currentIndex + slides.length) % slides.length
    const backwardDistance =
      (currentIndex - index + slides.length) % slides.length
    rotateStage(
      index,
      forwardDistance <= backwardDistance ? "next" : "previous",
    )
  }
  const markSlideFailed = (index: number) =>
    setFailedSlides((previousFailed) => ({ ...previousFailed, [index]: true }))

  return (
    <div
      className={cn(
        "group relative w-full max-w-[620px] overflow-visible",
        className,
      )}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute -inset-x-1 -inset-y-5 z-0 rounded-[2.35rem] bg-[radial-gradient(circle_at_38%_34%,rgba(125,211,252,0.14),transparent_42%),radial-gradient(circle_at_68%_76%,rgba(245,130,32,0.08),transparent_34%)] blur-xl transition duration-500 group-hover:opacity-90 sm:-inset-x-5" />
      <div className="pointer-events-none absolute inset-x-[18%] -bottom-7 z-0 h-14 rounded-full bg-black/58 blur-2xl" />
      <div className="pointer-events-none absolute inset-x-[30%] -bottom-2 z-0 h-3 rounded-full bg-cyan-100/16 blur-lg" />

      <div className="relative z-10 mx-auto flex min-h-[338px] w-full items-center justify-center overflow-visible [perspective:1400px] sm:min-h-[420px] md:min-h-[440px] lg:min-h-[460px]">
        <div className="relative h-full w-full overflow-visible [transform-style:preserve-3d]">
          {(["left", "center", "right"] as const).map((slot) => {
            const slideIndex = panelIndexes[slot]
            return (
              <HeroStagePanel
                key={`hero-stage-panel-${slot}`}
                slot={slot}
                position={panelPositions[slot]}
                slide={slides[slideIndex]}
                slideIndex={slideIndex}
                fallbackAlt={fallbackAlt}
                failed={failedSlides[slideIndex]}
                isTransitioning={isAnimatingStage}
                isResetting={isResettingStage}
                onImageError={markSlideFailed}
              />
            )
          })}
          {incomingStagePanel && incomingStagePosition ? (
            <HeroStagePanel
              key={`hero-stage-panel-${incomingStagePanel.slot}`}
              slot={incomingStagePanel.slot}
              position={incomingStagePosition}
              slide={slides[incomingSlideIndex]}
              slideIndex={incomingSlideIndex}
              fallbackAlt={fallbackAlt}
              failed={failedSlides[incomingSlideIndex]}
              isTransitioning={isAnimatingStage}
              isResetting={isResettingStage}
              onImageError={markSlideFailed}
            />
          ) : null}
        </div>

        {canNavigate ? (
          <>
            <button
              type="button"
              aria-label="تصویر قبلی"
              onClick={previous}
              disabled={isAnimatingStage}
              className="absolute right-4 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-100/20 bg-[#081225]/58 text-white shadow-lg backdrop-blur transition hover:border-accent/70 hover:bg-[#0b2a5a]/82 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="تصویر بعدی"
              onClick={next}
              disabled={isAnimatingStage}
              className="absolute left-4 top-1/2 z-40 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-cyan-100/20 bg-[#081225]/58 text-white shadow-lg backdrop-blur transition hover:border-accent/70 hover:bg-[#0b2a5a]/82 focus:outline-none focus:ring-2 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60 lg:flex"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {canNavigate ? (
        <div className="relative z-20 mt-2 flex items-center justify-center gap-2.5 sm:mt-3">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={`${slide.desktopUrl}-dot-${slide.sortOrder}`}
              aria-label={`نمایش تصویر ${index + 1}`}
              onClick={() => selectSlide(index)}
              disabled={isAnimatingStage}
              className={cn(
                "h-2.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-accent/70 disabled:cursor-not-allowed",
                index === currentIndex
                  ? "w-10 bg-accent shadow-[0_0_18px_rgba(245,130,32,0.65)]"
                  : "w-2.5 bg-white/34 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
