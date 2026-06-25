import type { ReactNode } from "react"
import { SiteSettingsProvider } from "@/components/site-settings-provider"
import { CustomerAuthStatusProvider } from "@/components/auth/customer-auth-status-provider"
import { PublicFooterCategoriesProvider } from "@/components/storefront/public-categories-provider"
import { getPublicSiteSettings } from "@/lib/services/site-settings-service"
import { getFooterCategoryLinks } from "@/lib/services/categories-service"
import { publicSiteSettingsFallback } from "@/lib/site-settings-defaults"
import { withServerTiming } from "@/lib/performance/server-timing"

export const revalidate = 300

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  const [settingsResult, categoriesResult] = await Promise.allSettled([
    withServerTiming("storefront site settings lookup", () => getPublicSiteSettings("storefront-layout")),
    withServerTiming("storefront footer categories lookup", () => getFooterCategoryLinks("storefront-layout")),
  ])

  const settings = settingsResult.status === "fulfilled" ? settingsResult.value : publicSiteSettingsFallback
  const footerCategories = categoriesResult.status === "fulfilled" ? categoriesResult.value : []

  return (
    <SiteSettingsProvider settings={settings}>
      <CustomerAuthStatusProvider>
        <PublicFooterCategoriesProvider categories={footerCategories}>{children}</PublicFooterCategoriesProvider>
      </CustomerAuthStatusProvider>
    </SiteSettingsProvider>
  )
}
