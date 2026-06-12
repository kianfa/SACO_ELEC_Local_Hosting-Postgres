import { getReadDbClient, getServerDbClient } from "@/lib/supabase/get-db-client"

import { createRequestTimeoutSignal } from "@/lib/performance/server-timing"
import type {
  BannerFormInput,
  HomepageSection,
  JsonRecord,
  SiteBanner,
  SiteSetting,
  SiteSettingsBundle,
} from "@/types/site-content"

const LEGACY_SITE_MEDIA_BUCKET = "site-media"
export const HOMEPAGE_PROMO_PLACEMENT = "homepage_promo"

type RawSection = {
  id: string | number
  section_key: string | null
  title?: string | null
  subtitle?: string | null
  description?: string | null
  image_url?: string | null
  mobile_image_url?: string | null
  primary_button_text?: string | null
  primary_button_url?: string | null
  secondary_button_text?: string | null
  secondary_button_url?: string | null
  metadata?: JsonRecord | null
  is_active?: boolean | null
  sort_order?: number | string | null
}

type RawBanner = {
  id: string | number
  title: string | null
  subtitle?: string | null
  description?: string | null
  image_url?: string | null
  image_alt_text?: string | null
  button_text?: string | null
  button_url?: string | null
  badge_text?: string | null
  placement?: string | null
  is_active?: boolean | null
  starts_at?: string | null
  ends_at?: string | null
  sort_order?: number | string | null
  created_at?: string | null
}

type RawSetting = { id: string | number; key: string | null; value?: JsonRecord | null }

function toNumber(value: number | string | null | undefined, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function isMissingTableOrColumn(message: string) {
  const lower = message.toLowerCase()
  return lower.includes("does not exist") || lower.includes("schema cache")
}

function normalizePlacement(value: string | null | undefined) {
  const raw = (value || HOMEPAGE_PROMO_PLACEMENT).trim()
  if (["promo_banner", "homepage_banner", "home_promo", "homepage-promo"].includes(raw)) return HOMEPAGE_PROMO_PLACEMENT
  return raw || HOMEPAGE_PROMO_PLACEMENT
}

function normalizePublicMediaUrl(value: string | null | undefined) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed

  // Backward-compatible fallback: if an older row stored only the Storage path
  // such as "banners/promo.webp", convert it to the public URL here. UI components
  // still receive a clean URL and remain independent from Supabase.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "")
  if (!supabaseUrl) return trimmed
  const path = trimmed.startsWith(`${LEGACY_SITE_MEDIA_BUCKET}/`) ? trimmed.slice(`${LEGACY_SITE_MEDIA_BUCKET}/`.length) : trimmed
  return `${supabaseUrl}/storage/v1/object/public/${LEGACY_SITE_MEDIA_BUCKET}/${path.replace(/^\/+/, "")}`
}


function normalizeHomepageMetadata(metadata: JsonRecord | null | undefined): JsonRecord {
  const base = metadata ?? {}
  const rawImages = base.heroImages

  if (!Array.isArray(rawImages)) return base

  return {
    ...base,
    heroImages: rawImages.map((item, index) => {
      const image = item as Record<string, unknown>
      return {
        desktopUrl: normalizePublicMediaUrl(typeof image.desktopUrl === "string" ? image.desktopUrl : null) ?? "",
        mobileUrl: normalizePublicMediaUrl(typeof image.mobileUrl === "string" ? image.mobileUrl : null),
        altText: typeof image.altText === "string" ? image.altText : `تصویر تجهیزات برق صنعتی ${index + 1}`,
        sortOrder: toNumber(image.sortOrder as number | string | null | undefined, index),
        isActive: image.isActive !== false,
      }
    }),
  }
}

function mapSection(row: RawSection): HomepageSection {
  return {
    id: String(row.id),
    sectionKey: row.section_key ?? "",
    title: row.title ?? null,
    subtitle: row.subtitle ?? null,
    description: row.description ?? null,
    imageUrl: normalizePublicMediaUrl(row.image_url),
    mobileImageUrl: normalizePublicMediaUrl(row.mobile_image_url),
    primaryButtonText: row.primary_button_text ?? null,
    primaryButtonUrl: row.primary_button_url ?? null,
    secondaryButtonText: row.secondary_button_text ?? null,
    secondaryButtonUrl: row.secondary_button_url ?? null,
    metadata: normalizeHomepageMetadata(row.metadata),
    isActive: Boolean(row.is_active ?? true),
    sortOrder: toNumber(row.sort_order),
  }
}

