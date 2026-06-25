import type { Metadata } from "next"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "بازیابی رمز عبور | الکتروساکو",
  description: "بازیابی رمز عبور حساب کاربری مشتریان الکتروساکو.",
}

export default function Page() {
  return (
    <AuthPageShell title="بازیابی رمز عبور">
      <ForgotPasswordForm />
    </AuthPageShell>
  )
}
