"use client"

import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"

interface ProductImageWithFallbackProps {
  imageUrl: string | null | undefined
  alt?: string | null
  fallbackLabel?: string
  className?: string
  fallbackClassName?: string
  iconClassName?: string
  objectFit?: "cover" | "contain"
}

export function ProductImageWithFallback({
  imageUrl,
  alt,
  fallbackLabel = "تصویر محصول",
  className,
  fallbackClassName,
  objectFit = "contain",
}: ProductImageWithFallbackProps) {
  return (
    <SafeImageWithFallback
      src={imageUrl}
      altText={alt}
      fallbackText={alt || fallbackLabel}
      objectFit={objectFit}
      className={className}
      imageClassName="h-full w-full"
      fallbackClassName={fallbackClassName}
    />
  )
}
