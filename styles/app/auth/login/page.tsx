import type { Metadata } from "next"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "ورود به حساب کاربری | الکتروساکو",
  description: "ورود مشتریان الکتروساکو برای مشاهده حساب کاربری و ثبت سریع‌تر سفارش.",
}

export default function Page() {
  return (
    <AuthPageShell title="ورود به حساب کاربری">
      <LoginForm />
    </AuthPageShell>
  )
}
