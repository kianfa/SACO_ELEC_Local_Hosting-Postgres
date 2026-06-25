import { AdminLayout } from "@/components/admin/admin-layout"
import { SiteSettingsForm } from "@/components/admin/content/site-settings-form"
import { getAdminSiteSettings } from "@/lib/services/site-content-service"

export default async function AdminSiteSettingsPage() {
  const settings = await getAdminSiteSettings()
  return (
    <AdminLayout title="تنظیمات سایت" subtitle="اطلاعات تماس، فوتر، شبکه‌های اجتماعی و متن‌های پرداخت دستی">
      <SiteSettingsForm settings={settings} />
    </AdminLayout>
  )
}
