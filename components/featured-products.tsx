"use client"

import Link from "next/link"
import { ProductCard } from "./product-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import type { Product } from "@/types/product"
import { PublicDataErrorState } from "@/components/public-data-error-state"

interface FeaturedProductsProps {
  products: Product[]
  error?: string | null
}

export function FeaturedProducts({ products, error }: FeaturedProductsProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-foreground">محصولات ویژه</h2>
        <Button variant="link" className="text-primary gap-1" asChild>
          <Link href="/products">
            مشاهده همه
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
      </div>

      {error ? (
        <PublicDataErrorState variant="products" className="p-6 sm:p-8" />
      ) : products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
          هنوز محصول ویژه‌ای ثبت نشده است.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 min-[769px]:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              model={product.model}
              sku={product.sku}
              price={product.price}
              oldPrice={product.oldPrice}
              discount={product.discountPercent || null}
              rating={product.rating}
              reviewCount={product.reviewCount}
              image={product.mainImageUrl}
              imageAlt={product.mainImageAlt}
              brand={product.brandName}
              stockQuantity={product.stockQuantity}
              hasOptions={Boolean(product.variants?.length)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
