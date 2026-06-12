"use client"

import { useActionState, useState } from "react"
import { deleteBannerAction, saveBannerAction } from "@/lib/actions/site-content-actions"
import type { SiteBanner, SiteContentActionState } from "@/types/site-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ContentActionMessage } from "@/components/admin/content/content-action-message"
import { AdminSubmitButton } from "@/components/admin/content/admin-submit-button"
import { Edit, Trash2 } from "lucide-react"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"

const initialState: SiteContentActionState = { ok: false, message: "" }
const placements = ["homepage_promo", "products_top", "checkout_notice"]

function toDateTimeLocalValue(value: string | null) {
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  const offsetMs = parsed.getTimezoneOffset() * 60_000
  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16)
}

function emptyBanner(): SiteBanner {
  return {
    id: "",
    title: "",
    subtitle: null,
    description: null,
    imageUrl: null,
    imageAltText: null,
    buttonText: null,
    buttonUrl: null,
    badgeText: null,
    placement: "homepage_promo",
    isActive: true,
    startsAt: null,
    endsAt: null,
    sortOrder: 0,
  }
}

export function BannerManagement({ banners }: { banners: SiteBanner[] }) {
  const [state, formAction] = useActionState(saveBannerAction, initialState)
  const [editing, setEditing] = useState<SiteBanner>(emptyBanner())

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>لیست بنرها</CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length ? (
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">تصویر</TableHead>
                    <TableHead className="text-right">عنوان</TableHead>
                    <TableHead className="text-right">محل نمایش</TableHead>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">آدرس تصویر</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell>
                        <SafeImageWithFallback
                          src={banner.imageUrl}
                          altText={banner.imageAltText || banner.title}
                          fallbackText={banner.title}
                          compact
                          objectFit="cover"
                          className="h-14 w-20 rounded-lg"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{banner.title}</TableCell>
                      <TableCell dir="ltr">{banner.placement}</TableCell>
                      <TableCell>
                        <Badge variant={banner.isActive ? "default" : "secondary"}>{banner.isActive ? "فعال" : "غیرفعال"}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-xs" dir="ltr" title={banner.imageUrl ?? ""}>
                        {banner.imageUrl || "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => setEditing(banner)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <form action={deleteBannerAction}>
                            <input type="hidden" name="id" value={banner.id} />
                            <Button type="submit" size="sm" variant="outline" className="rounded-xl text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </form>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">هنوز بنری ثبت نشده است.</div>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit rounded-2xl shadow-sm xl:sticky xl:top-6">
        <CardHeader>
          <CardTitle>{editing.id ? "ویرایش بنر" : "افزودن بنر جدید"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <ContentActionMessage state={state} />
            <input type="hidden" name="id" value={editing.id} />
            <input type="hidden" name="imageUrl" value={editing.imageUrl ?? ""} />

            {editing.imageUrl ? (
              <div className="overflow-hidden rounded-2xl border bg-muted">
                <SafeImageWithFallback
                  src={editing.imageUrl}
                  altText={editing.imageAltText || editing.title || "بنر ساکو الکتریک"}
                  fallbackText={editing.title || "بنر ساکو الکتریک"}
                  objectFit="cover"
                  className="h-40 w-full"
                />
                <div className="border-t bg-card p-3 text-xs text-muted-foreground" dir="ltr">
                  <span className="break-all">{editing.imageUrl}</span>
                </div>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>عنوان</Label>
              <Input name="title" required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>زیرعنوان</Label>
              <Input name="subtitle" value={editing.subtitle ?? ""} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>توضیح</Label>
              <Textarea name="description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>متن دکمه</Label>
                <Input name="buttonText" value={editing.buttonText ?? ""} onChange={(e) => setEditing({ ...editing, buttonText: e.target.value })} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>متن Badge</Label>
                <Input name="badgeText" value={editing.badgeText ?? ""} onChange={(e) => setEditing({ ...editing, badgeText: e.target.value })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>لینک دکمه</Label>
              <Input name="buttonUrl" dir="ltr" value={editing.buttonUrl ?? ""} onChange={(e) => setEditing({ ...editing, buttonUrl: e.target.value })} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>محل نمایش</Label>
                <Select name="placement" value={editing.placement || "homepage_promo"} onValueChange={(value) => setEditing({ ...editing, placement: value })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{placements.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">برای صفحه اصلی از homepage_promo استفاده می‌شود.</p>
              </div>
              <div className="space-y-2">
                <Label>ترتیب</Label>
                <Input name="sortOrder" type="number" value={editing.sortOrder} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} className="rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>تصویر بنر</Label>
              <Input name="image" type="file" accept="image/jpeg,image/png,image/webp" className="rounded-xl" />
              <p className="text-xs text-muted-foreground">تصویر مستقیماً روی فضای هاست ذخیره می‌شود و آدرس عمومی آن در دیتابیس ثبت می‌شود.</p>
            </div>
            <div className="space-y-2">
              <Label>متن ALT تصویر بنر</Label>
              <Input
                name="imageAltText"
                maxLength={150}
                value={editing.imageAltText ?? ""}
                onChange={(event) => setEditing({ ...editing, imageAltText: event.target.value })}
                placeholder={editing.title || "بنر ساکو الکتریک"}
                className="rounded-xl"
              />
              <p className="text-xs text-muted-foreground">برای سئو، دسترس‌پذیری و fallback در صورت خطای تصویر استفاده می‌شود.</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <span className="text-sm font-medium">فعال</span>
              <input type="hidden" name="isActive" value={editing.isActive ? "true" : "false"} />
              <Switch checked={editing.isActive} onCheckedChange={(value) => setEditing({ ...editing, isActive: value })} />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>شروع</Label>
                <Input
                  name="startsAt"
                  type="datetime-local"
                  value={toDateTimeLocalValue(editing.startsAt)}
                  onChange={(event) => setEditing({ ...editing, startsAt: event.target.value || null })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>پایان</Label>
                <Input
                  name="endsAt"
                  type="datetime-local"
                  value={toDateTimeLocalValue(editing.endsAt)}
                  onChange={(event) => setEditing({ ...editing, endsAt: event.target.value || null })}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row [&_button]:w-full sm:[&_button]:w-auto">
              <AdminSubmitButton>{editing.id ? "ذخیره تغییرات" : "افزودن بنر"}</AdminSubmitButton>
              <Button type="button" variant="outline" className="rounded-xl" onClick={() => setEditing(emptyBanner())}>فرم جدید</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
