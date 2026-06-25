"use client"

import { useActionState, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertTriangle, FileText, ImagePlus, Loader2, Plus, Save, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import type { AdminActionState, AdminProduct, AdminProductDocument, AdminProductFormOptions, AdminProductImage, AdminProductSpec, AdminProductVariant } from "@/types/admin-product"
import type { Brand, BrandActionState } from "@/types/brand"
import type { Category, CategoryActionState } from "@/types/category"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductImagePreviewCard } from "@/components/admin/product-image-preview-card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF]+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function initialSpecs(product?: AdminProduct | null): AdminProductSpec[] {
  if (product?.specs?.length) return product.specs
  return [
    { specName: "جریان نامی", specValue: "100A", sortOrder: 1 },
    { specName: "تعداد پل", specValue: "3P", sortOrder: 2 },
  ]
}

function initialVariants(product?: AdminProduct | null): AdminProductVariant[] {
  return product?.variants?.length ? product.variants : []
}

function initialState(): AdminActionState {
  return { ok: false, message: "" }
}

type PendingProductImage = {
  id: string
  file: File
  previewUrl: string
  altText: string
  isMain: boolean
  sortOrder: number
}

type PendingProductDocument = {
  id: string
  file: File
  title: string
  sortOrder: number
}

const MAX_PRODUCT_DOCUMENT_UPLOAD_BYTES = 5 * 1024 * 1024

function formatFileSize(size: number): string {
  if (!Number.isFinite(size) || size <= 0) return "—"
  if (size >= 1024 * 1024) return `${(size / 1024 / 1024).toLocaleString("en-US", { maximumFractionDigits: 1 })} MB`
  return `${Math.ceil(size / 1024).toLocaleString("en-US")} KB`
}

function defaultDocumentTitle(fileName: string): string {
  return fileName.replace(/\.pdf$/i, "").trim() || "فایل PDF محصول"
}

function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
}

function createPendingImageId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normalizeNumericText(value: string) {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[^0-9]/g, "")
}

