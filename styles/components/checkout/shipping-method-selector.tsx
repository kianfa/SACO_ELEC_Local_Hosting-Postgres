import { CheckCircle2, PackageCheck, Truck, Warehouse } from "lucide-react"
import { cn } from "@/lib/utils"

export type ShippingMethod = "fast" | "cargo" | "pickup" | ""

const methods = [
  {
    id: "fast" as const,
    title: "ارسال سریع",
    description: "مناسب سفارش‌های شهری و فوری",
    cost: "هزینه: محاسبه پس از ثبت آدرس",
    icon: Truck,
  },
  {
    id: "cargo" as const,
    title: "ارسال باربری",
    description: "مناسب تجهیزات سنگین و سفارش‌های پروژه‌ای",
    cost: "هزینه: پس‌کرایه یا توافقی",
    icon: PackageCheck,
  },
  {
    id: "pickup" as const,
    title: "تحویل حضوری",
    description: "هماهنگی با واحد فروش",
    cost: "رایگان",
    icon: Warehouse,
  },
]

interface ShippingMethodSelectorProps {
  value: ShippingMethod
  onChange: (value: ShippingMethod) => void
  showWarning?: boolean
}

export function ShippingMethodSelector({ value, onChange, showWarning = false }: ShippingMethodSelectorProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-extrabold text-foreground">روش ارسال</h2>
        <p className="mt-1 text-sm text-muted-foreground">روش تحویل سفارش صنعتی خود را انتخاب کنید.</p>
      </div>

      {showWarning && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          لطفاً یک روش ارسال انتخاب کنید.
        </div>
      )}

      <div className="grid gap-3">
        {methods.map((method) => {
          const Icon = method.icon
          const selected = value === method.id

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              className={cn(
                "flex w-full items-start gap-4 rounded-2xl border bg-background p-4 text-right transition-all hover:border-primary/50 hover:shadow-sm",
                selected ? "border-primary ring-2 ring-primary/10" : "border-border",
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-extrabold text-foreground">{method.title}</h3>
                  {selected && <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{method.description}</p>
                <p className="mt-2 text-sm font-bold text-primary">{method.cost}</p>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
