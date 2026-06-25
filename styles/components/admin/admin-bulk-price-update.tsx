"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { AlertTriangle, Calculator, CheckCircle2, Percent, Search } from "lucide-react"
import type { Brand } from "@/types/brand"
import type { Category } from "@/types/category"
import type { Product } from "@/types/product"
import type {
  BulkOldPriceBehavior,
  BulkPriceChangeType,
  BulkPricePreviewItem,
  BulkPriceRequest,
  BulkPriceRoundingMode,
  BulkPriceTargetType,
} from "@/types/admin-price"
import { applyBulkPriceAction, previewBulkPriceAction } from "@/lib/actions/admin-price-actions"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ProductImageWithFallback } from "@/components/product-image-with-fallback"

function formatPrice(value: number) {
  return new Intl.NumberFormat("fa-IR").format(Math.round(value))
}

function percentLabel(type: BulkPriceChangeType, percent: number) {
  if (!percent) return "—"
  return `${type === "increase" ? "+" : "-"}${new Intl.NumberFormat("fa-IR").format(percent)}٪`
}

const roundingOptions: { value: BulkPriceRoundingMode; label: string }[] = [
  { value: "none", label: "بدون گرد کردن" },
  { value: "1000", label: "گرد کردن به نزدیک‌ترین ۱٬۰۰۰ تومان" },
  { value: "10000", label: "گرد کردن به نزدیک‌ترین ۱۰٬۰۰۰ تومان" },
  { value: "100000", label: "گرد کردن به نزدیک‌ترین ۱۰۰٬۰۰۰ تومان" },
]

