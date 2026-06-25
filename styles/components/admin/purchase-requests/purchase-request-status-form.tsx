"use client"

import { useState } from "react"
import { purchaseRequestStatusLabels, purchaseRequestStatuses, type PurchaseRequestStatus } from "@/types/purchase-request"
import { updatePurchaseRequestStatusAction } from "@/lib/actions/purchase-request-actions"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function PurchaseRequestStatusForm({
  id,
  currentStatus,
  compact = false,
}: {
  id: string
  currentStatus: PurchaseRequestStatus
  compact?: boolean
}) {
  const [status, setStatus] = useState<PurchaseRequestStatus>(currentStatus)

  return (
    <form
      action={updatePurchaseRequestStatusAction}
      className={compact ? "flex items-center gap-1" : "space-y-2"}
      onSubmit={(event) => {
        if ((status === "completed" || status === "cancelled") && !window.confirm(`آیا از تغییر وضعیت به «${purchaseRequestStatusLabels[status]}» مطمئن هستید؟`)) {
          event.preventDefault()
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        value={status}
        onChange={(event) => setStatus(event.target.value as PurchaseRequestStatus)}
        className={compact ? "h-8 rounded-lg border bg-background px-2 text-xs" : "h-10 w-full rounded-xl border bg-background px-3 text-sm"}
      >
        {purchaseRequestStatuses.map((value) => <option key={value} value={value}>{purchaseRequestStatusLabels[value]}</option>)}
      </select>
      {!compact ? <Textarea name="note" placeholder="یادداشت اختیاری تغییر وضعیت" className="rounded-xl" /> : null}
      <Button type="submit" size={compact ? "sm" : "default"} variant="secondary" className={compact ? "rounded-lg" : "w-full rounded-xl"}>ثبت وضعیت</Button>
    </form>
  )
}
