import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, ClipboardList, Home, LogOut, MapPin, PackageCheck, ShieldCheck, UserCircle } from "lucide-react"
import { requireCustomerAccess } from "@/lib/auth/customer-auth"
import { logoutCustomerAction } from "@/lib/actions/auth-actions"
import { TopBar } from "@/components/top-bar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "حساب کاربری من | ساکو الکتریک",
  description: "مشاهده اطلاعات حساب کاربری مشتریان ساکو الکتریک.",
}

export default async function Page() {
  const user = await requireCustomerAccess()

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
                  <BreadcrumbPage>حساب کاربری من</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge className="mb-3 bg-accent/15 text-accent hover:bg-accent/20">حساب مشتری</Badge>
                <h1 className="text-3xl font-bold text-primary md:text-4xl">حساب کاربری من</h1>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  اطلاعات حساب کاربری شما برای ثبت سریع‌تر سفارش و ارتباط بهتر با پشتیبانی ساکو الکتریک استفاده می‌شود.
                </p>
              </div>
              <form action={logoutCustomerAction}>
                <Button type="submit" variant="outline" className="rounded-xl">
                  <LogOut className="ml-2 h-4 w-4" />
                  خروج از حساب کاربری
                </Button>
              </form>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="rounded-3xl border-border/70 shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <UserCircle className="h-6 w-6 text-accent" />
                    اطلاعات کاربر
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <dt className="text-sm text-muted-foreground">نام و نام خانوادگی</dt>
                      <dd className="mt-2 font-semibold text-primary">{user.fullName || "ثبت نشده"}</dd>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <dt className="text-sm text-muted-foreground">ایمیل</dt>
                      <dd className="mt-2 break-all font-semibold text-primary" dir="ltr">{user.email || "ثبت نشده"}</dd>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <dt className="text-sm text-muted-foreground">شماره موبایل</dt>
                      <dd className="mt-2 font-semibold text-primary" dir="ltr">{user.phone || "ثبت نشده"}</dd>
                    </div>
                    <div className="rounded-2xl bg-muted/50 p-4">
                      <dt className="text-sm text-muted-foreground">نقش کاربر</dt>
                      <dd className="mt-2 font-semibold text-primary">{user.role === "customer" ? "مشتری" : user.role || "مشتری"}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/70 bg-primary text-primary-foreground shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-accent" />
                    امکانات آینده
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: PackageCheck, title: "سفارش‌های من" },
                    { icon: MapPin, title: "آدرس‌های من" },
                    { icon: ClipboardList, title: "پیگیری خرید" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between rounded-2xl bg-white/10 p-3">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-accent" />
                        <span className="text-sm">{item.title}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/15 text-primary-foreground hover:bg-white/20">به‌زودی</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
