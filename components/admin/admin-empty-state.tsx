import Link from "next/link"
import { PackagePlus } from "lucide-react"

export function AdminEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed bg-card p-10 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <PackagePlus className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-primary">هنوز محصولی ثبت نشده است</h2>
      <p className="mt-2 text-sm text-muted-foreground">برای شروع، اولین محصول فروشگاه را بدون نیاز به SQL اضافه کنید.</p>
      <Link
        href="/admin/products/new"
        prefetch={false}
        data-add-product-link="empty-state"
        className="mt-6 inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        افزودن اولین محصول
      </Link>
    </div>
  )
}
