import type { ReactNode } from "react"
import Link from "next/link"
import { AlertTriangle, ChevronLeft, Home, PackageSearch } from "lucide-react"
import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductGallery } from "@/components/product-detail/product-gallery"
import { ProductInfo } from "@/components/product-detail/product-info"
import { SpecsSummary } from "@/components/product-detail/specs-summary"
import { ProductTabs } from "@/components/product-detail/product-tabs"
import { ProjectPurchaseBox } from "@/components/product-detail/project-purchase-box"
import { RelatedProducts } from "@/components/product-detail/related-products"
import { StickyAddToCart } from "@/components/product-detail/sticky-add-to-cart"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getFeaturedProducts, getProductBySlug } from "@/lib/services/products-service"
import type { Product, ProductDetail } from "@/types/product"

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>
}

function toRelatedProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    model: product.model ?? product.sku ?? "—",
    price: product.price,
    oldPrice: product.oldPrice,
    discount: product.discountPercent || null,
    rating: product.rating,
    reviewCount: product.reviewCount,
    image: product.mainImageUrl,
    imageAlt: product.mainImageAlt,
    brand: product.brandName ?? "برند نامشخص",
    slug: product.slug,
  }
}

function buildQuickSpecs(product: ProductDetail) {
  const baseSpecs = product.specs.slice(0, 4).map((spec) => ({
    label: spec.name,
    value: spec.value,
  }))

  if (baseSpecs.length > 0) return baseSpecs

  return [
    { label: "برند", value: product.brandName ?? "نامشخص" },
    { label: "مدل", value: product.model ?? product.sku ?? "نامشخص" },
    { label: "دسته‌بندی", value: product.categoryName ?? "تجهیزات برق صنعتی" },
    {
      label: "وضعیت موجودی",
      value: product.stockQuantity > 0 ? `${product.stockQuantity.toLocaleString("en-US")} عدد` : "ناموجود",
    },
  ]
}

function buildFullSpecs(product: ProductDetail) {
  const specs = product.specs.map((spec) => ({ label: spec.name, value: spec.value }))

  return [
    { label: "نام محصول", value: product.name },
    ...(product.brandName ? [{ label: "برند", value: product.brandName }] : []),
    ...(product.categoryName ? [{ label: "دسته‌بندی", value: product.categoryName }] : []),
    ...(product.model ? [{ label: "مدل", value: product.model }] : []),
    ...(product.sku ? [{ label: "کد کالا / SKU", value: product.sku }] : []),
    ...(product.originCountry ? [{ label: "کشور سازنده", value: product.originCountry }] : []),
    ...(product.warranty ? [{ label: "گارانتی", value: product.warranty }] : []),
    ...specs,
  ]
}

function productBadges(product: ProductDetail) {
  const badges: string[] = []
  if (product.stockQuantity > 0) badges.push("موجود")
  if (product.hasWarranty || product.warranty) badges.push("گارانتی‌دار")
  if (product.discountPercent > 0) badges.push(`${product.discountPercent}٪ تخفیف`)
  return badges.length > 0 ? badges : ["مناسب پروژه"]
}


function StaticReviews() {
  return []
}

function StaticFaqs() {
  return [
    {
      question: "آیا این محصول برای خرید پروژه‌ای مناسب است؟",
      answer:
        "بله، برای خرید تعداد بالا، دریافت پیش‌فاکتور رسمی و هماهنگی ارسال پروژه‌ای می‌توانید با کارشناسان فروش تماس بگیرید.",
    },
    {
      question: "موجودی و قیمت محصول قطعی است؟",
      answer:
        "قیمت و موجودی از دیتابیس سایت خوانده می‌شود. برای سفارش‌های عمده یا پروژه‌ای، قبل از پرداخت نهایی با واحد فروش هماهنگ کنید.",
    },
  ]
}

