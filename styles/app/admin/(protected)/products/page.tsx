import { AdminLayout } from "@/components/admin/admin-layout"
import { AdminEmptyState } from "@/components/admin/admin-empty-state"
import { AdminProductsTable } from "@/components/admin/admin-products-table"
import { getAdminProducts } from "@/lib/services/admin-products-service"
import { getAdminBrandOptions } from "@/lib/services/admin-brands-service"
import { getAdminCategoryOptions } from "@/lib/services/admin-categories-service"
import { withServerTiming } from "@/lib/performance/server-timing"
import Link from "next/link"

export default async function AdminProductsPage() {
  try {
    const [products, brands, categories] = await withServerTiming("admin products page data", () =>
      Promise.all([getAdminProducts(), getAdminBrandOptions(), getAdminCategoryOptions()]),
    )

    return (
      <AdminLayout title="مدیریت محصولات" subtitle="افزودن، ویرایش و کنترل وضعیت محصولات فروشگاه">
        {products.length ? (
          <AdminProductsTable products={products} brands={brands} categories={categories} />
        ) : (
          <AdminEmptyState />
        )}
      </AdminLayout>
    )
  } catch (error) {
    const message = error instanceof Error && error.message.includes("Timeout")
      ? "ارتباط با سرور با تأخیر مواجه شد. لطفاً دوباره تلاش کنید."
      : error instanceof Error ? error.message : "خطای نامشخص"
    return (
      <AdminLayout title="مدیریت محصولات">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-destructive shadow-sm">
          <h2 className="font-bold">خطا در دریافت محصولات</h2>
          <p className="mt-2 text-sm">{message}</p>
          <Link
            href="/admin/products/new"
            prefetch={false}
            data-add-product-link="error-state"
            className="mt-4 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            افزودن محصول جدید
          </Link>
        </div>
      </AdminLayout>
    )
  }
}
