import { AdminLayout } from "@/components/admin/admin-layout"
import { ProductForm } from "@/components/admin/product-form"
import { createProductAction } from "@/lib/actions/admin-products-actions"
import { quickCreateBrandAction } from "@/lib/actions/admin-brand-actions"
import { quickCreateCategoryAction } from "@/lib/actions/admin-category-actions"
import { getAdminBrandOptions } from "@/lib/services/admin-brands-service"
import { getAdminCategoryOptions } from "@/lib/services/admin-categories-service"
import { performanceDebugEnabled, safePerformanceError, withServerTiming } from "@/lib/performance/server-timing"

function debugAddProductPage(message: string) {
  if (performanceDebugEnabled()) console.log(`[add-product-page] ${message}`)
}

export default async function NewProductPage() {
  const startedAt = performance.now()
  debugAddProductPage("render started")
  debugAddProductPage("categories load started")
  debugAddProductPage("brands load started")

  let brands: Awaited<ReturnType<typeof getAdminBrandOptions>>
  let categories: Awaited<ReturnType<typeof getAdminCategoryOptions>>
  try {
    ;[brands, categories] = await withServerTiming("add-product form options", () =>
      Promise.all([getAdminBrandOptions("admin-new-product"), getAdminCategoryOptions("admin-new-product")]),
    )
  } catch (error) {
    debugAddProductPage(`failed stage=form-options durationMs=${Math.round(performance.now() - startedAt)} safeMessage=${safePerformanceError(error)}`)
    throw error
  }

  debugAddProductPage("categories load completed")
  debugAddProductPage("brands load completed")
  debugAddProductPage(`initial data load completed durationMs=${Math.round(performance.now() - startedAt)}`)
  debugAddProductPage("product form render started")
  debugAddProductPage(`render completed durationMs=${Math.round(performance.now() - startedAt)}`)

  return (
    <AdminLayout
      title="افزودن محصول جدید"
      subtitle="محصول جدید را ثبت کنید. تصاویر جدید در فضای ذخیره‌سازی MinIO ذخیره می‌شوند."
    >
      <ProductForm
        options={{ brands, categories }}
        submitAction={createProductAction}
        quickCreateBrandSubmitAction={quickCreateBrandAction}
        quickCreateCategorySubmitAction={quickCreateCategoryAction}
      />
    </AdminLayout>
  )
}
