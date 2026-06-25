"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function NewProductError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin-new-product] handled route error", error.digest ?? error.message)
    }
  }, [error])

  return (
    <div className="rounded-2xl border bg-card p-6 text-center shadow-sm" dir="rtl">
      <h2 className="text-lg font-bold text-primary">آماده‌سازی فرم محصول با خطا مواجه شد</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        دریافت اطلاعات فرم بیش از حد معمول طول کشید. لطفاً دوباره تلاش کنید.
      </p>
      <Button type="button" onClick={() => reset()} className="mt-5 rounded-xl">
        تلاش دوباره
      </Button>
    </div>
  )
}
