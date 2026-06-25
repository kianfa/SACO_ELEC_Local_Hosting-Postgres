"use client"

import { cn } from "@/lib/utils"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"

type ProductImageSize = "card" | "detail" | "thumbnail" | "search" | "cart" | "admin"

type ProductImageProps = {
  src?: string | null
  alt: string
  className?: string
  imageClassName?: string
  size?: ProductImageSize
  priority?: boolean
}

const sizeClasses: Record<ProductImageSize, string> = {
  card: "h-[150px] rounded-xl p-2 min-[769px]:h-auto min-[769px]:aspect-square min-[769px]:p-5",
  detail: "aspect-square rounded-2xl p-4 sm:p-6 lg:p-5",
  thumbnail: "aspect-square rounded-xl p-2",
  search: "h-12 w-12 rounded-xl p-1.5",
  cart: "aspect-square rounded-xl p-2",
  admin: "aspect-square rounded-lg p-2",
}

export function ProductImage({ src, alt, className, imageClassName, size = "card", priority = false }: ProductImageProps) {
  const compact = size === "search" || size === "thumbnail" || size === "cart" || size === "admin"

  return (
    <SafeImageWithFallback
      src={src}
      altText={alt}
      fallbackText={alt || "تصویر محصول"}
      priority={priority}
      compact={compact}
      objectFit="contain"
      className={cn(
        "group relative shrink-0 border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 shadow-sm",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_70%_20%,rgba(249,115,22,0.08),transparent_34%),radial-gradient(circle_at_10%_85%,rgba(15,23,42,0.07),transparent_32%)]",
        sizeClasses[size],
        className,
      )}
      imageClassName={cn("relative z-[1] group-hover:scale-[1.03]", imageClassName)}
    />
  )
}
