"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Edit, Eye, Plus, Power, PowerOff, Search, Trash2 } from "lucide-react"
import type { Brand } from "@/types/brand"
import { deleteBrandAction, toggleBrandActiveAction } from "@/lib/actions/admin-brand-actions"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export function BrandsManagement({ brands }: { brands: Brand[] }) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return brands
    return brands.filter((brand) => `${brand.name} ${brand.slug} ${brand.description ?? ""}`.toLowerCase().includes(value))
  }, [brands, query])

  return (
    <div className="space-y-5">
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی برند" className="rounded-xl pr-9" />
          </div>
          <Button asChild className="rounded-xl"><Link href="/admin/brands/new"><Plus className="ml-2 h-4 w-4" />افزودن برند جدید</Link></Button>
        </CardContent>
      </Card>

      {!brands.length ? (
        <Card className="rounded-2xl border-dashed shadow-sm"><CardContent className="p-10 text-center">
          <h2 className="text-xl font-black text-primary">هنوز برندی ثبت نشده است</h2>
          <p className="mt-2 text-sm text-muted-foreground">برای شروع، اولین برند تجهیزات برق صنعتی را اضافه کنید.</p>
          <Button asChild className="mt-5 rounded-xl"><Link href="/admin/brands/new">افزودن اولین برند</Link></Button>
        </CardContent></Card>
      ) : (
        <Card className="overflow-hidden rounded-2xl shadow-sm"><CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>لوگو</TableHead><TableHead>نام برند</TableHead><TableHead>slug</TableHead><TableHead>توضیحات</TableHead><TableHead>محصولات</TableHead><TableHead>تاریخ ثبت</TableHead><TableHead>وضعیت</TableHead><TableHead>عملیات</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell><SafeImageWithFallback src={brand.logoUrl} altText={brand.logoAltText || `لوگوی برند ${brand.name}`} fallbackText={brand.name} objectFit="contain" className="h-14 w-14 rounded-xl border bg-muted/30 p-2" /></TableCell>
                    <TableCell className="font-bold text-primary">{brand.name}</TableCell>
                    <TableCell dir="ltr" className="text-left text-xs">{brand.slug}</TableCell>
                    <TableCell className="max-w-[240px] truncate text-sm text-muted-foreground">{brand.description || "—"}</TableCell>
                    <TableCell>{brand.productCount ?? 0}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{brand.createdAt ? new Intl.DateTimeFormat("fa-IR").format(new Date(brand.createdAt)) : "—"}</TableCell>
                    <TableCell><Badge variant={brand.isActive ? "default" : "secondary"}>{brand.isActive ? "فعال" : "غیرفعال"}</Badge></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button asChild size="sm" variant="outline" className="rounded-lg"><Link href={`/admin/brands/${brand.id}/edit`}><Edit className="h-4 w-4" /></Link></Button>
                        <Button asChild size="sm" variant="outline" className="rounded-lg"><Link href={`/products?brands=${encodeURIComponent(brand.slug)}`} target="_blank"><Eye className="h-4 w-4" /></Link></Button>
                        <form action={toggleBrandActiveAction}>
                          <input type="hidden" name="id" value={brand.id} />{brand.isActive ? <input type="hidden" name="currentIsActive" value="on" /> : null}
                          <Button type="submit" size="sm" variant="outline" className="rounded-lg">{brand.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}</Button>
                        </form>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button size="sm" variant="outline" className="rounded-lg text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف برند</AlertDialogTitle><AlertDialogDescription>این برند به {brand.productCount ?? 0} محصول متصل است. در صورت حذف برند، ارتباط برند از محصولات مربوطه حذف خواهد شد.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><form action={deleteBrandAction}><input type="hidden" name="id" value={brand.id} /><AlertDialogAction asChild><Button type="submit" variant="destructive">حذف برند</Button></AlertDialogAction></form></AlertDialogFooter></AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent></Card>
      )}
    </div>
  )
}
