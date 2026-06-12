import { AdminLayout } from "@/components/admin/admin-layout"
import { HomepageCategoriesManagement } from "@/components/admin/content/homepage-categories-management"
import { getAdminHomepageCategorySectionSettings, getAllCategoriesForAdmin } from "@/lib/services/categories-service"

export default async function AdminHomepageCategoriesPage() {
  const [categories, settings] = await Promise.all([getAllCategoriesForAdmin(), getAdminHomepageCategorySectionSettings()])

  return (
    <AdminLayout
      title="مدیریت دسته‌بندی‌های صفحه اصلی"
      subtitle="دسته‌بندی‌هایی را که در بخش زیر هیرو نمایش داده می‌شوند مدیریت کنید."
    >
      <HomepageCategoriesManagement categories={categories} settings={settings} />
    </AdminLayout>
  )
}
