"use client"

import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentCardProps {
  name: string
  type: string
  size: string
}

export function DocumentCard({ name, type, size }: DocumentCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl hover:border-primary/50 hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">
            {type} • {size}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" className="gap-2 rounded-lg">
        <Download className="w-4 h-4" />
        <span>دانلود</span>
      </Button>
    </div>
  )
}
