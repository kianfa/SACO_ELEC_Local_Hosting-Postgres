import type { Metadata } from "next"
import { BrandsPage } from "@/components/brands/brands-page"
import { getBrandsWithProductCounts } from "@/lib/services/brands-service"
import type { Brand } from "@/types/brand"

export const metadata: Metadata = {
  title: "برندها | الکتروساکو",
  description: "مشاهده برندهای معتبر تجهیزات برق صنعتی در فروشگاه الکتروساکو؛ Schneider Electric، Siemens، ABB، Delta، Omron، Danfoss و سایر برندها.",
}

export const dynamic = "force-dynamic"

export default async function Page() {
  let brands: Brand[] = []

  try {
    brands = await getBrandsWithProductCounts()
  } catch (error) {
    console.error("Failed to load public brands page:", error)
  }

  return <BrandsPage brands={brands} />
}
