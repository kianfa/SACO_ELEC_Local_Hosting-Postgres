"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQ {
  question: string
  answer: string
}

interface FAQSectionProps {
  faqs: FAQ[]
}

export function FAQSection({ faqs }: FAQSectionProps) {
  return (
    <Accordion type="single" collapsible dir="rtl" className="space-y-3 text-right">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          value={`faq-${index}`}
          className="rounded-xl border border-border bg-card px-4 text-right"
        >
          <AccordionTrigger dir="rtl" className="py-4 text-right hover:no-underline">
            <span className="flex-1 text-right font-medium">{faq.question}</span>
          </AccordionTrigger>
          <AccordionContent className="pb-4 text-right leading-relaxed text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
