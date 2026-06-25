"use client"

import { Star, ThumbsUp, User } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Review {
  id: number
  author: string
  role: string
  rating: number
  date: string
  comment: string
  helpful: number
}

interface ReviewSectionProps {
  reviews: Review[]
  averageRating: number
  totalReviews: number
}

export function ReviewSection({
  reviews,
  averageRating,
  totalReviews,
}: ReviewSectionProps) {
  return (
    <div dir="rtl" className="space-y-6 text-right">
      {/* Summary */}
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-muted/50 p-4 text-right md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{averageRating}</p>
            <div className="flex items-center gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating)
                      ? "fill-accent text-accent"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              از {totalReviews} نظر
            </p>
          </div>
        </div>
        <Button variant="outline" className="rounded-xl">
          ثبت نظر جدید
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="space-y-3 rounded-2xl border border-border bg-card p-4 text-right"
          >
            <div className="flex items-start justify-between gap-4 text-right">
              <div className="flex items-center gap-3 text-right">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.role}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-accent text-accent"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {review.date}
                </p>
              </div>
            </div>
            <p className="text-right leading-relaxed text-muted-foreground">
              {review.comment}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <Button variant="ghost" size="sm" className="gap-2 text-xs">
                <ThumbsUp className="h-4 w-4" />
                <span>مفید بود ({review.helpful})</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
