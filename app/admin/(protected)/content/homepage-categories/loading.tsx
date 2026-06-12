import { AdminLayout } from "@/components/admin/admin-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminHomepageCategoriesLoading() {
  return (
    <AdminLayout title="مدیریت دسته‌بندی‌های صفحه اصلی" subtitle="در حال دریافت اطلاعات...">
      <div className="space-y-6">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </AdminLayout>
  )
}
