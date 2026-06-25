"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  Award,
  ChevronLeft,
  Clock,
  Headphones,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  Send,
  ShieldCheck,
  Smartphone,
  Truck,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"
import { usePublicFooterCategories } from "@/components/storefront/public-categories-provider"
import { useSiteSettings } from "@/components/site-settings-provider"
import { storeContactConfig } from "@/lib/store-contact-config"
import type { PublicSiteSettings } from "@/types/site-settings"

const quickLinks = [
  { name: "صفحه اصلی", href: "/" },
  { name: "محصولات", href: "/products" },
  { name: "دسته‌بندی‌ها", href: "/categories" },
  { name: "برندها", href: "/brands" },
  { name: "پروژه‌ها", href: "/projects" },
  { name: "وبلاگ", href: "/blog" },
  { name: "تماس با ما", href: "/contact" },
]

const featureCards = [
  {
    icon: ShieldCheck,
    title: "ضمانت اصالت کالا",
    description: "تأمین کالا از برندهای معتبر",
  },
  {
    icon: Headphones,
    title: "مشاوره فنی تخصصی",
    description: "راهنمایی انتخاب تجهیزات صنعتی",
  },
  {
    icon: PackageCheck,
    title: "تأمین پروژه‌ای",
    description: "مناسب خرید عمده و پروژه‌ای",
  },
  {
    icon: Truck,
    title: "ارسال به سراسر کشور",
    description: "هماهنگی ارسال پس از تأیید سفارش",
  },
]

const brandChips = ["برق صنعتی", "اتوماسیون", "تابلو برق", "تأمین پروژه‌ای"]

function normalizeTel(value: string) {
  return value.replace(/\s+/g, "")
}

function isValidExternalUrl(value?: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value))
}

const footerCardClass =
  "rounded-[1.75rem] border border-white/10 bg-[#0a2139]/82 p-5 shadow-2xl shadow-black/15 backdrop-blur-md ring-1 ring-white/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-[#0d2a48]/86 hover:shadow-accent/10"

const footerInnerCardClass =
  "rounded-3xl border border-white/10 bg-white/[0.045] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white/[0.075]"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
      <h3 className="text-lg font-black text-white">{children}</h3>
      <span className="h-1 w-9 rounded-full bg-accent shadow-[0_0_18px_rgba(249,115,22,.55)]" />
    </div>
  )
}

