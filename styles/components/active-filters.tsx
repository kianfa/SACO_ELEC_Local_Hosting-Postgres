"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/data"
import type { FilterOption, ProductFilterState } from "@/components/filter-sidebar"

interface ActiveFiltersProps {
  filters: ProductFilterState
  categories: FilterOption[]
  brands: FilterOption[]
  searchQuery?: string
  maxPrice: number
  onRemoveFilter: (type: string, value?: string) => void
  onClearAll: () => void
}

function getOptionName(options: FilterOption[], slug: string): string {
  return options.find((option) => option.slug === slug)?.name ?? slug
}

export function ActiveFilters({
  filters,
  categories,
  brands,
  searchQuery = "",
  maxPrice,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    filters.categories.length > 0 ||
    filters.brands.length > 0 ||
    filters.applications.length > 0 ||
    filters.inStock !== null ||
    filters.hasWarranty !== null ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < maxPrice

  if (!hasActiveFilters) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">فیلترهای فعال:</span>

      {searchQuery.trim() && (
        <FilterChip
          label={`جستجو: «${searchQuery.trim()}»`}
          onRemove={() => onRemoveFilter("search")}
        />
      )}

      {/* Category chips */}
      {filters.categories.map((cat) => (
        <FilterChip
          key={`cat-${cat}`}
          label={`دسته‌بندی: ${getOptionName(categories, cat)}`}
          onRemove={() => onRemoveFilter("category", cat)}
        />
      ))}

      {/* Brand chips */}
      {filters.brands.map((brand) => (
        <FilterChip
          key={`brand-${brand}`}
          label={`برند: ${getOptionName(brands, brand)}`}
          onRemove={() => onRemoveFilter("brand", brand)}
        />
      ))}

      {/* Application chips */}
      {filters.applications.map((app) => (
        <FilterChip
          key={`app-${app}`}
          label={app}
          onRemove={() => onRemoveFilter("application", app)}
        />
      ))}

      {/* Stock status chip */}
      {filters.inStock !== null && (
        <FilterChip
          label={filters.inStock ? "موجود" : "ناموجود"}
          onRemove={() => onRemoveFilter("inStock")}
        />
      )}

      {/* Warranty chip */}
      {filters.hasWarranty !== null && (
        <FilterChip
          label={filters.hasWarranty ? "گارانتی دارد" : "بدون گارانتی"}
          onRemove={() => onRemoveFilter("hasWarranty")}
        />
      )}

      {/* Price range chip */}
      {(filters.priceRange[0] > 0 || filters.priceRange[1] < maxPrice) && (
        <FilterChip
          label={`${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])} تومان`}
          onRemove={() => onRemoveFilter("priceRange")}
        />
      )}

      {/* Clear all button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
        onClick={onClearAll}
      >
        پاک کردن همه
      </Button>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1.5 rounded-lg">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
        type="button"
        aria-label={`حذف فیلتر ${label}`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </span>
  )
}
