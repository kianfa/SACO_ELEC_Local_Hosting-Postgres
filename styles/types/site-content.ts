export type JsonRecord = Record<string, unknown>

export type HomepageSectionKey = "hero" | "promo_banner" | "trust_features" | "project_purchase" | "homepage_notice"

export type HeroSliderImage = {
  desktopUrl: string
  mobileUrl?: string | null
  altText?: string | null
  sortOrder: number
  isActive: boolean
}

export type HomepageSection = {
  id: string
  sectionKey: string
  title: string | null
  subtitle: string | null
  description: string | null
  imageUrl: string | null
  mobileImageUrl: string | null
  primaryButtonText: string | null
  primaryButtonUrl: string | null
  secondaryButtonText: string | null
  secondaryButtonUrl: string | null
  metadata: JsonRecord
  isActive: boolean
  sortOrder: number
}

export type SiteBanner = {
  id: string
  title: string
  subtitle: string | null
  description: string | null
  imageUrl: string | null
  imageAltText: string | null
  buttonText: string | null
  buttonUrl: string | null
  badgeText: string | null
  placement: string
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
  sortOrder: number
}

export type SiteSetting = {
  id: string
  key: string
  value: JsonRecord
}

export type ContactInfoSettings = {
  brandName?: string
  phone?: string
  landline?: string
  mobile?: string
  supportPhone?: string
  telegramUsername?: string
  telegramUrl?: string
  telegramPhone?: string
  whatsappUrl?: string
  baleUsername?: string
  balePhone?: string
  address?: string
  workingHours?: string
  email?: string
  messagingApps?: string[]
}

export type FooterInfoSettings = {
  description?: string
  copyright?: string
  trustBadgeImageUrl?: string
  trustBadgeImageAltText?: string
  instagramUrl?: string
  instagramIsActive?: boolean
  telegramUrl?: string
  telegramIsActive?: boolean
  baleUrl?: string
  baleIsActive?: boolean
  linkedinUrl?: string
  linkedinIsActive?: boolean
}

export type ManualCheckoutSettings = {
  explanationText?: string
  helperText?: string
  cardToCardInstructionText?: string
  onlinePaymentDisabledText?: string
}

export type SiteSettingsBundle = {
  contactInfo: ContactInfoSettings
  footerInfo: FooterInfoSettings
  manualCheckout: ManualCheckoutSettings
}

export type HomepageContentInput = {
  hero: Partial<HomepageSection> & { trustPoints: string[]; heroImages?: HeroSliderImage[] }
  promoBanner: Partial<HomepageSection> & { badgeText?: string | null }
  homepageNotice: Partial<HomepageSection>
}

export type BannerFormInput = Omit<SiteBanner, "id"> & { id?: string }

export type SiteContentActionState = {
  ok: boolean
  message: string
  redirectTo?: string
}
