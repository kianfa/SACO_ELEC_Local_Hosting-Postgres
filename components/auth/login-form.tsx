"use client"

import Link from "next/link"
import { useActionState, useEffect, useState } from "react"
import { Lock, LogIn, Mail } from "lucide-react"
import { toast } from "sonner"
import { loginCustomerAction, type AuthActionState } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TurnstileCaptcha } from "@/components/auth/turnstile-captcha"

const initialState: AuthActionState = { ok: false, message: "" }

export function LoginForm() {
  const [captchaToken, setCaptchaToken] = useState("")
  const [state, formAction, isPending] = useActionState(loginCustomerAction, initialState)

  useEffect(() => {
    if (state.message && !state.ok) toast.error(state.message)
  }, [state])

  return (
    <Card className="mx-auto w-full max-w-md rounded-3xl border-border/70 shadow-xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-accent">
          <LogIn className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl text-primary">ورود به حساب کاربری</CardTitle>
        <p className="text-sm leading-7 text-muted-foreground">
          برای مشاهده حساب کاربری، پیگیری خریدها و ثبت سریع‌تر سفارش وارد شوید.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="turnstileToken" value={captchaToken} />
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" dir="ltr" required className="pr-10 text-left" placeholder="you@example.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" name="password" type="password" required className="pr-10" />
            </div>
          </div>
          <TurnstileCaptcha token={captchaToken} onTokenChange={setCaptchaToken} />
          <Button type="submit" disabled={isPending || !captchaToken} className="h-12 w-full rounded-xl bg-primary text-base hover:bg-primary/90">
            {isPending ? "در حال ورود..." : "ورود به حساب کاربری"}
          </Button>
          <div className="flex flex-col gap-2 text-center text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <Link href="/auth/register" className="font-medium text-primary hover:text-accent">ایجاد حساب جدید</Link>
            <Link href="/auth/forgot-password" className="font-medium text-primary hover:text-accent">فراموشی رمز عبور</Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
