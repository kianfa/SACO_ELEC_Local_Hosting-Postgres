export interface Brand {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  logoAltText: string | null
  description: string | null
  isActive: boolean
  createdAt: string | null
  productCount?: number
}

export interface AdminBrandInput {
  id?: string
  name: string
  slug: string
  description?: string | null
  logoUrl?: string | null
  logoAltText?: string | null
  isActive: boolean
}

export interface BrandActionState {
  ok: boolean
  message: string
  createdBrand?: Brand
  redirectTo?: string
}
