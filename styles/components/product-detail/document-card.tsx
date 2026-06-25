"use client"

import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentCardProps {
  name: string
  type: string
  size: string
  fileUrl: string
}

export function DocumentCard({ name, type, size, fileUrl }: DocumentCardProps) {
  return (
    <div dir="rtl" className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 text-right transition-all hover:border-primary/50 hover:shadow-md">
      <div className="flex min-w-0 items-center gap-4 text-right">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
          <FileText className="h-6 w-6 text-red-600" />
        </div>
        <div className="min-w-0 text-right">
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">
            {type} • {size}
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 gap-2 rounded-lg">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
          <Download className="h-4 w-4" />
          <span>دانلود</span>
        </a>
      </Button>
    </div>
  )
}
