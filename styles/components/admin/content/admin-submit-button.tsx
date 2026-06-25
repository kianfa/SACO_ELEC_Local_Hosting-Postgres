"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function AdminSubmitButton({ children = "ذخیره" }: { children?: string }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending} className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
      {pending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
      {pending ? "در حال ذخیره..." : children}
    </Button>
  )
}
