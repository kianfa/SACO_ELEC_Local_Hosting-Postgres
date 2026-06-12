"use client"

import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Brand } from "@/types/brand"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"

interface BrandStripProps {
  brands: Brand[]
  error?: string | null
}

export function BrandStrip({ brands, error }: BrandStripProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="relative flex items-center">
        {/* Navigation */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 z-10 bg-card/80 backdrop-blur-sm rounded-full hidden md:flex"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 z-10 bg-card/80 backdrop-blur-sm rounded-full hidden md:flex"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        {error ? (
          <div className="w-full rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>خطا در دریافت برندها. لطفاً بعداً دوباره تلاش کنید.</span>
          </div>
        ) : brands.length === 0 ? (
          <div className="w-full rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            هنوز برندی ثبت نشده است.
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide w-full px-0 md:px-12">
            {brands.map((brand) => (
              <a
                key={brand.id}
                href={`/products?brand=${encodeURIComponent(brand.slug)}`}
                className="flex-shrink-0 bg-card border border-border rounded-xl px-6 py-4 hover:border-primary hover:shadow-md transition-all flex items-center justify-center min-w-[140px]"
              >
                {brand.logoUrl ? (
                  <SafeImageWithFallback
                    src={brand.logoUrl}
                    altText={`لوگوی ${brand.name}`}
                    fallbackText={brand.name}
                    objectFit="contain"
                    compact
                    className="h-9 w-28"
                  />
                ) : (
                  <span className="font-semibold text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                    {brand.name}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
