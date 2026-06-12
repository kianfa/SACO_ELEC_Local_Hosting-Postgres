import type { Metadata } from "next"
import { AuthPageShell } from "@/components/auth/auth-page-shell"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "بازیابی رمز عبور | ساکو الکتریک",
  description: "بازیابی رمز عبور حساب کاربری مشتریان ساکو الکتریک.",
}

export default function Page() {
  return (
    <AuthPageShell title="بازیابی رمز عبور">
      <ForgotPasswordForm />
    </AuthPageShell>
  )
}
