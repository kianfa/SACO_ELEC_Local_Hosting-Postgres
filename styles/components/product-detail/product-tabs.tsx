"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpecTable } from "./spec-table"
import { DocumentCard } from "./document-card"
import { ReviewSection } from "./review-section"
import { FAQSection } from "./faq-section"

interface ProductTabsProps {
  fullSpecs: { label: string; value: string }[]
  description: string
  documents: { name: string; type: string; size: string; fileUrl: string }[]
  reviews: {
    id: number
    author: string
    role: string
    rating: number
    date: string
    comment: string
    helpful: number
  }[]
  faqs: { question: string; answer: string }[]
  averageRating: number
  totalReviews: number
}

export function ProductTabs({
  fullSpecs,
  description,
  documents,
  reviews,
  faqs,
  averageRating,
  totalReviews,
}: ProductTabsProps) {
  return (
    <Tabs defaultValue="specs" dir="rtl" className="w-full max-w-full text-right">
      <TabsList dir="rtl" className="mb-6 flex h-auto w-full flex-nowrap justify-start gap-2 overflow-x-auto bg-transparent p-0 pb-2 text-right scrollbar-hide">
        <TabsTrigger
          value="specs"
          className="shrink-0 rounded-xl px-4 py-3 text-right text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          مشخصات فنی
        </TabsTrigger>
        <TabsTrigger
          value="description"
          className="shrink-0 rounded-xl px-4 py-3 text-right text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          توضیحات محصول
        </TabsTrigger>
        <TabsTrigger
          value="documents"
          className="shrink-0 rounded-xl px-4 py-3 text-right text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          دیتاشیت و مستندات
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="shrink-0 rounded-xl px-4 py-3 text-right text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          نظرات کاربران
        </TabsTrigger>
        <TabsTrigger
          value="faq"
          className="shrink-0 rounded-xl px-4 py-3 text-right text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          سوالات متداول
        </TabsTrigger>
      </TabsList>

      <TabsContent value="specs" dir="rtl" className="mt-0 text-right">
        <SpecTable specs={fullSpecs} />
      </TabsContent>

      <TabsContent value="description" dir="rtl" className="mt-0 text-right">
        <div dir="rtl" className="prose prose-sm md:prose-base max-w-none text-right leading-relaxed text-muted-foreground">
          {description.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4 whitespace-pre-line text-right">
              {paragraph}
            </p>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="documents" dir="rtl" className="mt-0 text-right">
        <div dir="rtl" className="space-y-3 text-right">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <DocumentCard key={doc.fileUrl || doc.name} {...doc} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-right text-sm text-muted-foreground">
              هنوز دیتاشیت یا سندی برای این محصول ثبت نشده است.
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="reviews" dir="rtl" className="mt-0 text-right">
        <ReviewSection
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={totalReviews}
        />
      </TabsContent>

      <TabsContent value="faq" dir="rtl" className="mt-0 text-right">
        <FAQSection faqs={faqs} />
      </TabsContent>
    </Tabs>
  )
}
