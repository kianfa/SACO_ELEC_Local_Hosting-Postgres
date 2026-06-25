export type BulkPriceChangeType = "increase" | "decrease"
export type BulkPriceTargetType = "all" | "brand" | "category" | "manual"
export type BulkPriceRoundingMode = "none" | "1000" | "10000" | "100000"
export type BulkOldPriceBehavior = "current_to_old" | "keep" | "clear"

export type BulkPriceFilters = {
  targetType: BulkPriceTargetType
  brandId: string | null
  categoryId: string | null
  onlyActive: boolean
  onlyFeatured: boolean
  onlyInStock: boolean
  selectedProductIds: string[]
}

export type BulkPriceSettings = {
  changeType: BulkPriceChangeType
  percent: number
  roundingMode: BulkPriceRoundingMode
  oldPriceBehavior: BulkOldPriceBehavior
}

export type BulkPriceRequest = BulkPriceFilters & BulkPriceSettings

export type BulkPriceProduct = {
  id: string
  name: string
  slug: string
  model: string | null
  sku: string | null
  price: number
  oldPrice: number | null
  discountPercent: number
  brandId: string | null
  brandName: string | null
  categoryId: string | null
  categoryName: string | null
  stockQuantity: number
  mainImageUrl: string | null
  mainImageAlt: string | null
  isActive: boolean
  isFeatured: boolean
}

export type BulkPricePreviewItem = BulkPriceProduct & {
  newPrice: number
  changeAmount: number
  newOldPrice: number | null
  newDiscountPercent: number
}

export type BulkPricePreviewResult = {
  ok: boolean
  message: string
  items: BulkPricePreviewItem[]
  affectedCount: number
}

export type BulkPriceApplyResult = {
  ok: boolean
  message: string
  affectedCount: number
}
