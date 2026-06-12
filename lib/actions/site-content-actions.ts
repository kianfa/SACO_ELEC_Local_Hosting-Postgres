"use server"

import { revalidatePath } from "next/cache"
import { requireAdminAccess } from "@/lib/auth/admin-auth"
import { removeBanner, saveBanner, saveHomepageSection, saveSiteSettings, uploadWebsiteMedia } from "@/lib/services/site-content-service"
import { storeContactConfig } from "@/lib/store-contact-config"
import type { BannerFormInput, HeroSliderImage, SiteContentActionState, SiteSettingsBundle } from "@/types/site-content"

const emptyState: SiteContentActionState = { ok: false, message: "" }

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim()
  return value || null
}

function bool(formData: FormData, key: string): boolean {
  return formData
    .getAll(key)
    .some((value) => ["on", "true", "1", "yes"].includes(String(value).trim().toLowerCase()))
}

function optionalDateTime(formData: FormData, key: string): string | null {
  const value = text(formData, key)
  if (!value) return null

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("تاریخ شروع یا پایان بنر نامعتبر است")
  }

  return parsed.toISOString()
}

function invalidateHomepageBanners() {
  // Homepage banners are intentionally read without unstable_cache because
  // their start/end windows are time-sensitive. Revalidate the homepage after
  // every mutation so a newly active banner appears immediately.
  revalidatePath("/")
}

function numberValue(formData: FormData, key: string, fallback = 0): number {
  const parsed = Number(formData.get(key) ?? fallback)
  return Number.isFinite(parsed) ? parsed : fallback
}

function fileValue(formData: FormData, key: string): File | null {
  const value = formData.get(key)
  return value instanceof File && value.size > 0 ? value : null
}

async function uploadIfPresent(formData: FormData, key: string, folder: string, fileName: string, currentUrl: string | null) {
  const file = fileValue(formData, key)
  if (!file) return currentUrl
  return uploadWebsiteMedia(file, folder, fileName)
}

