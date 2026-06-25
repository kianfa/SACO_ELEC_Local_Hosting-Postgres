import { AdminLayout } from "@/components/admin/admin-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <AdminLayout title="ویرایش محصول">
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6"><Skeleton className="h-80 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </AdminLayout>
  )
}