export function AdminBulkPriceUpdate({ products, brands, categories }: { products: Product[]; brands: Brand[]; categories: Category[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [isApplying, startApplyTransition] = useTransition()
  const [targetType, setTargetType] = useState<BulkPriceTargetType>("brand")
  const [brandId, setBrandId] = useState<string | null>(brands[0]?.id ?? null)
  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null)
  const [onlyActive, setOnlyActive] = useState(true)
  const [onlyFeatured, setOnlyFeatured] = useState(false)
  const [onlyInStock, setOnlyInStock] = useState(false)
  const [changeType, setChangeType] = useState<BulkPriceChangeType>("increase")
  const [percent, setPercent] = useState("10")
  const [roundingMode, setRoundingMode] = useState<BulkPriceRoundingMode>("1000")
  const [oldPriceBehavior, setOldPriceBehavior] = useState<BulkOldPriceBehavior>("current_to_old")
  const [manualSearch, setManualSearch] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  const [previewItems, setPreviewItems] = useState<BulkPricePreviewItem[]>([])
  const [previewMessage, setPreviewMessage] = useState("")
  const [confirmed, setConfirmed] = useState(false)

  const filteredManualProducts = useMemo(() => {
    const query = manualSearch.trim().toLowerCase()
    if (!query) return products.slice(0, 80)
    return products
      .filter((product) => [product.name, product.model, product.sku, product.brandName, product.categoryName].filter(Boolean).some((item) => String(item).toLowerCase().includes(query)))
      .slice(0, 80)
  }, [products, manualSearch])

  const targetLabel = useMemo(() => {
    if (targetType === "brand") return brands.find((brand) => brand.id === brandId)?.name ?? null
    if (targetType === "category") return categories.find((category) => category.id === categoryId)?.name ?? null
    if (targetType === "manual") return `${selectedProductIds.length} محصول انتخاب‌شده`
    return "همه محصولات مطابق فیلترها"
  }, [targetType, brandId, categoryId, brands, categories, selectedProductIds.length])

  function buildRequest(): BulkPriceRequest {
    return {
      targetType,
      brandId: targetType === "brand" ? brandId : null,
      categoryId: targetType === "category" ? categoryId : null,
      onlyActive,
      onlyFeatured,
      onlyInStock,
      selectedProductIds: targetType === "manual" ? selectedProductIds : [],
      changeType,
      percent: Number(percent),
      roundingMode,
      oldPriceBehavior,
    }
  }

  function resetPreview() {
    setPreviewItems([])
    setPreviewMessage("")
    setConfirmed(false)
  }

  function handlePreview() {
    startTransition(async () => {
      const result = await previewBulkPriceAction(buildRequest())
      setPreviewItems(result.items)
      setPreviewMessage(result.message)
      setConfirmed(false)
      if (!result.ok) {
        toast({ title: "خطا در پیش‌نمایش", description: result.message, variant: "destructive" })
      } else if (!result.items.length) {
        toast({ title: "محصولی پیدا نشد", description: "محصولی با این فیلترها پیدا نشد" })
      } else {
        toast({ title: "پیش‌نمایش آماده شد", description: `${formatPrice(result.affectedCount)} محصول آماده بررسی است.` })
      }
    })
  }

  function handleApply() {
    if (!confirmed || !previewItems.length) return
    startApplyTransition(async () => {
      const result = await applyBulkPriceAction(buildRequest(), targetLabel)
      if (result.ok) {
        toast({ title: "قیمت محصولات با موفقیت به‌روزرسانی شد", description: `${formatPrice(result.affectedCount)} محصول به‌روزرسانی شد.` })
        setPreviewItems([])
        setPreviewMessage("")
        setConfirmed(false)
      } else {
        toast({ title: "خطا در به‌روزرسانی قیمت محصولات", description: result.message, variant: "destructive" })
      }
    })
  }

  function toggleProductSelection(productId: string, checked: boolean) {
    resetPreview()
    setSelectedProductIds((current) => checked ? Array.from(new Set([...current, productId])) : current.filter((id) => id !== productId))
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-bold text-primary">انتخاب و تنظیم تغییر قیمت</h2>
          <p className="mt-1 text-sm text-muted-foreground">ابتدا فیلترها را انتخاب کنید، سپس پیش‌نمایش بگیرید و در نهایت تغییرات را تأیید کنید.</p>
        </div>
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/admin/products">بازگشت به محصولات</Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>روش انتخاب محصولات</CardTitle>
              <CardDescription>بر اساس برند، دسته‌بندی یا انتخاب دستی محصولات را هدف‌گذاری کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <RadioGroup value={targetType} onValueChange={(value) => { setTargetType(value as BulkPriceTargetType); resetPreview() }} className="grid gap-3 md:grid-cols-3">
                <Label className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="brand" />
                  انتخاب بر اساس برند
                </Label>
                <Label className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="category" />
                  انتخاب بر اساس دسته‌بندی
                </Label>
                <Label className="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 hover:bg-muted/50">
                  <RadioGroupItem value="manual" />
                  انتخاب دستی
                </Label>
              </RadioGroup>

              {targetType === "brand" ? (
                <div className="grid gap-2">
                  <Label>انتخاب بر اساس برند</Label>
                  <Select value={brandId ?? ""} onValueChange={(value) => { setBrandId(value); resetPreview() }}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="برند را انتخاب کنید" /></SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              {targetType === "category" ? (
                <div className="grid gap-2">
                  <Label>انتخاب بر اساس دسته‌بندی</Label>
                  <Select value={categoryId ?? ""} onValueChange={(value) => { setCategoryId(value); resetPreview() }}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="دسته‌بندی را انتخاب کنید" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}

              <div className="grid gap-3 rounded-2xl bg-muted/50 p-4 md:grid-cols-3">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox checked={onlyActive} onCheckedChange={(value) => { setOnlyActive(Boolean(value)); resetPreview() }} />
                  فقط محصولات فعال
                </Label>
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox checked={onlyFeatured} onCheckedChange={(value) => { setOnlyFeatured(Boolean(value)); resetPreview() }} />
                  فقط محصولات ویژه
                </Label>
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox checked={onlyInStock} onCheckedChange={(value) => { setOnlyInStock(Boolean(value)); resetPreview() }} />
                  فقط محصولات دارای موجودی
                </Label>
              </div>

              {targetType === "manual" ? (
                <div className="space-y-3 rounded-2xl border p-4">
                  <div className="relative">
                    <Input value={manualSearch} onChange={(event) => setManualSearch(event.target.value)} placeholder="جستجوی محصول برای انتخاب دستی" className="h-11 rounded-xl pr-10" />
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  <div className="max-h-[380px] overflow-auto rounded-xl border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-10 text-right">انتخاب</TableHead>
                          <TableHead className="text-right">محصول</TableHead>
                          <TableHead className="text-right">برند</TableHead>
                          <TableHead className="text-right">قیمت</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredManualProducts.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <Checkbox checked={selectedProductIds.includes(product.id)} onCheckedChange={(value) => toggleProductSelection(product.id, Boolean(value))} />
                            </TableCell>
                            <TableCell className="font-medium text-primary">{product.name}</TableCell>
                            <TableCell>{product.brandName || "—"}</TableCell>
                            <TableCell>{formatPrice(product.price)} تومان</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatPrice(selectedProductIds.length)} محصول انتخاب شده است.</p>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>تنظیمات تغییر قیمت</CardTitle>
              <CardDescription>درصد تغییر، نحوه گرد کردن و رفتار قیمت قبلی را مشخص کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label>نوع تغییر</Label>
                  <RadioGroup value={changeType} onValueChange={(value) => { setChangeType(value as BulkPriceChangeType); resetPreview() }} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Label className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 hover:bg-muted/50"><RadioGroupItem value="increase" /> افزایش قیمت</Label>
                    <Label className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 hover:bg-muted/50"><RadioGroupItem value="decrease" /> کاهش قیمت</Label>
                  </RadioGroup>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="percent">درصد تغییر</Label>
                  <Input id="percent" value={percent} onChange={(event) => { setPercent(event.target.value); resetPreview() }} type="number" min="0" step="0.1" className="h-11 rounded-xl" placeholder="مثلاً 10" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label>نحوه گرد کردن قیمت</Label>
                <Select value={roundingMode} onValueChange={(value) => { setRoundingMode(value as BulkPriceRoundingMode); resetPreview() }}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {roundingOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>رفتار قیمت قبلی</Label>
                <RadioGroup value={oldPriceBehavior} onValueChange={(value) => { setOldPriceBehavior(value as BulkOldPriceBehavior); resetPreview() }} className="grid gap-3 md:grid-cols-3">
                  <Label className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 hover:bg-muted/50"><RadioGroupItem value="current_to_old" /> قیمت فعلی را در old_price ذخیره کن</Label>
                  <Label className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 hover:bg-muted/50"><RadioGroupItem value="keep" /> old_price را تغییر نده</Label>
                  <Label className="flex cursor-pointer items-center gap-2 rounded-xl border p-3 hover:bg-muted/50"><RadioGroupItem value="clear" /> old_price را پاک کن</Label>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:h-fit">
          <Card className="rounded-2xl border-primary/20 bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Percent className="h-5 w-5 text-accent" /> خلاصه عملیات</CardTitle>
              <CardDescription className="text-primary-foreground/70">قبل از اعمال، حتماً پیش‌نمایش را بررسی کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span>هدف</span><span className="font-bold">{targetLabel || "—"}</span></div>
              <div className="flex justify-between"><span>نوع تغییر</span><span>{changeType === "increase" ? "افزایش" : "کاهش"}</span></div>
              <div className="flex justify-between"><span>درصد</span><span>{percentLabel(changeType, Number(percent))}</span></div>
              <div className="flex justify-between"><span>تعداد پیش‌نمایش</span><span>{formatPrice(previewItems.length)}</span></div>
              <Button onClick={handlePreview} disabled={isPending || isApplying} className="mt-3 h-11 w-full rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                <Calculator className="ml-2 h-4 w-4" />
                {isPending ? "در حال محاسبه..." : "پیش‌نمایش تغییرات"}
              </Button>
            </CardContent>
          </Card>

          {previewItems.length ? (
            <Alert className="rounded-2xl border-amber-300 bg-amber-50 text-amber-900">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>تأیید تغییر گروهی قیمت</AlertTitle>
              <AlertDescription className="mt-2 leading-7 text-amber-900/80">
                این عملیات قیمت محصولات انتخاب‌شده را تغییر می‌دهد. لطفاً قبل از اعمال تغییرات، جدول پیش‌نمایش را بررسی کنید.
                <Label className="mt-3 flex items-center gap-2 font-medium">
                  <Checkbox checked={confirmed} onCheckedChange={(value) => setConfirmed(Boolean(value))} />
                  تأیید می‌کنم که قیمت محصولات انتخاب‌شده تغییر کند.
                </Label>
                <Button onClick={handleApply} disabled={!confirmed || isApplying || isPending} className="mt-4 h-11 w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                  {isApplying ? "در حال اعمال..." : "اعمال تغییر قیمت"}
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
        </aside>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>پیش‌نمایش تغییرات</CardTitle>
          <CardDescription>{previewMessage || "پس از انتخاب فیلترها، دکمه پیش‌نمایش تغییرات را بزنید."}</CardDescription>
        </CardHeader>
        <CardContent>
          {previewItems.length ? (
            <div className="overflow-hidden rounded-2xl border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-right">تصویر</TableHead>
                    <TableHead className="text-right">نام محصول</TableHead>
                    <TableHead className="text-right">برند</TableHead>
                    <TableHead className="text-right">دسته‌بندی</TableHead>
                    <TableHead className="text-right">قیمت فعلی</TableHead>
                    <TableHead className="text-right">قیمت جدید</TableHead>
                    <TableHead className="text-right">میزان تغییر</TableHead>
                    <TableHead className="text-right">موجودی</TableHead>
                    <TableHead className="text-right">وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="h-12 w-12 overflow-hidden rounded-xl border bg-muted">
                          <ProductImageWithFallback imageUrl={item.mainImageUrl} alt={item.mainImageAlt || item.name} objectFit="contain" />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[280px] whitespace-normal font-semibold text-primary">
                        {item.name}
                        {item.model ? <div className="text-xs font-normal text-muted-foreground">{item.model}</div> : null}
                      </TableCell>
                      <TableCell>{item.brandName || "—"}</TableCell>
                      <TableCell>{item.categoryName || "—"}</TableCell>
                      <TableCell>{formatPrice(item.price)} تومان</TableCell>
                      <TableCell className="font-bold text-primary">{formatPrice(item.newPrice)} تومان</TableCell>
                      <TableCell className={item.changeAmount >= 0 ? "text-emerald-700" : "text-destructive"}>{formatPrice(item.changeAmount)} تومان</TableCell>
                      <TableCell>{formatPrice(item.stockQuantity)}</TableCell>
                      <TableCell>{item.isActive ? <Badge variant="secondary">فعال</Badge> : <Badge variant="outline">غیرفعال</Badge>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center text-muted-foreground">
              {previewMessage || "هنوز پیش‌نمایشی ایجاد نشده است."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
