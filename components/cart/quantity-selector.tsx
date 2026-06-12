"use client"

import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  numberLocale?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  numberLocale = "fa-IR",
}: QuantitySelectorProps) {
  const decrease = () => onChange(Math.max(min, value - 1))
  const increase = () => onChange(Math.min(max, value + 1))

  return (
    <div className="inline-flex items-center rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-none hover:bg-muted disabled:opacity-40"
        onClick={increase}
        disabled={disabled || value >= max}
        aria-label="افزایش تعداد"
      >
        <Plus className="w-4 h-4" />
      </Button>
      <span className="min-w-10 px-3 text-center text-sm font-bold text-foreground">
        {value.toLocaleString(numberLocale)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-none hover:bg-muted disabled:opacity-40"
        onClick={decrease}
        disabled={disabled || value <= min}
        aria-label="کاهش تعداد"
      >
        <Minus className="w-4 h-4" />
      </Button>
    </div>
  )
}
