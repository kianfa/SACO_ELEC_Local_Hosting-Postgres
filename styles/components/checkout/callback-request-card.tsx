"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import { CalendarDays, CheckCircle2, Clock3, Hash, PhoneCall } from "lucide-react"
import { createPurchaseRequestAction } from "@/lib/actions/purchase-request-actions"
import type { CartItem } from "@/lib/cart/cart-store"
import type { PurchaseRequestActionState } from "@/types/purchase-request"
import { formatPersianDate, formatPersianTime } from "@/lib/persian-date"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const initialState: PurchaseRequestActionState = { ok: false, message: "" }

export function CallbackRequestCard({ items }: { items: CartItem[] }) {
  const [state, action, pending] = useActionState(createPurchaseRequestAction, initialState)
  const [contactTime, setContactTime] = useState("در اولین فرصت")
  const [submitted, setSubmitted] = useState(false)

  const cartItemsJson = useMemo(
    () => JSON.stringify(items.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity }))),
    [items],
  )

  useEffect(() => {
    if (state.ok) setSubmitted(true)
  }, [state.ok])

  if (submitted) {
    return (
      <Card className="rounded-2xl border-emerald-200 bg-emerald-50/70 shadow-sm">
        <CardContent className="p-5 text-emerald-950">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-7 w-7 shrink-0 text-emerald-600" />
            <div>
              <h3 className="text-lg font-extrabold leading-8 md:text-xl">درخواست تماس شما ثبت شد</h3>
              <p className="mt-2 text-sm leading-8">
                کارشناسان فروش الکتروساکو در اولین فرصت برای بررسی موجودی، اعلام قیمت نهایی و هماهنگی خرید با شما تماس خواهند گرفت.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 rounded-xl border border-emerald-200/80 bg-white/65 p-3 text-sm sm:grid-cols-3">
            <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-emerald-700" /><span className="text-emerald-700">شماره پیگیری:</span><strong dir="ltr">{state.requestNumber ?? state.requestId ?? "—"}</strong></div>
            <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-emerald-700" /><span className="text-emerald-700">تاریخ ثبت:</span><strong>{formatPersianDate(state.createdAt)}</strong></div>
            <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-emerald-700" /><span className="text-emerald-700">ساعت ثبت:</span><strong>{formatPersianTime(state.createdAt)}</strong></div>
          </div>

          <p className="mt-3 text-xs font-semibold leading-6 text-emerald-800">
            سبد خرید شما حفظ شده است و می‌توانید در صورت نیاز آن را ویرایش کنید.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-3xl border-primary/15 bg-background shadow-sm">
      <CardHeader className="gap-3 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <PhoneCall className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg font-extrabold leading-8 md:text-xl">درخواست تماس از کارشناسان فروش</CardTitle>
        </div>
        <p className="text-sm font-medium leading-8 text-muted-foreground md:text-base">
          فرصت ارسال پیام ندارید؟ شماره تماس خود را ثبت کنید تا کارشناسان فروش الکتروساکو برای بررسی موجودی، اعلام قیمت نهایی و هماهنگی خرید با شما تماس بگیرند.
        </p>
      </CardHeader>
      <CardContent className="px-5">
        <form action={action} className="space-y-4">
          <input type="hidden" name="cartItemsJson" value={cartItemsJson} />

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="callbackCustomerName">نام و نام خانوادگی</Label>
              <Input id="callbackCustomerName" name="customerName" required placeholder="مثلاً علی رضایی" className="mt-2 h-11 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="callbackPhone">شماره موبایل</Label>
              <Input id="callbackPhone" name="phone" required inputMode="tel" pattern="09[0-9]{9}" placeholder="09xxxxxxxxx" dir="ltr" className="mt-2 h-11 rounded-xl text-left" />
            </div>
          </div>

          <div>
            <Label htmlFor="callbackDescription">توضیحات اختیاری</Label>
            <Textarea id="callbackDescription" name="description" placeholder="اگر نکته‌ای درباره سفارش یا نحوه تماس دارید وارد کنید." className="mt-2 min-h-24 rounded-xl" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="callbackContactTime">زمان مناسب تماس</Label>
              <select
                id="callbackContactTime"
                name="preferredContactTime"
                value={contactTime}
                onChange={(event) => setContactTime(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option>در اولین فرصت</option>
                <option>صبح</option>
                <option>ظهر</option>
                <option>عصر</option>
                <option>تماس در زمان مشخص</option>
              </select>
            </div>
            {contactTime === "تماس در زمان مشخص" ? (
              <div>
                <Label htmlFor="callbackContactTimeNote">توضیح زمان مناسب تماس</Label>
                <Input id="callbackContactTimeNote" name="preferredContactTimeNote" placeholder="مثلاً فردا ساعت ۱۰ صبح" className="mt-2 h-11 rounded-xl" />
              </div>
            ) : null}
          </div>

          <p className="rounded-xl bg-muted/55 px-3 py-3 text-xs font-semibold leading-6 text-muted-foreground">
            سبد خرید شما به‌صورت خودکار همراه درخواست ثبت می‌شود و نیازی به ارسال مجدد لیست محصولات نیست.
          </p>

          {state.message ? (
            <p className={`rounded-xl px-3 py-3 text-sm font-semibold leading-6 ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-destructive/5 text-destructive"}`}>
              {state.message}
            </p>
          ) : null}

          <Button type="submit" disabled={pending || !items.length} className="h-12 w-full rounded-xl bg-primary font-extrabold hover:bg-primary/90">
            <PhoneCall className="h-4 w-4" />
            {pending ? "در حال ثبت درخواست..." : "ثبت درخواست تماس"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
