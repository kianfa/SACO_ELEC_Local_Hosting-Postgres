import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminBulkPriceUpdate } from "@/components/admin/admin-bulk-price-update"
import { getAdminProducts } from "@/lib/services/admin-products-service"
import { getAdminBrands } from "@/lib/services/admin-brands-service"
import { getAdminCategories } from "@/lib/services/admin-categories-service"

export default async function BulkPriceUpdatePage() {
  const [products, brands, categories] = await Promise.all([getAdminProducts(), getAdminBrands(), getAdminCategories()])

  return (
    <AdminLayout
      title="تغییر گروهی قیمت محصولات"
      subtitle="قیمت گروهی از محصولات را بر اساس برند، دسته‌بندی یا انتخاب دستی به‌صورت درصدی افزایش یا کاهش دهید."
    >
      <AdminBulkPriceUpdate products={products} brands={brands} categories={categories} />
    </AdminLayout>
  )
}
