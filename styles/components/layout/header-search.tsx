"use client"

import { FormEvent, KeyboardEvent, Suspense, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ImageIcon, Loader2, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ProductSearchSuggestion } from "@/types/product"
import { ProductImage } from "@/components/common/product-image"

interface HeaderSearchProps {
  compact?: boolean
  placeholder?: string
}

function formatPrice(price: number): string {
  return `${price.toLocaleString("en-US")} تومان`
}

function getSuggestionMeta(product: ProductSearchSuggestion): string {
  const parts = [
    product.model ? `مدل: ${product.model}` : null,
    product.sku ? `SKU: ${product.sku}` : null,
    product.brandName,
    product.categoryName,
  ].filter(Boolean)

  return parts.join(" | ")
}

function ProductSuggestionImage({ product }: { product: ProductSearchSuggestion }) {
  return <ProductImage src={product.mainImageUrl} alt={product.mainImageAlt || product.name} size="search" />
}

function HeaderSearchInner({
  compact = false,
  placeholder = "جستجو برای محصولات، برندها، کد فنی و ...",
}: HeaderSearchProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<ProductSearchSuggestion[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)

  const trimmedQuery = query.trim()
  const canShowDropdown = isFocused && trimmedQuery.length >= 2
  const viewAllHref = `/products?search=${encodeURIComponent(trimmedQuery)}`

  useEffect(() => {
    if (pathname === "/products") {
      setQuery(searchParams.get("search") ?? "")
      return
    }

    setQuery("")
  }, [pathname, searchParams])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsFocused(false)
        setHighlightedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const searchValue = query.trim()

    if (searchValue.length < 2) {
      setSuggestions([])
      setIsLoading(false)
      setHighlightedIndex(-1)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/search/products?q=${encodeURIComponent(searchValue)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("Suggestions request failed")
        }

        const payload = (await response.json()) as { products?: ProductSearchSuggestion[] }
        setSuggestions(payload.products ?? [])
        setHighlightedIndex(-1)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }, 300)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [query])

  const navigateToSearch = () => {
    if (!trimmedQuery) {
      router.push("/products")
      setIsFocused(false)
      return
    }

    router.push(viewAllHref)
    setIsFocused(false)
  }

  const navigateToSuggestion = (product: ProductSearchSuggestion) => {
    router.push(`/products/${product.slug}`)
    setIsFocused(false)
    setHighlightedIndex(-1)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    navigateToSearch()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!canShowDropdown) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      const maxIndex = suggestions.length // last index is view-all row
      setHighlightedIndex((current) => (current >= maxIndex ? 0 : current + 1))
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()
      const maxIndex = suggestions.length
      setHighlightedIndex((current) => (current <= 0 ? maxIndex : current - 1))
      return
    }

    if (event.key === "Enter") {
      if (highlightedIndex >= 0) {
        event.preventDefault()
        if (highlightedIndex < suggestions.length) {
          navigateToSuggestion(suggestions[highlightedIndex])
        } else {
          navigateToSearch()
        }
      }
      return
    }

    if (event.key === "Escape") {
      setIsFocused(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search" className="relative w-full">
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="جستجوی محصولات"
          aria-expanded={canShowDropdown}
          aria-controls="header-search-suggestions"
          className={
            compact
              ? "w-full pr-4 pl-20 py-5 rounded-xl border-2 border-border"
              : "w-full pr-4 pl-20 py-6 rounded-xl border-2 border-border focus:border-primary text-base"
          }
        />
        {query && (
          <button
            type="button"
            aria-label="پاک کردن جستجو"
            onClick={() => {
              setQuery("")
              setSuggestions([])
              setHighlightedIndex(-1)
            }}
            className="absolute left-14 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <Button
          type="submit"
          size="icon"
          aria-label="جستجو"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90 rounded-lg"
        >
          <Search className="w-5 h-5" />
        </Button>
      </form>

      {canShowDropdown && (
        <div
          id="header-search-suggestions"
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[80] w-full overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        >
          <div className="max-h-[420px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                در حال جستجو...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="space-y-1">
                {suggestions.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => navigateToSuggestion(product)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition ${
                      highlightedIndex === index ? "bg-primary/10" : "hover:bg-muted"
                    }`}
                  >
                    <ProductSuggestionImage product={product} />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 block text-sm font-bold text-foreground">
                        {product.name}
                      </span>
                      <span className="line-clamp-1 block text-xs text-muted-foreground">
                        {getSuggestionMeta(product) || "تجهیزات برق صنعتی"}
                      </span>
                      <span className="mt-1 block text-xs font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                <ImageIcon className="h-4 w-4" />
                نتیجه‌ای پیدا نشد
              </div>
            )}

            <Link
              href={viewAllHref}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setIsFocused(false)}
              onMouseEnter={() => setHighlightedIndex(suggestions.length)}
              className={`mt-2 flex items-center justify-between rounded-xl border border-primary/15 px-4 py-3 text-sm font-bold text-primary transition ${
                highlightedIndex === suggestions.length ? "bg-primary/10" : "bg-primary/5 hover:bg-primary/10"
              }`}
            >
              <span>مشاهده همه نتایج برای «{trimmedQuery}»</span>
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function HeaderSearch(props: HeaderSearchProps) {
  return (
    <Suspense
      fallback={
        <div className="relative w-full">
          <Input
            type="search"
            disabled
            placeholder={props.placeholder ?? "جستجو برای محصولات، برندها، کد فنی و ..."}
            className={
              props.compact
                ? "w-full pr-4 pl-12 py-5 rounded-xl border-2 border-border"
                : "w-full pr-4 pl-12 py-6 rounded-xl border-2 border-border text-base"
            }
          />
          <Button
            disabled
            size="icon"
            className="absolute left-1.5 top-1/2 -translate-y-1/2 bg-primary rounded-lg"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
      }
    >
      <HeaderSearchInner {...props} />
    </Suspense>
  )
}
