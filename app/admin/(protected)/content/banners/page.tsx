import { AdminLayout } from "@/components/admin/admin-layout"
import { BannerManagement } from "@/components/admin/content/banner-management"
import { getAdminSiteBanners } from "@/lib/services/site-content-service"

export default async function AdminBannersPage() {
  const banners = await getAdminSiteBanners()
  return (
    <AdminLayout title="مدیریت بنرها" subtitle="بنرهای تبلیغاتی و اطلاع‌رسانی سایت را اضافه یا ویرایش کنید">
      <BannerManagement banners={banners} />
    </AdminLayout>
  )
}
