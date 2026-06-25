import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoginLoading() {
  return (
    <main className="min-h-screen bg-muted/30" dir="rtl">
      <div className="container mx-auto grid min-h-screen place-items-center px-4">
        <div className="w-full max-w-md rounded-3xl border bg-card p-6 shadow-xl">
          <Skeleton className="mx-auto h-14 w-14 rounded-2xl" />
          <Skeleton className="mx-auto mt-6 h-7 w-32" />
          <Skeleton className="mt-8 h-12 w-full rounded-xl" />
          <Skeleton className="mt-4 h-12 w-full rounded-xl" />
          <Skeleton className="mt-6 h-12 w-full rounded-xl" />
        </div>
      </div>
    </main>
  )
}
