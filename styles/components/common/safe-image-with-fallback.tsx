"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { IndustrialImagePlaceholder } from "@/components/common/industrial-image-placeholder"

export type SafeImageWithFallbackProps = {
  src?: string | null
  altText?: string | null
  fallbackText?: string | null
  className?: string
  imageClassName?: string
  fallbackClassName?: string
  objectFit?: "contain" | "cover"
  priority?: boolean
  compact?: boolean
  onImageError?: () => void
}

export function SafeImageWithFallback({
  src,
  altText,
  fallbackText,
  className,
  imageClassName,
  fallbackClassName,
  objectFit = "contain",
  priority = false,
  compact = false,
  onImageError,
}: SafeImageWithFallbackProps) {
  const normalizedSrc = src?.trim() || null
  const resolvedText = altText?.trim() || fallbackText?.trim() || "تصویر در دسترس نیست"
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    setHasError(false)
  }, [normalizedSrc])

  function handleError() {
    setHasError(true)
    onImageError?.()
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
    >
      {normalizedSrc && !hasError ? (
        <img
          src={normalizedSrc}
          alt={altText?.trim() || fallbackText?.trim() || "تصویر محصول"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={handleError}
          className={cn(
            "h-full w-full transition-transform duration-300 ease-out",
            objectFit === "cover" ? "object-cover" : "object-contain",
            imageClassName,
          )}
        />
      ) : (
        <IndustrialImagePlaceholder
          alt={resolvedText}
          label={resolvedText}
          compact={compact}
          className={cn("h-full w-full", fallbackClassName)}
        />
      )}
    </div>
  )
}
