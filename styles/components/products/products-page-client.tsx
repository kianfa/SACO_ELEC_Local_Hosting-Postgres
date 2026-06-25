"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, RefreshCw, SearchX, X } from "lucide-react"
import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FilterSidebar, type FilterOption, type ProductFilterState } from "@/components/filter-sidebar"
import { ProductToolbar } from "@/components/product-toolbar"
import { ActiveFilters } from "@/components/active-filters"
import { ProductListingCard } from "@/components/product-listing-card"
import { ProductListItem } from "@/components/product-list-item"
import { ProductPagination } from "@/components/product-pagination"
import { EmptyProductState } from "@/components/empty-product-state"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Product } from "@/types/product"
import type { Brand } from "@/types/brand"
import type { Category } from "@/types/category"

const DEFAULT_PRICE_FILTER_MAX = 500000000

function roundPriceFilterMax(price: number): number {
  if (!Number.isFinite(price) || price <= 0) return DEFAULT_PRICE_FILTER_MAX
  return Math.max(DEFAULT_PRICE_FILTER_MAX, Math.ceil(price / 100000) * 100000)
}

function createEmptyFilters(maxPrice: number): ProductFilterState {
  return {
    categories: [],
    brands: [],
    priceRange: [0, maxPrice],
    inStock: null,
    hasWarranty: null,
    applications: [],
  }
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase()
}

function readAvailability(value?: string) {
  if (value === "in-stock" || value === "available" || value === "true") return true
  if (value === "out-of-stock" || value === "unavailable" || value === "false") return false
  return null
}

function createFiltersFromUrl(params: {
  categories?: string[]
  brands?: string[]
  availability?: string
  minPrice?: string
  maxPrice?: string
  defaultMaxPrice: number
}): ProductFilterState {
  const minPrice = Number(params.minPrice)
  const parsedMaxPrice = Number(params.maxPrice)

  return {
    ...createEmptyFilters(params.defaultMaxPrice),
    categories: params.categories ?? [],
    brands: params.brands ?? [],
    inStock: readAvailability(params.availability),
    priceRange: [
      Number.isFinite(minPrice) && minPrice >= 0 ? minPrice : 0,
      Number.isFinite(parsedMaxPrice) && parsedMaxPrice > 0 ? parsedMaxPrice : params.defaultMaxPrice,
    ],
  }
}

function toOptions(items: Array<Category | Brand>): FilterOption[] {
  return items
    .filter((item) => item.slug && item.name)
    .map((item) => ({ slug: item.slug, name: item.name }))
}

interface ProductsPageClientProps {
  products: Product[]
  categories: Category[]
  brands: Brand[]
  initialSearchQuery?: string
  activeBrandSlugs?: string[]
  activeCategorySlugs?: string[]
  activeAvailability?: string
  activeSort?: string
  activeMinPrice?: string
  activeMaxPrice?: string
}

