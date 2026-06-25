import { AdminLayout } from "@/components/admin/admin-layout"
import { PurchaseRequestsTable } from "@/components/admin/purchase-requests/purchase-requests-table"
import { RequestSummaryCards } from "@/components/admin/purchase-requests/request-summary-cards"
import { getAdminPurchaseRequests } from "@/lib/services/purchase-requests-service"
import { purchaseRequestStatusLabels, purchaseRequestStatuses, type PurchaseRequestStatus } from "@/types/purchase-request"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

type SearchParams = Record<string, string | string[] | undefined>
function first(value: string | string[] | undefined) { return Array.isArray(value) ? value[0] : value }

export default async function AdminPurchaseRequestsPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = searchParams ? await searchParams : {}
  const query = first(params.query)?.trim() || undefined
  const status = (first(params.status) || "all") as PurchaseRequestStatus | "all"
  const followUpToday = first(params.followUpToday) === "1"
  const date = first(params.date)?.trim() || undefined
  const sort = (first(params.sort) || "newest") as "newest" | "oldest" | "nearest-follow-up"
  const requests = await getAdminPurchaseRequests({ query, status, followUpToday, date, sort })

  return <AdminLayout title="درخواست‌های خرید و تماس" subtitle="درخواست‌های ثبت‌شده مشتریان را بررسی و وضعیت پیگیری آن‌ها را مدیریت کنید.">
    <div className="space-y-5">
      <RequestSummaryCards requests={requests} />
      <Card className="rounded-2xl shadow-sm"><CardContent className="p-4"><form method="get" className="grid gap-3 md:grid-cols-5">
        <Input name="query" defaultValue={query} placeholder="جستجو بر اساس شماره درخواست، نام یا شماره تماس" className="rounded-xl" />
        <select name="status" defaultValue={status} className="h-9 rounded-xl border bg-background px-3 text-sm">
          <option value="all">همه وضعیت‌ها</option>
          {purchaseRequestStatuses.map((value) => <option key={value} value={value}>{purchaseRequestStatusLabels[value]}</option>)}
        </select>
        <Input type="date" name="date" defaultValue={date} className="rounded-xl" />
        <select name="sort" defaultValue={sort} className="h-9 rounded-xl border bg-background px-3 text-sm">
          <option value="newest">جدیدترین</option><option value="oldest">قدیمی‌ترین</option><option value="nearest-follow-up">نزدیک‌ترین زمان پیگیری</option>
        </select>
        <div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-sm"><input type="checkbox" name="followUpToday" value="1" defaultChecked={followUpToday} />پیگیری‌های امروز</label><Button type="submit" size="sm" className="rounded-lg">اعمال فیلتر</Button></div>
      </form></CardContent></Card>
      <PurchaseRequestsTable requests={requests} />
    </div>
  </AdminLayout>
}
