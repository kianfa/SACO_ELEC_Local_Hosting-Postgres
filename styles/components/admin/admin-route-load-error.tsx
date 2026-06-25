import Link from "next/link"

export function AdminRouteLoadError() {
  return (
    <div className="min-h-screen bg-muted/30 p-6" dir="rtl">
      <div className="mx-auto max-w-xl rounded-2xl border bg-card p-6 text-center shadow-sm">
        <h1 className="text-lg font-bold text-primary">بارگذاری پنل مدیریت با خطا مواجه شد</h1>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          ارتباط با سرور با تأخیر مواجه شد. لطفاً دوباره تلاش کنید.
        </p>
        <Link
          href="/admin/products/new"
          className="mt-5 inline-flex rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          تلاش دوباره
        </Link>
      </div>
    </div>
  )
}
