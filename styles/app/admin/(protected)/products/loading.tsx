import { AdminLayout } from "@/components/admin/admin-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <AdminLayout title="مدیریت محصولات">
      <div className="space-y-4">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </AdminLayout>
  )
}
