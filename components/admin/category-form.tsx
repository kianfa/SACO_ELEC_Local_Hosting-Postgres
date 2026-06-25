"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import type { Category, CategoryActionState } from "@/types/category"
import { saveCategoryAction } from "@/lib/actions/admin-category-actions"
import { CategoryImage } from "@/components/common/category-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const initialState: CategoryActionState = { ok: false, message: "" }
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

export function CategoryForm({ category = null, categories }: { category?: Category | null; categories: Category[] }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(saveCategoryAction, initialState)
  const [name, setName] = useState(category?.name ?? "")
  const [slug, setSlug] = useState(category?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(category))
  const [generalPreview, setGeneralPreview] = useState(category?.imageUrl ?? "")
  const [homepagePreview, setHomepagePreview] = useState(category?.homepageImageUrl ?? "")
  const [iconPreview, setIconPreview] = useState(category?.homepageIconUrl ?? "")

  useEffect(() => { if (!slugTouched) setSlug(slugify(name)) }, [name, slugTouched])
  useEffect(() => { if (!state.message) return; state.ok ? toast.success(state.message) : toast.error(state.message); if (state.ok && state.redirectTo) router.push(state.redirectTo) }, [router, state])
  const preview = homepagePreview || generalPreview || iconPreview || null
  const defaultImageAlt = useMemo(() => `تصویر دسته‌بندی ${name || "محصولات"}`, [name])
  const availableParents = categories.filter((item) => item.id !== category?.id)

  return <form action={action} className="grid gap-6 xl:grid-cols-[1fr_340px]">
    <input type="hidden" name="id" value={category?.id ?? ""} /><input type="hidden" name="imageUrl" value={category?.imageUrl ?? ""} /><input type="hidden" name="homepageImageUrl" value={category?.homepageImageUrl ?? ""} /><input type="hidden" name="homepageIconUrl" value={category?.homepageIconUrl ?? ""} />
    <div className="space-y-6">
      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>اطلاعات اصلی دسته‌بندی</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2"><Label>نام دسته‌بندی</Label><Input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl" /></div>
        <div className="space-y-2"><Label>slug</Label><Input name="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }} required dir="ltr" className="rounded-xl text-left" /><p className="text-xs text-muted-foreground">فقط حروف انگلیسی کوچک، عدد و خط تیره</p></div>
        <div className="space-y-2"><Label>دسته‌بندی والد</Label><Select name="parentId" defaultValue={category?.parentId || "none"}><SelectTrigger className="rounded-xl"><SelectValue placeholder="بدون والد" /></SelectTrigger><SelectContent><SelectItem value="none">بدون والد</SelectItem>{availableParents.map((item) => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2 md:col-span-2"><Label>توضیحات</Label><Textarea name="description" defaultValue={category?.description ?? ""} className="min-h-28 rounded-xl" /></div>
      </CardContent></Card>
      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>تصاویر دسته‌بندی</CardTitle></CardHeader><CardContent className="grid gap-5 md:grid-cols-3">
        <ImageField label="تصویر عمومی دسته‌بندی" inputName="image" altName="imageAltText" clearName="clearImage" currentUrl={category?.imageUrl} currentAlt={category?.imageAltText} defaultAlt={defaultImageAlt} onPreview={setGeneralPreview} />
        <ImageField label="تصویر کارت صفحه اصلی" inputName="homepageImage" altName="homepageImageAltText" clearName="clearHomepageImage" currentUrl={category?.homepageImageUrl} currentAlt={category?.homepageImageAltText} defaultAlt={defaultImageAlt} onPreview={setHomepagePreview} />
        <ImageField label="آیکن دسته‌بندی" inputName="homepageIcon" altName="homepageIconAltText" clearName="clearHomepageIcon" currentUrl={category?.homepageIconUrl} currentAlt={category?.homepageIconAltText} defaultAlt={`آیکن دسته‌بندی ${name || "محصولات"}`} onPreview={setIconPreview} />
      </CardContent></Card>
      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>نمایش در صفحه اصلی</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>عنوان نمایشی کارت</Label><Input name="homepageTitle" defaultValue={category?.homepageTitle ?? ""} placeholder={name} className="rounded-xl" /></div>
        <div className="space-y-2"><Label>لینک سفارشی کارت</Label><Input name="homepageUrl" defaultValue={category?.homepageUrl ?? ""} placeholder={`/products?categories=${slug || "category-slug"}`} dir="ltr" className="rounded-xl text-left" /></div>
        <div className="space-y-2"><Label>ترتیب نمایش</Label><Input name="homepageSortOrder" type="number" defaultValue={category?.homepageSortOrder ?? 0} className="rounded-xl" /></div>
        <div className="grid gap-3 sm:grid-cols-2 md:col-span-2"><label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium">نمایش در صفحه اصلی<Switch name="showOnHomepage" defaultChecked={category?.showOnHomepage ?? true} /></label><label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium">فعال / قابل نمایش<Switch name="isActive" defaultChecked={category?.isActive ?? true} /></label></div>
      </CardContent></Card>
    </div>
    <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit"><Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>پیش‌نمایش کارت</CardTitle></CardHeader><CardContent><CategoryImage src={preview} iconSrc={iconPreview} alt={category?.displayImageAltText || defaultImageAlt} iconAlt={category?.homepageIconAltText || `آیکن دسته‌بندی ${name}`} size="large" className="h-56 w-full" /><div className="mt-3 font-bold text-primary">{name || "نام دسته‌بندی"}</div></CardContent></Card>{state.message && !state.ok ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.message}</div> : null}<div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm"><Button name="intent" value="save" disabled={pending} className="rounded-xl">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} ذخیره دسته‌بندی</Button>{!category ? <Button name="intent" value="save-new" variant="outline" disabled={pending} className="rounded-xl">ذخیره و افزودن دسته‌بندی جدید</Button> : null}<Button asChild type="button" variant="ghost" className="rounded-xl"><Link href="/admin/categories">انصراف</Link></Button></div></aside>
  </form>
}

function ImageField({ label, inputName, altName, clearName, currentUrl, currentAlt, defaultAlt, onPreview }: { label: string; inputName: string; altName: string; clearName: string; currentUrl?: string | null; currentAlt?: string | null; defaultAlt: string; onPreview: (value: string) => void }) {
  const previewObjectUrlRef = useRef<string | null>(null)

  useEffect(() => () => { if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current) }, [])

  function handlePreview(file: File | undefined) {
    if (!file) return
    if (previewObjectUrlRef.current) URL.revokeObjectURL(previewObjectUrlRef.current)
    const nextPreviewUrl = URL.createObjectURL(file)
    previewObjectUrlRef.current = nextPreviewUrl
    onPreview(nextPreviewUrl)
  }

  return <div className="space-y-3 rounded-xl border p-3"><Label>{label}</Label><Input name={inputName} type="file" accept="image/jpeg,image/png,image/webp" className="rounded-xl" onChange={(e) => handlePreview(e.target.files?.[0])} /><div className="space-y-2"><Label className="text-xs">متن ALT</Label><Input name={altName} maxLength={150} defaultValue={currentAlt ?? defaultAlt} className="rounded-xl" /></div>{currentUrl ? <label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" name={clearName} /> حذف تصویر فعلی</label> : null}</div>
}
