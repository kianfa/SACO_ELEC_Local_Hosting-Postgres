import { Skeleton } from "@/components/ui/skeleton"

export function CartLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div key={item} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex gap-4">
            <Skeleton className="h-24 w-24 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
              <div className="flex items-center justify-between">
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
