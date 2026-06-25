"use client"

import { useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ProductImage } from "@/components/common/product-image"
import type { ProductDetailImage } from "@/types/product"

interface ProductGalleryProps {
  images: ProductDetailImage[]
  badges: string[]
  productName: string
}

function sortGalleryImages(images: ProductDetailImage[]) {
  return [...images]
    .filter((image) => Boolean(image.imageUrl?.trim()))
    .sort((imageA, imageB) => {
      if (imageA.isMain && !imageB.isMain) return -1
      if (!imageA.isMain && imageB.isMain) return 1
      return imageA.sortOrder - imageB.sortOrder
    })
}

export function ProductGallery({ images, badges, productName }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const visibleImages = useMemo(() => sortGalleryImages(images), [images])
  const currentImage = visibleImages[selectedImage]

  return (
    <div className="w-full max-w-full space-y-3 lg:space-y-2">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Badges */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          {badges.map((badge, index) => {
            const isWarrantyBadge = badge.includes("گارانتی")
            const isStockBadge = badge === "موجود"

            return (
              <Badge
                key={index}
                variant={isStockBadge ? "default" : "secondary"}
                className={`${
                  isStockBadge
                    ? "bg-green-600 hover:bg-green-700"
                    : isWarrantyBadge
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-accent hover:bg-accent/90 text-accent-foreground"
                } text-xs px-3 py-1`}
              >
                {badge}
              </Badge>
            )
          })}
        </div>

        <ProductImage
          src={currentImage?.imageUrl ?? null}
          alt={currentImage?.altText || productName}
          size="detail"
          className="h-[320px] w-full max-w-full aspect-auto sm:h-[380px] md:h-[440px] lg:h-[clamp(320px,48vh,440px)] xl:h-[clamp(340px,50vh,480px)]"
          imageClassName="object-contain"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex w-full max-w-full gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {(visibleImages.length > 0 ? visibleImages : [null]).map((image, index) => (
          <button
            key={image?.id ?? image?.imageUrl ?? `placeholder-${index}`}
            onClick={() => setSelectedImage(index)}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-white transition-all sm:h-[72px] sm:w-[72px] ${
              selectedImage === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-border hover:border-primary/50"
            }`}
            aria-label={`تصویر ${index + 1} ${productName}`}
          >
            <ProductImage
              src={image?.imageUrl ?? null}
              alt={image?.altText || `${productName} ${index + 1}`}
              size="thumbnail"
              className="h-full w-full rounded-none border-0 shadow-none"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