function parseNumberInput(value: string | number | null | undefined): number {
  const normalized = normalizeNumericText(String(value ?? ""))
  if (!normalized) return 0
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function formatNumberInput(value: string | number | null | undefined): string {
  const numericValue = parseNumberInput(value)
  return numericValue > 0 ? numericValue.toLocaleString("en-US") : ""
}

function clampDiscountPercent(value: string | number | null | undefined): number {
  const parsed = parseNumberInput(value)
  return Math.min(100, Math.max(0, parsed))
}

function formatDiscountPercentInput(value: string): string {
  const normalized = normalizeNumericText(value)
  if (!normalized) return ""
  return String(clampDiscountPercent(normalized))
}

function calculateDiscountedPrice(originalPrice: number, discountPercent: number): number {
  if (discountPercent <= 0) return originalPrice
  return Math.round(originalPrice * (100 - discountPercent) / 100)
}

function initialOriginalPrice(product?: AdminProduct | null): number {
  if (!product) return 0
  if (product.oldPrice && product.oldPrice > 0) return product.oldPrice

  const discountPercent = clampDiscountPercent(product.discountPercent)
  if (discountPercent > 0 && discountPercent < 100 && product.price > 0) {
    return Math.round((product.price * 100) / (100 - discountPercent))
  }

  return product.price ?? 0
}

type ProductSubmitAction = (prevState: AdminActionState, formData: FormData) => Promise<AdminActionState>
type QuickCreateBrandSubmitAction = (prevState: BrandActionState, formData: FormData) => Promise<BrandActionState>
type QuickCreateCategorySubmitAction = (prevState: CategoryActionState, formData: FormData) => Promise<CategoryActionState>

type ProductFormProps = {
  options: AdminProductFormOptions
  product?: AdminProduct | null
  submitAction: ProductSubmitAction
  quickCreateBrandSubmitAction: QuickCreateBrandSubmitAction
  quickCreateCategorySubmitAction: QuickCreateCategorySubmitAction
}

export function ProductForm({
  options,
  product = null,
  submitAction,
  quickCreateBrandSubmitAction,
  quickCreateCategorySubmitAction,
}: ProductFormProps) {
  const router = useRouter()
  const isEdit = Boolean(product)
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(submitAction, initialState())
  const [name, setName] = useState(product?.name ?? "")
  const [model, setModel] = useState(product?.model ?? "")
  const [slug, setSlug] = useState(product?.slug ?? "")
  const [brands, setBrands] = useState(options.brands)
  const [categories, setCategories] = useState(options.categories)
  const [brandId, setBrandId] = useState(product?.brandId ?? "")
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "")
  const [originalPrice, setOriginalPrice] = useState(formatNumberInput(initialOriginalPrice(product)))
  const [discountPercent, setDiscountPercent] = useState(product?.discountPercent ? String(clampDiscountPercent(product.discountPercent)) : "")
  const [quantity, setQuantity] = useState(String(product?.quantity ?? "0"))
  const [specs, setSpecs] = useState<AdminProductSpec[]>(initialSpecs(product))
  const [optionGroupTitle, setOptionGroupTitle] = useState(product?.optionGroupTitle ?? "")
  const [variants, setVariants] = useState<AdminProductVariant[]>(initialVariants(product))
  const [existingImages, setExistingImages] = useState<AdminProductImage[]>(product?.images ?? [])
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([])
  const [mainExistingImageId, setMainExistingImageId] = useState<string | null>(product?.images.find((image) => image.isMain)?.id ?? null)
  const [pendingImages, setPendingImages] = useState<PendingProductImage[]>([])
  const [existingDocuments, setExistingDocuments] = useState<AdminProductDocument[]>(product?.documents ?? [])
  const [removedDocumentIds, setRemovedDocumentIds] = useState<string[]>([])
  const [pendingDocuments, setPendingDocuments] = useState<PendingProductDocument[]>([])
  const [manualSlugTouched, setManualSlugTouched] = useState(Boolean(product?.slug))
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const documentInputRef = useRef<HTMLInputElement | null>(null)

  const selectedBrand = brands.find((brand) => brand.id === brandId)?.slug ?? ""
  const originalPriceNumber = parseNumberInput(originalPrice)
  const discountPercentNumber = clampDiscountPercent(discountPercent)
  const finalDiscountedPrice = useMemo(
    () => calculateDiscountedPrice(originalPriceNumber, discountPercentNumber),
    [originalPriceNumber, discountPercentNumber],
  )
  const hasDiscount = discountPercentNumber > 0
  const submittedOldPrice = hasDiscount ? originalPriceNumber : ""

  useEffect(() => {
    if (manualSlugTouched) return
    const nextSlug = slugify([selectedBrand, model, name].filter(Boolean).join(" "))
    if (nextSlug) setSlug(nextSlug)
  }, [manualSlugTouched, model, name, selectedBrand])

  useEffect(() => {
    if (!state.message) return
    if (state.ok) {
      toast.success(state.message)
      if (state.redirectTo) router.push(state.redirectTo)
    } else {
      toast.error(state.message)
    }
  }, [router, state])

  function addSpec() {
    setSpecs((items) => [...items, { specName: "", specValue: "", sortOrder: items.length + 1 }])
  }

  function updateSpec(index: number, field: keyof AdminProductSpec, value: string | number) {
    setSpecs((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  function removeSpec(index: number) {
    setSpecs((items) => items.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, sortOrder: itemIndex + 1 })))
  }

  function addVariant() {
    setVariants((items) => [...items, { label: "", price: 0, sku: null, sortOrder: items.length + 1, isActive: true }])
  }

  function updateVariant(index: number, field: keyof AdminProductVariant, value: string | number | boolean | null) {
    setVariants((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item))
  }

  function handleOriginalPriceChange(value: string) {
    setOriginalPrice(formatNumberInput(value))
  }

  function handleDiscountPercentChange(value: string) {
    setDiscountPercent(formatDiscountPercentInput(value))
  }

  function handleVariantPriceChange(index: number, value: string) {
    updateVariant(index, "price", parseNumberInput(value))
  }

  function removeVariant(index: number) {
    setVariants((items) => items.filter((_, itemIndex) => itemIndex !== index).map((item, itemIndex) => ({ ...item, sortOrder: itemIndex + 1 })))
  }

  useEffect(() => {
    if (!fileInputRef.current || typeof DataTransfer === "undefined") return
    const transfer = new DataTransfer()
    pendingImages.forEach((image) => transfer.items.add(image.file))
    fileInputRef.current.files = transfer.files
  }, [pendingImages])

  useEffect(() => {
    if (!documentInputRef.current || typeof DataTransfer === "undefined") return
    const transfer = new DataTransfer()
    pendingDocuments.forEach((document) => transfer.items.add(document.file))
    documentInputRef.current.files = transfer.files
  }, [pendingDocuments])

  function selectExistingMain(id: string) {
    setMainExistingImageId(id)
    setExistingImages((images) => images.map((image) => ({ ...image, isMain: image.id === id })))
    setPendingImages((images) => images.map((image) => ({ ...image, isMain: false })))
  }

  function selectPendingMain(id: string) {
    setMainExistingImageId(null)
    setExistingImages((images) => images.map((image) => ({ ...image, isMain: false })))
    setPendingImages((images) => images.map((image) => ({ ...image, isMain: image.id === id })))
  }

  function removeExistingImage(id: string) {
    const remainingExisting = existingImages.filter((image) => image.id !== id)
    const removedWasMain = existingImages.some((image) => image.id === id && image.isMain)
    setRemovedImageIds((items) => items.includes(id) ? items : [...items, id])

    if (!removedWasMain) {
      setExistingImages(remainingExisting)
      return
    }

    const nextExistingMain = remainingExisting[0]?.id ?? null
    const nextPendingMain = nextExistingMain ? null : pendingImages[0]?.id ?? null
    setMainExistingImageId(nextExistingMain)
    setExistingImages(remainingExisting.map((image) => ({ ...image, isMain: image.id === nextExistingMain })))
    setPendingImages((images) => images.map((image) => ({ ...image, isMain: image.id === nextPendingMain })))
  }

  function handleNewImagesChange(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []).filter((file) => file.size > 0)
    if (!selectedFiles.length) return

    const defaultAlt = `${name}${model ? ` ${model}` : ""}`.trim() || "تصویر محصول"
    const currentMaxSortOrder = [...existingImages, ...pendingImages].reduce((max, image) => Math.max(max, image.sortOrder || 0), 0)
    const hasMain = existingImages.some((image) => image.isMain) || pendingImages.some((image) => image.isMain)

    const additions = selectedFiles.map((file, index) => ({
      id: createPendingImageId(),
      file,
      previewUrl: URL.createObjectURL(file),
      altText: defaultAlt,
      isMain: !hasMain && index === 0,
      sortOrder: currentMaxSortOrder + index + 1,
    }))

    setPendingImages((images) => [...images, ...additions])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function removePendingImage(id: string) {
    const imageToRemove = pendingImages.find((image) => image.id === id)
    if (imageToRemove) URL.revokeObjectURL(imageToRemove.previewUrl)

    const remainingPending = pendingImages.filter((image) => image.id !== id)
    if (!imageToRemove?.isMain) {
      setPendingImages(remainingPending)
      return
    }

    const nextExistingMain = existingImages[0]?.id ?? null
    const nextPendingMain = nextExistingMain ? null : remainingPending[0]?.id ?? null
    setMainExistingImageId(nextExistingMain)
    setExistingImages((images) => images.map((image) => ({ ...image, isMain: image.id === nextExistingMain })))
    setPendingImages(remainingPending.map((image) => ({ ...image, isMain: image.id === nextPendingMain })))
  }

  function clearNewImages() {
    pendingImages.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    const pendingHadMain = pendingImages.some((image) => image.isMain)
    const nextExistingMain = pendingHadMain ? existingImages[0]?.id ?? null : mainExistingImageId
    setMainExistingImageId(nextExistingMain)
    setExistingImages((images) => images.map((image) => ({ ...image, isMain: image.id === nextExistingMain })))
    setPendingImages([])
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function updateExistingImageAlt(id: string, altText: string) {
    setExistingImages((images) => images.map((image) => image.id === id ? { ...image, altText } : image))
  }

  function updatePendingImageAlt(id: string, altText: string) {
    setPendingImages((images) => images.map((image) => image.id === id ? { ...image, altText } : image))
  }

  function handleNewDocumentsChange(files: FileList | null) {
    const selectedFiles = Array.from(files ?? []).filter((file) => file.size > 0)
    if (!selectedFiles.length) return

    const invalidType = selectedFiles.find((file) => !isPdfFile(file))
    if (invalidType) {
      toast.error(`فقط فایل PDF قابل آپلود است: ${invalidType.name}`)
      if (documentInputRef.current) documentInputRef.current.value = ""
      return
    }

    const oversizedFile = selectedFiles.find((file) => file.size > MAX_PRODUCT_DOCUMENT_UPLOAD_BYTES)
    if (oversizedFile) {
      toast.error(`حجم هر فایل PDF باید حداکثر ۵ مگابایت باشد: ${oversizedFile.name}`)
      if (documentInputRef.current) documentInputRef.current.value = ""
      return
    }

    const currentMaxSortOrder = [...existingDocuments, ...pendingDocuments].reduce((max, document) => Math.max(max, document.sortOrder || 0), 0)
    const additions = selectedFiles.map((file, index) => ({
      id: createPendingImageId(),
      file,
      title: defaultDocumentTitle(file.name),
      sortOrder: currentMaxSortOrder + index + 1,
    }))

    setPendingDocuments((documents) => [...documents, ...additions])
    if (documentInputRef.current) documentInputRef.current.value = ""
  }

  function removeExistingDocument(id: string) {
    setRemovedDocumentIds((items) => items.includes(id) ? items : [...items, id])
    setExistingDocuments((documents) => documents.filter((document) => document.id !== id))
  }

  function removePendingDocument(id: string) {
    setPendingDocuments((documents) => documents.filter((document) => document.id !== id))
  }

  function clearNewDocuments() {
    setPendingDocuments([])
    if (documentInputRef.current) documentInputRef.current.value = ""
  }

  function updateExistingDocumentTitle(id: string, title: string) {
    setExistingDocuments((documents) => documents.map((document) => document.id === id ? { ...document, title } : document))
  }

  function updatePendingDocumentTitle(id: string, title: string) {
    setPendingDocuments((documents) => documents.map((document) => document.id === id ? { ...document, title } : document))
  }

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <input type="hidden" name="price" value={String(finalDiscountedPrice)} />
      <input type="hidden" name="oldPrice" value={String(submittedOldPrice)} />
      <input type="hidden" name="specsJson" value={JSON.stringify(specs)} />
      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />
      <input type="hidden" name="existingImagesJson" value={JSON.stringify(existingImages)} />
      <input type="hidden" name="removedImageIdsJson" value={JSON.stringify(removedImageIds)} />
      <input type="hidden" name="mainExistingImageId" value={mainExistingImageId ?? ""} />
      <input type="hidden" name="existingDocumentsJson" value={JSON.stringify(existingDocuments)} />
      <input type="hidden" name="removedDocumentIdsJson" value={JSON.stringify(removedDocumentIds)} />
      <input type="hidden" name="newDocumentsMetadataJson" value={JSON.stringify(pendingDocuments.map(({ id, title, file, sortOrder }) => ({ clientId: id, title, fileName: file.name, sortOrder })))} />
      <input type="hidden" name="newImageAltTextsJson" value={JSON.stringify(pendingImages.map((image) => image.altText))} />
      <input
        type="hidden"
        name="newImagesMetadataJson"
        value={JSON.stringify(pendingImages.map(({ id, altText, isMain, sortOrder }) => ({ clientId: id, altText, isMain, sortOrder })))}
      />

      <div className="space-y-6">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>اطلاعات اصلی محصول</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="نام محصول" error={state.fieldErrors?.name} className="md:col-span-2">
              <Input name="name" value={name} onChange={(event) => setName(event.target.value)} required className="rounded-xl" />
            </Field>
            <Field label="slug" error={state.fieldErrors?.slug} helper="این مقدار برای آدرس صفحه محصول استفاده می‌شود.">
              <Input name="slug" value={slug} onChange={(event) => { setSlug(slugify(event.target.value)); setManualSlugTouched(true) }} required dir="ltr" className="rounded-xl text-left" />
            </Field>
            <Field label="مدل">
              <Input name="model" value={model} onChange={(event) => setModel(event.target.value)} className="rounded-xl" />
            </Field>
            <Field label="SKU" error={state.fieldErrors?.sku}>
              <Input name="sku" defaultValue={product?.sku ?? ""} dir="ltr" className="rounded-xl text-left" />
            </Field>
            <Field label="برند">
              <div className="space-y-2">
                <Select value={brandId || "none"} onValueChange={(value) => setBrandId(value === "none" ? "" : value)} name="brandId">
                  <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="انتخاب برند" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">بدون برند</SelectItem>
                    {brands.map((brand) => <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <QuickCreateBrandDialog action={quickCreateBrandSubmitAction} onCreated={(brand) => { setBrands((items) => [...items, brand].sort((a, b) => a.name.localeCompare(b.name, "fa"))); setBrandId(brand.id) }} />
              </div>
            </Field>
            <Field label="دسته‌بندی" error={state.fieldErrors?.categoryId}>
              <div className="space-y-2">
                <Select value={categoryId || "none"} onValueChange={(value) => setCategoryId(value === "none" ? "" : value)} name="categoryId">
                  <SelectTrigger className="w-full rounded-xl"><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">انتخاب نشده</SelectItem>
                    {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <QuickCreateCategoryDialog action={quickCreateCategorySubmitAction} categories={categories} onCreated={(category) => { setCategories((items) => [...items, category].sort((a, b) => a.name.localeCompare(b.name, "fa"))); setCategoryId(category.id) }} />
              </div>
            </Field>
            <Field label="توضیح کوتاه" className="md:col-span-2">
              <Textarea name="shortDescription" defaultValue={product?.shortDescription ?? ""} className="min-h-24 rounded-xl" />
            </Field>
            <Field label="توضیحات کامل" className="md:col-span-2">
              <Textarea name="description" defaultValue={product?.description ?? ""} className="min-h-36 rounded-xl" />
            </Field>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>قیمت‌گذاری و موجودی</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Field label="قیمت اصلی" error={state.fieldErrors?.price}>
              <Input
                name="originalPrice"
                value={originalPrice}
                onChange={(event) => handleOriginalPriceChange(event.target.value)}
                inputMode="numeric"
                required
                className="rounded-xl"
              />
            </Field>
            <Field label="درصد تخفیف">
              <Input
                name="discountPercent"
                value={discountPercent}
                onChange={(event) => handleDiscountPercentChange(event.target.value)}
                inputMode="numeric"
                min={0}
                max={100}
                className="rounded-xl"
              />
            </Field>
            <div className="rounded-xl bg-muted p-4 text-sm md:col-span-3">
              قیمت بعد از تخفیف: <span className="font-bold text-primary">{finalDiscountedPrice.toLocaleString("en-US")} تومان</span>
              {hasDiscount ? (
                <span className="mt-1 block text-xs text-muted-foreground">
                  این مبلغ به‌صورت خودکار در فیلد قیمت نهایی محصول ذخیره می‌شود.
                </span>
              ) : (
                <span className="mt-1 block text-xs text-muted-foreground">
                  بدون تخفیف، قیمت نهایی برابر با قیمت اصلی ذخیره می‌شود.
                </span>
              )}
            </div>
            <Field label="تعداد موجودی" error={state.fieldErrors?.quantity}>
              <Input name="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" className="rounded-xl" />
            </Field>
            <Field label="حداقل موجودی هشدار">
              <Input name="lowStockThreshold" defaultValue={product?.lowStockThreshold ?? ""} inputMode="numeric" className="rounded-xl" />
            </Field>
            <div className="flex items-end">
              <div className="w-full rounded-xl border bg-card p-3 text-sm">
                وضعیت: {Number(quantity) > 0 ? <span className="font-bold text-green-600">موجود</span> : <span className="font-bold text-destructive">ناموجود</span>}
              </div>
            </div>
          </CardContent>
        </Card>


        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>گزینه‌های قیمت‌دار محصول</CardTitle><Button type="button" variant="outline" onClick={addVariant} className="w-full rounded-xl sm:w-auto"><Plus className="h-4 w-4" /> افزودن گزینه</Button></CardHeader>
          <CardContent className="space-y-3">
            <Field label="عنوان گروه گزینه‌ها" error={state.fieldErrors?.optionGroupTitle} helper="مثلاً توان، سایز، طول، ظرفیت یا ولتاژ. برای محصول ساده این بخش را خالی بگذارید.">
              <Input name="optionGroupTitle" value={optionGroupTitle} onChange={(event) => setOptionGroupTitle(event.target.value)} placeholder="مثلاً توان" className="rounded-xl" />
            </Field>
            {variants.length ? variants.map((variant, index) => (
              <div key={variant.id ?? index} className="grid gap-2 rounded-xl border p-3 md:grid-cols-[1fr_1fr_110px_90px_auto]">
                <Field label="عنوان گزینه" error={state.fieldErrors?.[`variants.${index}.label`]}><Input value={variant.label} onChange={(event) => updateVariant(index, "label", event.target.value)} placeholder="مثلاً 750 وات" className="rounded-xl" /></Field>
                <Field label="قیمت" error={state.fieldErrors?.[`variants.${index}.price`]}><Input value={formatNumberInput(variant.price)} onChange={(event) => handleVariantPriceChange(index, event.target.value)} inputMode="numeric" className="rounded-xl" /></Field>
                <Field label="SKU اختیاری"><Input value={variant.sku ?? ""} onChange={(event) => updateVariant(index, "sku", event.target.value || null)} dir="ltr" className="rounded-xl text-left" /></Field>
                <Field label="ترتیب"><Input value={variant.sortOrder} onChange={(event) => updateVariant(index, "sortOrder", Number(event.target.value) || index + 1)} inputMode="numeric" className="rounded-xl" /></Field>
                <div className="flex items-end gap-2 pb-1"><label className="flex items-center gap-2 text-xs"><Checkbox checked={variant.isActive} onCheckedChange={(checked) => updateVariant(index, "isActive", checked === true)} /> فعال</label><Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)} className="rounded-xl text-destructive"><Trash2 className="h-4 w-4" /></Button></div>
              </div>
            )) : <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">این محصول ساده است و از قیمت اصلی استفاده می‌کند.</p>}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>تصاویر محصول</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-dashed bg-muted/40 p-4">
              <Label htmlFor="images" className="mb-3 flex items-center gap-2 font-bold"><ImagePlus className="h-4 w-4" /> آپلود تصاویر محصول</Label>
              <Input
                ref={fileInputRef}
                id="images"
                name="images"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => handleNewImagesChange(event.target.files)}
                className="rounded-xl bg-card"
              />
              <p className="mt-2 text-xs leading-6 text-muted-foreground">می‌توانید چند تصویر را هم‌زمان انتخاب کنید یا بعداً تصاویر بیشتری اضافه کنید. تصویر اول به‌صورت پیش‌فرض تصویر اصلی است و از داخل کارت‌ها قابل تغییر خواهد بود.</p>
              <p className="mt-1 text-xs text-muted-foreground">مسیر ذخیره‌سازی روی هاست: uploads/products/{slug || "product-slug"}/</p>
              <p className="mt-1 text-xs font-medium text-primary">پیشنهاد: تصویر محصول با پس‌زمینه سفید یا روشن و نسبت ۱:۱ آپلود شود.</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <span>تعداد تصاویر فعلی: {existingImages.length}</span>
              <span>تصاویر جدید انتخاب‌شده: {pendingImages.length}</span>
            </div>

            {existingImages.length ? (
              <div>
                <div className="mb-2 text-sm font-bold">تصاویر فعلی</div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {existingImages.map((image) => {
                    const fallbackText = `${name}${model ? ` ${model}` : ""}`.trim() || "تصویر محصول"
                    return (
                      <ProductImagePreviewCard
                        key={image.id}
                        imageUrl={image.imageUrl}
                        altText={image.altText ?? ""}
                        fallbackText={fallbackText}
                        isMain={image.isMain}
                        onSetMain={() => selectExistingMain(image.id)}
                        onRemove={() => removeExistingImage(image.id)}
                        onAltTextChange={(value) => updateExistingImageAlt(image.id, value)}
                        showSavedUrl
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}

            {pendingImages.length ? (
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold">پیش‌نمایش تصاویر جدید</span>
                  <Button type="button" variant="ghost" size="sm" onClick={clearNewImages}><X className="h-4 w-4" /> حذف همه تصاویر جدید</Button>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {pendingImages.map((image) => {
                    const fallbackText = `${name}${model ? ` ${model}` : ""}`.trim() || "تصویر محصول"
                    return (
                      <ProductImagePreviewCard
                        key={image.id}
                        imageUrl={image.previewUrl}
                        altText={image.altText}
                        fallbackText={fallbackText}
                        isMain={image.isMain}
                        onSetMain={() => selectPendingMain(image.id)}
                        onRemove={() => removePendingImage(image.id)}
                        onAltTextChange={(value) => updatePendingImageAlt(image.id, value)}
                      />
                    )
                  })}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>دیتاشیت و مستندات PDF</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-dashed bg-muted/40 p-4">
              <Label htmlFor="documents" className="mb-3 flex items-center gap-2 font-bold"><FileText className="h-4 w-4" /> آپلود فایل‌های PDF محصول</Label>
              <Input
                ref={documentInputRef}
                id="documents"
                name="documents"
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onChange={(event) => handleNewDocumentsChange(event.target.files)}
                className="rounded-xl bg-card"
              />
              <p className="mt-2 text-xs leading-6 text-muted-foreground">می‌توانید چند دیتاشیت، کاتالوگ یا راهنمای نصب PDF را هم‌زمان انتخاب کنید. حداکثر حجم هر فایل ۵ مگابایت است.</p>
              <p className="mt-1 text-xs text-muted-foreground">مسیر ذخیره‌سازی: uploads/products/{product?.id ?? "productId"}/documents/</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
              <span>تعداد فایل‌های فعلی: {existingDocuments.length}</span>
              <span>فایل‌های جدید انتخاب‌شده: {pendingDocuments.length}</span>
            </div>

            {existingDocuments.length ? (
              <div className="space-y-3">
                <div className="text-sm font-bold">مستندات فعلی</div>
                {existingDocuments.map((document) => (
                  <div key={document.id} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      <Field label="عنوان فایل">
                        <Input value={document.title} onChange={(event) => updateExistingDocumentTitle(document.id, event.target.value)} className="rounded-xl" />
                      </Field>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{document.fileName}</span>
                        <span>•</span>
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>•</span>
                        <Link href={document.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">مشاهده فایل</Link>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeExistingDocument(document.id)} className="rounded-xl text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            {pendingDocuments.length ? (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold">فایل‌های PDF جدید</span>
                  <Button type="button" variant="ghost" size="sm" onClick={clearNewDocuments}><X className="h-4 w-4" /> حذف همه فایل‌های جدید</Button>
                </div>
                {pendingDocuments.map((document) => (
                  <div key={document.id} className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      <Field label="عنوان فایل">
                        <Input value={document.title} onChange={(event) => updatePendingDocumentTitle(document.id, event.target.value)} className="rounded-xl" />
                      </Field>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{document.file.name}</span>
                        <span>•</span>
                        <span>{formatFileSize(document.file.size)}</span>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="ghost" size="icon" onClick={() => removePendingDocument(document.id)} className="rounded-xl text-destructive"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader className="flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>مشخصات فنی</CardTitle><Button type="button" variant="outline" onClick={addSpec} className="w-full rounded-xl sm:w-auto"><Plus className="h-4 w-4" /> افزودن ردیف</Button></CardHeader>
          <CardContent className="space-y-3">
            {specs.map((spec, index) => (
              <div key={index} className="grid gap-2 rounded-xl border p-3 md:grid-cols-[1fr_1fr_100px_auto]">
                <Input value={spec.specName} onChange={(e) => updateSpec(index, "specName", e.target.value)} placeholder="نام مشخصه" className="rounded-xl" />
                <Input value={spec.specValue} onChange={(e) => updateSpec(index, "specValue", e.target.value)} placeholder="مقدار" className="rounded-xl" />
                <Input value={spec.sortOrder} onChange={(e) => updateSpec(index, "sortOrder", Number(e.target.value))} inputMode="numeric" className="rounded-xl" />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(index)} className="rounded-xl text-destructive"><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6 xl:h-fit">
        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>وضعیت محصول</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <CheckField name="isActive" label="فعال / قابل نمایش" defaultChecked={product?.isActive ?? true} />
            <CheckField name="isFeatured" label="محصول ویژه" defaultChecked={product?.isFeatured ?? false} />
            <CheckField name="showInHomepage" label="نمایش در صفحه اصلی" defaultChecked={product?.isFeatured ?? false} />
            <CheckField name="hasWarranty" label="دارای گارانتی" defaultChecked={product?.hasWarranty ?? true} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm">
          <CardHeader><CardTitle>گارانتی و کشور سازنده</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Field label="گارانتی"><Input name="warranty" defaultValue={product?.warranty ?? "ضمانت اصالت و سلامت کالا"} className="rounded-xl" /></Field>
            <Field label="کشور سازنده"><Input name="originCountry" defaultValue={product?.originCountry ?? ""} className="rounded-xl" /></Field>
          </CardContent>
        </Card>

        {product?.slug && slug !== product.slug ? (
          <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm leading-7 text-primary">
            <div className="flex items-center gap-2 font-bold"><AlertTriangle className="h-4 w-4" /> هشدار تغییر slug</div>
            با تغییر slug، آدرس صفحه محصول و مسیر پوشه تصاویر ممکن است تغییر کند.
          </div>
        ) : null}

        {state.message && !state.ok ? <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{state.message}</div> : null}

        <div className="grid gap-3 rounded-2xl border bg-card p-4 shadow-sm">
          <Button name="intent" value="save" disabled={pending} className="h-12 rounded-xl bg-primary hover:bg-primary/90">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} ذخیره محصول
          </Button>
          {!isEdit ? <Button name="intent" value="save-new" disabled={pending} variant="outline" className="h-12 rounded-xl">ذخیره و افزودن محصول جدید</Button> : null}
          <Button asChild type="button" variant="ghost" className="h-12 rounded-xl"><Link href="/admin/products">انصراف</Link></Button>
        </div>
      </aside>
    </form>
  )
}


function QuickCreateBrandDialog({ action: submitAction, onCreated }: { action: QuickCreateBrandSubmitAction; onCreated: (brand: Brand) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [state, action, pending] = useActionState<BrandActionState, FormData>(submitAction, { ok: false, message: "" })
  const handledBrandId = useRef<string | null>(null)
  useEffect(() => { if (!slugTouched) setSlug(slugify(name)) }, [name, slugTouched])
  useEffect(() => { if (!state.message) return; if (state.ok && state.createdBrand && handledBrandId.current !== state.createdBrand.id) { handledBrandId.current = state.createdBrand.id; toast.success(state.message); onCreated(state.createdBrand); setOpen(false); setName(""); setSlug(""); setSlugTouched(false) } else if (!state.ok) toast.error(state.message) }, [onCreated, state])
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button type="button" variant="ghost" size="sm" className="h-auto px-1 text-xs text-primary"><Plus className="h-3.5 w-3.5" /> افزودن برند جدید</Button></DialogTrigger><DialogContent dir="rtl"><DialogHeader><DialogTitle>افزودن سریع برند</DialogTitle><DialogDescription>برای تنظیم لوگو و توضیحات کامل بعداً به صفحه مدیریت برندها بروید.</DialogDescription></DialogHeader><form action={action} className="space-y-4"><div className="space-y-2"><Label>نام برند</Label><Input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl" /></div><div className="space-y-2"><Label>slug</Label><Input name="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }} required dir="ltr" className="rounded-xl text-left" /></div><DialogFooter><Button type="submit" disabled={pending} className="rounded-xl">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} ذخیره برند</Button></DialogFooter></form></DialogContent></Dialog>
}

function QuickCreateCategoryDialog({ action: submitAction, categories, onCreated }: { action: QuickCreateCategorySubmitAction; categories: Category[]; onCreated: (category: Category) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [state, action, pending] = useActionState<CategoryActionState, FormData>(submitAction, { ok: false, message: "" })
  const handledCategoryId = useRef<string | null>(null)
  useEffect(() => { if (!slugTouched) setSlug(slugify(name)) }, [name, slugTouched])
  useEffect(() => { if (!state.message) return; if (state.ok && state.createdCategory && handledCategoryId.current !== state.createdCategory.id) { handledCategoryId.current = state.createdCategory.id; toast.success(state.message); onCreated(state.createdCategory); setOpen(false); setName(""); setSlug(""); setSlugTouched(false) } else if (!state.ok) toast.error(state.message) }, [onCreated, state])
  return <Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button type="button" variant="ghost" size="sm" className="h-auto px-1 text-xs text-primary"><Plus className="h-3.5 w-3.5" /> افزودن دسته‌بندی جدید</Button></DialogTrigger><DialogContent dir="rtl"><DialogHeader><DialogTitle>افزودن سریع دسته‌بندی</DialogTitle><DialogDescription>برای تصاویر و تنظیمات صفحه اصلی بعداً به صفحه مدیریت دسته‌بندی‌ها بروید.</DialogDescription></DialogHeader><form action={action} className="space-y-4"><div className="space-y-2"><Label>نام دسته‌بندی</Label><Input name="name" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl" /></div><div className="space-y-2"><Label>slug</Label><Input name="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true) }} required dir="ltr" className="rounded-xl text-left" /></div><div className="space-y-2"><Label>دسته‌بندی والد</Label><Select name="parentId" defaultValue="none"><SelectTrigger className="rounded-xl"><SelectValue placeholder="بدون والد" /></SelectTrigger><SelectContent><SelectItem value="none">بدون والد</SelectItem>{categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select></div><DialogFooter><Button type="submit" disabled={pending} className="rounded-xl">{pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} ذخیره دسته‌بندی</Button></DialogFooter></form></DialogContent></Dialog>
}

function Field({ label, helper, error, className, children }: { label: string; helper?: string; error?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <Label className="mb-2 block font-semibold">{label}</Label>
      {children}
      {helper ? <p className="mt-1 text-xs text-muted-foreground">{helper}</p> : null}
      {error ? <p className="mt-1 text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

function CheckField({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border p-3 text-sm font-medium">
      {label}
      <Checkbox name={name} defaultChecked={defaultChecked} />
    </label>
  )
}
