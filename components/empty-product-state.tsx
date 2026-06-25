"use client"

import { SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EmptyProductStateProps {
  onClearFilters: () => void
}

export function EmptyProductState({ onClearFilters }: EmptyProductStateProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 text-center sm:p-12">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
        <SearchX className="w-10 h-10 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">
        محصولی یافت نشد
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        در حال حاضر محصولی مطابق با این بخش وجود ندارد.
      </p>
      <Button
        variant="outline"
        className="rounded-xl"
        onClick={onClearFilters}
      >
        مشاهده همه محصولات
      </Button>
    </div>
  )
}
