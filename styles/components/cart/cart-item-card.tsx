"use client"

import { Bookmark, CheckCircle2, Trash2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { QuantitySelector } from "@/components/cart/quantity-selector"
import { ProductImage } from "@/components/common/product-image"
import { formatPrice } from "@/lib/data"
import type { CartItem } from "@/lib/cart/cart-store"

interface CartItemCardProps {
  item: CartItem
  onQuantityChange: (lineId: string, quantity: number) => void
  onRemove: (lineId: string) => void
  compact?: boolean
}

export function CartItemCard({ item, onQuantityChange, onRemove, compact = false }: CartItemCardProps) {
  const total = item.price * item.quantity
  const inStock = item.stockQuantity !== 0
  const maxQuantity = item.stockQuantity > 0 ? item.stockQuantity : 99
  const stockLabel = inStock
    ? item.stockQuantity > 0
      ? `${item.stockQuantity.toLocaleString("fa-IR")} عدد موجود در انبار`
      : "موجودی قابل بررسی"
    : "ناموجود"

  if (compact) {
    return (
      <div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
        <div className="flex gap-3">
          <ProductImage src={item.mainImageUrl} alt={item.name} size="cart" className="h-20 w-20" />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-bold leading-6 text-foreground">{item.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-lg text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(item.lineId)}
                aria-label="حذف کالا"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="mb-1 text-xs text-muted-foreground" dir="ltr">{item.model ?? item.sku ?? "—"}</p>
            <p className="mb-1 text-xs font-medium text-primary">{item.brandName ?? "برند نامشخص"}</p>{item.variantLabel ? <p className="mb-2 text-xs font-bold text-foreground">{item.variantGroupTitle ?? "گزینه"}: {item.variantLabel}</p> : null}
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-extrabold text-foreground">{formatPrice(item.price)}</span>
              <span className="text-xs text-muted-foreground">تومان</span>
            </div>
            <QuantitySelector
              value={item.quantity}
              onChange={(quantity) => onQuantityChange(item.lineId, quantity)}
              disabled={!inStock}
              max={maxQuantity}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row">
        <ProductImage src={item.mainImageUrl} alt={item.name} size="cart" className="w-full sm:h-36 sm:w-36 sm:shrink-0" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-base font-bold leading-7 text-foreground md:text-lg">{item.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="rounded-lg bg-muted px-2 py-1" dir="ltr">{item.model ?? item.sku ?? "—"}</span>
                <span className="rounded-lg bg-primary/10 px-2 py-1 font-medium text-primary">{item.brandName ?? "برند نامشخص"}</span>
                {item.variantLabel ? <span className="rounded-lg bg-muted px-2 py-1 font-bold text-foreground">{item.variantGroupTitle ?? "گزینه"}: {item.variantLabel}</span> : null}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-fit rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onRemove(item.lineId)}
            >
              <Trash2 className="ml-1.5 h-4 w-4" />
              حذف
            </Button>
          </div>

          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>گارانتی و اصالت کالا طبق شرایط فروش</span>
            </div>
            <div className={`flex items-center gap-2 ${inStock ? "text-green-700" : "text-destructive"}`}>
              {inStock ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span>{stockLabel}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-8">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">قیمت واحد</p>
                <p className="font-bold text-foreground">{formatPrice(item.price)} تومان</p>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">تعداد</p>
                <QuantitySelector
                  value={item.quantity}
                  onChange={(quantity) => onQuantityChange(item.lineId, quantity)}
                  disabled={!inStock}
                  max={maxQuantity}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end md:flex-col md:items-end">
              <div className="text-right">
                <p className="mb-1 text-xs text-muted-foreground">جمع این کالا</p>
                <p className="text-xl font-extrabold text-primary">{formatPrice(total)} تومان</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl">
                <Bookmark className="ml-1.5 h-4 w-4" />
                ذخیره برای بعد
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
