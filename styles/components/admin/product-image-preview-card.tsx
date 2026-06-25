"use client"

import { useId } from "react"
import { CheckCircle2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ProductImageWithFallback } from "@/components/product-image-with-fallback"

export type ProductImagePreviewCardProps = {
  imageUrl: string
  altText: string
  fallbackText: string
  isMain: boolean
  onAltTextChange: (value: string) => void
  onRemove?: () => void
  onSetMain?: () => void
  showSavedUrl?: boolean
}

/**
 * A self-contained admin preview card for one product image.
 * The preview, image controls and ALT field intentionally stay in normal
 * document flow so the card remains stable at narrow widths.
 */
export function ProductImagePreviewCard({
  imageUrl,
  altText,
  fallbackText,
  isMain,
  onAltTextChange,
  onRemove,
  onSetMain,
  showSavedUrl = false,
}: ProductImagePreviewCardProps) {
  const altInputId = useId()

  return (
    <Card className="w-full min-w-0 overflow-hidden rounded-xl border bg-card shadow-none">
      <CardContent className="flex min-w-0 flex-col gap-3 p-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100 p-3">
          <ProductImageWithFallback
            imageUrl={imageUrl}
            alt={altText || fallbackText}
            fallbackLabel={fallbackText}
            objectFit="contain"
            className="h-full w-full rounded-md"
          />

          {isMain ? (
            <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground shadow-sm">
              <CheckCircle2 className="h-3 w-3" />
              تصویر اصلی
            </span>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
          {onSetMain ? (
            <Button
              type="button"
              size="sm"
              variant={isMain ? "secondary" : "outline"}
              onClick={onSetMain}
              className="h-8 rounded-lg px-2.5 text-xs"
              disabled={isMain}
            >
              {isMain ? "تصویر اصلی" : "انتخاب به‌عنوان اصلی"}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">{isMain ? "تصویر اصلی" : "تصویر گالری"}</span>
          )}

          {onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 rounded-lg px-2 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              حذف
            </Button>
          ) : null}
        </div>

        {showSavedUrl && imageUrl ? (
          <div className="min-w-0 rounded-lg bg-muted/50 px-2 py-1.5 text-[10px] leading-4 text-muted-foreground" dir="ltr">
            <span className="block truncate" title={imageUrl}>{imageUrl}</span>
          </div>
        ) : null}

        <div className="min-w-0 space-y-1.5" dir="rtl">
          <Label htmlFor={altInputId} className="block text-right text-xs font-semibold leading-5">
            برچسب جایگزین تصویر (ALT)
          </Label>
          <Input
            id={altInputId}
            value={altText}
            maxLength={150}
            dir="rtl"
            onChange={(event) => onAltTextChange(event.target.value)}
            placeholder="مثال: کنتاکتور CHINT سه فاز ۳۸ آمپر"
            className="h-10 w-full min-w-0 rounded-lg text-right text-xs"
          />
          <p className="text-right text-[11px] leading-5 text-muted-foreground">
            این متن برای دسترس‌پذیری، سئو و نمایش جایگزین در صورت بارگذاری‌نشدن تصویر استفاده می‌شود.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
