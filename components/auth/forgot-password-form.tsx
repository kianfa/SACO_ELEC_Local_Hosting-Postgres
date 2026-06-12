"use client"

import Link from "next/link"
import { useActionState, useEffect } from "react"
import { KeyRound, Mail } from "lucide-react"
import { toast } from "sonner"
import { forgotPasswordAction, type AuthActionState } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: AuthActionState = { ok: false, message: "" }

export function ForgotPasswordForm() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState)

  useEffect(() => {
    if (!state.message) return
    if (state.ok) toast.success(state.message)
    else toast.error(state.message)
  }, [state])

  return (
    <Card className="mx-auto w-full max-w-md rounded-3xl border-border/70 shadow-xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-accent">
          <KeyRound className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl text-primary">بازیابی رمز عبور</CardTitle>
        <p className="text-sm leading-7 text-muted-foreground">ایمیل حساب کاربری خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود.</p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" dir="ltr" required className="pr-10 text-left" placeholder="you@example.com" />
            </div>
          </div>
          <Button type="submit" disabled={isPending} className="h-12 w-full rounded-xl bg-primary text-base hover:bg-primary/90">
            {isPending ? "در حال ارسال..." : "ارسال لینک بازیابی رمز عبور"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="font-medium text-primary hover:text-accent">بازگشت به ورود</Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
