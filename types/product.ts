export interface ProductVariant {
  id: string
  label: string
  price: number
  sku: string | null
  sortOrder: number
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  slug: string
  model: string | null
  sku: string | null
  shortDescription?: string | null
  description?: string | null
  price: number
  oldPrice: number | null
  discountPercent: number
  brandName: string | null
  brandSlug?: string | null
  categoryName: string | null
  categorySlug?: string | null
  stockQuantity: number
  mainImageUrl: string | null
  mainImageAlt: string | null
  isFeatured: boolean
  isActive?: boolean

  // UI-friendly fields. These keep the current product listing design intact
  // while still receiving normalized product data from the service layer.
  rating: number
  reviewCount: number
  hasWarranty: boolean
  specs: string[]
  optionGroupTitle?: string | null
  variants?: ProductVariant[]
}

export interface ProductDetailImage {
  id: string
  imageUrl: string
  altText: string | null
  isMain: boolean
  sortOrder: number
}

export interface ProductDetailSpec {
  name: string
  value: string
  sortOrder: number
}

export interface ProductDetail {
  id: string
  name: string
  slug: string
  model: string | null
  sku: string | null
  shortDescription: string | null
  description: string | null
  price: number
  oldPrice: number | null
  discountPercent: number
  warranty: string | null
  originCountry: string | null
  brandName: string | null
  brandSlug?: string | null
  categoryName: string | null
  categorySlug?: string | null
  stockQuantity: number
  images: ProductDetailImage[]
  specs: ProductDetailSpec[]
  optionGroupTitle: string | null
  variants: ProductVariant[]

  // UI-only compatibility fields for the existing product detail components.
  rating: number
  reviewCount: number
  hasWarranty: boolean
}

export interface ProductQueryOptions {
  featured?: boolean
  active?: boolean
  limit?: number
  search?: string

  /**
   * Legacy single-value filters kept for backward compatibility with older
   * links such as /products?category=inverters and /products?brand=siemens.
   */
  brand?: string
  category?: string

  /** Multi-select filters used by the products page. */
  brands?: string[]
  categories?: string[]
}


export interface ProductSearchSuggestion {
  id: string
  name: string
  slug: string
  model: string | null
  sku: string | null
  price: number
  brandName: string | null
  categoryName: string | null
  mainImageUrl: string | null
  mainImageAlt: string | null
}
