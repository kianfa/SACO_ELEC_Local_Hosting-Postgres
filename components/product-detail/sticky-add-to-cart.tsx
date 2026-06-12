"use client"

import { ShoppingCart } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatEnglishPrice } from "@/lib/data"
import { useCart } from "@/lib/cart/cart-store"

interface StickyAddToCartProps {
  productId: string
  slug: string
  name: string
  model: string | null
  sku: string | null
  brandName: string | null
  price: number
  oldPrice: number | null
  discount: number | null
  mainImageUrl: string | null
  stockQuantity: number
}

export function StickyAddToCart({
  productId,
  slug,
  name,
  model,
  sku,
  brandName,
  price,
  oldPrice,
  discount,
  mainImageUrl,
  stockQuantity,
}: StickyAddToCartProps) {
  const { addToCart } = useCart()
  const safeStockQuantity = typeof stockQuantity === "number" ? stockQuantity : -1
  const inStock = safeStockQuantity !== 0

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error("این محصول در حال حاضر ناموجود است")
      return
    }

    addToCart({
      productId,
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
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 md:hidden z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {discount && (
              <span className="bg-accent text-accent-foreground text-xs font-bold px-2 py-0.5 rounded">
                {discount}٪
              </span>
            )}
            <span className="text-lg font-bold text-foreground">
              {formatEnglishPrice(price)}
            </span>
            <span className="text-sm text-muted-foreground">تومان</span>
          </div>
        </div>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90 rounded-xl gap-2 px-8"
          disabled={!inStock}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{inStock ? "افزودن به سبد" : "ناموجود"}</span>
        </Button>
      </div>
    </div>
  )
}
