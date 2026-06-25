"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"

type CategoryImageSize = "card" | "large" | "thumbnail"

type CategoryImageProps = {
  src?: string | null
  iconSrc?: string | null
  alt: string
  iconAlt?: string | null
  className?: string
  imageClassName?: string
  size?: CategoryImageSize
}

const sizeClasses: Record<CategoryImageSize, string> = {
  card: "h-20 w-20 rounded-xl p-2.5 md:h-24 md:w-24",
  large: "h-40 w-full rounded-2xl p-4",
  thumbnail: "h-14 w-14 rounded-xl p-2",
}

export function CategoryImage({ src, iconSrc, alt, iconAlt, className, imageClassName, size = "card" }: CategoryImageProps) {
  const sources = useMemo(
    () =>
      [
        src?.trim() ? { url: src.trim(), alt } : null,
        iconSrc?.trim() ? { url: iconSrc.trim(), alt: iconAlt?.trim() || alt } : null,
      ].filter(Boolean) as { url: string; alt: string }[],
    [src, iconSrc, alt, iconAlt],
  )
  const [sourceIndex, setSourceIndex] = useState(0)

  useEffect(() => {
    setSourceIndex(0)
  }, [sources.map((item) => item.url).join("|")])

  const current = sources[sourceIndex] ?? null

  return (
    <SafeImageWithFallback
      src={current?.url}
      altText={current?.alt || alt}
      fallbackText={alt || "تصویر دسته‌بندی"}
      compact={size === "thumbnail"}
      objectFit="contain"
      onImageError={() => {
        if (sourceIndex < sources.length - 1) setSourceIndex((index) => index + 1)
      }}
      className={cn(
        "group relative shrink-0 border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-sm",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_15%,rgba(249,115,22,0.08),transparent_34%),radial-gradient(circle_at_10%_90%,rgba(15,23,42,0.07),transparent_32%)]",
        sizeClasses[size],
        className,
      )}
      imageClassName={cn("relative z-[1] group-hover:scale-[1.04]", imageClassName)}
    />
  )
}
