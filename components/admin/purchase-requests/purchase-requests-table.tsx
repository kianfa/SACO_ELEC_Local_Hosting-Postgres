import Link from "next/link"
import { Eye, PhoneCall } from "lucide-react"
import { formatPrice } from "@/lib/data"
import { formatPersianDate, formatPersianTime, formatPersianDateTime } from "@/lib/persian-date"
import type { PurchaseRequestListItem } from "@/types/purchase-request"
import { PurchaseRequestStatusForm } from "@/components/admin/purchase-requests/purchase-request-status-form"
import { PurchaseRequestStatusBadge } from "@/components/admin/purchase-requests/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

function followUpClass(value: string | null) {
  if (!value) return ""
  const time = new Date(value).getTime()
  const now = Date.now()
  if (time < now) return "text-destructive font-bold"
  const endOfToday = new Date()
  endOfToday.setHours(23, 59, 59, 999)
  if (time <= endOfToday.getTime()) return "text-orange-700 font-bold"
  return "text-muted-foreground"
}

export function PurchaseRequestsTable({ requests }: { requests: PurchaseRequestListItem[] }) {
  if (!requests.length) {
    return (
      <Card className="rounded-2xl border-dashed shadow-sm">
        <CardContent className="p-10 text-center">
          <h2 className="text-xl font-black text-primary">هنوز درخواست خریدی ثبت نشده است</h2>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">درخواست‌های تماس مشتریان از صفحه تسویه‌حساب در این بخش نمایش داده می‌شوند.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden rounded-2xl shadow-sm">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>شماره درخواست</TableHead>
                <TableHead>تاریخ ثبت</TableHead>
                <TableHead>ساعت ثبت</TableHead>
                <TableHead>نام مشتری</TableHead>
                <TableHead>شماره تماس</TableHead>
                <TableHead>اقلام</TableHead>
                <TableHead>مبلغ تقریبی</TableHead>
                <TableHead>زمان تماس</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>آخرین پیگیری</TableHead>
                <TableHead>پیگیری بعدی</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell dir="ltr" className="whitespace-nowrap text-left text-xs font-bold text-primary">{request.requestNumber}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatPersianDate(request.createdAt)}</TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatPersianTime(request.createdAt)}</TableCell>
                  <TableCell className="font-bold text-primary">{request.customerName}</TableCell>
                  <TableCell dir="ltr" className="whitespace-nowrap text-left font-semibold">{request.phone}</TableCell>
                  <TableCell>{request.itemCount.toLocaleString("fa-IR")}</TableCell>
                  <TableCell className="whitespace-nowrap font-bold">{formatPrice(request.estimatedTotal)} تومان</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{request.preferredContactTime || "در اولین فرصت"}</TableCell>
                  <TableCell><PurchaseRequestStatusBadge status={request.status} /></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatPersianDateTime(request.lastContactedAt)}</TableCell>
                  <TableCell className={`whitespace-nowrap text-xs ${followUpClass(request.nextFollowUpAt)}`}>{formatPersianDateTime(request.nextFollowUpAt)}</TableCell>
                  <TableCell>
                    <div className="flex min-w-[250px] flex-wrap items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="rounded-lg">
                        <Link href={`/admin/purchase-requests/${request.id}`}><Eye className="h-4 w-4" />جزئیات</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-lg">
                        <a href={`tel:${request.phone}`}><PhoneCall className="h-4 w-4" /></a>
                      </Button>
                      <PurchaseRequestStatusForm id={request.id} currentStatus={request.status} compact />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
