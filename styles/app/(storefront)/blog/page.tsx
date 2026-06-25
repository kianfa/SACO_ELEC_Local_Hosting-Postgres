import type { Metadata } from "next"
import { BlogComingSoonPage } from "@/components/blog/blog-coming-soon-page"

export const metadata: Metadata = {
  title: "وبلاگ | الکتروساکو",
  description: "وبلاگ تخصصی الکتروساکو به‌زودی با مقالات آموزشی، راهنمای خرید تجهیزات برق صنعتی و نکات فنی راه‌اندازی می‌شود.",
}

export default function Page() {
  return <BlogComingSoonPage />
}
