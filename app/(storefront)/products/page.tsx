import { ProductsErrorState, ProductsPageClient } from "@/components/products/products-page-client"
import { getBrands } from "@/lib/services/brands-service"
import { getCategories } from "@/lib/services/categories-service"
import { getProductList } from "@/lib/services/products-service"

type SearchParamsValue = string | string[] | undefined
type ProductsPageSearchParams = Record<string, SearchParamsValue>

function readSearchParam(value: SearchParamsValue): string | undefined {
  if (Array.isArray(value)) return value[0]
  return value
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function parseAvailabilityParam(value: string | undefined) {
  if (value === "in-stock" || value === "available" || value === "true") return value
  if (value === "out-of-stock" || value === "unavailable" || value === "false") return value
  return undefined
}

function parseMultiParam(params: ProductsPageSearchParams, key: string, legacyKey?: string): string[] {
  const values = [readSearchParam(params[key]), legacyKey ? readSearchParam(params[legacyKey]) : undefined]

  return values
    .filter((value): value is string => Boolean(value?.trim()))
    .flatMap((value) => value.split(","))
    .map((value) => safeDecode(value).trim())
    .filter(Boolean)
    .filter((value, index, array) => array.indexOf(value) === index)
}

interface ProductsPageProps {
  searchParams?: Promise<ProductsPageSearchParams>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  try {
    const params = searchParams ? await searchParams : {}
    const search = readSearchParam(params.search)?.trim() || undefined
    const categories = parseMultiParam(params, "categories", "category")
    const brands = parseMultiParam(params, "brands", "brand")
    const availability = readSearchParam(params.availability)?.trim() || undefined
    const sort = readSearchParam(params.sort)?.trim() || undefined
    const minPrice = readSearchParam(params.minPrice)?.trim() || undefined
    const maxPrice = readSearchParam(params.maxPrice)?.trim() || undefined
    const page = Math.max(1, Number(readSearchParam(params.page)) || 1)
    const minPriceNumber = minPrice ? Number(minPrice) : undefined
    const maxPriceNumber = maxPrice ? Number(maxPrice) : undefined

    const [productList, categoryOptions, brandOptions] = await Promise.all([
      getProductList({
        active: true,
        search,
        categories,
        brands,
        availability: parseAvailabilityParam(availability),
        sort,
        minPrice: Number.isFinite(minPriceNumber) ? minPriceNumber : undefined,
        maxPrice: Number.isFinite(maxPriceNumber) ? maxPriceNumber : undefined,
        page,
        pageSize: 12,
      }),
      getCategories().catch(() => []),
      getBrands().catch(() => []),
    ])

    return (
      <ProductsPageClient
        products={productList.products}
        categories={categoryOptions}
        brands={brandOptions}
        initialSearchQuery={search ?? ""}
        activeCategorySlugs={categories}
        activeBrandSlugs={brands}
        activeAvailability={availability ?? ""}
        activeSort={sort ?? "bestselling"}
        activeMinPrice={minPrice ?? ""}
        activeMaxPrice={maxPrice ?? ""}
        totalProducts={productList.total}
        currentPage={productList.page}
        totalPages={productList.totalPages}
      />
    )
  } catch (error) {
    console.error("[products-page] failed to load public products", error)
    return <ProductsErrorState />
  }
}
