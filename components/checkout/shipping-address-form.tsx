import { MapPin } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ShippingAddressFormProps {
  showErrors?: boolean
}

export function ShippingAddressForm({ showErrors = false }: ShippingAddressFormProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MapPin className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-foreground">آدرس ارسال</h2>
          <p className="text-sm text-muted-foreground">آدرس محل تحویل تجهیزات را تکمیل کنید.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="province">استان</Label>
          <Input id="province" placeholder="تهران" className="mt-2 h-12 rounded-xl" aria-invalid={showErrors} />
        </div>
        <div>
          <Label htmlFor="city">شهر</Label>
          <Input id="city" placeholder="تهران" className="mt-2 h-12 rounded-xl" aria-invalid={showErrors} />
        </div>
        <div>
          <Label htmlFor="postalCode">کد پستی</Label>
          <Input id="postalCode" placeholder="۱۲۳۴۵۶۷۸۹۰" className="mt-2 h-12 rounded-xl" aria-invalid={showErrors} />
        </div>
        <div>
          <Label htmlFor="unit">پلاک / واحد</Label>
          <Input id="unit" placeholder="پلاک ۱۲، واحد ۳" className="mt-2 h-12 rounded-xl" />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="address">آدرس کامل</Label>
          <Textarea id="address" placeholder="خیابان، کوچه، پلاک و جزئیات مسیر" className="mt-2 min-h-24 rounded-xl" aria-invalid={showErrors} />
          {showErrors && <p className="mt-1 text-xs font-medium text-destructive">آدرس ارسال را کامل وارد کنید.</p>}
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="deliveryNote">توضیحات ارسال</Label>
          <Textarea id="deliveryNote" placeholder="مثلاً هماهنگی قبل از ارسال یا محدودیت ورود باربری" className="mt-2 min-h-20 rounded-xl" />
        </div>
      </div>

      <Label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl bg-muted/40 p-3 text-sm font-semibold">
        <Checkbox />
        <span>ذخیره این آدرس برای خریدهای بعدی</span>
      </Label>
    </section>
  )
}
