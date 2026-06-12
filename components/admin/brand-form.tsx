"use client"

import { useActionState, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import type { Brand, BrandActionState } from "@/types/brand"
import { saveBrandAction } from "@/lib/actions/admin-brand-actions"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

const initialState: BrandActionState = { ok: false, message: "" }
const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")

export function BrandForm({ brand = null }: { brand?: Brand | null }) {
  const router = useRouter()
  const [state, action, pending] = useActionState(saveBrandAction, initialState)
  const [name, setName] = useState(brand?.name ?? "")
  const [slug, setSlug] = useState(brand?.slug ?? "")
  const [slugTouched, setSlugTouched] = useState(Boolean(brand))
  const [logoPreview, setLogoPreview] = useState(brand?.logoUrl ?? "")

  useEffect(() => { if (!slugTouched) setSlug(slugify(name)) }, [name, slugTouched])
  useEffect(() => { if (!state.message) return; state.ok ? toast.success(state.message) : toast.error(state.message); if (state.ok && state.redirectTo) router.push(state.redirectTo) }, [router, state])
  const defaultAlt = useMemo(() => `لوگوی برند ${name || "برند"}`, [name])

  return <form action={action} className="grid gap-6 lg:grid-cols-[1fr_300px]">
    <input type="hidden" name="id" value={brand?.id ?? ""} />
    <input type="hidden" name="logoUrl" value={brand?.logoUrl ?? ""} />
    <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>اطلاعات برند</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2"><Label>نام برند</Label><Input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl" /></div>
      <div className="space-y-2"><Label>slug</Label><Input name="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }} required dir="ltr" className="rounded-xl text-left" /><p className="text-xs text-muted-foreground">فقط حروف انگلیسی کوچک، عدد و خط تیره</p></div>
      <div className="space-y-2"><Label>لوگوی برند</Label><Input name="logo" type="file" accept="image/jpeg,image/png,image/webp" className="rounded-xl" onChange={(e) => { const selected = e.target.files?.[0]; if (selected) setLogoPreview(URL.createObjectURL(selected)) }} /></div>
      <div className="space-y-2 md:col-span-2"><Label>متن ALT لوگو</Label><Input name="logoAltText" defaultValue={brand?.logoAltText ?? defaultAlt} maxLength={150} className="rounded-xl" /><p className="text-xs text-muted-foreground">برای سئو و نمایش جایگزین در صورت بارگذاری‌نشدن لوگو استفاده می‌شود.</p></div>
      <div className="space-y-2 md:col-span-2"><Label>توضیحات</Label><Textarea name="description" defaultValue={brand?.description ?? ""} className="min-h-28 rounded-xl" /></div>
      <label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium md:col-span-2"><span>فعال / قابل نمایش</span><Switch name="isActive" defaultChecked={brand?.isActive ?? true} /></label>
      {brand?.logoUrl ? <label className="flex items-center gap-2 text-sm text-muted-foreground md:col-span-2"><input type="checkbox" name="clearLogo" /> حذف لوگوی فعلی</label> : null}
    </CardContent></Card>
    <aside className="space-y-4">
      <Card className="rounded-2xl shadow-sm"><CardHeader><CardTitle>پیش‌نمایش لوگو</CardTitle></CardHeader><CardContent><SafeImageWithFallback src={logoPreview} altText={brand?.logoAltText || defaultAlt} fallbackText={name || "لوگوی برند"} objectFit="contain" className="aspect-square w-full rounded-2xl border bg-muted/30 p-6" /></CardContent></Card>
      {state.message && !state.ok ? <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{state.message}</div> : null}
      <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm"><Button name="intent" value="save" disabled={pending} className="rounded-xl">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} ذخیره برند</Button>{!brand ? <Button name="intent" value="save-new" variant="outline" disabled={pending} className="rounded-xl">ذخیره و افزودن برند جدید</Button> : null}<Button asChild type="button" variant="ghost" className="rounded-xl"><Link href="/admin/brands">انصراف</Link></Button></div>
    </aside>
  </form>
}
