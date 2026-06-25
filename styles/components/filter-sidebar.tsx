"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { filterApplications, formatPrice } from "@/lib/data"

export interface ProductFilterState {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  inStock: boolean | null
  hasWarranty: boolean | null
  applications: string[]
}

export interface FilterOption {
  slug: string
  name: string
}

interface FilterSidebarProps {
  filters: ProductFilterState
  categories: FilterOption[]
  brands: FilterOption[]
  maxPrice: number
  onFilterChange: (filters: ProductFilterState) => void
  onClearFilters: () => void
}

export function FilterSidebar({
  filters,
  categories,
  brands,
  maxPrice,
  onFilterChange,
  onClearFilters,
}: FilterSidebarProps) {
  const toggleValue = (values: string[], value: string, checked: boolean) => {
    if (checked) {
      return values.includes(value) ? values : [...values, value]
    }

    return values.filter((item) => item !== value)
  }

  const handleCategoryChange = (categorySlug: string, checked: boolean) => {
    onFilterChange({
      ...filters,
      categories: toggleValue(filters.categories, categorySlug, checked),
    })
  }

  const handleBrandChange = (brandSlug: string, checked: boolean) => {
    onFilterChange({
      ...filters,
      brands: toggleValue(filters.brands, brandSlug, checked),
    })
  }

  const handleApplicationChange = (app: string, checked: boolean) => {
    const newApplications = checked
      ? [...filters.applications, app]
      : filters.applications.filter((a) => a !== app)
    onFilterChange({ ...filters, applications: newApplications })
  }

  const clampPrice = (value: number) => Math.min(Math.max(value, 0), maxPrice)

  const normalizePriceRange = (minPrice: number, maxPriceValue: number): [number, number] => {
    const nextMinPrice = clampPrice(minPrice)
    const nextMaxPrice = clampPrice(maxPriceValue)

    return nextMinPrice <= nextMaxPrice
      ? [nextMinPrice, nextMaxPrice]
      : [nextMaxPrice, nextMaxPrice]
  }

  const parsePriceInput = (value: string) => {
    const normalizedDigits = value
      .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
      .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/[^0-9]/g, "")

    return Number(normalizedDigits || 0)
  }

  const handlePriceChange = (value: number[]) => {
    onFilterChange({
      ...filters,
      priceRange: normalizePriceRange(value[0] ?? 0, value[1] ?? maxPrice),
    })
  }

  const handleMinPriceInputChange = (value: string) => {
    onFilterChange({
      ...filters,
      priceRange: normalizePriceRange(parsePriceInput(value), filters.priceRange[1]),
    })
  }

  const handleMaxPriceInputChange = (value: string) => {
    onFilterChange({
      ...filters,
      priceRange: normalizePriceRange(filters.priceRange[0], parsePriceInput(value)),
    })
  }

  const handleStockChange = (value: boolean | null) => {
    onFilterChange({ ...filters, inStock: value })
  }

  const handleWarrantyChange = (value: boolean | null) => {
    onFilterChange({ ...filters, hasWarranty: value })
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-bold text-foreground mb-4">دسته‌بندی</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.slug} className="flex items-center gap-3">
              <Checkbox
                id={`cat-${category.slug}`}
                checked={filters.categories.includes(category.slug)}
                onCheckedChange={(checked) => handleCategoryChange(category.slug, checked as boolean)}
              />
              <Label htmlFor={`cat-${category.slug}`} className="text-sm text-foreground cursor-pointer">
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">برند</h3>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand.slug} className="flex items-center gap-3">
              <Checkbox
                id={`brand-${brand.slug}`}
                checked={filters.brands.includes(brand.slug)}
                onCheckedChange={(checked) => handleBrandChange(brand.slug, checked as boolean)}
              />
              <Label htmlFor={`brand-${brand.slug}`} className="text-sm text-foreground cursor-pointer">
                {brand.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">محدوده قیمت</h3>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            min={0}
            max={maxPrice}
            step={100000}
            onValueChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">از</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatPrice(filters.priceRange[0])}
                onChange={(event) => handleMinPriceInputChange(event.target.value)}
                className="text-sm h-9"
              />
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">تا</Label>
              <Input
                type="text"
                inputMode="numeric"
                value={formatPrice(filters.priceRange[1])}
                onChange={(event) => handleMaxPriceInputChange(event.target.value)}
                className="text-sm h-9"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center">تومان</p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">وضعیت موجودی</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="in-stock"
              checked={filters.inStock === true}
              onCheckedChange={(checked) => handleStockChange(checked ? true : null)}
            />
            <Label htmlFor="in-stock" className="text-sm text-foreground cursor-pointer">
              موجود
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="out-of-stock"
              checked={filters.inStock === false}
              onCheckedChange={(checked) => handleStockChange(checked ? false : null)}
            />
            <Label htmlFor="out-of-stock" className="text-sm text-foreground cursor-pointer">
              ناموجود
            </Label>
          </div>
        </div>
      </div>

      {/* Warranty */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">گارانتی</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="has-warranty"
              checked={filters.hasWarranty === true}
              onCheckedChange={(checked) => handleWarrantyChange(checked ? true : null)}
            />
            <Label htmlFor="has-warranty" className="text-sm text-foreground cursor-pointer">
              دارد
            </Label>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              id="no-warranty"
              checked={filters.hasWarranty === false}
              onCheckedChange={(checked) => handleWarrantyChange(checked ? false : null)}
            />
            <Label htmlFor="no-warranty" className="text-sm text-foreground cursor-pointer">
              ندارد
            </Label>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div className="border-t border-border pt-6">
        <h3 className="font-bold text-foreground mb-4">مناسب برای</h3>
        <div className="space-y-3">
          {filterApplications.map((app) => (
            <div key={app} className="flex items-center gap-3">
              <Checkbox
                id={`app-${app}`}
                checked={filters.applications.includes(app)}
                onCheckedChange={(checked) => handleApplicationChange(app, checked as boolean)}
              />
              <Label htmlFor={`app-${app}`} className="text-sm text-foreground cursor-pointer">
                {app}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border pt-6 space-y-3">
        <Button className="w-full bg-primary hover:bg-primary/90 rounded-xl" type="button">
          اعمال فیلتر
        </Button>
        <Button
          variant="outline"
          className="w-full rounded-xl"
          onClick={onClearFilters}
          type="button"
        >
          پاک کردن فیلترها
        </Button>
      </div>
    </div>
  )
}
