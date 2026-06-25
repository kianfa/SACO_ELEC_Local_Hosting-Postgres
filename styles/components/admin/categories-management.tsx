"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Edit, Eye, EyeOff, Plus, Power, PowerOff, Search, Trash2 } from "lucide-react"
import type { Category } from "@/types/category"
import { deleteCategoryAction, toggleAdminCategoryActiveAction, toggleAdminCategoryHomepageAction } from "@/lib/actions/admin-category-actions"
import { CategoryImage } from "@/components/common/category-image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

export function CategoriesManagement({ categories }: { categories: Category[] }) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return categories
    return categories.filter((category) => `${category.name} ${category.slug} ${category.parentName ?? ""}`.toLowerCase().includes(value))
  }, [categories, query])

  return <div className="space-y-5">
    <Card className="rounded-2xl shadow-sm"><CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
      <div className="relative w-full md:max-w-sm"><Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی دسته‌بندی" className="rounded-xl pr-9" /></div>
      <Button asChild className="rounded-xl"><Link href="/admin/categories/new"><Plus className="ml-2 h-4 w-4" />افزودن دسته‌بندی جدید</Link></Button>
    </CardContent></Card>

    {!categories.length ? <Card className="rounded-2xl border-dashed shadow-sm"><CardContent className="p-10 text-center"><h2 className="text-xl font-black text-primary">هنوز دسته‌بندی‌ای ثبت نشده است</h2><p className="mt-2 text-sm text-muted-foreground">برای شروع، اولین دسته‌بندی تجهیزات برق صنعتی را اضافه کنید.</p><Button asChild className="mt-5 rounded-xl"><Link href="/admin/categories/new">افزودن اولین دسته‌بندی</Link></Button></CardContent></Card> :
      <Card className="overflow-hidden rounded-2xl shadow-sm"><CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow>
        <TableHead>تصویر</TableHead><TableHead>نام دسته‌بندی</TableHead><TableHead>slug</TableHead><TableHead>والد</TableHead><TableHead>صفحه اصلی</TableHead><TableHead>ترتیب</TableHead><TableHead>وضعیت</TableHead><TableHead>محصولات</TableHead><TableHead>عملیات</TableHead>
      </TableRow></TableHeader><TableBody>{filtered.map((category) => <TableRow key={category.id}>
        <TableCell><CategoryImage src={category.displayImageUrl} iconSrc={category.homepageIconUrl} alt={category.displayImageAltText || category.name} iconAlt={category.homepageIconAltText || category.name} size="thumbnail" className="h-14 w-14" /></TableCell>
        <TableCell className="font-bold text-primary">{category.name}</TableCell>
        <TableCell dir="ltr" className="text-left text-xs">{category.slug}</TableCell>
        <TableCell className="text-sm text-muted-foreground">{category.parentName || "—"}</TableCell>
        <TableCell><Badge variant={category.showOnHomepage ? "default" : "secondary"}>{category.showOnHomepage ? "نمایش" : "مخفی"}</Badge></TableCell>
        <TableCell>{category.homepageSortOrder}</TableCell>
        <TableCell><Badge variant={category.isActive ? "default" : "secondary"}>{category.isActive ? "فعال" : "غیرفعال"}</Badge></TableCell>
        <TableCell>{category.productCount ?? 0}</TableCell>
        <TableCell><div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="rounded-lg"><Link href={`/admin/categories/${category.id}/edit`}><Edit className="h-4 w-4" /></Link></Button>
          <Button asChild size="sm" variant="outline" className="rounded-lg"><Link href={`/products?categories=${encodeURIComponent(category.slug)}`} target="_blank"><Eye className="h-4 w-4" /></Link></Button>
          <form action={toggleAdminCategoryActiveAction}><input type="hidden" name="id" value={category.id} />{category.isActive ? <input type="hidden" name="currentIsActive" value="on" /> : null}<Button type="submit" size="sm" variant="outline" className="rounded-lg">{category.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}</Button></form>
          <form action={toggleAdminCategoryHomepageAction}><input type="hidden" name="id" value={category.id} />{category.showOnHomepage ? <input type="hidden" name="currentShowOnHomepage" value="on" /> : null}<Button type="submit" size="sm" variant="outline" className="rounded-lg">{category.showOnHomepage ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button></form>
          <AlertDialog><AlertDialogTrigger asChild><Button size="sm" variant="outline" className="rounded-lg text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent dir="rtl"><AlertDialogHeader><AlertDialogTitle>حذف دسته‌بندی</AlertDialogTitle><AlertDialogDescription>{category.productCount ? `این دسته‌بندی به ${category.productCount} محصول متصل است. در صورت حذف، دسته‌بندی محصولات مربوطه خالی خواهد شد.` : "این دسته‌بندی حذف خواهد شد."}{category.childCount ? ` این دسته‌بندی دارای ${category.childCount} زیرمجموعه است؛ ابتدا وضعیت زیرمجموعه‌ها را بررسی کنید.` : ""}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>انصراف</AlertDialogCancel><form action={deleteCategoryAction}><input type="hidden" name="id" value={category.id} /><AlertDialogAction asChild><Button type="submit" variant="destructive">حذف دسته‌بندی</Button></AlertDialogAction></form></AlertDialogFooter></AlertDialogContent></AlertDialog>
        </div></TableCell>
      </TableRow>)}</TableBody></Table></div></CardContent></Card>}
  </div>
}
