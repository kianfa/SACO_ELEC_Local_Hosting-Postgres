import {
  fetchProductBySlug,
  fetchProductList,
  fetchProductSearchSuggestions,
  fetchProducts,
} from "@/lib/repositories/products-repository"
import type { Product, ProductDetail, ProductListResult, ProductQueryOptions, ProductSearchSuggestion } from "@/types/product"

// Application service API used by pages/components.
// Keep this file provider-agnostic. Business rules, caching decisions, and future
// API-provider switching can be handled here without touching the UI.
export async function getProducts(options: ProductQueryOptions = {}): Promise<Product[]> {
  return fetchProducts(options)
}

export async function getProductList(options: ProductQueryOptions = {}): Promise<ProductListResult> {
  return fetchProductList(options)
}

export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  return fetchProducts({ active: true, featured: true, limit, pageSize: limit })
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  return fetchProductBySlug(slug)
}

export async function searchProductSuggestions(
  query: string,
  limit = 6
): Promise<ProductSearchSuggestion[]> {
  return fetchProductSearchSuggestions(query, limit)
}
