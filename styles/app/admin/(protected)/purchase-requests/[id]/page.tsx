import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, CalendarClock, Clock3, Hash, MessageSquareText, PhoneCall, Save, UserRound } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { PurchaseRequestStatusBadge } from "@/components/admin/purchase-requests/status-badge"
import { PurchaseRequestStatusForm } from "@/components/admin/purchase-requests/purchase-request-status-form"
import { ProductImage } from "@/components/common/product-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  addPurchaseRequestActivityAction,
  schedulePurchaseRequestFollowUpAction,
  updatePurchaseRequestNoteAction,
} from "@/lib/actions/purchase-request-actions"
import { formatPrice } from "@/lib/data"
import { formatDateTimeLocalInput } from "@/lib/date-time"
import { formatPersianDate, formatPersianDateTime, formatPersianTime } from "@/lib/persian-date"
import { getAdminPurchaseRequestById } from "@/lib/services/purchase-requests-service"

export default async function AdminPurchaseRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const request = await getAdminPurchaseRequestById(id)
  if (!request) notFound()
  const totalItems = request.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <AdminLayout title="جزئیات درخواست خرید" subtitle="اطلاعات مشتری، سبد خرید و سوابق پیگیری را مدیریت کنید.">
      <div className="space-y-5">
        <Button asChild variant="ghost" className="rounded-xl">
          <Link href="/admin/purchase-requests"><ArrowRight className="h-4 w-4" />بازگشت به درخواست‌ها</Link>
        </Button>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5 text-primary" />اطلاعات مشتری و درخواست</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm md:grid-cols-2">
                <div><span className="text-muted-foreground">شماره درخواست:</span><p dir="ltr" className="mt-1 text-left font-bold text-primary">{request.requestNumber}</p></div>
                <div><span className="text-muted-foreground">نام مشتری:</span><p className="mt-1 font-bold">{request.customerName}</p></div>
                <div><span className="text-muted-foreground">شماره تماس:</span><p dir="ltr" className="mt-1 text-left font-bold">{request.phone}</p></div>
                <div><span className="text-muted-foreground">زمان مناسب تماس:</span><p className="mt-1 font-bold">{request.preferredContactTime || "در اولین فرصت"}</p></div>
                {request.preferredContactTimeNote ? <div className="md:col-span-2"><span className="text-muted-foreground">توضیح زمان تماس:</span><p className="mt-1 leading-7">{request.preferredContactTimeNote}</p></div> : null}
                <div><span className="text-muted-foreground">تاریخ ثبت:</span><p className="mt-1 font-bold">{formatPersianDate(request.createdAt)}</p></div>
                <div><span className="text-muted-foreground">ساعت ثبت:</span><p className="mt-1 font-bold">{formatPersianTime(request.createdAt)}</p></div>
                <div><span className="text-muted-foreground">آخرین ویرایش:</span><p className="mt-1 font-bold">{formatPersianDateTime(request.updatedAt)}</p></div>
                <div><span className="text-muted-foreground">آخرین تماس:</span><p className="mt-1 font-bold">{formatPersianDateTime(request.lastContactedAt)}</p></div>
                <div><span className="text-muted-foreground">پیگیری بعدی:</span><p className="mt-1 font-bold">{formatPersianDateTime(request.nextFollowUpAt)}</p></div>
                <div><span className="text-muted-foreground">زمان تکمیل خرید:</span><p className="mt-1 font-bold">{formatPersianDateTime(request.completedAt)}</p></div>
                <div className="md:col-span-2"><span className="text-muted-foreground">توضیحات مشتری:</span><p className="mt-1 whitespace-pre-wrap leading-7">{request.description || "—"}</p></div>
                <div><span className="text-muted-foreground">منبع درخواست:</span><p className="mt-1 font-bold">صفحه تسویه‌حساب</p></div>
                <div><span className="text-muted-foreground">وضعیت فعلی:</span><div className="mt-1"><PurchaseRequestStatusBadge status={request.status} /></div></div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle>اقلام سبد خرید</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {request.items.map((item) => (
                  <div key={item.id} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center">
                    <ProductImage src={item.mainImageUrl} alt={item.productName} size="cart" className="h-20 w-20" />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-primary">{item.productName}</p>
                      <p className="mt-1 text-xs leading-6 text-muted-foreground">مدل: {item.productModel || "—"} | SKU: {item.productSku || "—"} | برند: {item.brandName || "—"}</p>
                      {item.variantLabel ? <p className="mt-1 text-xs font-bold text-foreground">{item.variantGroupTitle || "گزینه انتخاب‌شده"}: {item.variantLabel}</p> : null}
                    </div>
                    <div className="text-sm"><p>{item.quantity.toLocaleString("fa-IR")} × {formatPrice(item.unitPrice)} تومان</p><p className="mt-1 font-black text-primary">{formatPrice(item.totalPrice)} تومان</p></div>
                  </div>
                ))}
                <Separator />
                <div className="flex flex-wrap items-center justify-between gap-3 font-bold"><span>تعداد اقلام: {totalItems.toLocaleString("fa-IR")}</span><span className="text-lg text-primary">مبلغ تقریبی: {formatPrice(request.estimatedTotal)} تومان</span></div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle>تاریخچه فعالیت‌ها</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {request.activities.length ? request.activities.map((activity) => (
                  <div key={activity.id} className="rounded-xl border-r-4 border-primary/40 bg-muted/35 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-primary">{activity.action}</p>
                        {activity.createdBy ? <p dir="ltr" className="mt-1 text-left text-[11px] text-muted-foreground">admin: {activity.createdBy.slice(0, 8)}</p> : null}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatPersianDate(activity.createdAt)}</span>
                        <span>{formatPersianTime(activity.createdAt)}</span>
                      </div>
                    </div>
                    {activity.note ? <p className="mt-2 text-sm leading-7 text-muted-foreground">{activity.note}</p> : null}
                  </div>
                )) : <p className="text-sm text-muted-foreground">هنوز فعالیتی ثبت نشده است.</p>}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-6 xl:h-fit">
            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2"><PhoneCall className="h-5 w-5 text-primary" />اقدامات پیگیری</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full rounded-xl"><a href={`tel:${request.phone}`}><PhoneCall className="h-4 w-4" />تماس تلفنی</a></Button>
                <PurchaseRequestStatusForm id={request.id} currentStatus={request.status} />
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-primary" />یادداشت داخلی</CardTitle></CardHeader>
              <CardContent>
                <form action={updatePurchaseRequestNoteAction} className="space-y-3">
                  <input type="hidden" name="id" value={request.id} />
                  <Textarea name="adminNote" defaultValue={request.adminNote || ""} placeholder="این یادداشت فقط در پنل مدیریت نمایش داده می‌شود." className="min-h-28 rounded-xl" />
                  <Button type="submit" className="w-full rounded-xl"><Save className="h-4 w-4" />ذخیره یادداشت</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" />زمان پیگیری بعدی</CardTitle></CardHeader>
              <CardContent>
                <form action={schedulePurchaseRequestFollowUpAction} className="space-y-3">
                  <input type="hidden" name="id" value={request.id} />
                  <Input type="datetime-local" name="nextFollowUpAt" defaultValue={formatDateTimeLocalInput(request.nextFollowUpAt)} className="rounded-xl" />
                  <Input name="note" placeholder="یادداشت پیگیری" className="rounded-xl" />
                  <Button type="submit" className="w-full rounded-xl"><Clock3 className="h-4 w-4" />ثبت زمان پیگیری</Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm">
              <CardHeader><CardTitle className="flex items-center gap-2"><Hash className="h-5 w-5 text-primary" />ثبت فعالیت دستی</CardTitle></CardHeader>
              <CardContent>
                <form action={addPurchaseRequestActivityAction} className="space-y-3">
                  <input type="hidden" name="id" value={request.id} />
                  <Input name="action" required placeholder="مثلاً پیش‌فاکتور ارسال شد" className="rounded-xl" />
                  <Textarea name="note" placeholder="توضیحات اختیاری" className="rounded-xl" />
                  <Button type="submit" variant="outline" className="w-full rounded-xl">افزودن به تاریخچه</Button>
                </form>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </AdminLayout>
  )
}
