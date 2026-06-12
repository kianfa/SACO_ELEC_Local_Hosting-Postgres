"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SpecTable } from "./spec-table"
import { DocumentCard } from "./document-card"
import { ReviewSection } from "./review-section"
import { FAQSection } from "./faq-section"

interface ProductTabsProps {
  fullSpecs: { label: string; value: string }[]
  description: string
  documents: { name: string; type: string; size: string }[]
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
    <Tabs defaultValue="specs" className="w-full max-w-full">
      <TabsList className="mb-6 flex h-auto w-full flex-nowrap justify-start gap-2 overflow-x-auto bg-transparent p-0 pb-2 scrollbar-hide">
        <TabsTrigger
          value="specs"
          className="shrink-0 rounded-xl px-4 py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          مشخصات فنی
        </TabsTrigger>
        <TabsTrigger
          value="description"
          className="shrink-0 rounded-xl px-4 py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          توضیحات محصول
        </TabsTrigger>
        <TabsTrigger
          value="documents"
          className="shrink-0 rounded-xl px-4 py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          دیتاشیت و مستندات
        </TabsTrigger>
        <TabsTrigger
          value="reviews"
          className="shrink-0 rounded-xl px-4 py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          نظرات کاربران
        </TabsTrigger>
        <TabsTrigger
          value="faq"
          className="shrink-0 rounded-xl px-4 py-3 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground sm:px-6 sm:text-sm"
        >
          سوالات متداول
        </TabsTrigger>
      </TabsList>

      <TabsContent value="specs" className="mt-0">
        <SpecTable specs={fullSpecs} />
      </TabsContent>

      <TabsContent value="description" className="mt-0">
        <div className="prose prose-sm md:prose-base max-w-none text-muted-foreground leading-relaxed">
          {description.split("\n\n").map((paragraph, index) => (
            <p key={index} className="mb-4 whitespace-pre-line">
              {paragraph}
            </p>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="documents" className="mt-0">
        <div className="space-y-3">
          {documents.map((doc, index) => (
            <DocumentCard key={index} {...doc} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reviews" className="mt-0">
        <ReviewSection
          reviews={reviews}
          averageRating={averageRating}
          totalReviews={totalReviews}
        />
      </TabsContent>

      <TabsContent value="faq" className="mt-0">
        <FAQSection faqs={faqs} />
      </TabsContent>
    </Tabs>
  )
}
