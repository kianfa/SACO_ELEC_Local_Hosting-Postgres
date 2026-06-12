"use client"

import { createContext, useContext } from "react"
import { publicSiteSettingsFallback } from "@/lib/site-settings-defaults"
import type { PublicSiteSettings } from "@/types/site-settings"

const SiteSettingsContext = createContext<PublicSiteSettings>(publicSiteSettingsFallback)

export function SiteSettingsProvider({ settings, children }: { settings?: PublicSiteSettings; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={settings ?? publicSiteSettingsFallback}>{children}</SiteSettingsContext.Provider>
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext)
}

export function useContactInfo() {
  return useSiteSettings().contactInfo
}

export function useFooterInfo() {
  return useSiteSettings().footerInfo
}

export function useManualCheckoutSettings() {
  return useSiteSettings().manualCheckout
}
