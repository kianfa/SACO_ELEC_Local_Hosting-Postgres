"use server"

import { revalidatePath } from "next/cache"
import { requireAdminAccess } from "@/lib/auth/admin-auth"
import { createBrand, deleteBrand, toggleBrandActive, updateBrand, uploadBrandLogo } from "@/lib/services/admin-brands-service"
import type { AdminBrandInput, BrandActionState } from "@/types/brand"
import { withAdminMutationTimeout } from "@/lib/performance/server-timing"

const emptyState: BrandActionState = { ok: false, message: "" }
const text = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim()
const bool = (formData: FormData, key: string) => formData.get(key) === "on"
const file = (formData: FormData, key: string) => {
  const value = formData.get(key)
  return value instanceof File && value.size ? value : null
}

function revalidateBrands() {
  revalidatePath("/")
  revalidatePath("/brands")
  revalidatePath("/products")
  revalidatePath("/admin/brands")
  revalidatePath("/admin/products")
}

function inputFrom(formData: FormData, logoUrl: string | null): AdminBrandInput {
  return {
    name: text(formData, "name"),
    slug: text(formData, "slug").toLowerCase(),
    description: text(formData, "description") || null,
    logoUrl,
    logoAltText: text(formData, "logoAltText") || null,
    isActive: bool(formData, "isActive"),
  }
}

export async function saveBrandAction(_prev: BrandActionState = emptyState, formData: FormData): Promise<BrandActionState> {
  await requireAdminAccess()
  try {
    const id = text(formData, "id")
    const slug = text(formData, "slug").toLowerCase()
    let logoUrl = bool(formData, "clearLogo") ? null : text(formData, "logoUrl") || null
    const logoFile = file(formData, "logo")
    if (logoFile) logoUrl = await uploadBrandLogo(logoFile, slug)
    const input = inputFrom(formData, logoUrl)
    const brand = id
      ? await withAdminMutationTimeout("update brand", updateBrand(id, input))
      : await withAdminMutationTimeout("create brand", createBrand(input))
    revalidateBrands()
    return { ok: true, message: "برند با موفقیت ذخیره شد", createdBrand: brand, redirectTo: text(formData, "intent") === "save-new" ? "/admin/brands/new" : "/admin/brands" }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ثبت برند" }
  }
}

export async function quickCreateBrandAction(_prev: BrandActionState = emptyState, formData: FormData): Promise<BrandActionState> {
  await requireAdminAccess()
  try {
    const brand = await withAdminMutationTimeout("quick create brand", createBrand({ name: text(formData, "name"), slug: text(formData, "slug").toLowerCase(), description: null, logoUrl: null, logoAltText: null, isActive: true }))
    revalidateBrands()
    return { ok: true, message: "برند با موفقیت ذخیره شد", createdBrand: brand }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ثبت برند" }
  }
}

export async function toggleBrandActiveAction(formData: FormData) {
  await requireAdminAccess()
  await withAdminMutationTimeout("toggle brand active", toggleBrandActive(text(formData, "id"), !bool(formData, "currentIsActive")))
  revalidateBrands()
}

export async function deleteBrandAction(formData: FormData) {
  await requireAdminAccess()
  await withAdminMutationTimeout("delete brand", deleteBrand(text(formData, "id")))
  revalidateBrands()
}
