import type { Metadata } from "next"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { RegisterForm } from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "ثبت نام | الکتروساکو",
  description: "ایجاد حساب کاربری مشتریان در فروشگاه تجهیزات برق صنعتی الکتروساکو.",
}

export default function Page() {
  return (
    <AuthPageShell title="ایجاد حساب کاربری">
      <RegisterForm />
    </AuthPageShell>
  )
}
