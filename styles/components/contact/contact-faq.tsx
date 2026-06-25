"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { storeContactConfig } from "@/lib/store-contact-config"
import { useContactInfo } from "@/components/site-settings-provider"

function buildFaqs(supportPhone: string, telegramUsername: string) {
  return [
    {
      question: "چطور سفارش خود را نهایی کنم؟",
      answer:
        "ابتدا محصولات را به سبد خرید اضافه کنید، سپس تصویر سبد خرید را از طریق تلگرام، واتساپ، بله یا روبیکا ارسال نمایید تا موجودی و قیمت نهایی تأیید شود.",
    },
    {
      question: "آیا پرداخت اینترنتی فعال است؟",
      answer: "در حال حاضر پرداخت اینترنتی فعال نیست و پرداخت پس از هماهنگی با پشتیبانی به‌صورت کارت‌به‌کارت انجام می‌شود.",
    },
    {
      question: "آیا امکان استعلام قیمت پروژه‌ای وجود دارد؟",
      answer:
        "بله، برای خریدهای پروژه‌ای، تعداد بالا و دریافت پیش‌فاکتور می‌توانید با پشتیبانی تماس بگیرید یا در تلگرام پیام ارسال کنید.",
    },
    {
      question: "برای پیگیری سفارش با چه شماره‌ای تماس بگیرم؟",
      answer: `برای پیگیری سفارش با شماره ${supportPhone} تماس بگیرید یا در تلگرام به ${telegramUsername} پیام دهید.`,
    },
  ]
}

export function ContactFAQ() {
  const contact = useContactInfo()
  const supportPhone = contact.supportPhone || contact.mobile || storeContactConfig.mobile
  const telegramUsername = contact.telegramUsername || storeContactConfig.telegram.username
  const faqs = buildFaqs(supportPhone, telegramUsername)
  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm md:p-7">
      <div className="mb-5">
        <h2 className="text-2xl font-black text-foreground">سوالات متداول تماس و ثبت سفارش</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">پاسخ چند پرسش رایج درباره خرید و هماهنگی سفارش در الکتروساکو.</p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={faq.question} value={`item-${index}`}>
            <AccordionTrigger className="text-right font-bold">{faq.question}</AccordionTrigger>
            <AccordionContent className="leading-8 text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
