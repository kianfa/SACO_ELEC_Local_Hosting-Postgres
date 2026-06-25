import {
  brandSlugExists,
  fetchAdminBrandById,
  fetchAdminBrandOptions,
  fetchAdminBrands,
  insertBrand,
  patchBrand,
  removeBrand,
  setBrandActive,
} from "@/lib/repositories/admin-brands-repository"
import { uploadWebsiteMedia } from "@/lib/services/site-content-service"
import { toSafePathSegment } from "@/lib/security/file-upload"
import type { AdminBrandInput } from "@/types/brand"

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validate(input: AdminBrandInput) {
  if (!input.name.trim()) throw new Error("نام برند الزامی است")
  if (!input.slug.trim()) throw new Error("slug برند الزامی است")
  if (!SLUG_RE.test(input.slug)) throw new Error("slug فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد")
}

export const getAdminBrands = fetchAdminBrands
export const getAdminBrandOptions = fetchAdminBrandOptions
export const getAdminBrandById = fetchAdminBrandById

export async function createBrand(input: AdminBrandInput) {
  validate(input)
  if (await brandSlugExists(input.slug)) throw new Error("این slug قبلاً استفاده شده است")
  return insertBrand(input)
}

export async function updateBrand(id: string, input: AdminBrandInput) {
  validate(input)
  if (await brandSlugExists(input.slug, id)) throw new Error("این slug قبلاً استفاده شده است")
  return patchBrand(id, input)
}

export const deleteBrand = removeBrand
export const toggleBrandActive = setBrandActive

export async function uploadBrandLogo(file: File, slug: string): Promise<string> {
  return uploadWebsiteMedia(file, `brands/${toSafePathSegment(slug, "brand")}`, "logo.webp")
}
