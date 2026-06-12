import type { Brand } from "@/types/brand"
import type { Category } from "@/types/category"

export interface AdminProductImage {
  id: string
  imageUrl: string
  altText: string | null
  sortOrder: number
  isMain: boolean
}

export interface NewProductImageMetadata {
  clientId: string
  altText: string
  isMain: boolean
  sortOrder: number
}

export interface AdminProductVariant {
  id?: string
  label: string
  price: number
  sku: string | null
  sortOrder: number
  isActive: boolean
}

export interface AdminProductSpec {
  id?: string
  specName: string
  specValue: string
  sortOrder: number
}

export interface AdminProduct {
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
  brandId: string | null
  brandName: string | null
  categoryId: string | null
  categoryName: string | null
  quantity: number
  lowStockThreshold: number | null
  isActive: boolean
  isFeatured: boolean
  hasWarranty: boolean
  images: AdminProductImage[]
  specs: AdminProductSpec[]
  optionGroupTitle: string | null
  variants: AdminProductVariant[]
}

export interface AdminProductFormInput {
  name: string
  slug: string
  model: string | null
  sku: string | null
  shortDescription: string | null
  description: string | null
  brandId: string | null
  categoryId: string | null
  price: number
  oldPrice: number | null
  discountPercent: number
  quantity: number
  lowStockThreshold: number | null
  isActive: boolean
  isFeatured: boolean
  showInHomepage: boolean
  hasWarranty: boolean
  warranty: string | null
  originCountry: string | null
  specs: AdminProductSpec[]
  optionGroupTitle: string | null
  variants: AdminProductVariant[]
  existingImages?: AdminProductImage[]
  removedImageIds?: string[]
  mainExistingImageId?: string | null
  newImageAltTexts?: string[]
  newImagesMetadata?: NewProductImageMetadata[]
}

export interface AdminProductFormOptions {
  brands: Brand[]
  categories: Category[]
}

export interface AdminActionState {
  ok: boolean
  message: string
  productId?: string
  redirectTo?: string
  fieldErrors?: Record<string, string>
}