export function Footer({ settings }: { settings?: PublicSiteSettings } = {}) {
  const contextSettings = useSiteSettings()
  const { contactInfo: contact, footerInfo: footer } = settings ?? contextSettings
  const dynamicCategories = usePublicFooterCategories()

  const brandName = contact.brandName || storeContactConfig.brandName || "الکتروساکو"
  const description = footer.description || storeContactConfig.defaultFooterDescription
  const copyright =
    footer.copyright || `© ${new Date().getFullYear()} ${brandName}. تمامی حقوق محفوظ است.`
  const landline = contact.landline || storeContactConfig.landline
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  const telegramUsername = contact.telegramUsername || storeContactConfig.telegram.username
  const telegramUrl = footer.telegramUrl || contact.telegramUrl || storeContactConfig.telegram.url
  const whatsappUrl = contact.whatsappUrl || storeContactConfig.whatsapp.url
  const workingHours = contact.workingHours || storeContactConfig.workingHours
  const address = contact.address || storeContactConfig.address
  const email = contact.email?.trim() || ""
  const channels = contact.messagingApps?.length ? contact.messagingApps : [...storeContactConfig.channels]
  const popularCategories = dynamicCategories.slice(0, 7)

  const socialLinks = [
    { label: "اینستاگرام", url: footer.instagramUrl, isActive: footer.instagramIsActive, icon: Instagram },
    { label: "تلگرام", url: footer.telegramUrl || telegramUrl, isActive: footer.telegramIsActive, icon: Send },
    { label: "بله", url: footer.baleUrl, isActive: footer.baleIsActive, icon: MessageCircle },
    { label: "لینکدین", url: footer.linkedinUrl, isActive: footer.linkedinIsActive, icon: Linkedin },
  ].filter((item) => item.isActive && isValidExternalUrl(item.url))

  const messagingActions = [
    { label: "واتساپ", url: whatsappUrl, icon: MessageCircle, className: "border-emerald-400/35 text-emerald-200 hover:bg-emerald-500/15" },
    { label: "تلگرام", url: telegramUrl, icon: Send, className: "border-sky-400/35 text-sky-200 hover:bg-sky-500/15" },
    ...(footer.baleIsActive && isValidExternalUrl(footer.baleUrl)
      ? [{ label: "بله", url: footer.baleUrl, icon: MessageCircle, className: "border-white/15 text-white/80 hover:bg-white/10" }]
      : []),
  ].filter((item) => isValidExternalUrl(item.url))

  const passiveChannels = channels.filter((channel) => !messagingActions.some((item) => item.label === channel))

  const safeCopyright = useMemo(() => {
    if (copyright.includes("©")) return copyright
    return `© ${new Date().getFullYear()} ${copyright}`
  }, [copyright])

  return (
    <footer dir="rtl" className="relative overflow-hidden bg-[#061529] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(249,115,22,0.16),transparent_31%),radial-gradient(circle_at_86%_25%,rgba(14,165,233,0.13),transparent_34%),linear-gradient(135deg,#061529_0%,#08203a_48%,#061326_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.075] [background-image:linear-gradient(rgba(255,255,255,.58)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.58)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-accent/50 to-transparent" />

      <div className="relative container mx-auto px-4 py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="group rounded-3xl border border-white/12 bg-[#0a2139]/72 p-5 shadow-xl shadow-black/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-[#0d2a48]/82"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-black text-white">{item.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/62">{item.description}</p>
                  </div>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent shadow-[0_0_22px_rgba(249,115,22,.18)] transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                    <Icon className="h-7 w-7" />
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <section className={`${footerCardClass} lg:col-span-4`}>
            <Link href="/" className="mb-6 flex items-center gap-4">
              <span className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border border-accent/35 bg-accent/10 text-accent shadow-[0_0_32px_rgba(249,115,22,.16)]">
                <Zap className="h-11 w-11" />
                <span className="absolute -bottom-2 h-1 w-10 rounded-full bg-accent shadow-[0_0_18px_rgba(249,115,22,.65)]" />
              </span>
              <span>
                <span className="block text-2xl font-black tracking-tight text-white sm:text-3xl">{brandName}</span>
                <span className="mt-2 block text-xs font-semibold text-white/55">{storeContactConfig.tagline}</span>
              </span>
            </Link>

            <p className="text-sm leading-8 text-white/70">{description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {brandChips.map((chip) => (
                <span key={chip} className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-bold text-white/72">
                  {chip}
                </span>
              ))}
            </div>

            <div className={`${footerInnerCardClass} mt-5`}>
              {footer.trustBadgeImageUrl && (
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <SafeImageWithFallback
                    src={footer.trustBadgeImageUrl}
                    altText={footer.trustBadgeImageAltText || "نشان اعتبار الکتروساکو"}
                    fallbackText={footer.trustBadgeImageAltText || "نشان اعتبار الکتروساکو"}
                    objectFit="contain"
                    className="h-20 w-20 rounded-2xl border border-white/12 bg-white p-2"
                  />
                  <div className="min-w-0 flex-1 text-sm leading-7 text-white/68">
                    <strong className="block text-white">{footer.trustBadgeImageAltText || "نشان اعتبار الکتروساکو"}</strong>
                    <span>اطلاعات اعتبارسنجی بارگذاری‌شده از تنظیمات سایت.</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-accent">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-black text-white">خدمات سریع مشتریان</h3>
                  <p className="mt-1 text-xs leading-6 text-white/62">
                    برای مشاوره، اعلام قیمت و پیگیری سفارش با تیم پشتیبانی در ارتباط باشید.
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button asChild className="h-11 rounded-2xl bg-accent text-sm font-black text-accent-foreground shadow-lg shadow-accent/15 hover:bg-accent/90">
                  <a href={isValidExternalUrl(telegramUrl) ? telegramUrl : `/contact`} target={isValidExternalUrl(telegramUrl) ? "_blank" : undefined} rel={isValidExternalUrl(telegramUrl) ? "noreferrer" : undefined}>
                    <Headphones className="ml-2 h-4 w-4" />
                    مشاوره
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-2xl border-accent/45 bg-transparent text-sm font-black text-white hover:bg-accent hover:text-accent-foreground">
                  <Link href="/contact">
                    <Phone className="ml-2 h-4 w-4" />
                    استعلام
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-11 rounded-2xl border-white/15 bg-white/[0.05] text-sm font-black text-white hover:bg-white hover:text-primary">
                  <Link href="/contact">
                    <MessageCircle className="ml-2 h-4 w-4" />
                    پشتیبانی
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section className={`${footerCardClass} lg:col-span-2`}>
            <SectionTitle>دسترسی سریع</SectionTitle>
            <ul className="space-y-1.5">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="group flex items-center justify-between rounded-2xl px-2.5 py-2.5 text-sm font-medium text-white/68 transition-colors hover:bg-white/[0.06] hover:text-white">
                    <span>{link.name}</span>
                    <ChevronLeft className="h-4 w-4 text-accent transition-transform group-hover:-translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${footerCardClass} lg:col-span-3`}>
            <SectionTitle>دسته‌بندی‌های پرفروش</SectionTitle>
            <ul className="space-y-1.5">
              {popularCategories.length ? popularCategories.map((category) => (
                <li key={`${category.slug}-${category.name}`}>
                  <Link
                    href={category.href || `/products?category=${encodeURIComponent(category.slug)}`}
                    className="group flex items-center justify-between rounded-2xl px-2.5 py-2.5 text-sm font-medium text-white/68 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <span>{category.name}</span>
                    <ChevronLeft className="h-4 w-4 text-accent transition-transform group-hover:-translate-x-1" />
                  </Link>
                </li>
              )) : (
                <li>
                  <Link
                    href="/categories"
                    className="group flex items-center justify-between rounded-2xl px-2.5 py-2.5 text-sm font-medium text-white/68 transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <span>مشاهده همه دسته‌بندی‌ها</span>
                    <ChevronLeft className="h-4 w-4 text-accent transition-transform group-hover:-translate-x-1" />
                  </Link>
                </li>
              )}
            </ul>
          </section>

          <section className={`${footerCardClass} lg:col-span-3`}>
            <SectionTitle>تماس و پشتیبانی</SectionTitle>
            <div className="space-y-2.5 text-sm text-white/72">
              <a href={`tel:${normalizeTel(landline)}`} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] p-3 transition-colors hover:border-accent/30 hover:bg-white/[0.075] hover:text-white">
                <Phone className="h-5 w-5 shrink-0 text-accent" />
                <span dir="ltr" className="mr-auto text-white">{landline}</span>
              </a>
              <a href={`tel:${normalizeTel(supportPhone)}`} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] p-3 transition-colors hover:border-accent/30 hover:bg-white/[0.075] hover:text-white">
                <Smartphone className="h-5 w-5 shrink-0 text-accent" />
                <span dir="ltr" className="mr-auto text-white">{supportPhone}</span>
              </a>
              <a href={telegramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] p-3 transition-colors hover:border-accent/30 hover:bg-white/[0.075] hover:text-white">
                <Send className="h-5 w-5 shrink-0 text-accent" />
                <span dir="ltr" className="mr-auto text-white">{telegramUsername}</span>
              </a>
              {email && (
                <a href={`mailto:${email}`} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.045] p-3 transition-colors hover:border-accent/30 hover:bg-white/[0.075] hover:text-white">
                  <Mail className="h-5 w-5 shrink-0 text-accent" />
                  <span dir="ltr" className="mr-auto break-all text-left text-white">{email}</span>
                </a>
              )}
              {workingHours && (
                <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.045] p-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <span className="block text-white/52">ساعات پاسخگویی</span>
                    <strong className="mt-1 block font-bold text-white">{workingHours}</strong>
                  </div>
                </div>
              )}
            </div>

            <div className={`${footerInnerCardClass} mt-5 border-accent/25 bg-accent/10`}>
              <div className="mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-accent" />
                <h4 className="font-black text-white">استعلام قیمت و موجودی</h4>
              </div>
              <p className="text-xs leading-6 text-white/65">مدل کالا، عکس پلاک یا لیست اقلام پروژه را ارسال کنید تا قیمت و موجودی اعلام شود.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {messagingActions.map(({ label, url, icon: Icon, className }) => (
                  <a
                    key={label}
                    href={url ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center justify-center gap-2 rounded-2xl border bg-white/[0.04] px-3 py-2.5 text-sm font-bold transition-colors ${className}`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                ))}
                {passiveChannels.slice(0, Math.max(0, 4 - messagingActions.length)).map((channel) => (
                  <span key={channel} className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm font-bold text-white/58">
                    {channel}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className={`${footerCardClass} mt-5`}>
          <div className="flex flex-col gap-5 text-sm text-white/62 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3 lg:max-w-3xl">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <p className="leading-8">{address}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <a href="#" className="transition-colors hover:text-accent">قوانین و مقررات</a>
                <span className="hidden h-4 w-px bg-white/15 sm:block" />
                <a href="#" className="transition-colors hover:text-accent">حریم خصوصی</a>
                <span className="hidden h-4 w-px bg-white/15 sm:block" />
                <Link href="/contact" className="transition-colors hover:text-accent">تماس با ما</Link>
              </div>
              <span className="text-white/50">{safeCopyright}</span>
            </div>
          </div>
        </section>
      </div>
    </footer>
  )
}
