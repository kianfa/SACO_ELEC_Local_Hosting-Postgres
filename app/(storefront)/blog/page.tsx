import type { Metadata } from "next"
import { BlogComingSoonPage } from "@/components/blog/blog-coming-soon-page"

export const metadata: Metadata = {
  title: "وبلاگ | ساکو الکتریک",
  description: "وبلاگ تخصصی ساکو الکتریک به‌زودی با مقالات آموزشی، راهنمای خرید تجهیزات برق صنعتی و نکات فنی راه‌اندازی می‌شود.",
}

export default function Page() {
  return <BlogComingSoonPage />
}