export function ProductsPageClient({
  products,
  categories,
  brands,
  initialSearchQuery = "",
  activeBrandSlugs = [],
  activeCategorySlugs = [],
  activeAvailability = "",
  activeSort = "bestselling",
  activeMinPrice = "",
  activeMaxPrice = "",
}: ProductsPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const categoryOptions = useMemo(() => toOptions(categories), [categories])
  const brandOptions = useMemo(() => toOptions(brands), [brands])
  const filterMaxPrice = useMemo(() => {
    const catalogMaxPrice = products.reduce((max, product) => Math.max(max, product.price || 0), 0)
    const urlMaxPrice = Number(activeMaxPrice)
    return roundPriceFilterMax(Math.max(catalogMaxPrice, Number.isFinite(urlMaxPrice) ? urlMaxPrice : 0))
  }, [activeMaxPrice, products])
  const [filters, setFilters] = useState<ProductFilterState>(() =>
    createFiltersFromUrl({
      categories: activeCategorySlugs,
      brands: activeBrandSlugs,
      availability: activeAvailability,
      minPrice: activeMinPrice,
      maxPrice: activeMaxPrice,
      defaultMaxPrice: filterMaxPrice,
    })
  )
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState(activeSort || "bestselling")
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery)
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Keep client-side filter controls in sync when navigation changes between
  // /products?category=inverters and /products?category=contactors without a full reload.
  useEffect(() => {
    setFilters(
      createFiltersFromUrl({
        categories: activeCategorySlugs,
        brands: activeBrandSlugs,
        availability: activeAvailability,
        minPrice: activeMinPrice,
        maxPrice: activeMaxPrice,
        defaultMaxPrice: filterMaxPrice,
      })
    )
    setSearchQuery(initialSearchQuery)
    setSortBy(activeSort || "bestselling")
    setCurrentPage(1)
  }, [
    activeCategorySlugs,
    activeBrandSlugs,
    activeAvailability,
    activeMinPrice,
    activeMaxPrice,
    filterMaxPrice,
    initialSearchQuery,
    activeSort,
  ])

  const pushProductsUrl = (nextFilters: ProductFilterState, overrides?: { search?: string | null; sort?: string | null }) => {
    const params = new URLSearchParams(searchParams.toString())
    const nextSearch = overrides?.search ?? searchQuery
    const nextSort = overrides?.sort ?? sortBy

    if (nextSearch?.trim()) params.set("search", nextSearch.trim())
    else params.delete("search")

    if (nextFilters.categories.length > 0) params.set("categories", nextFilters.categories.join(","))
    else params.delete("categories")
    // Remove legacy single-value params once the filter UI writes the URL.
    params.delete("category")

    if (nextFilters.brands.length > 0) params.set("brands", nextFilters.brands.join(","))
    else params.delete("brands")
    params.delete("brand")

    if (nextFilters.inStock === true) params.set("availability", "in-stock")
    else if (nextFilters.inStock === false) params.set("availability", "out-of-stock")
    else params.delete("availability")

    if (nextFilters.priceRange[0] > 0) params.set("minPrice", String(nextFilters.priceRange[0]))
    else params.delete("minPrice")

    if (nextFilters.priceRange[1] < filterMaxPrice) params.set("maxPrice", String(nextFilters.priceRange[1]))
    else params.delete("maxPrice")

    if (nextSort && nextSort !== "bestselling") params.set("sort", nextSort)
    else params.delete("sort")

    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const searchableText = [
          product.name,
          product.model,
          product.sku,
          product.brandName,
          product.categoryName,
          product.shortDescription,
          product.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        if (!searchableText.includes(query)) {
          return false
        }
      }

      if (filters.categories.length > 0) {
        const productCategoryKey = normalize(product.categorySlug) || normalize(product.categoryName)
        if (!productCategoryKey || !filters.categories.map(normalize).includes(productCategoryKey)) {
          return false
        }
      }

      if (filters.brands.length > 0) {
        const productBrandKey = normalize(product.brandSlug) || normalize(product.brandName)
        if (!productBrandKey || !filters.brands.map(normalize).includes(productBrandKey)) {
          return false
        }
      }

      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false
      }

      if (filters.inStock !== null && (product.stockQuantity > 0) !== filters.inStock) {
        return false
      }

      if (filters.hasWarranty !== null && product.hasWarranty !== filters.hasWarranty) {
        return false
      }

      return true
    })
  }, [filters, products, searchQuery])

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortBy) {
        case "cheapest":
          return a.price - b.price
        case "expensive":
          return b.price - a.price
        case "discount":
          return b.discountPercent - a.discountPercent
        case "newest":
          return String(b.id).localeCompare(String(a.id))
        default:
          return b.reviewCount - a.reviewCount
      }
    })
  }, [filteredProducts, sortBy])

  const itemsPerPage = 12
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleRemoveFilter = (type: string, value?: string) => {
    let nextFilters = filters
    let nextSearch: string | null | undefined

    switch (type) {
      case "search":
        nextSearch = ""
        setSearchQuery("")
        break
      case "category":
        nextFilters = { ...filters, categories: filters.categories.filter((c) => c !== value) }
        setFilters(nextFilters)
        break
      case "brand":
        nextFilters = { ...filters, brands: filters.brands.filter((b) => b !== value) }
        setFilters(nextFilters)
        break
      case "application":
        nextFilters = { ...filters, applications: filters.applications.filter((a) => a !== value) }
        setFilters(nextFilters)
        break
      case "inStock":
        nextFilters = { ...filters, inStock: null }
        setFilters(nextFilters)
        break
      case "hasWarranty":
        nextFilters = { ...filters, hasWarranty: null }
        setFilters(nextFilters)
        break
      case "priceRange":
        nextFilters = { ...filters, priceRange: [0, filterMaxPrice] }
        setFilters(nextFilters)
        break
    }

    setCurrentPage(1)
    pushProductsUrl(nextFilters, { search: nextSearch })
  }

  const handleClearFilters = () => {
    setFilters(createEmptyFilters(filterMaxPrice))
    setSearchQuery("")
    setSortBy("bestselling")
    setCurrentPage(1)
    router.push("/products")
  }

  const handleFilterChange = (nextFilters: ProductFilterState) => {
    setFilters(nextFilters)
    setCurrentPage(1)
    pushProductsUrl(nextFilters)
  }

  const handleSortChange = (nextSort: string) => {
    setSortBy(nextSort)
    setCurrentPage(1)
    pushProductsUrl(filters, { sort: nextSort })
  }

  const hasUrlSearch = Boolean(initialSearchQuery)
  const totalProducts = filteredProducts.length

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <main className="container mx-auto px-4 py-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-muted-foreground hover:text-primary">
                صفحه اصلی
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronLeft className="w-4 h-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">محصولات</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            محصولات برق صنعتی
          </h1>
          <p className="text-muted-foreground text-sm md:text-base mb-2">
            مشاهده و مقایسه انواع تجهیزات برق صنعتی، اتوماسیون، تابلو برق، کابل، سنسور و اینورتر
          </p>
          <p className="text-sm text-primary font-medium">
            {totalProducts.toLocaleString("fa-IR")} کالا
          </p>

          {hasUrlSearch && (
            <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <SearchX className="h-4 w-4 text-primary" />
                <span>
                  نتایج جستجو برای: <strong>«{initialSearchQuery}»</strong>
                </span>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl gap-2">
                <Link href="/products">
                  <X className="h-4 w-4" />
                  پاک کردن جستجو
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block w-72 shrink-0">
            <FilterSidebar
              filters={filters}
              categories={categoryOptions}
              brands={brandOptions}
              maxPrice={filterMaxPrice}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
            />
          </aside>

          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
              <SheetHeader className="mb-4">
                <SheetTitle>فیلترها</SheetTitle>
                <SheetDescription className="sr-only">فیلتر محصولات بر اساس دسته‌بندی، برند، قیمت و موجودی.</SheetDescription>
              </SheetHeader>
              <FilterSidebar
                filters={filters}
                categories={categoryOptions}
                brands={brandOptions}
                maxPrice={filterMaxPrice}
                onFilterChange={(nextFilters) => {
                  handleFilterChange(nextFilters)
                  setMobileFiltersOpen(false)
                }}
                onClearFilters={() => {
                  handleClearFilters()
                  setMobileFiltersOpen(false)
                }}
              />
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <ProductToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              searchQuery={searchQuery}
              onSearchChange={(value) => {
                setSearchQuery(value)
                setCurrentPage(1)
              }}
              onOpenMobileFilters={() => setMobileFiltersOpen(true)}
            />

            <ActiveFilters
              filters={filters}
              categories={categoryOptions}
              brands={brandOptions}
              searchQuery={hasUrlSearch ? initialSearchQuery : ""}
              maxPrice={filterMaxPrice}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearFilters}
            />

            {paginatedProducts.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 gap-3 min-[769px]:grid-cols-3 lg:grid-cols-4">
                    {paginatedProducts.map((product) => (
                      <ProductListingCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => (
                      <ProductListItem key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {totalPages > 1 && (
                  <ProductPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : hasUrlSearch ? (
              <div className="bg-card border border-border rounded-2xl p-6 text-center sm:p-12">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchX className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  محصولی برای جستجوی شما پیدا نشد
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  عبارت جستجو را تغییر دهید یا با پشتیبانی تماس بگیرید.
                </p>
                <Button asChild className="rounded-xl bg-primary hover:bg-primary/90">
                  <Link href="/products">مشاهده همه محصولات</Link>
                </Button>
              </div>
            ) : filters.categories.length > 0 || filters.brands.length > 0 ? (
              <div className="bg-card border border-border rounded-2xl p-6 text-center sm:p-12">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchX className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  محصولی با فیلترهای انتخاب‌شده پیدا نشد
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  فیلترها را تغییر دهید یا با پشتیبانی الکتروساکو تماس بگیرید.
                </p>
                <Button onClick={handleClearFilters} className="rounded-xl bg-primary hover:bg-primary/90">
                  پاک کردن فیلترها
                </Button>
              </div>
            ) : (
              <EmptyProductState onClearFilters={handleClearFilters} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export function ProductsErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-destructive/20 bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <RefreshCw className="h-7 w-7" />
          </div>
          <h1 className="mb-3 text-2xl font-bold text-foreground">خطا در دریافت محصولات</h1>
          <p className="mb-6 text-sm leading-7 text-muted-foreground">
            اتصال به پایگاه داده برقرار نشد یا اطلاعات محصولات قابل دریافت نیست.
          </p>
          <p dir="ltr" className="mb-6 rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            {message}
          </p>
          <Button asChild className="rounded-xl bg-primary hover:bg-primary/90">
            <Link href="/products">تلاش مجدد</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
