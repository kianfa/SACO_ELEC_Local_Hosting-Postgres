export default function Loading() {
  return (
    <main className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-10 w-56 animate-pulse rounded-xl bg-muted" />
          <div className="h-5 w-full animate-pulse rounded-lg bg-muted" />
          <div className="h-5 w-4/5 animate-pulse rounded-lg bg-muted" />
          <p className="pt-4 text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    </main>
  )
}
