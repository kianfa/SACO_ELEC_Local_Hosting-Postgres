"use client"

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-background p-6 text-foreground">
        <main className="mx-auto max-w-lg rounded-2xl border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-bold text-primary">خطایی رخ داد</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">لطفاً دوباره تلاش کنید.</p>
          <button type="button" onClick={() => reset()} className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            تلاش دوباره
          </button>
        </main>
      </body>
    </html>
  )
}
