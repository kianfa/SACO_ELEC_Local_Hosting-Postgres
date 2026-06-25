import { ProductsErrorState, ProductsPageClient } from "@/components/products/products-page-client"
import { getBrands } from "@/lib/services/brands-service"
import { getCategories } from "@/lib/services/categories-service"
import { getProducts } from "@/lib/services/products-service"

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

    const [products, categoryOptions, brandOptions] = await Promise.all([
      getProducts({
        active: true,
        search,
        categories,
        brands,
      }),
      getCategories().catch(() => []),
      getBrands().catch(() => []),
    ])

    return (
      <ProductsPageClient
        products={products}
        categories={categoryOptions}
        brands={brandOptions}
        initialSearchQuery={search ?? ""}
        activeCategorySlugs={categories}
        activeBrandSlugs={brands}
        activeAvailability={availability ?? ""}
        activeSort={sort ?? "bestselling"}
        activeMinPrice={minPrice ?? ""}
        activeMaxPrice={maxPrice ?? ""}
      />
    )
  } catch (error) {
    console.error("[products-page] failed to load public products", error)
    return <ProductsErrorState />
  }
}
