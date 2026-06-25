import { AlertTriangle, RefreshCw } from "lucide-react"

interface CartWarningsProps {
  priceUpdated?: boolean
  hasOutOfStock?: boolean
}

export function CartWarnings({ priceUpdated, hasOutOfStock }: CartWarningsProps) {
  if (!priceUpdated && !hasOutOfStock) return null

  return (
    <div className="space-y-3">
      {priceUpdated && (
        <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
          <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p className="font-medium">قیمت برخی کالاها به‌روزرسانی شده است.</p>
        </div>
      )}
      {hasOutOfStock && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p className="font-medium">یک یا چند کالا در حال حاضر موجود نیست.</p>
        </div>
      )}
    </div>
  )
}
