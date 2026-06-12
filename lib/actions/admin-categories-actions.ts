"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { requireAdminAccess } from "@/lib/auth/admin-auth"
import {
  updateCategoryHomepageSettings,
  updateHomepageCategorySectionSettings,
  uploadCategoryHomepageIcon,
  uploadCategoryHomepageImage,
} from "@/lib/services/categories-service"
import type { CategoryActionState } from "@/types/category"
import { withAdminMutationTimeout } from "@/lib/performance/server-timing"

const emptyState: CategoryActionState = { ok: false, message: "" }

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim()
  return value || null
}

function bool(formData: FormData, key: string): boolean {
  return formData.get(key) === "on"
}

function numberValue(formData: FormData, key: string, fallback = 0): number {
  const parsed = Number(formData.get(key) ?? fallback)
  return Number.isFinite(parsed) ? parsed : fallback
}

function fileValue(formData: FormData, key: string): File | null {
  const value = formData.get(key)
  return value instanceof File && value.size > 0 ? value : null
}

function revalidatePublicCategoryData() {
  revalidateTag("public-categories", "max")
  revalidatePath("/")
  revalidatePath("/admin/content/homepage-categories")
}

export async function saveHomepageCategorySectionAction(
  _prevState: CategoryActionState = emptyState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdminAccess()
  try {
    const result = await withAdminMutationTimeout("save homepage category section", updateHomepageCategorySectionSettings({
      title: text(formData, "title") ?? "",
      subtitle: text(formData, "subtitle") ?? "",
      isActive: bool(formData, "isActive"),
    }))

    revalidatePublicCategoryData()
    return result
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ذخیره تنظیمات بخش دسته‌بندی‌ها" }
  }
}

export async function saveCategoryHomepageSettingsAction(
  _prevState: CategoryActionState = emptyState,
  formData: FormData,
): Promise<CategoryActionState> {
  await requireAdminAccess()
  try {
    const id = text(formData, "id") ?? ""
    const slug = text(formData, "slug") ?? "category"
    const clearImage = bool(formData, "clearHomepageImage")
    const clearIcon = bool(formData, "clearHomepageIcon")

    let homepageImageUrl = clearImage ? null : text(formData, "homepageImageUrl")
    let homepageIconUrl = clearIcon ? null : text(formData, "homepageIconUrl")

    const imageFile = fileValue(formData, "homepageImage")
    if (imageFile) homepageImageUrl = await uploadCategoryHomepageImage(slug, imageFile)

    const iconFile = fileValue(formData, "homepageIcon")
    if (iconFile) homepageIconUrl = await uploadCategoryHomepageIcon(slug, iconFile)

    const result = await withAdminMutationTimeout("save homepage category settings", updateCategoryHomepageSettings({
      id,
      slug,
      homepageTitle: text(formData, "homepageTitle"),
      homepageImageUrl,
      homepageImageAltText: text(formData, "homepageImageAltText"),
      homepageIconUrl,
      homepageIconAltText: text(formData, "homepageIconAltText"),
      homepageUrl: text(formData, "homepageUrl"),
      showOnHomepage: bool(formData, "showOnHomepage"),
      homepageSortOrder: numberValue(formData, "homepageSortOrder", 0),
      isActive: bool(formData, "isActive"),
    }))

    revalidatePublicCategoryData()
    return result
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ذخیره تنظیمات دسته‌بندی" }
  }
}

export async function toggleCategoryHomepageVisibilityAction(formData: FormData) {
  await requireAdminAccess()
  const id = text(formData, "id") ?? ""
  const slug = text(formData, "slug") ?? "category"
  const currentShowOnHomepage = bool(formData, "currentShowOnHomepage")
  const currentIsActive = bool(formData, "currentIsActive")

  await withAdminMutationTimeout("toggle homepage category visibility", updateCategoryHomepageSettings({
    id,
    slug,
    homepageTitle: text(formData, "homepageTitle"),
    homepageImageUrl: text(formData, "homepageImageUrl"),
    homepageImageAltText: text(formData, "homepageImageAltText"),
    homepageIconUrl: text(formData, "homepageIconUrl"),
    homepageIconAltText: text(formData, "homepageIconAltText"),
    homepageUrl: text(formData, "homepageUrl"),
    showOnHomepage: !currentShowOnHomepage,
    homepageSortOrder: numberValue(formData, "homepageSortOrder", 0),
    isActive: currentIsActive,
  }))

  revalidatePublicCategoryData()
}

export async function toggleCategoryActiveAction(formData: FormData) {
  await requireAdminAccess()
  const id = text(formData, "id") ?? ""
  const slug = text(formData, "slug") ?? "category"
  const currentShowOnHomepage = bool(formData, "currentShowOnHomepage")
  const currentIsActive = bool(formData, "currentIsActive")

  await withAdminMutationTimeout("toggle homepage category active", updateCategoryHomepageSettings({
    id,
    slug,
    homepageTitle: text(formData, "homepageTitle"),
    homepageImageUrl: text(formData, "homepageImageUrl"),
    homepageImageAltText: text(formData, "homepageImageAltText"),
    homepageIconUrl: text(formData, "homepageIconUrl"),
    homepageIconAltText: text(formData, "homepageIconAltText"),
    homepageUrl: text(formData, "homepageUrl"),
    showOnHomepage: currentShowOnHomepage,
    homepageSortOrder: numberValue(formData, "homepageSortOrder", 0),
    isActive: !currentIsActive,
  }))

  revalidatePublicCategoryData()
}
