import { NextResponse } from "next/server"
import { searchProductSuggestions } from "@/lib/services/products-service"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = (searchParams.get("q") ?? "").trim()

  if (query.length < 2) {
    return NextResponse.json({ products: [] })
  }

  try {
    const products = await searchProductSuggestions(query, 6)
    return NextResponse.json({ products })
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Product suggestions search failed:", error)
    }

    return NextResponse.json(
      { products: [], error: "Failed to fetch product suggestions" },
      { status: 500 }
    )
  }
}