async function buildHeroSliderImages(formData: FormData): Promise<HeroSliderImage[]> {
  const images: HeroSliderImage[] = []

  for (let index = 0; index < 4; index += 1) {
    const slideNumber = index + 1
    const currentDesktopUrl = bool(formData, `heroSlide${slideNumber}ClearDesktop`) ? null : text(formData, `heroSlide${slideNumber}DesktopUrl`)
    const currentMobileUrl = bool(formData, `heroSlide${slideNumber}ClearMobile`) ? null : text(formData, `heroSlide${slideNumber}MobileUrl`)

    const desktopUrl = await uploadIfPresent(
      formData,
      `heroSlide${slideNumber}Desktop`,
      "homepage/hero",
      `slide-${slideNumber}-desktop.webp`,
      currentDesktopUrl,
    )
    const mobileUrl = await uploadIfPresent(
      formData,
      `heroSlide${slideNumber}Mobile`,
      "homepage/hero",
      `slide-${slideNumber}-mobile.webp`,
      currentMobileUrl,
    )

    if (desktopUrl) {
      images.push({
        desktopUrl,
        mobileUrl,
        altText: text(formData, `heroSlide${slideNumber}AltText`) || `تصویر تجهیزات برق صنعتی ${slideNumber}`,
        sortOrder: numberValue(formData, `heroSlide${slideNumber}SortOrder`, index),
        isActive: bool(formData, `heroSlide${slideNumber}IsActive`),
      })
    }
  }

  return images.sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function saveHomepageContentAction(
  _prevState: SiteContentActionState = emptyState,
  formData: FormData
): Promise<SiteContentActionState> {
  await requireAdminAccess()
  try {
    const heroImageUrl = await uploadIfPresent(formData, "heroImage", "homepage/hero", "hero-main.webp", text(formData, "heroImageUrl"))
    const heroMobileImageUrl = await uploadIfPresent(formData, "heroMobileImage", "homepage/hero", "hero-mobile.webp", text(formData, "heroMobileImageUrl"))
    const promoImageUrl = await uploadIfPresent(formData, "promoImage", "banners", "promo-main.webp", text(formData, "promoImageUrl"))
    const noticeImageUrl = await uploadIfPresent(formData, "noticeImage", "homepage/notice", "notice.webp", text(formData, "noticeImageUrl"))

    const trustPoints = String(formData.get("heroTrustPoints") ?? "")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
    const heroImages = await buildHeroSliderImages(formData)

    let result = await saveHomepageSection({
      sectionKey: "hero",
      title: text(formData, "heroTitle"),
      subtitle: text(formData, "heroSubtitle"),
      description: text(formData, "heroDescription"),
      imageUrl: heroImageUrl,
      mobileImageUrl: heroMobileImageUrl,
      primaryButtonText: text(formData, "heroPrimaryButtonText"),
      primaryButtonUrl: text(formData, "heroPrimaryButtonUrl"),
      secondaryButtonText: text(formData, "heroSecondaryButtonText"),
      secondaryButtonUrl: text(formData, "heroSecondaryButtonUrl"),
      metadata: { trustPoints, heroImages },
      isActive: bool(formData, "heroIsActive"),
      sortOrder: 1,
    })
    if (!result.ok) return result

    result = await saveHomepageSection({
      sectionKey: "promo_banner",
      title: text(formData, "promoTitle"),
      subtitle: text(formData, "promoSubtitle"),
      description: text(formData, "promoDescription"),
      imageUrl: promoImageUrl,
      primaryButtonText: text(formData, "promoButtonText"),
      primaryButtonUrl: text(formData, "promoButtonUrl"),
      metadata: {
        badgeText: text(formData, "promoBadgeText"),
        imageAltText: text(formData, "promoImageAltText") || text(formData, "promoTitle") || "بنر ساکو الکتریک",
      },
      isActive: bool(formData, "promoIsActive"),
      sortOrder: 2,
    })
    if (!result.ok) return result

    result = await saveHomepageSection({
      sectionKey: "homepage_notice",
      title: text(formData, "noticeTitle"),
      description: text(formData, "noticeDescription"),
      imageUrl: noticeImageUrl,
      primaryButtonText: text(formData, "noticeButtonText"),
      primaryButtonUrl: text(formData, "noticeButtonUrl"),
      isActive: bool(formData, "noticeIsActive"),
      sortOrder: 3,
    })
    if (!result.ok) return result

    revalidatePath("/")
    revalidatePath("/admin/content/homepage")
    return { ok: true, message: "محتوای صفحه اصلی با موفقیت ذخیره شد" }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ذخیره محتوای صفحه اصلی" }
  }
}

export async function saveBannerAction(
  _prevState: SiteContentActionState = emptyState,
  formData: FormData
): Promise<SiteContentActionState> {
  await requireAdminAccess()
  try {
    const id = text(formData, "id") ?? undefined
    const imageUrl = await uploadIfPresent(
      formData,
      "image",
      "banners",
      id ? `banner-${id}.webp` : `banner-${Date.now()}.webp`,
      text(formData, "imageUrl")
    )

    const input: BannerFormInput = {
      id,
      title: text(formData, "title") ?? "",
      subtitle: text(formData, "subtitle"),
      description: text(formData, "description"),
      imageUrl,
      imageAltText: text(formData, "imageAltText") || text(formData, "title") || "بنر ساکو الکتریک",
      buttonText: text(formData, "buttonText"),
      buttonUrl: text(formData, "buttonUrl"),
      badgeText: text(formData, "badgeText"),
      placement: text(formData, "placement") ?? "homepage_promo",
      isActive: bool(formData, "isActive"),
      startsAt: optionalDateTime(formData, "startsAt"),
      endsAt: optionalDateTime(formData, "endsAt"),
      sortOrder: numberValue(formData, "sortOrder", 0),
    }

    const result = await saveBanner(input)
    if (!result.ok) return result
    invalidateHomepageBanners()
    revalidatePath("/products")
    revalidatePath("/checkout")
    revalidatePath("/contact")
    revalidatePath("/products")
    revalidatePath("/categories")
    revalidatePath("/brands")
    revalidatePath("/admin/content/banners")
    return result
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ذخیره بنر" }
  }
}

export async function deleteBannerAction(formData: FormData) {
  await requireAdminAccess()
  const id = text(formData, "id")
  if (id) await removeBanner(id)
  invalidateHomepageBanners()
  revalidatePath("/admin/content/banners")
}

export async function saveSiteSettingsAction(
  _prevState: SiteContentActionState = emptyState,
  formData: FormData
): Promise<SiteContentActionState> {
  await requireAdminAccess()
  try {
    const trustBadgeImageUrl = await uploadIfPresent(formData, "trustBadgeImage", "footer", "trust-badge.webp", text(formData, "trustBadgeImageUrl"))
    const settings: SiteSettingsBundle = {
      contactInfo: {
        brandName: text(formData, "brandName") ?? storeContactConfig.brandName,
        phone: text(formData, "phone") ?? undefined,
        landline: text(formData, "phone") ?? undefined,
        mobile: text(formData, "mobile") ?? text(formData, "supportPhone") ?? undefined,
        supportPhone: text(formData, "supportPhone") ?? text(formData, "mobile") ?? undefined,
        telegramUsername: text(formData, "telegramUsername") ?? undefined,
        telegramUrl: text(formData, "telegramUrl") ?? undefined,
        telegramPhone: text(formData, "telegramPhone") ?? text(formData, "supportPhone") ?? undefined,
        whatsappUrl: text(formData, "whatsappUrl") ?? undefined,
        baleUsername: text(formData, "baleUsername") ?? undefined,
        balePhone: text(formData, "balePhone") ?? text(formData, "supportPhone") ?? undefined,
        address: text(formData, "address") ?? undefined,
        workingHours: text(formData, "workingHours") ?? undefined,
        email: text(formData, "email") ?? undefined,
        messagingApps: ["واتساپ", "بله", "روبیکا", "تلگرام"],
      },
      footerInfo: {
        description: text(formData, "footerDescription") ?? undefined,
        copyright: text(formData, "copyright") ?? undefined,
        trustBadgeImageUrl: trustBadgeImageUrl ?? undefined,
        trustBadgeImageAltText: text(formData, "trustBadgeImageAltText") ?? "نشان اعتماد ساکو الکتریک",
        instagramUrl: text(formData, "instagramUrl") ?? undefined,
        telegramUrl: text(formData, "footerTelegramUrl") ?? undefined,
        instagramIsActive: bool(formData, "instagramIsActive"),
        telegramIsActive: bool(formData, "footerTelegramIsActive"),
        baleUrl: text(formData, "baleUrl") ?? undefined,
        baleIsActive: bool(formData, "baleIsActive"),
        linkedinUrl: text(formData, "linkedinUrl") ?? undefined,
        linkedinIsActive: bool(formData, "linkedinIsActive"),
      },
      manualCheckout: {
        explanationText: text(formData, "manualExplanationText") ?? undefined,
        helperText: text(formData, "manualHelperText") ?? undefined,
        cardToCardInstructionText: text(formData, "cardToCardInstructionText") ?? undefined,
        onlinePaymentDisabledText: text(formData, "onlinePaymentDisabledText") ?? undefined,
      },
    }
    const result = await saveSiteSettings(settings)
    revalidatePath("/")
    revalidatePath("/checkout")
    revalidatePath("/contact")
    revalidatePath("/products")
    revalidatePath("/categories")
    revalidatePath("/brands")
    revalidatePath("/admin/content/settings")
    return result
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "خطا در ذخیره تنظیمات" }
  }
}
