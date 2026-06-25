import Link from "next/link"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ImagePlus, LayoutTemplate, Megaphone, Settings, ArrowLeft, Grid3X3 } from "lucide-react"

const cards = [
  { href: "/admin/content/homepage", title: "مدیریت صفحه اصلی", text: "ویرایش hero، بنر تبلیغاتی، نکات اعتماد و تصاویر اصلی سایت", icon: LayoutTemplate },
  { href: "/admin/content/banners", title: "مدیریت بنرها", text: "افزودن و ویرایش بنرهای تبلیغاتی برای صفحه اصلی، محصولات و checkout", icon: Megaphone },
  { href: "/admin/content/homepage-categories", title: "دسته‌بندی‌های صفحه اصلی", text: "مدیریت عنوان بخش، تصاویر، ترتیب و نمایش کارت‌های دسته‌بندی زیر هیرو", icon: Grid3X3 },
  { href: "/admin/content/settings", title: "تنظیمات تماس و فوتر", text: "اطلاعات تماس، شبکه‌های اجتماعی، فوتر و متن پرداخت دستی", icon: Settings },
  { href: "/admin/content/homepage", title: "مدیریت عکس‌های سایت", text: "آپلود تصاویر عمومی سایت در فضای ذخیره‌سازی MinIO", icon: ImagePlus },
]

export default function AdminContentPage() {
  return (
    <AdminLayout title="محتوای سایت" subtitle="مدیریت متن‌ها، تصاویر و بنرهای عمومی فروشگاه بدون ویرایش کد">
      <div className="grid gap-5 md:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.href + card.title} className="rounded-2xl shadow-sm transition hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Icon className="h-7 w-7" /></div>
                <h2 className="text-xl font-black text-primary">{card.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{card.text}</p>
                <Button asChild className="mt-5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"><Link href={card.href}>ورود به بخش <ArrowLeft className="mr-2 h-4 w-4" /></Link></Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="mt-6 rounded-2xl border border-accent/30 bg-accent/10 p-5 text-sm leading-7 text-muted-foreground">
        تصاویر جدید در فضای ذخیره‌سازی MinIO ذخیره می‌شوند و فقط آدرس عمومی آن‌ها در دیتابیس ثبت می‌شود.
      </div>
    </AdminLayout>
  )
}
