"use client"

import Link from "next/link"
import { ChevronLeft, Home, MessageCircle, Phone, Send, Smartphone, Zap } from "lucide-react"
import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ContactCard } from "@/components/contact/contact-card"
import { ContactFAQ } from "@/components/contact/contact-faq"
import { ContactForm } from "@/components/contact/contact-form"
import { ManualOrderGuide } from "@/components/contact/manual-order-guide"
import { Button } from "@/components/ui/button"
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

export function ContactPage() {
  const contact = useContactInfo()
  const brandName = contact.brandName || storeContactConfig.brandName
  const landline = contact.landline || storeContactConfig.landline
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  const telegramUsername = contact.telegramUsername || storeContactConfig.telegram.username
  const telegramUrl = contact.telegramUrl || storeContactConfig.telegram.url
  const whatsappUrl = contact.whatsappUrl || storeContactConfig.whatsapp.url
  const channels = contact.messagingApps?.length ? contact.messagingApps : [...storeContactConfig.channels]

  return (
    <div className="min-h-screen bg-background">
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
                  <BreadcrumbPage className="font-medium text-foreground">تماس با ما</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
          <div className="container mx-auto px-4 py-10 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-bold text-accent-foreground">
                  <Zap className="h-4 w-4 text-accent" />
                  ارتباط سریع با {brandName}
                </div>
                <h1 className="text-3xl font-black tracking-tight text-foreground md:text-5xl">تماس با الکتروساکو</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground md:text-lg">
                  کارشناسان فروش و پشتیبانی فنی الکتروساکو آماده پاسخ‌گویی برای انتخاب تجهیزات برق صنعتی، استعلام قیمت، بررسی موجودی و هماهنگی ارسال سفارش هستند.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Button asChild size="lg" className="rounded-xl bg-primary px-7">
                    <Link href={`tel:${supportPhone}`}>
                      <Phone className="ml-2 h-5 w-5" />
                      تماس با پشتیبانی
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="rounded-xl border-primary/20 px-7">
                    <Link href={telegramUrl} target="_blank" rel="noreferrer">
                      <Send className="ml-2 h-5 w-5" />
                      ارسال پیام در تلگرام
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-primary/5 md:p-7">
                <div className="grid gap-4 text-sm">
                  <InfoRow label="تلفن ثابت" value={landline} href={`tel:${landline}`} />
                  <InfoRow label="موبایل / پشتیبانی" value={supportPhone} href={`tel:${supportPhone}`} />
                  <InfoRow label="تلگرام" value={telegramUsername} href={telegramUrl} external />
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <p className="mb-2 font-bold text-foreground">پیام‌رسان‌های قابل استفاده</p>
                    <div className="flex flex-wrap gap-2">
                      {channels.map((channel) => (
                        <span key={channel} className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted-foreground shadow-sm">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8 md:py-12">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-foreground md:text-3xl">راه‌های ارتباطی</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">برای ثبت سفارش، پیگیری خرید یا دریافت مشاوره فنی از یکی از روش‌های زیر استفاده کنید.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
            <ContactCard
              icon={Phone}
              title="تلفن ثابت"
              value={landline}
              description="برای تماس مستقیم با فروشگاه"
              actions={[{ label: "تماس", href: `tel:${landline}` }]}
            />
            <ContactCard
              icon={Smartphone}
              title="موبایل / پشتیبانی"
              value={supportPhone}
              description="برای پیگیری سفارش و هماهنگی خرید"
              actions={[{ label: "تماس با پشتیبانی", href: `tel:${supportPhone}` }]}
            />
            <ContactCard
              icon={Send}
              title="تلگرام"
              value={telegramUsername}
              description="ارسال تصویر سبد خرید، استعلام قیمت و هماهنگی پرداخت"
              actions={[{ label: "ارسال پیام در تلگرام", href: telegramUrl, external: true }]}
            />
            <ContactCard
              icon={MessageCircle}
              title="پیام‌رسان‌ها"
              value={channels.join("، ")}
              description="برای ثبت سفارش و ارسال اسکرین‌شات سبد خرید"
              phone={supportPhone}
              badges={["بله", "روبیکا"]}
              actions={[
                { label: "واتساپ", href: whatsappUrl, external: true },
                { label: "تلگرام", href: telegramUrl, external: true },
              ]}
            />
          </div>
        </section>

        <section className="container mx-auto px-4 py-4 md:py-8">
          <ManualOrderGuide />
        </section>

        <section className="container mx-auto grid gap-6 px-4 py-8 md:py-12 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <ContactForm />
          <ContactFAQ />
        </section>
      </main>

      <Footer />
    </div>
  )
}

function InfoRow({ label, value, href, external }: { label: string; value: string; href: string; external?: boolean }) {
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-background p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="font-black text-primary" dir="auto">
        {value}
      </span>
    </Link>
  )
}
