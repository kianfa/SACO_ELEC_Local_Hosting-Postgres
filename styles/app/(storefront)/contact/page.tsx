import type { Metadata } from "next"
import { ContactPage } from "@/components/contact/contact-page"

export const metadata: Metadata = {
  title: "تماس با ما | الکتروساکو",
  description: "تماس با الکتروساکو برای استعلام قیمت، مشاوره فنی، ثبت سفارش و پشتیبانی تجهیزات برق صنعتی.",
}

export default function Page() {
  return <ContactPage />
}
