"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Boxes, Search, Send, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryImage } from "@/components/common/category-image"
import { Input } from "@/components/ui/input"
import type { Category } from "@/types/category"
import { storeContactConfig } from "@/lib/store-contact-config"
import { useContactInfo } from "@/components/site-settings-provider"
import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

type CategoriesPageProps = {
  categories: Category[]
}

function CategoryVisual({ category }: { category: Category }) {
  const image = category.displayImageUrl || category.homepageImageUrl || category.imageUrl || null
  const icon = category.homepageIconUrl || null

  return (
    <CategoryImage
      src={image}
      iconSrc={icon}
      alt={category.displayImageAltText || category.homepageTitle || category.name}
      iconAlt={category.homepageIconAltText || category.name}
      size="large"
      className="h-40 w-full"
    />
  )
}

export function CategoriesPage({ categories }: CategoriesPageProps) {
  const contact = useContactInfo()
  const telegramUrl = contact.telegramUrl || storeContactConfig.telegram.url
  const [query, setQuery] = useState("")
  const filteredCategories = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return categories
    return categories.filter((category) => `${category.homepageTitle ?? ""} ${category.name} ${category.description ?? ""} ${category.slug}`.toLowerCase().includes(normalized))
  }, [categories, query])

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
            <span className="font-semibold text-foreground">دسته‌بندی‌ها</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-bold text-accent">
                <Boxes className="h-4 w-4" />
                انتخاب سریع تجهیزات صنعتی
              </div>
              <h1 className="text-3xl font-black leading-tight text-primary md:text-5xl">دسته‌بندی تجهیزات برق صنعتی</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                محصولات مورد نیاز خود را بر اساس دسته‌بندی‌های تخصصی تجهیزات برق صنعتی، اتوماسیون، تابلو برق و کنترل انتخاب کنید.
              </p>
            </div>
            <Card className="overflow-hidden rounded-3xl border-primary/10 bg-primary text-primary-foreground shadow-xl">
              <CardContent className="p-6">
                <Zap className="mb-4 h-10 w-10 text-accent" />
                <p className="text-lg font-bold">مشاوره انتخاب دسته‌بندی</p>
                <p className="mt-2 text-sm leading-7 text-primary-foreground/75">
                  برای انتخاب تجهیزات مناسب تابلو برق، کنترل موتور و اتوماسیون صنعتی می‌توانید با تیم فنی ما هماهنگ شوید.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black text-primary">همه دسته‌بندی‌ها</h2>
            <p className="mt-2 text-sm text-muted-foreground">{categories.length} دسته‌بندی فعال</p>
          </div>
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جستجوی دسته‌بندی" className="h-12 rounded-2xl pr-10" />
          </div>
        </div>

        {categories.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card p-10 text-center shadow-sm">
            <Boxes className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="text-xl font-black text-primary">هنوز دسته‌بندی‌ای ثبت نشده است</h3>
            <p className="mt-2 text-muted-foreground">دسته‌بندی محصولات به‌زودی تکمیل خواهد شد.</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-card p-10 text-center text-muted-foreground shadow-sm">دسته‌بندی‌ای با این جستجو پیدا نشد.</div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCategories.map((category) => {
              const title = category.homepageTitle || category.name
              const href = category.homepageUrl || `/products?category=${encodeURIComponent(category.slug)}`
              return (
                <Card key={category.id} className="group overflow-hidden rounded-3xl border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                  <CardContent className="flex h-full min-w-0 flex-col p-2.5 sm:p-4">
                    <CategoryVisual category={category} />
                    <div className="flex flex-1 flex-col p-2 pt-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <h3 className="line-clamp-2 text-sm font-black text-primary sm:text-lg">{title}</h3>
                        <span className="hidden shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground sm:inline-flex">
                          {category.productCount ?? 0} محصول
                        </span>
                      </div>
                      <p className="line-clamp-2 min-h-10 text-xs leading-5 text-muted-foreground sm:line-clamp-3 sm:min-h-[72px] sm:text-sm sm:leading-6">
                        {category.description || "مشاهده محصولات مرتبط با این دسته‌بندی برای پروژه‌های برق صنعتی، اتوماسیون و تابلو برق."}
                      </p>
                      <Button asChild className="mt-3 w-full rounded-2xl bg-primary px-2 text-xs hover:bg-primary/90 sm:mt-5 sm:px-4 sm:text-sm">
                        <Link href={href}>
                          مشاهده محصولات این دسته
                          <ArrowLeft className="mr-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      <section className="container mx-auto px-4 pb-14">
        <div className="overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-xl md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-black">برای انتخاب دسته‌بندی مناسب نیاز به راهنمایی دارید؟</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-primary-foreground/75">
                اگر در انتخاب تجهیزات مناسب برای تابلو برق، اتوماسیون، کنترل موتور یا پروژه صنعتی خود نیاز به مشاوره دارید، با کارشناسان الکتروساکو تماس بگیرید.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="secondary" className="rounded-2xl">
                <Link href="/contact">تماس با پشتیبانی</Link>
              </Button>
              <Button asChild className="rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/products">مشاهده همه محصولات</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-2xl border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
                <a href={telegramUrl} target="_blank" rel="noreferrer">
                  <Send className="ml-2 h-4 w-4" />
                  تلگرام
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
