"use client"

import Link from "next/link"
import { Check, Heart, Star, ShoppingCart, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatEnglishPrice } from "@/lib/data"
import { ProductImage } from "@/components/common/product-image"
import { useCart } from "@/lib/cart/cart-store"

interface ProductCardProps {
  id: string
  name: string
  slug: string
  model: string | null
  sku?: string | null
  price: number
  oldPrice: number | null
  discount: number | null
  rating: number
  reviewCount: number
  image: string | null
  imageAlt?: string | null
  brand: string | null
  stockQuantity: number
  hasOptions?: boolean
}

export function ProductCard({
  id,
  name,
  slug,
  model,
  sku = null,
  price,
  oldPrice,
  discount,
  rating,
  reviewCount,
  image,
  imageAlt,
  brand,
  stockQuantity,
  hasOptions = false,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const safeStockQuantity = typeof stockQuantity === "number" ? stockQuantity : -1
  const inStock = safeStockQuantity !== 0

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("این محصول در حال حاضر ناموجود است")
      return
    }
    if (hasOptions) {
      toast.info("برای انتخاب گزینه و قیمت، صفحه محصول را باز کنید")
      return
    }

    addToCart({
      productId: id,
      variantId: null,
      variantGroupTitle: null,
      variantLabel: null,
      slug,
      name,
      model,
      sku,
      brandName: brand,
      price,
      oldPrice,
      mainImageUrl: image,
      stockQuantity: safeStockQuantity,
    })
  }

  return (
    <div className="group flex min-w-0 flex-col rounded-2xl border border-border bg-card p-2.5 transition-all duration-300 hover:border-primary hover:shadow-xl min-[769px]:p-4">
      <div className="relative mb-2 min-[769px]:mb-4">
        {discount ? (
          <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-lg z-10">
            {discount}٪
          </span>
        ) : null}

        <button className="absolute top-2 left-2 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border hover:border-destructive hover:text-destructive transition-colors z-10">
          <Heart className="w-4 h-4" />
        </button>

        <Link href={`/products/${slug}`} aria-label={name}>
          <ProductImage
            src={image}
            alt={imageAlt || name}
            size="card"
            className="w-full"
          />
        </Link>
      </div>

      <div className="flex-1 flex flex-col">
        <Link href={`/products/${slug}`}>
          <h3 className="mb-1 line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-foreground transition-colors hover:text-primary min-[769px]:min-h-0 min-[769px]:text-base">
            {name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-1" dir="ltr">
          {model ?? "—"}
        </p>
        {brand ? <p className="text-xs text-primary mb-2">{brand}</p> : null}

        <div className="mb-2 hidden items-center gap-1 min-[769px]:flex">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>

        <div className="mb-2 flex items-center gap-1 text-xs">
          {inStock ? (
            <>
              <Check className="h-3.5 w-3.5 shrink-0 text-green-600" />
              <span className="truncate text-green-600">موجود</span>
            </>
          ) : (
            <>
              <X className="h-3.5 w-3.5 shrink-0 text-destructive" />
              <span className="truncate text-destructive">ناموجود</span>
            </>
          )}
        </div>

        <div className="mt-auto min-w-0">
          {oldPrice ? (
            <span className="block truncate text-[11px] text-muted-foreground line-through min-[769px]:text-sm">
              {formatEnglishPrice(oldPrice)} تومان
            </span>
          ) : null}
          <div className="flex min-w-0 flex-wrap items-baseline gap-1 min-[769px]:gap-2">
            <span className="truncate text-base font-bold text-foreground min-[769px]:text-lg">
              {formatEnglishPrice(price)}
            </span>
            <span className="text-[11px] text-muted-foreground min-[769px]:text-sm">تومان</span>
          </div>
        </div>

        <Button
          type="button"
          className="mt-3 w-full gap-1 rounded-xl bg-primary px-2 text-xs hover:bg-primary/90 min-[769px]:gap-2 min-[769px]:px-4 min-[769px]:text-sm"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 shrink-0" />
          <span className="truncate">{inStock ? (hasOptions ? "انتخاب گزینه" : "افزودن به سبد") : "ناموجود"}</span>
        </Button>
      </div>
    </div>
  )
}
