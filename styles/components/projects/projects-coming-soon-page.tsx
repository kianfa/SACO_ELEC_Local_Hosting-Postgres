"use client"

import Link from "next/link"
import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Cable,
  ChevronLeft,
  ClipboardCheck,
  Factory,
  FileCheck2,
  HardHat,
  Home,
  MessageCircle,
  Phone,
  Send,
  Settings2,
  ShieldCheck,
  Truck,
  Wrench,
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

const projectServices = [
  {
    title: "تأمین تجهیزات برق صنعتی",
    description: "تأمین انواع کلید، فیوز، کنتاکتور، سنسور، PLC و تجهیزات تابلو برق برای پروژه‌های صنعتی",
    icon: Zap,
  },
  {
    title: "مشاوره انتخاب تجهیزات",
    description: "راهنمایی فنی برای انتخاب صحیح تجهیزات متناسب با نیاز پروژه",
    icon: Wrench,
  },
  {
    title: "استعلام قیمت پروژه‌ای",
    description: "بررسی لیست اقلام، موجودی، قیمت نهایی و ارائه پیشنهاد برای خرید عمده",
    icon: ClipboardCheck,
  },
  {
    title: "هماهنگی ارسال پروژه",
    description: "هماهنگی ارسال کالاهای پروژه‌ای، باربری و تحویل طبق شرایط سفارش",
    icon: Truck,
  },
  {
    title: "تجهیزات اتوماسیون و کنترل",
    description: "تأمین تجهیزات PLC، اینورتر، سنسور، HMI و قطعات کنترلی صنعتی",
    icon: Settings2,
  },
  {
    title: "تجهیزات تابلو برق",
    description: "تأمین تجهیزات حفاظتی، فرمان، کابل، ترمینال و ملزومات تابلو برق صنعتی",
    icon: Cable,
  },
]

const futureCaseStudies = [
  {
    title: "تأمین تجهیزات تابلو برق صنعتی",
    icon: Building2,
  },
  {
    title: "تأمین اینورتر و تجهیزات راه‌اندازی موتور",
    icon: Factory,
  },
  {
    title: "تأمین تجهیزات اتوماسیون و ابزار دقیق",
    icon: ShieldCheck,
  },
]

export function ProjectsComingSoonPage() {
  const contact = useContactInfo()
  const landline = contact.landline || storeContactConfig.landline
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  const telegramUrl = contact.telegramUrl || storeContactConfig.telegram.url
  const telegramUsername = contact.telegramUsername || storeContactConfig.telegram.username
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
                  <BreadcrumbPage className="font-medium text-foreground">پروژه‌ها</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle_at_top_right,hsl(var(--accent)/0.2),transparent_35%),radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_34%)]" />
          <div className="container mx-auto px-4 py-10 md:py-16">
            <Card className="overflow-hidden rounded-3xl border-primary/10 bg-card shadow-xl shadow-primary/5">
              <CardContent className="relative p-6 md:p-10 lg:p-12">
                <div className="absolute bottom-0 left-0 hidden h-44 w-44 rounded-full bg-accent/10 blur-3xl lg:block" />
                <div className="absolute right-0 top-0 hidden h-full w-1/3 bg-gradient-to-l from-primary/8 to-transparent lg:block" />
                <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
                  <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                    <HardHat className="h-10 w-10" />
                  </div>
                  <Badge className="mb-4 rounded-full bg-accent px-4 py-1.5 text-sm font-black text-accent-foreground hover:bg-accent">
                    به‌زودی
                  </Badge>
                  <h1 className="text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
                    بخش پروژه‌های صنعتی به‌زودی راه‌اندازی می‌شود
                  </h1>
                  <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                    در این بخش به‌زودی نمونه پروژه‌های تأمین تجهیزات برق صنعتی، تابلو برق، اتوماسیون، اینورتر، الکتروموتور و تجهیزات کنترلی منتشر خواهد شد.
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
                        تماس برای استعلام پروژه
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
              <BriefcaseBusiness className="h-4 w-4 text-accent" />
              تأمین پروژه‌های صنعتی
            </div>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">خدمات پروژه‌ای الکتروساکو</h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:mx-auto">
              برای خرید پروژه‌ای، استعلام قیمت عمده و هماهنگی تأمین تجهیزات برق صنعتی، کارشناسان فروش الکتروساکو در کنار شما هستند.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projectServices.map((service) => {
              const Icon = service.icon
              return (
                <Card key={service.title} className="group rounded-2xl border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-accent/40 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black leading-7 text-foreground">{service.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-muted-foreground">{service.description}</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-10 md:pb-14">
          <div className="overflow-hidden rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/10">
            <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold">
                  <FileCheck2 className="h-4 w-4 text-accent" />
                  استعلام پروژه‌ای
                </div>
                <h2 className="text-2xl font-black md:text-3xl">برای پروژه صنعتی خود نیاز به استعلام دارید؟</h2>
                <p className="mt-3 max-w-3xl text-sm leading-8 text-primary-foreground/75 md:text-base">
                  لیست تجهیزات مورد نیاز پروژه خود را از طریق تلگرام، واتساپ، بله یا روبیکا برای کارشناسان الکتروساکو ارسال کنید تا موجودی، قیمت نهایی و شرایط تأمین بررسی شود.
                </p>
                <div className="mt-5 grid gap-2 text-sm text-primary-foreground/80 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white/8 px-4 py-3">
                    <span className="block text-primary-foreground/60">تلفن ثابت</span>
                    <a href={`tel:${landline}`} dir="ltr" className="font-bold text-primary-foreground hover:text-accent">
                      {landline}
                    </a>
                  </div>
                  <div className="rounded-2xl bg-white/8 px-4 py-3">
                    <span className="block text-primary-foreground/60">موبایل / پشتیبانی</span>
                    <a href={`tel:${supportPhone}`} dir="ltr" className="font-bold text-primary-foreground hover:text-accent">
                      {supportPhone}
                    </a>
                  </div>
                  <div className="rounded-2xl bg-white/8 px-4 py-3">
                    <span className="block text-primary-foreground/60">تلگرام</span>
                    <a href={telegramUrl} target="_blank" rel="noreferrer" dir="ltr" className="font-bold text-primary-foreground hover:text-accent">
                      {telegramUsername}
                    </a>
                  </div>
                </div>
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

        <section className="container mx-auto px-4 pb-14 md:pb-20">
          <div className="mb-7 flex flex-col gap-2 md:items-center md:text-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/8 px-4 py-2 text-sm font-bold text-primary md:mx-auto">
              <BadgeCheck className="h-4 w-4" />
              نمونه پروژه‌ها
            </div>
            <h2 className="text-2xl font-black text-foreground md:text-3xl">نمونه‌هایی که به‌زودی منتشر می‌شوند</h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground md:mx-auto">
              این بخش فقط پیش‌نمایش دسته‌بندی پروژه‌های آینده است و جزئیات پروژه واقعی بعداً منتشر خواهد شد.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {futureCaseStudies.map((caseStudy) => {
              const Icon = caseStudy.icon
              return (
                <Card key={caseStudy.title} className="overflow-hidden rounded-3xl border-border bg-card shadow-sm">
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-accent/10">
                    <Icon className="h-14 w-14 text-primary/55" />
                  </div>
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="mb-3 rounded-full bg-accent/10 text-accent-foreground">
                      به‌زودی
                    </Badge>
                    <h3 className="font-black leading-7 text-foreground">{caseStudy.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      جزئیات، اقلام تأمین‌شده و توضیحات پروژه پس از راه‌اندازی این بخش منتشر می‌شود.
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
