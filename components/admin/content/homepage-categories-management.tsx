"use client"

import { useActionState, useMemo, useState } from "react"
import {
  saveCategoryHomepageSettingsAction,
  saveHomepageCategorySectionAction,
  toggleCategoryActiveAction,
  toggleCategoryHomepageVisibilityAction,
} from "@/lib/actions/admin-categories-actions"
import type { Category, CategoryActionState, HomepageCategorySectionSettings } from "@/types/category"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminSubmitButton } from "@/components/admin/content/admin-submit-button"
import { Edit, Eye, EyeOff, Power, PowerOff, Search } from "lucide-react"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"

const initialState: CategoryActionState = { ok: false, message: "" }

function ActionMessage({ state }: { state: CategoryActionState }) {
  if (!state.message) return null
  return (
    <div className={state.ok ? "rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700" : "rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"}>
      {state.message}
    </div>
  )
}

function CategoryHiddenFields({ category }: { category: Category }) {
  return (
    <>
      <input type="hidden" name="id" value={category.id} />
      <input type="hidden" name="slug" value={category.slug} />
      <input type="hidden" name="homepageTitle" value={category.homepageTitle ?? ""} />
      <input type="hidden" name="homepageImageUrl" value={category.homepageImageUrl ?? ""} />
      <input type="hidden" name="homepageImageAltText" value={category.homepageImageAltText ?? ""} />
      <input type="hidden" name="homepageIconUrl" value={category.homepageIconUrl ?? ""} />
      <input type="hidden" name="homepageIconAltText" value={category.homepageIconAltText ?? ""} />
      <input type="hidden" name="homepageUrl" value={category.homepageUrl ?? ""} />
      <input type="hidden" name="homepageSortOrder" value={category.homepageSortOrder} />
      {category.showOnHomepage ? <input type="hidden" name="currentShowOnHomepage" value="on" /> : null}
      {category.isActive ? <input type="hidden" name="currentIsActive" value="on" /> : null}
    </>
  )
}

function emptyPreview(category: Category | null) {
  return category?.displayImageUrl || category?.homepageImageUrl || category?.imageUrl || category?.homepageIconUrl || null
}

