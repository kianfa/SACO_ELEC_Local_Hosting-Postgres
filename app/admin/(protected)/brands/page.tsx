import { AdminLayout } from "@/components/admin/admin-layout"
import { BrandsManagement } from "@/components/admin/brands-management"
import { getAdminBrands } from "@/lib/services/admin-brands-service"

export default async function AdminBrandsPage() {
  const brands = await getAdminBrands()
  return <AdminLayout title="مدیریت برندها" subtitle="برندهای تجهیزات برق صنعتی را اضافه، ویرایش و مدیریت کنید."><BrandsManagement brands={brands} /></AdminLayout>
}
