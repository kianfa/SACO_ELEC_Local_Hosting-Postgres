import type { Metadata } from "next"
import { ContactPage } from "@/components/contact/contact-page"

export const metadata: Metadata = {
  title: "تماس با ما | ساکو الکتریک",
  description: "تماس با ساکو الکتریک برای استعلام قیمت، مشاوره فنی، ثبت سفارش و پشتیبانی تجهیزات برق صنعتی.",
}

export default function Page() {
  return <ContactPage />
}
