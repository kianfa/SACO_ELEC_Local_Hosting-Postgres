import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyCartProps {
  compact?: boolean
}

export function EmptyCart({ compact = false }: EmptyCartProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? "py-10" : "py-16"}`}>
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/5 text-primary">
        <ShoppingCart className="h-9 w-9" />
      </div>
      <h2 className="mb-2 text-xl font-bold text-foreground">سبد خرید شما خالی است</h2>
      <p className="mb-6 max-w-md text-sm leading-7 text-muted-foreground">
        برای شروع، تجهیزات مورد نیاز پروژه خود را انتخاب کنید.
      </p>
      <Button asChild className="rounded-xl bg-primary px-6 hover:bg-primary/90">
        <Link href="/products">مشاهده محصولات</Link>
      </Button>
    </div>
  )
}
