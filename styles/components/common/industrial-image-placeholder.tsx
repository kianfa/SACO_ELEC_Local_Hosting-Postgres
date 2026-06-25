import { CircuitBoard, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type IndustrialImagePlaceholderProps = {
  alt?: string
  className?: string
  iconClassName?: string
  label?: string | null
  compact?: boolean
}

export function IndustrialImagePlaceholder({
  alt = "تصویر الکتروساکو",
  className,
  iconClassName,
  label = "تصویر در دسترس نیست",
  compact = false,
}: IndustrialImagePlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={alt}
      dir="rtl"
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit] border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-slate-100",
        className,
      )}
    >
      <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(rgba(15,23,42,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.05)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
      <div className="relative flex max-w-full flex-col items-center justify-center px-2 text-center">
        <div
          className={cn(
            "relative flex items-center justify-center rounded-2xl border border-primary/10 bg-white/75 text-primary/55 shadow-sm backdrop-blur-sm",
            compact ? "h-9 w-9" : "h-14 w-14",
          )}
        >
          <CircuitBoard className={cn(compact ? "h-4 w-4" : "h-7 w-7", iconClassName)} strokeWidth={1.7} />
          <Zap className="absolute -bottom-1 -left-1 h-4 w-4 rounded-full bg-accent p-0.5 text-accent-foreground shadow-sm" />
        </div>
        {label && !compact ? (
          <span className="mt-2 line-clamp-2 max-w-[180px] text-[11px] font-bold leading-5 text-slate-500">
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
