"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, Pencil, Percent, Plus, Search, Trash2, ToggleRight } from "lucide-react"
import type { Brand } from "@/types/brand"
import type { Category } from "@/types/category"
import type { Product } from "@/types/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductImageWithFallback } from "@/components/product-image-with-fallback"
import { deleteProductAction, toggleProductActiveAction } from "@/lib/actions/admin-products-actions"
import { toast } from "sonner"

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(value)
}

function DeleteProductButton({ productId, onDeleted }: { productId: string; onDeleted: (productId: string) => void }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm("آیا از حذف این محصول مطمئن هستید؟")) return

    startTransition(async () => {
      const result = await deleteProductAction(productId)
      if (!result.ok) {
        toast.error("حذف محصول ناموفق بود", { description: result.message })
        return
      }

      onDeleted(productId)
      toast.success(result.message)
      router.refresh()
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={isPending ? "sm" : "icon"}
      className="rounded-lg text-destructive hover:text-destructive"
      disabled={isPending}
      onClick={handleDelete}
      title={isPending ? "در حال حذف..." : "حذف محصول"}
      aria-label={isPending ? "در حال حذف..." : "حذف محصول"}
    >
      {isPending ? <span className="text-xs">در حال حذف...</span> : <Trash2 className="h-4 w-4" />}
    </Button>
  )
}

export function AdminProductsTable({ products, brands, categories }: { products: Product[]; brands: Brand[]; categories: Category[] }) {
  const [search, setSearch] = useState("")
  const [brand, setBrand] = useState("all")
  const [category, setCategory] = useState("all")
  const [status, setStatus] = useState("all")
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([])

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      if (deletedProductIds.includes(product.id)) return false
      const matchesQuery = !query || [product.name, product.model, product.sku].filter(Boolean).some((item) => String(item).toLowerCase().includes(query))
      const matchesBrand = brand === "all" || product.brandName === brand
      const matchesCategory = category === "all" || product.categoryName === category
      const matchesStatus = status === "all" || (status === "active" ? product.isActive !== false : product.isActive === false)
      return matchesQuery && matchesBrand && matchesCategory && matchesStatus
    })
  }, [products, search, brand, category, status, deletedProductIds])

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px_160px_auto_auto]">
          <div className="relative">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجو نام، مدل یا SKU" className="h-11 rounded-xl pr-10" />
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="دسته‌بندی" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌بندی‌ها</SelectItem>
              {categories.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="برند" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه برندها</SelectItem>
              {brands.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-11 w-full rounded-xl"><SelectValue placeholder="وضعیت" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="inactive">غیرفعال</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild variant="outline" className="h-11 rounded-xl">
            <Link href="/admin/products/bulk-price-update" className="gap-2"><Percent className="h-4 w-4" /> تغییر گروهی قیمت‌ها</Link>
          </Button>
          <Link
            href="/admin/products/new"
            prefetch={false}
            data-add-product-link="toolbar"
            className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <Plus className="h-4 w-4" />
            افزودن محصول جدید
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">تصویر</TableHead>
              <TableHead className="text-right">نام محصول</TableHead>
              <TableHead className="text-right">مدل</TableHead>
              <TableHead className="text-right">SKU</TableHead>
              <TableHead className="text-right">برند</TableHead>
              <TableHead className="text-right">دسته‌بندی</TableHead>
              <TableHead className="text-right">قیمت</TableHead>
              <TableHead className="text-right">موجودی</TableHead>
              <TableHead className="text-right">وضعیت</TableHead>
              <TableHead className="text-right">ویژه</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="h-14 w-14 overflow-hidden rounded-xl border bg-muted">
                    <ProductImageWithFallback imageUrl={product.mainImageUrl} alt={product.mainImageAlt || product.name} objectFit="contain" />
                  </div>
                </TableCell>
                <TableCell className="max-w-[260px] whitespace-normal font-semibold text-primary">{product.name}</TableCell>
                <TableCell>{product.model || "—"}</TableCell>
                <TableCell>{product.sku || "—"}</TableCell>
                <TableCell>{product.brandName || "—"}</TableCell>
                <TableCell>{product.categoryName || "—"}</TableCell>
                <TableCell>{formatPrice(product.price)} تومان</TableCell>
                <TableCell>{formatPrice(product.stockQuantity)}</TableCell>
                <TableCell>{product.isActive === false ? <Badge variant="outline">غیرفعال</Badge> : <Badge variant="secondary">فعال</Badge>}</TableCell>
                <TableCell>{product.isFeatured ? <Badge className="bg-accent text-accent-foreground">ویژه</Badge> : "—"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button asChild variant="ghost" size="icon" className="rounded-lg"><Link href={`/products/${product.slug}`}><Eye className="h-4 w-4" /></Link></Button>
                    <Button asChild variant="ghost" size="icon" className="rounded-lg"><Link href={`/admin/products/${product.id}/edit`}><Pencil className="h-4 w-4" /></Link></Button>
                    <form action={toggleProductActiveAction}>
                      <input type="hidden" name="id" value={product.id} />
                      <Button variant="ghost" size="icon" className="rounded-lg" title="فعال/غیرفعال"><ToggleRight className="h-4 w-4" /></Button>
                    </form>
                    <DeleteProductButton
                      productId={product.id}
                      onDeleted={(productId) => setDeletedProductIds((current) => [...current, productId])}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
