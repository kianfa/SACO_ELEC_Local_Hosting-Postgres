import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { ProductForm } from "@/components/admin/product-form"
import { updateProductAction } from "@/lib/actions/admin-products-actions"
import { quickCreateBrandAction } from "@/lib/actions/admin-brand-actions"
import { quickCreateCategoryAction } from "@/lib/actions/admin-category-actions"
import { Button } from "@/components/ui/button"
import { getAdminBrands } from "@/lib/services/admin-brands-service"
import { getAdminCategories } from "@/lib/services/admin-categories-service"
import { getAdminProductById } from "@/lib/services/admin-products-service"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const [product, brands, categories] = await Promise.all([getAdminProductById(id), getAdminBrands(), getAdminCategories()])

  if (!product) {
    return (
      <AdminLayout title="محصول پیدا نشد">
        <div className="rounded-2xl border bg-card p-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-primary">محصول مورد نظر وجود ندارد یا حذف شده است.</h2>
          <Button asChild className="mt-6 rounded-xl"><Link href="/admin/products">بازگشت به محصولات</Link></Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="ویرایش محصول" subtitle={product.name}>
      <ProductForm
        product={product}
        options={{ brands, categories }}
        submitAction={updateProductAction.bind(null, product.id)}
        quickCreateBrandSubmitAction={quickCreateBrandAction}
        quickCreateCategorySubmitAction={quickCreateCategoryAction}
      />
    </AdminLayout>
  )
}
