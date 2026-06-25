import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PaymentRedirectModalProps {
  open: boolean
}

export function PaymentRedirectModal({ open }: PaymentRedirectModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="max-w-sm rounded-2xl text-center" dir="rtl">
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <DialogTitle className="text-xl font-extrabold">در حال انتقال به درگاه پرداخت</DialogTitle>
          <DialogDescription className="text-sm leading-7">لطفاً چند لحظه صبر کنید...</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
