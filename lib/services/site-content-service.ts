import {
  createBanner,
  deleteBanner,
  fetchAdminBanners,
  fetchAdminHomepageSections,
  fetchAdminSiteSettings,
  fetchActiveBannersByPlacement,
  fetchBanners,
  fetchHomepageSection,
  fetchHomepageSections,
  fetchSiteSettings,
  updateBanner,
  uploadSiteMedia,
  upsertHomepageSection,
  upsertSiteSetting,
} from "@/lib/repositories/site-content-repository"
import type { BannerFormInput, HomepageSection, SiteSettingsBundle } from "@/types/site-content"
import { assertSafeImageFile, toSafePathSegment } from "@/lib/security/file-upload"
import { withAdminMutationTimeout } from "@/lib/performance/server-timing"

export const getHomepageSection = fetchHomepageSection
export const getHomepageSections = fetchHomepageSections
export const getSiteBanners = fetchBanners
export const getActiveBannersByPlacement = fetchActiveBannersByPlacement
export const getSiteSettings = fetchSiteSettings
export const getAdminHomepageSections = fetchAdminHomepageSections
export const getAdminSiteBanners = fetchAdminBanners
export const getAdminSiteSettings = fetchAdminSiteSettings

export async function saveHomepageSection(section: Partial<HomepageSection> & { sectionKey: string }) {
  if (section.sectionKey === "hero" && !section.title?.trim()) {
    return { ok: false, message: "عنوان اصلی hero الزامی است" }
  }
  await withAdminMutationTimeout("save homepage section", upsertHomepageSection(section))
  return { ok: true, message: "محتوای صفحه اصلی ذخیره شد" }
}

export async function saveSiteSettings(settings: SiteSettingsBundle) {
  await withAdminMutationTimeout("save contact settings", upsertSiteSetting("contact_info", settings.contactInfo))
  await withAdminMutationTimeout("save footer settings", upsertSiteSetting("footer_info", settings.footerInfo))
  await withAdminMutationTimeout("save checkout settings", upsertSiteSetting("manual_checkout", settings.manualCheckout))
  return { ok: true, message: "تنظیمات سایت با موفقیت ذخیره شد" }
}

export async function saveBanner(input: BannerFormInput) {
  if (!input.title.trim()) return { ok: false, message: "عنوان بنر الزامی است" }
  if (!input.placement.trim()) return { ok: false, message: "محل نمایش بنر الزامی است" }
  if (input.startsAt && input.endsAt && new Date(input.startsAt).getTime() > new Date(input.endsAt).getTime()) {
    return { ok: false, message: "زمان پایان بنر باید بعد از زمان شروع باشد" }
  }
  if (input.id) await withAdminMutationTimeout("update banner", updateBanner(input as BannerFormInput & { id: string }))
  else await withAdminMutationTimeout("create banner", createBanner(input))
  return { ok: true, message: "بنر ذخیره شد" }
}

export async function removeBanner(id: string) {
  await withAdminMutationTimeout("delete banner", deleteBanner(id))
  return { ok: true, message: "بنر حذف شد" }
}

export async function uploadWebsiteMedia(file: File, folder: string, fileName: string) {
  assertSafeImageFile(file)

  const safeFolder = folder
    .split("/")
    .filter(Boolean)
    .map((part) => toSafePathSegment(part, "folder"))
    .join("/")
  const safeFileName = toSafePathSegment(fileName.replace(/\.[^.]+$/, ""), "site-media")

  return uploadSiteMedia(file, safeFolder, safeFileName)
}
