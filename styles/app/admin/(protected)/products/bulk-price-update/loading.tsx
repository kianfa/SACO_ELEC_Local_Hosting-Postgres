import { AdminLayout } from "@/components/admin/admin-layout"
import { Skeleton } from "@/components/ui/skeleton"

export default function BulkPriceUpdateLoading() {
  return (
    <AdminLayout title="تغییر گروهی قیمت محصولات">
      <div className="space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Skeleton className="h-[520px] rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    </AdminLayout>
  )
}
