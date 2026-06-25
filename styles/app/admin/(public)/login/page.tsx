import Link from "next/link"
import { Zap } from "lucide-react"
import { AdminLoginForm } from "@/components/admin/auth/admin-login-form"

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const accessDenied = params?.error === "access-denied"

  return (
    <main className="min-h-screen bg-muted/30" dir="rtl">
      <div className="container mx-auto flex min-h-screen flex-col px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-accent">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <div className="font-bold text-primary">الکتروساکو</div>
              <div className="text-xs text-muted-foreground">فروشگاه تجهیزات برق صنعتی</div>
            </div>
          </Link>
          <Link href="/" className="rounded-xl border bg-card px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted">
            بازگشت به سایت
          </Link>
        </div>

        <div className="grid flex-1 place-items-center py-10">
          <div className="w-full max-w-md space-y-4">
            {accessDenied ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                شما دسترسی مدیر ندارید
              </div>
            ) : null}
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </main>
  )
}
