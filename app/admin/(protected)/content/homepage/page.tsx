import { AdminLayout } from "@/components/admin/admin-layout"
import { HomepageContentForm } from "@/components/admin/content/homepage-content-form"
import { getAdminHomepageSections } from "@/lib/services/site-content-service"

export default async function AdminHomepageContentPage() {
  const sections = await getAdminHomepageSections()
  return (
    <AdminLayout title="مدیریت صفحه اصلی" subtitle="ویرایش Hero، بنر تبلیغاتی، اعلان‌ها و تصاویر صفحه اصلی">
      {!sections.length ? (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800">
          اگر جدول‌های محتوای سایت هنوز ساخته نشده‌اند، فایل <span dir="ltr">supabase/migrations/20260526_site_content.sql</span> را در Supabase SQL Editor اجرا کن. فرم همچنان با fallbackهای فعلی آماده ذخیره است.
        </div>
      ) : null}
      <HomepageContentForm sections={sections} />
    </AdminLayout>
  )
}
