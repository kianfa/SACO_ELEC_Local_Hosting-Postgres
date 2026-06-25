import { Zap } from "lucide-react"

interface ProductImagePlaceholderProps {
  className?: string
}

export function ProductImagePlaceholder({ className = "" }: ProductImagePlaceholderProps) {
  return (
    <div
      className={`bg-muted rounded-2xl overflow-hidden border border-border flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <div className="w-full h-full bg-gradient-to-br from-primary/5 via-card to-accent/10 flex items-center justify-center">
        <Zap className="w-10 h-10 text-primary/30" />
      </div>
    </div>
  )
}
