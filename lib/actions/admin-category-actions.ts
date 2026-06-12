"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { requireAdminAccess } from "@/lib/auth/admin-auth"
import {
  createCategory,
  deleteCategory,
  toggleCategoryActive,
  toggleCategoryHomepageVisibility,
  updateCategory,
  uploadCategoryImage,
} from "@/lib/services/admin-categories-service"
import type { AdminCategoryInput, CategoryActionState } from "@/types/category"
import { withAdminMutationTimeout } from "@/lib/performance/server-timing"

const emptyState: CategoryActionState = { ok: false, message: "" }
const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim()
const bool = (formData: FormData, key: string) => formData.get(key) === "on"
const numberValue = (formData: FormData, key: string, fallback = 0) => {
  const parsed = Number(formData.get(key) ?? fallback)
  return Number.isFinite(parsed) ? parsed : fallback
}
const nullableId = (value: string) => value && value !== "none" ? value : null
const file = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return value instanceof File && value.size ? value : null
}

function revalidateCategories() {
  revalidateTag("public-categories", "max")
  revalidatePath("/")
  revalidatePath("/categories")
  revalidatePath("/products")
  revalidatePath("/admin/categories")
  revalidatePath("/admin/products")
  revalidatePath("/admin/content/homepage-categories")
}

function inputFrom(formData: FormData, urls: { imageUrl: string | null; homepageImageUrl: string | null; homepageIconUrl: string | null }): AdminCategoryInput {
  return {
    name: text(formData, "name"),
    slug: text(formData, "slug").toLowerCase(),
    description: text(formData, "description") || null,
    parentId: nullableId(text(formData, "parentId")),
    imageUrl: urls.imageUrl,
    imageAltText: text(formData, "imageAltText") || null,
    homepageTitle: text(formData, "homepageTitle") || null,
    homepageImageUrl: urls.homepageImageUrl,
    homepageImageAltText: text(formData, "homepageImageAltText") || null,
    homepageIconUrl: urls.homepageIconUrl,
    homepageIconAltText: text(formData, "homepageIconAltText") || null,
    homepageUrl: text(formData, "homepageUrl") || null,
    showOnHomepage: bool(formData, "showOnHomepage"),
    homepageSortOrder: numberValue(formData, "homepageSortOrder", 0),
    isActive: bool(formData, "isActive"),
  }
}

export async function saveCategoryAction(_prev: CategoryActionState = emptyState, formData: FormData): Promise<CategoryActionState> {
  await requireAdminAccess()
  try {
    const id = text(formData, "id")
    const slug = text(formData, "slug").toLowerCase()
    let imageUrl = bool(formData, "clearImage") ? null : text(formData, "imageUrl") || null
    let homepageImageUrl = bool(formData, "clearHomepageImage") ? null : text(formData, "homepageImageUrl") || null
    let homepageIconUrl = bool(formData, "clearHomepageIcon") ? null : text(formData, "homepageIconUrl") || null
    const generalFile = file(formData, "image")
    const homepageFile = file(formData, "homepageImage")
    const iconFile = file(formData, "homepageIcon")
    if (generalFile) imageUrl = await uploadCategoryImage(generalFile, slug, "general")
    if (homepageFile) homepageImageUrl = await uploadCategoryImage(homepageFile, slug, "homepage")
    if (iconFile) homepageIconUrl = await uploadCategoryImage(iconFile, slug, "icon")
    const input = inputFrom(formData, { imageUrl, homepageImageUrl, homepageIconUrl })
    const category = id
      ? await withAdminMutationTimeout("update category", updateCategory(id, input))
      : await withAdminMutationTimeout("create category", createCategory(input))
    revalidateCategories()
    return { ok: true, message: "دسته‌بندی با موفقیت ذخیره شد", createdCategory: category, redirectTo: text(formData, "intent") === "save-new" ? "/admin/categories/new" : "/admin/categories" }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ثبت دسته‌بندی" }
  }
}

export async function quickCreateCategoryAction(_prev: CategoryActionState = emptyState, formData: FormData): Promise<CategoryActionState> {
  await requireAdminAccess()
  try {
    const category = await withAdminMutationTimeout("quick create category", createCategory({
      name: text(formData, "name"),
      slug: text(formData, "slug").toLowerCase(),
      parentId: nullableId(text(formData, "parentId")),
      description: null,
      imageUrl: null,
      imageAltText: null,
      homepageImageUrl: null,
      homepageImageAltText: null,
      homepageIconUrl: null,
      homepageIconAltText: null,
      homepageTitle: null,
      homepageUrl: null,
      showOnHomepage: true,
      homepageSortOrder: 0,
      isActive: true,
    }))
    revalidateCategories()
    return { ok: true, message: "دسته‌بندی با موفقیت ذخیره شد", createdCategory: category }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ثبت دسته‌بندی" }
  }
}

export async function toggleAdminCategoryActiveAction(formData: FormData) {
  await requireAdminAccess()
  await withAdminMutationTimeout("toggle category active", toggleCategoryActive(text(formData, "id"), !bool(formData, "currentIsActive")))
  revalidateCategories()
}

export async function toggleAdminCategoryHomepageAction(formData: FormData) {
  await requireAdminAccess()
  await withAdminMutationTimeout("toggle category homepage visibility", toggleCategoryHomepageVisibility(text(formData, "id"), !bool(formData, "currentShowOnHomepage")))
  revalidateCategories()
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdminAccess()
  await withAdminMutationTimeout("delete category", deleteCategory(text(formData, "id")))
  revalidateCategories()
}
