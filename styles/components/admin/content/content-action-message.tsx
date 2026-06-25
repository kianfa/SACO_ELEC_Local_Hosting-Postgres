"use client"

import type { SiteContentActionState } from "@/types/site-content"

export function ContentActionMessage({ state }: { state: SiteContentActionState }) {
  if (!state.message) return null
  return (
    <div className={state.ok ? "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700" : "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"}>
      {state.message}
    </div>
  )
}