function mapBanner(row: RawBanner): SiteBanner {
  return {
    id: String(row.id),
    title: row.title ?? "بنر بدون عنوان",
    subtitle: row.subtitle ?? null,
    description: row.description ?? null,
    imageUrl: normalizePublicMediaUrl(row.image_url),
    imageAltText: row.image_alt_text?.trim() || row.title || "بنر ساکو الکتریک",
    buttonText: row.button_text ?? null,
    buttonUrl: row.button_url ?? null,
    badgeText: row.badge_text ?? null,
    placement: normalizePlacement(row.placement),
    isActive: Boolean(row.is_active ?? true),
    startsAt: row.starts_at ?? null,
    endsAt: row.ends_at ?? null,
    sortOrder: toNumber(row.sort_order),
  }
}

function mapSetting(row: RawSetting): SiteSetting {
  return { id: String(row.id), key: row.key ?? "", value: row.value ?? {} }
}

function logDev(message: string, payload: unknown) {
  if (process.env.DEBUG_PERFORMANCE !== "true") return
  const count = Array.isArray(payload) ? payload.length : undefined
  console.log(count === undefined ? message : `${message} count=${count}`)
}

// Public read repository. Supabase is isolated here so the provider can be replaced later.
export async function fetchHomepageSection(sectionKey: string, includeInactive = false): Promise<HomepageSection | null> {
  const supabase = await getReadDbClient()
  let query = supabase.from("homepage_sections").select("*").eq("section_key", sectionKey)
  if (!includeInactive) query = query.eq("is_active", true)

  const { data, error } = await query.abortSignal(createRequestTimeoutSignal("publicData")).maybeSingle()
  if (error) {
    if (isMissingTableOrColumn(error.message)) return null
    throw new Error(`Failed to fetch homepage section: ${error.message}`)
  }
  return data ? mapSection(data as RawSection) : null
}

export async function fetchHomepageSections(includeInactive = false): Promise<HomepageSection[]> {
  const supabase = await getReadDbClient()
  let query = supabase.from("homepage_sections").select("*").order("sort_order", { ascending: true })
  if (!includeInactive) query = query.eq("is_active", true)
  const { data, error } = await query.abortSignal(createRequestTimeoutSignal("publicData"))
  if (error) {
    if (isMissingTableOrColumn(error.message)) return []
    throw new Error(`Failed to fetch homepage sections: ${error.message}`)
  }
  return ((data ?? []) as RawSection[]).map(mapSection)
}

export async function fetchBanners(placement?: string, includeInactive = false): Promise<SiteBanner[]> {
  const supabase = await getReadDbClient()
  let query = supabase.from("site_banners").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false })
  if (placement) query = query.eq("placement", normalizePlacement(placement))
  if (!includeInactive) query = query.eq("is_active", true)
  const { data, error } = await query.abortSignal(createRequestTimeoutSignal("publicData"))
  if (error) {
    if (isMissingTableOrColumn(error.message)) return []
    throw new Error(`Failed to fetch banners: ${error.message}`)
  }
  return ((data ?? []) as RawBanner[]).map(mapBanner)
}

export async function fetchActiveBannersByPlacement(placement: string): Promise<SiteBanner[]> {
  const now = new Date().toISOString()
  const normalizedPlacement = normalizePlacement(placement)
  const supabase = await getReadDbClient()

  const { data, error } = await supabase
    .from("site_banners")
    .select("*")
    .eq("placement", normalizedPlacement)
    .eq("is_active", true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })
    .abortSignal(createRequestTimeoutSignal("publicData"))

  if (error) {
    if (isMissingTableOrColumn(error.message)) return []
    throw new Error(`Failed to fetch active banners: ${error.message}`)
  }

  const banners = ((data ?? []) as RawBanner[]).map(mapBanner)
  if (process.env.DEBUG_PERFORMANCE === "true") {
    console.log("[banner-flow] public homepage banners result", {
      placement: normalizedPlacement,
      count: banners.length,
      banners: banners.map((banner) => ({
        id: banner.id,
        placement: banner.placement,
        isActive: banner.isActive,
        startsAt: banner.startsAt,
        endsAt: banner.endsAt,
        sortOrder: banner.sortOrder,
        imageSource: banner.imageUrl?.startsWith("/uploads/") ? "local" : banner.imageUrl ? "legacy-or-external" : "none",
      })),
    })
  }
  return banners
}

