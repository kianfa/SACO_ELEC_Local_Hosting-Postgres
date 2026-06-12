"use client"

import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Cable,
  ChevronLeft,
  Factory,
  FileText,
  Home,
  Lightbulb,
  MessageCircle,
  Newspaper,
  Phone,
  Send,
  Settings,
  ShieldCheck,
  Zap,
} from "lucide-react"
import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { storeContactConfig } from "@/lib/store-contact-config"
import { useContactInfo } from "@/components/site-settings-provider"

const upcomingTopics = [
  {
    title: "راهنمای خرید تجهیزات برق صنعتی",
    description: "نکات کاربردی برای انتخاب مطمئن تجهیزات مناسب پروژه.",
    icon: BookOpen,
  },
  {
    title: "آموزش انتخاب کنتاکتور، کلید و فیوز",
    description: "راهنمای فنی برای انتخاب درست قطعات حفاظتی و کنترلی.",
    icon: Zap,
  },
  {
    title: "نکات فنی تابلو برق و اتوماسیون",
    description: "مطالب تخصصی برای طراحی، اجرا و نگهداری سیستم‌های صنعتی.",
    icon: Settings,
  },
  {
    title: "معرفی برندهای معتبر صنعتی",
    description: "بررسی برندهای شناخته‌شده و کاربرد هرکدام در صنعت.",
    icon: ShieldCheck,
  },
  {
    title: "راهنمای انتخاب اینورتر و الکتروموتور",
    description: "انتخاب توان، کاربرد، شرایط نصب و نکات راه‌اندازی.",
    icon: Cable,
  },
  {
    title: "مقالات پروژه‌ای و کاربردی",
    description: "تجربه‌های اجرایی، چک‌لیست‌ها و راهکارهای خرید پروژه‌ای.",
    icon: Factory,
  },
]

export function BlogComingSoonPage() {
  const contact = useContactInfo()
  const telegramUrl = contact.telegramUrl || storeContactConfig.telegram.url
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <TopBar />
      <Header />

      <main>
        <div className="border-b border-border bg-muted/30">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <Home className="h-4 w-4" />
                      صفحه اصلی
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">وبلاگ</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.18),transparent_35%),radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_32%)]" />
          <div className="container mx-auto px-4 py-10 md:py-16">
            <Card className="overflow-hidden rounded-3xl border-primary/10 bg-card shadow-xl shadow-primary/5">
              <CardContent className="relative p-6 md:p-10 lg:p-12">
                <div className="absolute left-0 top-0 hidden h-full w-1/3 bg-gradient-to-r from-accent/10 to-transparent lg:block" />
                <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <Newspaper className="h-10 w-10" />
                  </div>
                  <Badge className="mb-4 rounded-full bg-accent px-4 py-1.5 text-sm font-black text-accent-foreground hover:bg-accent">
                    به‌زودی
                  </Badge>
                  <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                    وبلاگ تخصصی برق صنعتی به‌زودی راه‌اندازی می‌شود
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                    در این بخش به‌زودی مقالات آموزشی، راهنمای خرید تجهیزات برق صنعتی، نکات فنی، معرفی برندها و مطالب کاربردی برای مهندسان، تکنسین‌ها و خریداران پروژه‌ای منتشر خواهد شد.
                  </p>
                  <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                    <Button asChild size="lg" className="rounded-xl bg-primary px-7">
                      <Link href="/products">
                        مشاهده محصولات
                        <ArrowLeft className="mr-2 h-5 w-5" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="rounded-xl border-primary/20 px-7">
                      <Link href="/contact">
                        <MessageCircle className="ml-2 h-5 w-5" />
                        تماس با پشتیبانی
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="container mx-auto px-4 py-10 md:py-14">
          <div className="mb-7 flex flex-col gap-2 md:items-center md:text-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-bold text-accent-foreground md:mx-auto">
              <Lightbulb className="h-4 w-4 text-accent" />
              محتوای آموزشی و کاربردی
            </div>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">موضوعاتی که به‌زودی منتشر می‌شوند</h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:mx-auto">
              مطالب وبلاگ با تمرکز بر انتخاب بهتر تجهیزات، کاهش خطای خرید و پشتیبانی فنی پروژه‌های صنعتی آماده خواهد شد.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcomingTopics.map((topic) => {
              const Icon = topic.icon
              return (
                <Card key={topic.title} className="group rounded-2xl border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black leading-7 text-foreground">{topic.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">{topic.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-14 md:pb-20">
          <div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/10">
            <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                  <FileText className="h-4 w-4 text-accent" />
                  مشاوره پیش از خرید
                </div>
                <h2 className="text-2xl font-black md:text-3xl">برای دریافت مشاوره فنی عجله دارید؟</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-primary-foreground/75 md:text-base">
                  تا زمان راه‌اندازی وبلاگ، می‌توانید برای انتخاب محصول، استعلام قیمت و مشاوره فنی با کارشناسان ساکو الکتریک در ارتباط باشید.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Button asChild size="lg" className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href={telegramUrl} target="_blank" rel="noreferrer">
                    <Send className="ml-2 h-5 w-5" />
                    ارسال پیام در تلگرام
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-xl border-white/25 bg-white/5 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground">
                  <Link href={`tel:${supportPhone}`}>
                    <Phone className="ml-2 h-5 w-5" />
                    تماس با پشتیبانی
                  </Link>
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
