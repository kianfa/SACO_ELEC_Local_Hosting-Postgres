import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Skeleton className="mb-6 h-5 w-56 rounded-xl" />
        <div className="mb-8 space-y-3">
          <Skeleton className="h-9 w-72 rounded-xl" />
          <Skeleton className="h-5 w-full max-w-2xl rounded-xl" />
          <Skeleton className="h-5 w-24 rounded-xl" />
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="rounded-2xl border border-border bg-card p-5">
              <Skeleton className="mb-5 h-6 w-24 rounded-xl" />
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <Skeleton key={index} className="h-5 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </aside>
          <section className="min-w-0 flex-1">
            <div className="mb-6 rounded-2xl border border-border bg-card p-4">
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3 min-[769px]:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-border bg-card p-4">
                  <Skeleton className="mb-4 aspect-square w-full rounded-xl" />
                  <Skeleton className="mb-2 h-5 w-4/5 rounded-xl" />
                  <Skeleton className="mb-2 h-4 w-2/3 rounded-xl" />
                  <Skeleton className="mb-4 h-4 w-1/2 rounded-xl" />
                  <Skeleton className="mb-3 h-7 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-full rounded-xl" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
