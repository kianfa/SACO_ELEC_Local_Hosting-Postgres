"use client"

import { Search, Grid3X3, List, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { sortOptions } from "@/lib/data"

interface ProductToolbarProps {
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
  sortBy: string
  onSortChange: (value: string) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  onOpenMobileFilters: () => void
}

export function ProductToolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  onOpenMobileFilters,
}: ProductToolbarProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
        {/* Search within products */}
        <div className="relative flex-1 w-full lg:max-w-sm">
          <Input
            type="search"
            placeholder="جستجو در محصولات..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pr-4 pl-10 py-5 rounded-xl border-border"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        </div>

        {/* Mobile filter button */}
        <Button
          variant="outline"
          className="lg:hidden rounded-xl gap-2 w-full sm:w-auto"
          onClick={onOpenMobileFilters}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>فیلترها</span>
        </Button>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">مرتب‌سازی:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-36 sm:w-40 rounded-xl">
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 border border-border rounded-xl p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className={`rounded-lg h-8 w-8 ${viewMode === "grid" ? "bg-primary" : ""}`}
              onClick={() => onViewModeChange("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className={`rounded-lg h-8 w-8 ${viewMode === "list" ? "bg-primary" : ""}`}
              onClick={() => onViewModeChange("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
