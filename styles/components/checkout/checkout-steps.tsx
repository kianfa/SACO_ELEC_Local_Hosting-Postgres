import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = ["سبد خرید", "انتخاب روش", "هماهنگی فروش", "تکمیل خرید"]

export function CheckoutSteps() {
  const currentStep = 2

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm md:p-5">
      <div className="grid grid-cols-4 gap-1 text-center sm:gap-2">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isDone = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div key={step} className="relative flex flex-col items-center gap-2">
              {index !== 0 && <span className="absolute right-[-50%] top-5 hidden h-0.5 w-full bg-border md:block" />}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background text-sm font-extrabold transition-colors",
                  isDone && "border-primary bg-primary text-primary-foreground",
                  isCurrent && "border-secondary bg-secondary text-secondary-foreground shadow-md",
                  !isDone && !isCurrent && "border-border text-muted-foreground",
                )}
              >
                {isDone ? <CheckCircle2 className="h-5 w-5" /> : stepNumber.toLocaleString("fa-IR")}
              </div>
              <span
                className={cn(
                  "text-xs font-bold leading-6 md:text-sm",
                  isCurrent ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
