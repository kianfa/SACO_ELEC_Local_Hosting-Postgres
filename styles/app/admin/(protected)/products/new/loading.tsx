import { Skeleton } from "@/components/ui/skeleton"

// Keep this fallback synchronous and network-free so App Router navigation
// shows immediate feedback while the protected page validates the admin
// session and loads the form option lists.
export default function Loading() {
  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-primary md:text-3xl">افزودن محصول جدید</h1>
          <p className="mt-2 text-sm text-muted-foreground">در حال آماده‌سازی فرم محصول...</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
