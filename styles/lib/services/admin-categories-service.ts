import {
  categorySlugExists,
  fetchAdminCategories,
  fetchAdminCategoryOptions,
  fetchAdminCategoryById,
  insertCategory,
  patchCategory,
  removeCategory,
  setCategoryActive,
  setCategoryHomepageVisibility,
} from "@/lib/repositories/admin-categories-repository"
import { uploadWebsiteMedia } from "@/lib/services/site-content-service"
import { toSafePathSegment } from "@/lib/security/file-upload"
import type { AdminCategoryInput } from "@/types/category"

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function validate(input: AdminCategoryInput) {
  if (!input.name.trim()) throw new Error("نام دسته‌بندی الزامی است")
  if (!input.slug.trim()) throw new Error("slug دسته‌بندی الزامی است")
  if (!SLUG_RE.test(input.slug)) throw new Error("slug فقط باید شامل حروف انگلیسی کوچک، عدد و خط تیره باشد")
  if (!Number.isFinite(input.homepageSortOrder)) throw new Error("ترتیب نمایش باید عددی باشد")
  if (input.id && input.parentId === input.id) throw new Error("دسته‌بندی نمی‌تواند والد خودش باشد")
}

export const getAdminCategories = fetchAdminCategories
export const getAdminCategoryOptions = fetchAdminCategoryOptions
export const getAdminCategoryById = fetchAdminCategoryById

export async function createCategory(input: AdminCategoryInput) {
  validate(input)
  if (await categorySlugExists(input.slug)) throw new Error("این slug قبلاً استفاده شده است")
  return insertCategory(input)
}

export async function updateCategory(id: string, input: AdminCategoryInput) {
  validate({ ...input, id })
  if (await categorySlugExists(input.slug, id)) throw new Error("این slug قبلاً استفاده شده است")
  return patchCategory(id, input)
}

export const deleteCategory = removeCategory
export const toggleCategoryActive = setCategoryActive
export const toggleCategoryHomepageVisibility = setCategoryHomepageVisibility

export async function uploadCategoryImage(file: File, slug: string, imageType: "general" | "homepage" | "icon"): Promise<string> {
  return uploadWebsiteMedia(file, `categories/${toSafePathSegment(slug, "category")}`, `${imageType}.webp`)
}
