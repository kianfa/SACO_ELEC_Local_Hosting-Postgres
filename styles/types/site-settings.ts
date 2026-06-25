export type PublicContactInfo = {
  brandName: string
  address: string
  landline: string
  mobile: string
  supportPhone: string
  telegramUsername: string
  telegramUrl: string
  whatsappUrl: string
  messagingApps: string[]
  workingHours: string
  email: string
}

export type PublicFooterInfo = {
  description: string
  copyright: string
  trustBadgeImageUrl: string | null
  trustBadgeImageAltText: string | null
  instagramUrl: string | null
  instagramIsActive: boolean
  telegramUrl: string
  telegramIsActive: boolean
  baleUrl: string | null
  baleIsActive: boolean
  linkedinUrl: string | null
  linkedinIsActive: boolean
}

export type PublicManualCheckoutSettings = {
  explanationText: string
  helperText: string
  cardToCardInstructionText: string
  onlinePaymentDisabledText: string
}

export type PublicSiteSettings = {
  contactInfo: PublicContactInfo
  footerInfo: PublicFooterInfo
  manualCheckout: PublicManualCheckoutSettings
}
