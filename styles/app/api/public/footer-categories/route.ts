import { NextResponse } from "next/server"
import { getFooterCategoryLinks } from "@/lib/services/categories-service"
import { createRequestTraceId, traceLog, withRequestTraceTiming } from "@/lib/performance/request-tracing"

export const revalidate = 300

export async function GET() {
  const requestId = createRequestTraceId()
  traceLog(`footer-categories request started requestId=${requestId}`)

  try {
    const categories = await withRequestTraceTiming("footer-categories query", requestId, () =>
      getFooterCategoryLinks("footer-api"),
    )
    traceLog(`footer-categories request completed requestId=${requestId} count=${categories.length}`)
    return NextResponse.json({ categories })
  } catch {
    traceLog(`footer-categories request completed requestId=${requestId} count=0 fallback=true`)
    return NextResponse.json({ categories: [] })
  }
}
