"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { Mail, Phone, UserPlus, UserRound } from "lucide-react"
import { toast } from "sonner"
import { registerCustomerAction, type AuthActionState } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TurnstileCaptcha } from "@/components/auth/turnstile-captcha"

const initialState: AuthActionState = { ok: false, message: "" }

export function RegisterForm() {
  const [captchaToken, setCaptchaToken] = useState("")
  const [state, formAction, isPending] = useActionState(registerCustomerAction, initialState)

  useEffect(() => {
    if (state.message && !state.ok) toast.error(state.message)
  }, [state])

  return (
    <Card className="mx-auto w-full max-w-2xl rounded-3xl border-border/70 shadow-xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-accent">
          <UserPlus className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl text-primary">ایجاد حساب کاربری</CardTitle>
        <p className="text-sm leading-7 text-muted-foreground">
          با ایجاد حساب کاربری، خریدهای بعدی خود را سریع‌تر و ساده‌تر انجام دهید.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="turnstileToken" value={captchaToken} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">نام و نام خانوادگی</Label>
              <div className="relative">
                <UserRound className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="fullName" name="fullName" required className="pr-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره موبایل</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="phone" name="phone" dir="ltr" required className="pr-10 text-left" placeholder="09xxxxxxxxx" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" dir="ltr" required className="pr-10 text-left" placeholder="you@example.com" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
            </div>
          </div>
          <TurnstileCaptcha token={captchaToken} onTokenChange={setCaptchaToken} />
          <Button type="submit" disabled={isPending || !captchaToken} className="h-12 w-full rounded-xl bg-primary text-base hover:bg-primary/90">
            {isPending ? "در حال ثبت نام..." : "ثبت نام"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            قبلاً حساب دارید؟ <Link href="/auth/login" className="font-medium text-primary hover:text-accent">وارد شوید</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
