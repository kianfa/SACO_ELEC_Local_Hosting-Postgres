"use client"

import { Heart, Star, ShoppingCart, Eye, Check, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart/cart-store"
import Link from "next/link"
import { formatPrice } from "@/lib/data"
import { ProductImage } from "@/components/common/product-image"
import type { Product } from "@/types/product"

interface ProductListItemProps {
  product: Product
}

export function ProductListItem({ product }: ProductListItemProps) {
  const { addToCart } = useCart()
  const {
    name,
    model,
    sku,
    price,
    oldPrice,
    discountPercent,
    rating,
    reviewCount,
    brandName,
    stockQuantity,
    mainImageUrl,
    mainImageAlt,
    slug,
    specs,
  } = product
  const safeStockQuantity = typeof stockQuantity === "number" ? stockQuantity : -1
  const inStock = safeStockQuantity !== 0

  const handleAddToCart = () => {
    if (product.variants?.length) {
      toast.info("برای انتخاب گزینه و قیمت، صفحه محصول را باز کنید")
      return
    }
    addToCart({
      productId: product.id,
      variantId: null,
      variantGroupTitle: null,
      variantLabel: null,
      slug,
      name,
      model,
      sku,
      brandName,
      price,
      oldPrice,
      mainImageUrl,
      stockQuantity: safeStockQuantity,
    })
  }

  return (
    <div className="group bg-card border border-border rounded-2xl p-4 hover:border-primary hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row gap-4">
      {/* Image Container - Right side in RTL */}
      <div className="relative w-full sm:w-48 shrink-0">
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded-lg z-10">
            {discountPercent}٪
          </span>
        )}

        {/* Favorite Button */}
        <button className="absolute top-2 left-2 w-8 h-8 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center border border-border hover:border-destructive hover:text-destructive transition-colors z-10">
          <Heart className="w-4 h-4" />
        </button>

        {/* Product Image */}
        <Link href={`/products/${slug}`}>
          <ProductImage
            src={mainImageUrl}
            alt={mainImageAlt || name}
            size="card"
            className="w-full cursor-pointer sm:h-full sm:min-h-[180px]"
          />
        </Link>
      </div>

      {/* Product Info - Middle */}
      <div className="flex-1 flex flex-col">
        <Link href={`/products/${slug}`}>
          <h3 className="font-semibold text-foreground mb-1 text-base hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-1" dir="ltr">
          {model ?? sku ?? "—"}
        </p>
        <p className="text-sm text-primary mb-2">{brandName ?? "برند نامشخص"}</p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span className="text-sm font-medium">{rating}</span>
          <span className="text-xs text-muted-foreground">({reviewCount} نظر)</span>
        </div>

        {/* Specs */}
        {specs && specs.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-2">مشخصات فنی:</p>
            <ul className="space-y-1">
              {specs.slice(0, 3).map((spec, index) => (
                <li key={index} className="text-xs text-foreground flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                  {spec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Stock Status */}
        <div className="flex items-center gap-1 mt-auto">
          {inStock ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-600">موجود در انبار</span>
            </>
          ) : (
            <>
              <X className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">ناموجود</span>
            </>
          )}
        </div>
      </div>

      {/* Price and CTA - Left side in RTL */}
      <div className="sm:w-48 shrink-0 flex flex-col items-start sm:items-end justify-between border-t sm:border-t-0 sm:border-r border-border pt-4 sm:pt-0 sm:pr-4">
        {/* Price */}
        <div className="text-left sm:text-right">
          {oldPrice && (
            <span className="text-sm text-muted-foreground line-through block mb-1">
              {formatPrice(oldPrice)} تومان
            </span>
          )}
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-xl font-bold text-foreground">
              {formatPrice(price)}
            </span>
            <span className="text-sm text-muted-foreground">تومان</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2 mt-4 w-full sm:w-auto">
          <Button
            type="button"
            className="bg-primary hover:bg-primary/90 rounded-xl gap-2"
            disabled={!inStock}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{inStock ? (product.variants?.length ? "انتخاب گزینه" : "افزودن به سبد") : "ناموجود"}</span>
          </Button>
          <Button variant="outline" className="rounded-xl gap-2" asChild>
            <Link href={`/products/${slug}`}>
              <Eye className="w-4 h-4" />
              <span>مشاهده جزئیات</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