export async function fetchSiteSettings(): Promise<SiteSettingsBundle> {
  const supabase = await getReadDbClient()
  const { data, error } = await supabase.from("site_settings").select("*").abortSignal(createRequestTimeoutSignal("publicData"))
  if (error) {
    if (isMissingTableOrColumn(error.message)) return { contactInfo: {}, footerInfo: {}, manualCheckout: {} }
    throw new Error(`Failed to fetch site settings: ${error.message}`)
  }
  const settings = ((data ?? []) as RawSetting[]).map(mapSetting)
  const find = (key: string) => settings.find((item) => item.key === key)?.value ?? {}
  return {
    contactInfo: find("contact_info") as SiteSettingsBundle["contactInfo"],
    footerInfo: find("footer_info") as SiteSettingsBundle["footerInfo"],
    manualCheckout: find("manual_checkout") as SiteSettingsBundle["manualCheckout"],
  }
}

// Admin server-side repository. Create/update/delete/upload operations belong here only.
export async function fetchAdminHomepageSections(): Promise<HomepageSection[]> {
  const supabase = await getServerDbClient()
  const { data, error } = await supabase.from("homepage_sections").select("*").order("sort_order", { ascending: true })
  if (error) {
    if (isMissingTableOrColumn(error.message)) return []
    throw new Error(`Failed to fetch homepage content: ${error.message}`)
  }
  return ((data ?? []) as RawSection[]).map(mapSection)
}

export async function fetchAdminBanners(): Promise<SiteBanner[]> {
  const supabase = await getServerDbClient()
  const { data, error } = await supabase.from("site_banners").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false })
  if (error) {
    if (isMissingTableOrColumn(error.message)) return []
    throw new Error(`Failed to fetch banners: ${error.message}`)
  }
  return ((data ?? []) as RawBanner[]).map(mapBanner)
}

export async function fetchAdminSiteSettings(): Promise<SiteSettingsBundle> {
  const supabase = await getServerDbClient()
  const { data, error } = await supabase.from("site_settings").select("*")
  if (error) {
    if (isMissingTableOrColumn(error.message)) return { contactInfo: {}, footerInfo: {}, manualCheckout: {} }
    throw new Error(`Failed to fetch settings: ${error.message}`)
  }
  const settings = ((data ?? []) as RawSetting[]).map(mapSetting)
  const find = (key: string) => settings.find((item) => item.key === key)?.value ?? {}
  return {
    contactInfo: find("contact_info") as SiteSettingsBundle["contactInfo"],
    footerInfo: find("footer_info") as SiteSettingsBundle["footerInfo"],
    manualCheckout: find("manual_checkout") as SiteSettingsBundle["manualCheckout"],
  }
}

export async function upsertHomepageSection(section: Partial<HomepageSection> & { sectionKey: string }): Promise<void> {
  const supabase = await getServerDbClient()
  const payload = {
    section_key: section.sectionKey,
    title: section.title ?? null,
    subtitle: section.subtitle ?? null,
    description: section.description ?? null,
    image_url: section.imageUrl ?? null,
    mobile_image_url: section.mobileImageUrl ?? null,
    primary_button_text: section.primaryButtonText ?? null,
    primary_button_url: section.primaryButtonUrl ?? null,
    secondary_button_text: section.secondaryButtonText ?? null,
    secondary_button_url: section.secondaryButtonUrl ?? null,
    metadata: section.metadata ?? {},
    is_active: section.isActive ?? true,
    sort_order: section.sortOrder ?? 0,
    updated_at: new Date().toISOString(),
  }
  const { error } = await supabase.from("homepage_sections").upsert(payload, { onConflict: "section_key" }).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to save homepage section: ${error.message}`)
}

export async function upsertSiteSetting(key: string, value: JsonRecord): Promise<void> {
  const supabase = await getServerDbClient()
  const { error } = await supabase.from("site_settings").upsert(
    { key, value, updated_at: new Date().toISOString() },
    { onConflict: "key" }
  ).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to save site setting: ${error.message}`)
}

