import type { Metadata } from "next"
import { CategoriesPage } from "@/components/categories/categories-page"
import { getCategoriesWithProductCounts } from "@/lib/services/categories-service"
import type { Category } from "@/types/category"

export const metadata: Metadata = {
  title: "دسته‌بندی تجهیزات | ساکو الکتریک",
  description: "مشاهده دسته‌بندی تجهیزات برق صنعتی شامل تابلو برق، کابل و سیم، سنسور و ابزار دقیق، الکتروموتور، اینورتر، PLC، کنتاکتور، کلید و فیوز در ساکو الکتریک.",
}

export const dynamic = "force-dynamic"

export default async function Page() {
  let categories: Category[] = []

  try {
    categories = await getCategoriesWithProductCounts()
  } catch (error) {
    console.error("Failed to load public categories page:", error)
  }

  return <CategoriesPage categories={categories} />
}
