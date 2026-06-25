import type { ReactNode } from "react"
import { Building2, UserRound } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface CustomerInfoFormProps {
  showErrors?: boolean
}

function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-1 text-xs font-medium text-destructive">{children}</p>
}

export function CustomerInfoForm({ showErrors = false }: CustomerInfoFormProps) {
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <UserRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold leading-8 text-foreground md:text-xl">اطلاعات خریدار</h2>
          <p className="text-sm leading-7 text-muted-foreground">اطلاعات تماس و نوع خریدار را وارد کنید.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="fullName">نام و نام خانوادگی</Label>
          <Input id="fullName" placeholder="مثلاً علی رضایی" className="mt-2 h-12 rounded-xl" aria-invalid={showErrors} />
          {showErrors && <FieldError>وارد کردن نام خریدار الزامی است.</FieldError>}
        </div>
        <div>
          <Label htmlFor="mobile">شماره موبایل</Label>
          <Input id="mobile" placeholder="۰۹xxxxxxxxx" className="mt-2 h-12 rounded-xl" aria-invalid={showErrors} />
          {showErrors && <FieldError>شماره موبایل معتبر نیست.</FieldError>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="email">ایمیل</Label>
          <Input id="email" type="email" placeholder="example@company.com" className="mt-2 h-12 rounded-xl text-left" dir="ltr" />
        </div>
      </div>

      <div className="mt-5">
        <Label>نوع خریدار</Label>
        <RadioGroup defaultValue="person" className="mt-3 grid gap-3 sm:grid-cols-2" dir="rtl">
          <Label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/50">
            <RadioGroupItem value="person" />
            <UserRound className="h-5 w-5 text-primary" />
            <span className="font-bold">شخص حقیقی</span>
          </Label>
          <Label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/50">
            <RadioGroupItem value="company" />
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-bold">شرکت / سازمان</span>
          </Label>
        </RadioGroup>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="companyName">نام شرکت</Label>
          <Input id="companyName" placeholder="نام شرکت یا سازمان" className="mt-2 h-12 rounded-xl" />
        </div>
        <div>
          <Label htmlFor="taxId">شناسه ملی / کد اقتصادی</Label>
          <Input id="taxId" placeholder="شناسه ملی یا کد اقتصادی" className="mt-2 h-12 rounded-xl" />
        </div>
      </div>

      <Label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl bg-muted/40 p-3 text-sm font-semibold">
        <Checkbox />
        <span>درخواست فاکتور رسمی</span>
      </Label>
    </section>
  )
}
