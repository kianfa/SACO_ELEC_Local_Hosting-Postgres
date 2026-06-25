import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { BrandForm } from "@/components/admin/brand-form"
import { getAdminBrandById } from "@/lib/services/admin-brands-service"
import { Button } from "@/components/ui/button"
export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const brand = await getAdminBrandById(id)
  if (!brand) return <AdminLayout title="برند پیدا نشد"><div className="rounded-2xl border bg-card p-8 text-center"><p>برند مورد نظر وجود ندارد.</p><Button asChild className="mt-4 rounded-xl"><Link href="/admin/brands">بازگشت</Link></Button></div></AdminLayout>
  return <AdminLayout title="ویرایش برند" subtitle={brand.name}><BrandForm brand={brand} /></AdminLayout>
}
