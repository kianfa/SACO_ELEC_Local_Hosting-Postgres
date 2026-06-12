import type { Metadata } from "next"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "ثبت نام | ساکو الکتریک",
  description: "ایجاد حساب کاربری مشتریان در فروشگاه تجهیزات برق صنعتی ساکو الکتریک.",
}

export default function Page() {
  return (
    <AuthPageShell title="ایجاد حساب کاربری">
      <RegisterForm />
    </AuthPageShell>
  )
}
