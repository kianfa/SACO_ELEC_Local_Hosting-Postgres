"use client"

import { CategoryCard } from "./category-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Category, HomepageCategorySectionSettings } from "@/types/category"
import { PublicDataErrorState } from "@/components/public-data-error-state"

interface CategorySectionProps {
  categories: Category[]
  settings?: HomepageCategorySectionSettings
  error?: string | null
}

const fallbackSettings: HomepageCategorySectionSettings = {
  title: "دسته‌بندی تجهیزات",
  subtitle: "انتخاب سریع تجهیزات برق صنعتی بر اساس دسته‌بندی",
  isActive: true,
}

const fallbackCategories: Pick<Category, "id" | "name" | "slug" | "homepageTitle" | "homepageImageUrl" | "homepageImageAltText" | "homepageIconUrl" | "homepageIconAltText" | "displayImageUrl" | "displayImageAltText" | "homepageUrl" | "imageUrl">[] = [
  { id: "fallback-mccb", name: "کلید اتوماتیک", slug: "mccb", homepageTitle: null, homepageImageUrl: null, homepageImageAltText: null, homepageIconUrl: null, homepageIconAltText: null, displayImageUrl: null, displayImageAltText: null, homepageUrl: null, imageUrl: null },
  { id: "fallback-cable", name: "کابل و سیم", slug: "cable-wire", homepageTitle: null, homepageImageUrl: null, homepageImageAltText: null, homepageIconUrl: null, homepageIconAltText: null, displayImageUrl: null, displayImageAltText: null, homepageUrl: null, imageUrl: null },
  { id: "fallback-sensor", name: "سنسور و ابزار دقیق", slug: "sensor-instrument", homepageTitle: null, homepageImageUrl: null, homepageImageAltText: null, homepageIconUrl: null, homepageIconAltText: null, displayImageUrl: null, displayImageAltText: null, homepageUrl: null, imageUrl: null },
  { id: "fallback-panel", name: "تابلو برق", slug: "electrical-panel", homepageTitle: null, homepageImageUrl: null, homepageImageAltText: null, homepageIconUrl: null, homepageIconAltText: null, displayImageUrl: null, displayImageAltText: null, homepageUrl: null, imageUrl: null },
  { id: "fallback-inverter", name: "اینورتر", slug: "inverter", homepageTitle: null, homepageImageUrl: null, homepageImageAltText: null, homepageIconUrl: null, homepageIconAltText: null, displayImageUrl: null, displayImageAltText: null, homepageUrl: null, imageUrl: null },
  { id: "fallback-motor", name: "الکتروموتور", slug: "electric-motor", homepageTitle: null, homepageImageUrl: null, homepageImageAltText: null, homepageIconUrl: null, homepageIconAltText: null, displayImageUrl: null, displayImageAltText: null, homepageUrl: null, imageUrl: null },
  { id: "fallback-plc", name: "PLC و اتوماسیون", slug: "plc-automation", homepageTitle: null, homepageImageUrl: null, homepageImageAltText: null, homepageIconUrl: null, homepageIconAltText: null, displayImageUrl: null, displayImageAltText: null, homepageUrl: null, imageUrl: null },
  { id: "fallback-contactor", name: "کنتاکتور", slug: "contactor", homepageTitle: null, homepageImageUrl: null, homepageImageAltText: null, homepageIconUrl: null, homepageIconAltText: null, displayImageUrl: null, displayImageAltText: null, homepageUrl: null, imageUrl: null },
]

export function CategorySection({ categories, settings, error }: CategorySectionProps) {
  const sectionSettings = settings ?? fallbackSettings
  const visibleCategories = categories.length > 0 ? categories : fallbackCategories

  if (!sectionSettings.isActive) return null

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-primary md:text-3xl">{sectionSettings.title}</h2>
          {sectionSettings.subtitle ? <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">{sectionSettings.subtitle}</p> : null}
        </div>
      </div>

      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-card shadow-lg xl:flex"
          aria-label="دسته‌بندی قبلی"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 rounded-full bg-card shadow-lg xl:flex"
          aria-label="دسته‌بندی بعدی"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        {error ? (
          <PublicDataErrorState variant="compact" className="p-6 sm:p-8" />
        ) : visibleCategories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            هنوز دسته‌بندی‌ای برای صفحه اصلی انتخاب نشده است.
          </div>
        ) : (
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide xl:grid xl:grid-cols-4 2xl:grid-cols-8 xl:overflow-visible xl:pb-0 xl:px-12">
            {visibleCategories.map((category) => {
              const image = category.displayImageUrl || category.homepageImageUrl || category.imageUrl || category.homepageIconUrl || null
              const fallbackImage = image !== category.homepageIconUrl ? category.homepageIconUrl : null
              const href = category.homepageUrl || `/products?category=${encodeURIComponent(category.slug)}`
              return (
                <div key={category.id} className="w-[142px] flex-shrink-0 snap-start sm:w-[160px] xl:w-auto">
                  <CategoryCard
                    name={category.homepageTitle || category.name}
                    image={image}
                    fallbackImage={fallbackImage}
                    altText={category.displayImageAltText || category.homepageTitle || category.name}
                    fallbackAltText={category.homepageIconAltText || category.name}
                    href={href}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
