import { cache } from "react"
import { unstable_cache } from "next/cache"
import {
  fetchAllCategoriesForAdmin,
  fetchCategories,
  fetchCategoriesWithProductCounts,
  fetchCategoryProductCounts,
  fetchHomepageCategories,
  updateCategoryHomepageSettings as updateCategoryHomepageSettingsInRepository,
} from "@/lib/repositories/categories-repository"
import { fetchAdminHomepageSections, fetchHomepageSection, upsertHomepageSection } from "@/lib/repositories/site-content-repository"
import { uploadWebsiteMedia } from "@/lib/services/site-content-service"
import { performanceDebugEnabled, safePerformanceError, withPublicDataTimeout, withServerTiming } from "@/lib/performance/server-timing"
import { traceLog } from "@/lib/performance/request-tracing"
import type { AdminCategoryHomepageSettingsInput, Category, HomepageCategorySectionSettings } from "@/types/category"
import type { FooterCategoryLink } from "@/types/storefront"
import { toSafePathSegment } from "@/lib/security/file-upload"

const DEFAULT_HOMEPAGE_CATEGORY_SETTINGS: HomepageCategorySectionSettings = {
  title: "دسته‌بندی تجهیزات",
  subtitle: "انتخاب سریع تجهیزات برق صنعتی بر اساس دسته‌بندی",
  isActive: true,
}

async function fetchPublicCategoriesUncached(): Promise<Category[]> {
  try {
    return await withPublicDataTimeout("public categories lookup", (signal) => fetchCategories(signal))
  } catch (error) {
    if (performanceDebugEnabled()) {
      console.log(`[perf] public categories fallback ${safePerformanceError(error)}`)
    }
    return []
  }
}

async function fetchHomepageCategoriesUncached(): Promise<Category[]> {
  try {
    const categories = await withPublicDataTimeout("homepage categories lookup", (signal) => fetchHomepageCategories(signal))
    if (performanceDebugEnabled()) {
      console.log(`[perf] homepage categories mapped count=${categories.length}`)
    }
    return categories
  } catch (error) {
    if (performanceDebugEnabled()) {
      console.log(`[perf] homepage categories fallback ${safePerformanceError(error)}`)
    }
    return []
  }
}

const getCachedPublicCategories = unstable_cache(
  async () => fetchPublicCategoriesUncached(),
  ["public-categories-v1"],
  { revalidate: 300, tags: ["public-categories"] },
)

const getCachedHomepageCategories = unstable_cache(
  async () => fetchHomepageCategoriesUncached(),
  ["public-homepage-categories-v1"],
  { revalidate: 300, tags: ["public-categories"] },
)

// React cache deduplicates callers within one Server Component render request.
// unstable_cache handles reuse across requests and controlled revalidation.
const getRequestScopedPublicCategories = cache(async () => getCachedPublicCategories())
const getRequestScopedHomepageCategories = cache(async () => getCachedHomepageCategories())

// Application service API used by pages/components.
// Keep this provider-agnostic so a future PostgreSQL/API provider can replace
// the repository without changing homepage or admin UI.
export async function getCategories(requestedBy = "unspecified-call-site"): Promise<Category[]> {
  traceLog(`fetchPublicCategories caller=${requestedBy}`)
  return withServerTiming(`getCategories ${requestedBy}`, () => getRequestScopedPublicCategories())
}

export async function getCategoriesWithProductCounts(): Promise<Category[]> {
  return fetchCategoriesWithProductCounts()
}

export async function getCategoryProductCounts(): Promise<Record<string, number>> {
  return fetchCategoryProductCounts()
}

export async function getHomepageCategories(requestedBy = "unspecified-call-site"): Promise<Category[]> {
  traceLog(`fetchHomepageCategories caller=${requestedBy}`)
  return withServerTiming(`getHomepageCategories ${requestedBy}`, () => getRequestScopedHomepageCategories())
}

export async function getFooterCategoryLinks(requestedBy = "unspecified-call-site"): Promise<FooterCategoryLink[]> {
  traceLog(`fetchFooterCategoryLinks caller=${requestedBy}`)

  // The footer must reflect the current database rows after a normal refresh.
  // Use the public homepage-category query directly instead of the shared
  // five-minute category cache, and do not fall back to hidden categories when
  // no category is configured for public homepage/footer display.
  const categories = await withServerTiming(`getFooterCategoryLinks ${requestedBy}`, () => fetchHomepageCategoriesUncached())

  return categories
    .filter((category) => category.isActive !== false && category.showOnHomepage !== false)
    .slice(0, 8)
    .map((category) => ({
      name: category.homepageTitle || category.name,
      slug: category.slug,
      href: category.homepageUrl || `/products?category=${encodeURIComponent(category.slug)}`,
    }))
}

export async function getAllCategoriesForAdmin(): Promise<Category[]> {
  return fetchAllCategoriesForAdmin()
}

export async function updateCategoryHomepageSettings(input: AdminCategoryHomepageSettingsInput) {
  if (!input.id) return { ok: false, message: "شناسه دسته‌بندی نامعتبر است" }
  if (!input.slug.trim()) return { ok: false, message: "slug دسته‌بندی نامعتبر است" }
  if (!Number.isFinite(input.homepageSortOrder)) return { ok: false, message: "ترتیب نمایش باید عددی باشد" }

  await updateCategoryHomepageSettingsInRepository(input)
  return { ok: true, message: "تنظیمات دسته‌بندی صفحه اصلی ذخیره شد" }
}

export async function uploadCategoryHomepageImage(categorySlug: string, file: File) {
  const safeSlug = toSafePathSegment(categorySlug, "category")
  return uploadWebsiteMedia(file, `categories/${safeSlug}`, "homepage.webp")
}

export async function uploadCategoryHomepageIcon(categorySlug: string, file: File) {
  const safeSlug = toSafePathSegment(categorySlug, "category")
  return uploadWebsiteMedia(file, `categories/${safeSlug}`, "icon.webp")
}

export async function getHomepageCategorySectionSettings(): Promise<HomepageCategorySectionSettings> {
  const section = await fetchHomepageSection("homepage_categories")
  if (!section) return DEFAULT_HOMEPAGE_CATEGORY_SETTINGS
  return {
    title: section.title || DEFAULT_HOMEPAGE_CATEGORY_SETTINGS.title,
    subtitle: section.subtitle || DEFAULT_HOMEPAGE_CATEGORY_SETTINGS.subtitle,
    isActive: section.isActive,
  }
}

export async function getAdminHomepageCategorySectionSettings(): Promise<HomepageCategorySectionSettings> {
  const sections = await fetchAdminHomepageSections()
  const section = sections.find((item) => item.sectionKey === "homepage_categories")
  if (!section) return DEFAULT_HOMEPAGE_CATEGORY_SETTINGS
  return {
    title: section.title || DEFAULT_HOMEPAGE_CATEGORY_SETTINGS.title,
    subtitle: section.subtitle || DEFAULT_HOMEPAGE_CATEGORY_SETTINGS.subtitle,
    isActive: section.isActive,
  }
}

export async function updateHomepageCategorySectionSettings(input: HomepageCategorySectionSettings) {
  if (!input.title.trim()) return { ok: false, message: "عنوان بخش الزامی است" }
  await upsertHomepageSection({
    sectionKey: "homepage_categories",
    title: input.title.trim(),
    subtitle: input.subtitle.trim() || null,
    isActive: input.isActive,
    sortOrder: 1,
    metadata: {},
  })
  return { ok: true, message: "تنظیمات بخش دسته‌بندی‌های صفحه اصلی ذخیره شد" }
}
