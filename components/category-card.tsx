import { ChevronLeft } from "lucide-react"
import { CategoryImage } from "@/components/common/category-image"

interface CategoryCardProps {
  name: string
  image: string | null
  fallbackImage?: string | null
  altText?: string | null
  fallbackAltText?: string | null
  href: string
}

export function CategoryCard({ name, image, fallbackImage = null, altText, fallbackAltText, href }: CategoryCardProps) {
  return (
    <a
      href={href}
      className="group flex h-full min-h-[178px] flex-col items-center justify-between rounded-2xl border border-border bg-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <CategoryImage src={image} iconSrc={fallbackImage} alt={altText || name} iconAlt={fallbackAltText || name} size="card" className="mb-3" />
      <span className="line-clamp-2 min-h-11 text-sm font-bold leading-6 text-foreground md:text-base">{name}</span>
      <div className="mt-2 flex items-center gap-1 text-muted-foreground transition-colors group-hover:text-primary">
        <ChevronLeft className="h-4 w-4" />
      </div>
    </a>
  )
}
