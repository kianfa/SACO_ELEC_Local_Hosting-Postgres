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
import { storeContactConfig } from "@/lib/store-contact-config"
import { useSiteSettings } from "@/components/site-settings-provider"
import { SafeImageWithFallback } from "@/components/common/safe-image-with-fallback"
import { usePublicFooterCategories } from "@/components/storefront/public-categories-provider"
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

const trustItems = [
  {
    icon: ShieldCheck,
    title: "تضمین اصالت کالا",
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

export function Footer({ settings }: { settings?: PublicSiteSettings } = {}) {
  const contextSettings = useSiteSettings()
  const { contactInfo: contact, footerInfo: footer } = settings ?? contextSettings
  const dynamicCategories = usePublicFooterCategories()

  const brandName = contact.brandName || storeContactConfig.brandName
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
  const popularCategories = dynamicCategories
  const socialLinks = [
    { label: "اینستاگرام", url: footer.instagramUrl, isActive: footer.instagramIsActive, icon: Instagram },
    { label: "تلگرام", url: footer.telegramUrl, isActive: footer.telegramIsActive, icon: Send },
    { label: "بله", url: footer.baleUrl, isActive: footer.baleIsActive, icon: MessageCircle },
    { label: "لینکدین", url: footer.linkedinUrl, isActive: footer.linkedinIsActive, icon: Linkedin },
  ].filter((item) => item.isActive && isValidExternalUrl(item.url))

  const safeCopyright = useMemo(() => {
    if (copyright.includes("©")) return copyright
    return `© ${new Date().getFullYear()} ${copyright}`
  }, [copyright])

  return (
    <footer className="relative overflow-hidden bg-[#07182f] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(59,130,246,0.18),transparent_34%),linear-gradient(135deg,#07182f_0%,#0b2240_48%,#061326_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:34px_34px]" />

      <div className="relative border-b border-white/10 bg-white/[0.03]">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-lg shadow-black/5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-accent/35 hover:bg-white/[0.09]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent ring-1 ring-accent/25 transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-xs leading-6 text-white/62">{item.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="relative container mx-auto px-4 py-8 sm:py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-12">
          <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/10 backdrop-blur lg:col-span-4">
            <Link href="/" className="mb-5 flex items-center gap-3">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-lg shadow-accent/20">
                <Zap className="h-8 w-8" />
              </span>
              <span>
                <span className="block text-2xl font-black tracking-tight text-white">{brandName}</span>
                <span className="mt-1 block text-xs font-medium text-white/58">{storeContactConfig.tagline}</span>
              </span>
            </Link>

            <p className="text-sm leading-8 text-white/72">{description}</p>

            <div className="mt-5 flex flex-wrap gap-2">
              {brandChips.map((chip) => (
                <span key={chip} className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-white/75">
                  {chip}
                </span>
              ))}
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map(({ label, url, icon: Icon }) => (
                  <a
                    key={label}
                    href={url ?? undefined}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.08] text-white/75 transition-colors hover:border-accent/45 hover:bg-accent hover:text-accent-foreground"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/10 p-4">
              <div className="flex items-start gap-3">
                <Award className="mt-1 h-5 w-5 shrink-0 text-accent" />
                <div>
                  <h4 className="font-bold text-white">اطلاعات اعتماد فروشگاه</h4>
                  {footer.trustBadgeImageUrl ? (
                    <div className="mt-3 flex items-center gap-3">
                      <SafeImageWithFallback
                        src={footer.trustBadgeImageUrl}
                        altText={footer.trustBadgeImageAltText || "نشان اعتماد ساکو الکتریک"}
                        fallbackText={footer.trustBadgeImageAltText || "نشان اعتماد ساکو الکتریک"}
                        objectFit="contain"
                        className="h-20 w-20 rounded-2xl border border-white/10 bg-white p-2"
                      />
                      <span className="text-xs leading-6 text-white/65">نشان اعتماد ثبت‌شده فروشگاه</span>
                    </div>
                  ) : (
                    <p className="mt-1 text-xs leading-6 text-white/62">در حال تکمیل اطلاعات اعتماد فروشگاه</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h4 className="mb-5 flex items-center gap-2 text-lg font-black text-white">
                <ChevronLeft className="h-5 w-5 text-accent" />
                دسترسی سریع
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="group flex items-center justify-between rounded-xl px-2 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-accent">
                      <span>{link.name}</span>
                      <ChevronLeft className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h4 className="mb-5 flex items-center gap-2 text-lg font-black text-white">
                <ChevronLeft className="h-5 w-5 text-accent" />
                دسته‌بندی‌های پرکاربرد
              </h4>
              <ul className="space-y-3">
                {popularCategories.length ? popularCategories.map((category) => (
                  <li key={`${category.slug}-${category.name}`}>
                    <Link
                      href={category.href || `/products?category=${encodeURIComponent(category.slug)}`}
                      className="group flex items-center justify-between rounded-xl px-2 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-accent"
                    >
                      <span>{category.name}</span>
                      <ChevronLeft className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                )) : (
                  <li>
                    <Link
                      href="/categories"
                      className="group flex items-center justify-between rounded-xl px-2 py-1.5 text-sm text-white/70 transition-colors hover:bg-white/[0.06] hover:text-accent"
                    >
                      <span>مشاهده همه دسته‌بندی‌ها</span>
                      <ChevronLeft className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </section>

          <section className="space-y-5 lg:col-span-4">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/10 backdrop-blur">
              <h4 className="mb-5 text-lg font-black text-white">اطلاعات تماس</h4>
              <div className="space-y-4 text-sm text-white/75">
                <a href={`tel:${normalizeTel(landline)}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3 transition-colors hover:bg-white/[0.08] hover:text-white">
                  <Phone className="h-5 w-5 shrink-0 text-accent" />
                  <span className="text-white/62">تلفن ثابت:</span>
                  <strong dir="ltr" className="mr-auto text-white">{landline}</strong>
                </a>
                <a href={`tel:${normalizeTel(supportPhone)}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3 transition-colors hover:bg-white/[0.08] hover:text-white">
                  <Smartphone className="h-5 w-5 shrink-0 text-accent" />
                  <span className="text-white/62">موبایل / پشتیبانی:</span>
                  <strong dir="ltr" className="mr-auto text-white">{supportPhone}</strong>
                </a>
                <a href={telegramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3 transition-colors hover:bg-white/[0.08] hover:text-white">
                  <Send className="h-5 w-5 shrink-0 text-accent" />
                  <span className="text-white/62">تلگرام:</span>
                  <strong dir="ltr" className="mr-auto text-white">{telegramUsername}</strong>
                </a>
                {email && (
                  <a href={`mailto:${email}`} className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3 transition-colors hover:bg-white/[0.08] hover:text-white">
                    <Mail className="h-5 w-5 shrink-0 text-accent" />
                    <span className="text-white/62">ایمیل:</span>
                    <strong dir="ltr" className="mr-auto break-all text-left text-white">{email}</strong>
                  </a>
                )}
                {workingHours && (
                  <div className="flex items-start gap-3 rounded-2xl bg-white/[0.05] p-3">
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <span className="block text-white/62">ساعات پاسخگویی</span>
                      <strong className="mt-1 block text-white">{workingHours}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {channels.map((channel) => (
                  <span key={channel} className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1.5 text-xs font-bold text-white/78">
                    {channel}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/18 to-white/[0.04] p-6 shadow-xl shadow-accent/5">
              <div className="mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-accent" />
                <h4 className="text-lg font-black text-white">استعلام قیمت و موجودی</h4>
              </div>
              <p className="text-sm leading-7 text-white/72">
                برای استعلام سریع قیمت، موجودی و دریافت مشاوره فنی، تصویر سبد خرید یا لیست اقلام خود را از طریق پیام‌رسان ارسال کنید.
              </p>
              <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <Button asChild className="rounded-2xl bg-accent text-accent-foreground hover:bg-accent/90">
                  <a href={telegramUrl} target="_blank" rel="noreferrer">
                    <Send className="ml-2 h-4 w-4" />
                    تلگرام
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-2xl border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary">
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">
                    <MessageCircle className="ml-2 h-4 w-4" />
                    واتساپ
                  </a>
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/62">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1">بله</span>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1">روبیکا</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-7 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="flex items-start gap-3">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-accent" />
              <div>
                <h4 className="font-black text-white">آدرس فروشگاه</h4>
                <p className="mt-2 max-w-4xl text-sm leading-8 text-white/70">{address}</p>
              </div>
            </div>
            <Button asChild variant="outline" className="rounded-2xl border-white/15 bg-white/[0.06] text-white hover:bg-white hover:text-primary">
              <Link href="/contact">مشاهده صفحه تماس</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
            <p>{safeCopyright}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href="#" className="transition-colors hover:text-accent">قوانین و مقررات</a>
              <a href="#" className="transition-colors hover:text-accent">حریم خصوصی</a>
              <Link href="/contact" className="transition-colors hover:text-accent">تماس با ما</Link>
              {isValidExternalUrl(telegramUrl) && (
                <a href={telegramUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">تلگرام</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
