"use client"

import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type PublicDataErrorVariant = "general" | "products" | "compact"

const copy: Record<PublicDataErrorVariant, { title: string; description: string }> = {
  general: {
    title: "اتصال اینترنت ضعیف است",
    description: "اطلاعات سایت کامل بارگذاری نشد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.",
  },
  products: {
    title: "محصولات بارگذاری نشدند",
    description: "به نظر می‌رسد اتصال اینترنت ضعیف است یا ارتباط با سرور موقتاً برقرار نشد. لطفاً چند لحظه بعد دوباره تلاش کنید.",
  },
  compact: {
    title: "اطلاعات این بخش بارگذاری نشد",
    description: "ارتباط با سرور موقتاً برقرار نشد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.",
  },
}

interface PublicDataErrorStateProps {
  variant?: PublicDataErrorVariant
  className?: string
  fullPage?: boolean
  showRetry?: boolean
}

export function PublicDataErrorState({
  variant = "general",
  className,
  fullPage = false,
  showRetry = true,
}: PublicDataErrorStateProps) {
  const content = copy[variant]

  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div
      className={cn(
        "rounded-3xl border border-primary/15 bg-card p-6 text-center shadow-sm sm:p-8",
        fullPage && "mx-auto max-w-2xl",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="mb-3 text-xl font-black text-foreground sm:text-2xl">{content.title}</h2>
      <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
        {content.description}
      </p>
      {showRetry ? (
        <Button type="button" onClick={handleRetry} className="mt-6 gap-2 rounded-xl bg-primary hover:bg-primary/90">
          <RefreshCw className="h-4 w-4" />
          تلاش دوباره
        </Button>
      ) : null}
    </div>
  )
}
