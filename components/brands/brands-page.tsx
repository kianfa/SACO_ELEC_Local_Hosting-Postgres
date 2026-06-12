"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, Building2, Search, Send, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { Brand } from "@/types/brand"
import { storeContactConfig } from "@/lib/store-contact-config"
import { useContactInfo } from "@/components/site-settings-provider"
import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"

type BrandsPageProps = {
  brands: Brand[]
}

function BrandLogo({ brand }: { brand: Brand }) {
  if (brand.logoUrl) {
    return (
      <SafeImageWithFallback
        src={brand.logoUrl}
        altText={brand.logoAltText || `لوگوی ${brand.name}`}
        fallbackText={brand.name}
        objectFit="contain"
        className="h-20 w-20 rounded-2xl border border-border bg-white p-3 shadow-sm"
      />
    )
  }

  const initials = brand.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")

  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-xl font-black text-primary-foreground shadow-sm">
      {initials || <Building2 className="h-8 w-8" />}
    </div>
  )
}

export function BrandsPage({ brands }: BrandsPageProps) {
  const contact = useContactInfo()
  const telegramUrl = contact.telegramUrl || storeContactConfig.telegram.url
  const [query, setQuery] = useState("")
  const filteredBrands = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return brands
    return brands.filter((brand) => `${brand.name} ${brand.description ?? ""} ${brand.slug}`.toLowerCase().includes(normalized))
  }, [brands, query])

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <main>
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-primary">صفحه اصلی</Link>
            <span className="mx-2">/</span>
            <span className="font-semibold text-foreground">برندها</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
                <BadgeCheck className="h-4 w-4" />
                برندهای معتبر صنعتی
              </div>
              <h1 className="text-3xl font-black leading-tight text-primary md:text-5xl">برندهای تجهیزات برق صنعتی</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                در ساکو الکتریک می‌توانید محصولات برندهای معتبر برق صنعتی، اتوماسیون، کنترل، ابزار دقیق و تجهیزات تابلو برق را بررسی و انتخاب کنید.
              </p>
            </div>
            <Card className="overflow-hidden rounded-3xl border-primary/10 bg-primary text-primary-foreground shadow-xl">
              <CardContent className="p-6">
                <Sparkles className="mb-4 h-10 w-10 text-accent" />
                <p className="text-lg font-bold">استعلام برندهای خاص</p>
                <p className="mt-2 text-sm leading-7 text-primary-foreground/75">
                  اگر برند یا کد فنی مورد نظر شما در لیست نیست، برای استعلام موجودی و قیمت پروژه‌ای با کارشناسان ما تماس بگیرید.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-primary">لیست برندها</h2>
            <p className="mt-2 text-sm text-muted-foreground">{brands.length} برند ثبت‌شده در فروشگاه</p>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی برند" className="h-12 rounded-2xl pr-10" />
          </div>
        </div>

        {brands.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card p-10 text-center shadow-sm">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-black text-primary">هنوز برندی ثبت نشده است</h3>
            <p className="mt-2 text-muted-foreground">برندهای تجهیزات برق صنعتی به‌زودی اضافه خواهند شد.</p>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground shadow-sm">برندی با این جستجو پیدا نشد.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBrands.map((brand) => (
              <Card key={brand.id} className="group overflow-hidden rounded-3xl border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                <CardContent className="flex h-full min-w-0 flex-col p-3 sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-2 sm:mb-5 sm:gap-4">
                    <BrandLogo brand={brand} />
                    <span className="hidden rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground sm:inline-flex">
                      {brand.productCount ?? 0} محصول
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-sm font-black text-primary sm:text-lg">{brand.name}</h3>
                  <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground sm:line-clamp-3 sm:min-h-[72px] sm:text-sm sm:leading-6">
                    {brand.description || "محصولات این برند در دسته‌بندی تجهیزات برق صنعتی، اتوماسیون و تابلو برق قابل بررسی هستند."}
                  </p>
                  <Button asChild className="mt-3 w-full rounded-2xl bg-primary px-2 text-xs hover:bg-primary/90 sm:mt-5 sm:px-4 sm:text-sm">
                    <Link href={`/products?brand=${encodeURIComponent(brand.slug)}`}>
                      مشاهده محصولات
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pb-14">
        <div className="overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-xl md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">برند مورد نظر خود را پیدا نکردید؟</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-primary-foreground/75">
                برای استعلام موجودی برندهای خاص یا محصولات پروژه‌ای، با کارشناسان ساکو الکتریک در ارتباط باشید.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary" className="rounded-2xl">
                <Link href="/contact">تماس با پشتیبانی</Link>
              </Button>
              <Button asChild className="rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90">
                <a href={telegramUrl} target="_blank" rel="noreferrer">
                  <Send className="ml-2 h-4 w-4" />
                  ارسال پیام در تلگرام
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      </main>
      <Footer />
    </div>
  )
}
