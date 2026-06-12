import type { ReactNode } from "react"
import Link from "next/link"
import { LayoutDashboard, Package, Tags, Building2, ShoppingCart, Settings, Zap, LogOut, UserRound, ImagePlus, Percent, Grid3X3, PhoneCall } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCurrentAdminUser } from "@/lib/auth/admin-auth"
import { logoutAdminAction } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"

const links = [
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/brands", label: "برندها", icon: Building2 },
  { href: "/admin/categories", label: "دسته‌بندی‌ها", icon: Grid3X3 },
  { href: "/admin/products/bulk-price-update", label: "تغییر گروهی قیمت‌ها", icon: Percent },
  { href: "/admin/content", label: "محتوای سایت", icon: ImagePlus },
  { href: "/admin/content/homepage-categories", label: "دسته‌بندی‌های صفحه اصلی", icon: Grid3X3 },
  { href: "/admin/content/banners", label: "بنرها", icon: Tags },
  { href: "/admin/purchase-requests", label: "درخواست‌های خرید", icon: PhoneCall },
  { href: "#", label: "سفارش‌ها", icon: ShoppingCart },
  { href: "/admin/content/settings", label: "تنظیمات سایت", icon: Settings },
]

export async function AdminLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const admin = await getCurrentAdminUser()

  return (
    <div className="min-h-screen bg-muted/30" dir="rtl">
      <div className="border-b bg-card shadow-sm">
        <div className="container mx-auto flex max-w-full flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-accent">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-primary">پنل مدیریت ساکو الکتریک</div>
              <div className="text-xs text-muted-foreground">مدیریت فروشگاه تجهیزات برق صنعتی</div>
            </div>
          </Link>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            <div className="hidden items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground md:flex">
              <UserRound className="h-4 w-4" />
              <span>{admin?.fullName || admin?.email || "مدیر"}</span>
            </div>
            <Link href="/products" className="rounded-xl border px-3 py-2 text-xs font-medium hover:bg-muted sm:px-4 sm:text-sm">
              مشاهده سایت
            </Link>
            <form action={logoutAdminAction}>
              <Button type="submit" variant="outline" className="rounded-xl px-3 text-xs text-destructive hover:text-destructive sm:px-4 sm:text-sm">
                <LogOut className="ml-2 h-4 w-4" />
                خروج از پنل
              </Button>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid max-w-full gap-4 px-3 py-4 sm:px-4 sm:py-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-6">
        <aside className="h-fit max-w-full overflow-hidden rounded-2xl border bg-card p-3 shadow-sm lg:sticky lg:top-6">
          <div className="mb-3 flex items-center gap-2 px-3 py-2 text-sm font-bold text-primary">
            <LayoutDashboard className="h-4 w-4" />
            منوی مدیریت
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide lg:grid">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-xl px-3 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary lg:gap-3 lg:text-sm",
                    (link.href === "/admin/products" || link.href === "/admin/products/bulk-price-update" || link.href === "/admin/brands" || link.href === "/admin/categories" || link.href === "/admin/purchase-requests" || link.href.startsWith("/admin/content")) && "bg-primary/10 text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              )
            })}
          </nav>
          <div className="mt-4 hidden rounded-xl bg-accent/10 p-3 text-xs leading-6 text-muted-foreground lg:block">
            دسترسی این بخش با نشست امن کاربری و نقش <span dir="ltr">profiles.role = admin</span> محافظت می‌شود.
          </div>
        </aside>

        <main className="min-w-0 max-w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-black text-primary md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-muted-foreground">{subtitle}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