export function HomepageCategoriesManagement({ categories, settings }: { categories: Category[]; settings: HomepageCategorySectionSettings }) {
  const [sectionState, sectionAction] = useActionState(saveHomepageCategorySectionAction, initialState)
  const [categoryState, categoryAction] = useActionState(saveCategoryHomepageSettingsAction, initialState)
  const [editing, setEditing] = useState<Category | null>(categories[0] ?? null)
  const [query, setQuery] = useState("")

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((category) => `${category.name} ${category.slug} ${category.homepageTitle ?? ""}`.toLowerCase().includes(q))
  }, [categories, query])

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle>تنظیمات بخش دسته‌بندی‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={sectionAction} className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div className="md:col-span-3">
              <ActionMessage state={sectionState} />
            </div>
            <div className="space-y-2">
              <Label>عنوان بخش</Label>
              <Input name="title" defaultValue={settings.title} className="rounded-xl" required />
            </div>
            <div className="space-y-2">
              <Label>زیرعنوان بخش</Label>
              <Input name="subtitle" defaultValue={settings.subtitle} className="rounded-xl" />
            </div>
            <div className="flex items-center gap-3 rounded-xl border p-3">
              <Switch name="isActive" defaultChecked={settings.isActive} />
              <span className="text-sm font-medium">فعال</span>
            </div>
            <div className="md:col-span-3">
              <AdminSubmitButton>ذخیره تنظیمات بخش</AdminSubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_430px]">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <CardTitle>دسته‌بندی‌ها</CardTitle>
              <div className="relative w-full md:w-72">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی دسته‌بندی..." className="rounded-xl pr-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCategories.length ? (
              <div className="overflow-x-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">تصویر کارت</TableHead>
                      <TableHead className="text-right">نام دسته‌بندی</TableHead>
                      <TableHead className="text-right">slug</TableHead>
                      <TableHead className="text-right">نمایش</TableHead>
                      <TableHead className="text-right">ترتیب</TableHead>
                      <TableHead className="text-right">وضعیت</TableHead>
                      <TableHead className="text-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCategories.map((category) => {
                      const preview = emptyPreview(category)
                      return (
                        <TableRow key={category.id}>
                          <TableCell>
                            <SafeImageWithFallback
                              src={preview}
                              altText={category.displayImageAltText || category.homepageTitle || category.name}
                              fallbackText={category.homepageTitle || category.name}
                              compact
                              className="h-14 w-20 rounded-lg bg-gradient-to-br from-slate-50 to-white p-1"
                              objectFit="contain"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{category.homepageTitle || category.name}</div>
                            {category.homepageTitle ? <div className="text-xs text-muted-foreground">نام اصلی: {category.name}</div> : null}
                          </TableCell>
                          <TableCell dir="ltr" className="text-xs text-muted-foreground">{category.slug}</TableCell>
                          <TableCell><Badge variant={category.showOnHomepage ? "default" : "secondary"}>{category.showOnHomepage ? "نمایش" : "عدم نمایش"}</Badge></TableCell>
                          <TableCell>{category.homepageSortOrder}</TableCell>
                          <TableCell><Badge variant={category.isActive ? "default" : "secondary"}>{category.isActive ? "فعال" : "غیرفعال"}</Badge></TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => setEditing(category)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <form action={toggleCategoryHomepageVisibilityAction}>
                                <CategoryHiddenFields category={category} />
                                <Button type="submit" size="sm" variant="outline" className="rounded-xl">
                                  {category.showOnHomepage ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </form>
                              <form action={toggleCategoryActiveAction}>
                                <CategoryHiddenFields category={category} />
                                <Button type="submit" size="sm" variant="outline" className="rounded-xl">
                                  {category.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                </Button>
                              </form>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">دسته‌بندی‌ای با این جستجو پیدا نشد.</div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit rounded-2xl shadow-sm xl:sticky xl:top-6">
          <CardHeader>
            <CardTitle>ویرایش کارت دسته‌بندی</CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <form action={categoryAction} className="space-y-4">
                <ActionMessage state={categoryState} />
                <input type="hidden" name="id" value={editing.id} />
                <input type="hidden" name="slug" value={editing.slug} />
                <input type="hidden" name="homepageImageUrl" value={editing.homepageImageUrl ?? ""} />
                <input type="hidden" name="homepageIconUrl" value={editing.homepageIconUrl ?? ""} />

                <div className="rounded-2xl border bg-muted/40 p-3">
                  <div className="text-sm font-bold text-primary">{editing.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground" dir="ltr">{editing.slug}</div>
                </div>

                <SafeImageWithFallback
                  src={emptyPreview(editing)}
                  altText={editing.displayImageAltText || editing.homepageTitle || editing.name}
                  fallbackText={editing.homepageTitle || editing.name}
                  className="h-40 w-full rounded-2xl border bg-gradient-to-br from-slate-50 to-white p-4"
                  objectFit="contain"
                />

                <div className="rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                  <div className="font-bold text-foreground">آدرس‌های ذخیره‌شده</div>
                  <div className="mt-2 break-all" dir="ltr">homepage_image_url: {editing.homepageImageUrl || "—"}</div>
                  <div className="mt-1 break-all" dir="ltr">image_url: {editing.imageUrl || "—"}</div>
                  <div className="mt-1 break-all" dir="ltr">homepage_icon_url: {editing.homepageIconUrl || "—"}</div>
                </div>

                <div className="space-y-2">
                  <Label>عنوان نمایشی کارت</Label>
                  <Input name="homepageTitle" defaultValue={editing.homepageTitle ?? ""} placeholder={editing.name} className="rounded-xl" />
                </div>

                <div className="space-y-2">
                  <Label>لینک کارت</Label>
                  <Input name="homepageUrl" defaultValue={editing.homepageUrl ?? `/products?category=${editing.slug}`} dir="ltr" className="rounded-xl" />
                  <p className="text-xs text-muted-foreground">اگر خالی بماند، لینک بر اساس slug ساخته می‌شود.</p>
                </div>

                <div className="space-y-2">
                  <Label>تصویر کارت صفحه اصلی</Label>
                  <Input name="homepageImage" type="file" accept="image/jpeg,image/png,image/webp" className="rounded-xl" />
                  <p className="text-xs text-muted-foreground">پیشنهاد: تصویر دسته‌بندی با پس‌زمینه روشن و ابعاد مربعی آپلود شود.</p>
                  <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="clearHomepageImage" />
                    حذف تصویر کارت فعلی
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>متن ALT تصویر دسته‌بندی</Label>
                  <Input
                    name="homepageImageAltText"
                    maxLength={150}
                    defaultValue={editing.homepageImageAltText ?? `تصویر دسته‌بندی ${editing.name}`}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">برای سئو، دسترس‌پذیری و نمایش جایگزین هنگام خطای تصویر استفاده می‌شود.</p>
                </div>

                <div className="space-y-2">
                  <Label>آیکن کارت</Label>
                  <Input name="homepageIcon" type="file" accept="image/jpeg,image/png,image/webp" className="rounded-xl" />
                  <p className="text-xs text-muted-foreground">پیشنهاد: آیکن ساده، خوانا و با نسبت ۱:۱ آپلود شود.</p>
                  <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="clearHomepageIcon" />
                    حذف آیکن فعلی
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>متن ALT آیکن دسته‌بندی</Label>
                  <Input
                    name="homepageIconAltText"
                    maxLength={150}
                    defaultValue={editing.homepageIconAltText ?? `آیکن دسته‌بندی ${editing.name}`}
                    className="rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">اختیاری؛ اگر تصویر اصلی در دسترس نباشد برای آیکن جایگزین استفاده می‌شود.</p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>ترتیب نمایش</Label>
                    <Input name="homepageSortOrder" type="number" defaultValue={editing.homepageSortOrder} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>لینک پیش‌فرض</Label>
                    <Input value={`/products?category=${editing.slug}`} readOnly dir="ltr" className="rounded-xl bg-muted text-xs" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-sm font-medium">نمایش در صفحه اصلی</span>
                    <Switch name="showOnHomepage" defaultChecked={editing.showOnHomepage} />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border p-3">
                    <span className="text-sm font-medium">فعال</span>
                    <Switch name="isActive" defaultChecked={editing.isActive} />
                  </div>
                </div>

                <AdminSubmitButton>ذخیره کارت دسته‌بندی</AdminSubmitButton>
              </form>
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">برای ویرایش، یک دسته‌بندی را انتخاب کنید.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
