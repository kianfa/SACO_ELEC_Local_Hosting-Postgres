"use client"

import { createContext, useContext } from "react"
import type { FooterCategoryLink } from "@/types/storefront"

const PublicFooterCategoriesContext = createContext<FooterCategoryLink[]>([])

export function PublicFooterCategoriesProvider({
  categories,
  children,
}: {
  categories: FooterCategoryLink[]
  children: React.ReactNode
}) {
  return <PublicFooterCategoriesContext.Provider value={categories}>{children}</PublicFooterCategoriesContext.Provider>
}

export function usePublicFooterCategories(): FooterCategoryLink[] {
  return useContext(PublicFooterCategoriesContext)
}
