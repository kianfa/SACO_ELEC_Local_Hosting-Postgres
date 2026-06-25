"use client"

import { useActionState } from "react"
import { Loader2, LockKeyhole, Mail } from "lucide-react"
import { loginAdminAction, type LoginActionState } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initialState: LoginActionState = { ok: false, message: "" }

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, initialState)
  return (
    <Card className="w-full max-w-md rounded-3xl border bg-card shadow-xl">
      <CardHeader className="space-y-3 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-accent">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <CardTitle className="text-2xl font-black text-primary">ورود مدیر</CardTitle>
        <CardDescription className="leading-7">برای مدیریت محصولات وارد حساب ادمین شوید.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                dir="ltr"
                autoComplete="email"
                placeholder="admin@example.com"
                className="h-12 rounded-xl pr-10 text-left"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 rounded-xl pr-10 text-left"
                required
              />
            </div>
          </div>

          {state.message ? (
            <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {state.message}
            </div>
          ) : null}

          <Button type="submit" className="h-12 w-full rounded-xl bg-primary text-base font-bold text-primary-foreground hover:bg-primary/90" disabled={isPending}>
            {isPending ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : null}
            ورود به پنل مدیریت
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
