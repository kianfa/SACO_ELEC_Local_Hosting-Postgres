"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    setIsSubmitting(true)
    window.setTimeout(() => {
      setIsSubmitting(false)
      toast.success("پیام شما ثبت شد. برای پیگیری سریع‌تر لطفاً از تلگرام یا تماس تلفنی استفاده کنید.")
      form.reset()
    }, 600)
  }

  return (
    <Card className="rounded-3xl border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-black">ارسال پیام</CardTitle>
        <CardDescription className="leading-7">
          برای پاسخ‌گویی سریع‌تر، پیشنهاد می‌شود از طریق تلگرام یا تماس تلفنی با ما در ارتباط باشید.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">نام و نام خانوادگی</Label>
              <Input id="fullName" name="fullName" required className="rounded-xl" placeholder="نام خود را وارد کنید" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره تماس</Label>
              <Input id="phone" name="phone" required dir="ltr" className="rounded-xl text-left" placeholder="09xxxxxxxxx" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">موضوع</Label>
            <Input id="subject" name="subject" required className="rounded-xl" placeholder="مثلاً استعلام قیمت یا پیگیری سفارش" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">پیام</Label>
            <Textarea id="message" name="message" required className="min-h-32 rounded-xl" placeholder="متن پیام خود را بنویسید..." />
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-primary py-6 text-base md:w-fit md:px-8">
            <Send className="ml-2 h-5 w-5" />
            {isSubmitting ? "در حال ثبت پیام..." : "ارسال پیام"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