function bannerPayload(input: BannerFormInput) {
  return {
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    image_url: normalizePublicMediaUrl(input.imageUrl),
    image_alt_text: input.imageAltText?.trim() || input.title || null,
    button_text: input.buttonText,
    button_url: input.buttonUrl,
    badge_text: input.badgeText,
    placement: normalizePlacement(input.placement),
    is_active: input.isActive,
    starts_at: input.startsAt || null,
    ends_at: input.endsAt || null,
    sort_order: input.sortOrder,
  }
}

function withoutBannerAltText(payload: ReturnType<typeof bannerPayload>) {
  const { image_alt_text: _imageAltText, ...legacyPayload } = payload
  return legacyPayload
}

export async function createBanner(input: BannerFormInput): Promise<void> {
  const supabase = await getServerDbClient()
  const payload = bannerPayload(input)
  const { error } = await supabase.from("site_banners").insert(payload).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (!error) return

  // Backward compatibility: existing projects keep working before the optional
  // ALT text migration is applied. After migration, the richer payload is used.
  if (isMissingTableOrColumn(error.message)) {
    const legacy = await supabase.from("site_banners").insert(withoutBannerAltText(payload)).abortSignal(createRequestTimeoutSignal("adminMutation"))
    if (!legacy.error) return
    throw new Error(`Failed to create banner: ${legacy.error.message}`)
  }

  throw new Error(`Failed to create banner: ${error.message}`)
}

export async function updateBanner(input: BannerFormInput & { id: string }): Promise<void> {
  const supabase = await getServerDbClient()
  const payload = { ...bannerPayload(input), updated_at: new Date().toISOString() }
  const { error } = await supabase.from("site_banners").update(payload).eq("id", input.id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (!error) return

  // Backward compatibility for databases where image_alt_text has not yet been
  // added. The admin save still succeeds; applying the migration enables ALT persistence.
  if (isMissingTableOrColumn(error.message)) {
    const { image_alt_text: _imageAltText, ...legacyPayload } = payload
    const legacy = await supabase.from("site_banners").update(legacyPayload).eq("id", input.id).abortSignal(createRequestTimeoutSignal("adminMutation"))
    if (!legacy.error) return
    throw new Error(`Failed to update banner: ${legacy.error.message}`)
  }

  throw new Error(`Failed to update banner: ${error.message}`)
}

export async function deleteBanner(id: string): Promise<void> {
  const supabase = await getServerDbClient()
  const existing = await supabase.from("site_banners").select("image_url").eq("id", id).maybeSingle()
  if (existing.error) throw new Error(`Failed to read banner before deletion: ${existing.error.message}`)

  const imageUrl = typeof existing.data?.image_url === "string" ? existing.data.image_url : null
  if (imageUrl) {
    const shared = await supabase.from("site_banners").select("id", { count: "exact", head: true }).eq("image_url", imageUrl).neq("id", id)
    if (shared.error) throw new Error(`Failed to validate banner image usage: ${shared.error.message}`)
    if ((shared.count ?? 0) === 0) {
      const { deleteLocalMediaByPublicUrl } = await import("@/lib/storage/local-media-storage")
      await deleteLocalMediaByPublicUrl(imageUrl)
    }
  }

  const { error } = await supabase.from("site_banners").delete().eq("id", id).abortSignal(createRequestTimeoutSignal("adminMutation"))
  if (error) throw new Error(`Failed to delete banner: ${error.message}`)
}

export async function uploadSiteMedia(file: File, folder: string, fileName: string): Promise<string> {
  const { uploadLocalMedia } = await import("@/lib/storage/local-media-storage")
  const uploaded = await uploadLocalMedia(file, {
    folder: `site-media/${folder}`,
    fixedFileName: fileName,
  })
  return uploaded.publicUrl
}