function ProductStateCard({
  icon,
  title,
  text,
  details,
}: {
  icon: ReactNode
  title: string
  text: string
  details?: string
}) {
  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </div>
          <h1 className="mb-3 text-2xl font-bold text-foreground">{title}</h1>
          <p className="mb-6 text-muted-foreground leading-7">{text}</p>
          {details && (
            <p dir="ltr" className="mb-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground text-left">
              {details}
            </p>
          )}
          <Button asChild className="rounded-xl bg-primary hover:bg-primary/90">
            <Link href="/products">بازگشت به محصولات</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params

  let product: ProductDetail | null = null
  let relatedProducts: ReturnType<typeof toRelatedProduct>[] = []
  let errorMessage: string | null = null

  try {
    product = await getProductBySlug(slug)

    if (product) {
      const productSlug = product.slug
      relatedProducts = (await getFeaturedProducts(4))
        .filter((item) => item.slug !== productSlug)
        .slice(0, 4)
        .map(toRelatedProduct)
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Unknown product detail error"
  }

  if (errorMessage) {
    return (
      <ProductStateCard
        icon={<AlertTriangle className="h-10 w-10" />}
        title="خطا در دریافت محصول"
        text="در حال حاضر امکان دریافت اطلاعات این محصول وجود ندارد. لطفاً چند لحظه دیگر دوباره تلاش کنید."
        details={errorMessage}
      />
    )
  }

  if (!product) {
    return (
      <ProductStateCard
        icon={<PackageSearch className="h-10 w-10" />}
        title="محصول پیدا نشد"
        text="محصول مورد نظر وجود ندارد یا غیرفعال شده است."
      />
    )
  }

  const quickSpecs = buildQuickSpecs(product)
  const fullSpecs = buildFullSpecs(product)
  const categoryName = product.categoryName ?? "محصولات"
  const brandName = product.brandName ?? "برند نامشخص"
  const discount = product.discountPercent || null

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <TopBar />
      <Header />

      <main className="pb-24 md:pb-0">
        {/* Breadcrumb */}
        <div className="bg-muted/30 border-b border-border">
          <div className="container mx-auto overflow-x-auto px-4 py-4 scrollbar-hide">
            <Breadcrumb className="min-w-max">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center gap-1">
                      <Home className="w-4 h-4" />
                      <span>صفحه اصلی</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="w-4 h-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/products">محصولات</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="w-4 h-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{categoryName}</BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="w-4 h-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{product.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="container mx-auto space-y-10 px-4 py-6 md:space-y-12 md:py-8">
          {/* Product Main Section */}
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start lg:gap-8">
            {/* Right Side - Gallery */}
            <div className="order-1 lg:order-2">
              <ProductGallery images={product.images} badges={productBadges(product)} productName={product.name} />
            </div>

            {/* Left Side - Info */}
            <div className="order-2 lg:order-1">
              <ProductInfo
                id={product.id}
                slug={product.slug}
                name={product.name}
                brand={brandName}
                model={product.model ?? product.sku ?? "—"}
                sku={product.sku}
                rating={product.rating}
                reviewCount={product.reviewCount}
                shortDescription={product.shortDescription ?? ""}
                inStock={product.stockQuantity !== 0}
                stockCount={product.stockQuantity}
                warranty={product.warranty ?? "بدون گارانتی ثبت‌شده"}
                price={product.price}
                oldPrice={product.oldPrice}
                discount={discount}
                mainImageUrl={product.images[0]?.imageUrl ?? null}
                optionGroupTitle={product.optionGroupTitle}
                variants={product.variants}
              />
            </div>
          </section>

          {/* Technical Specs Summary */}
          <section>
            <SpecsSummary specs={quickSpecs} />
          </section>

          {/* Product Tabs */}
          <section className="max-w-full overflow-hidden rounded-2xl border border-border bg-card p-3 sm:p-4 md:p-8">
            <ProductTabs
              fullSpecs={fullSpecs}
              description={product.description ?? ""}
              documents={product.documents}
              reviews={StaticReviews()}
              faqs={StaticFaqs()}
              averageRating={product.rating}
              totalReviews={product.reviewCount}
            />
          </section>

          {/* Project Purchase Box */}
          <section>
            <ProjectPurchaseBox />
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}
        </div>
      </main>

      <Footer />

      {/* Sticky Mobile Add to Cart */}
      {product.variants.length === 0 ? (
        <StickyAddToCart
          productId={product.id}
          slug={product.slug}
          name={product.name}
          model={product.model}
          sku={product.sku}
          brandName={brandName}
          price={product.price}
          oldPrice={product.oldPrice}
          discount={discount}
          mainImageUrl={product.images[0]?.imageUrl ?? null}
          stockQuantity={product.stockQuantity}
        />
      ) : null}
    </div>
  )
}
