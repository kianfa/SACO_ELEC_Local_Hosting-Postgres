import "server-only"

import { randomUUID } from "node:crypto"
import { performanceDebugEnabled, safePerformanceError } from "@/lib/performance/server-timing"

export function createRequestTraceId(): string {
  return randomUUID().slice(0, 8)
}

export function traceLog(message: string): void {
  if (performanceDebugEnabled()) console.log(`[trace] ${message}`)
}

export async function withRequestTraceTiming<T>(
  label: string,
  requestId: string,
  operation: () => Promise<T>,
): Promise<T> {
  const startedAt = performance.now()
  traceLog(`${label} started requestId=${requestId}`)
  try {
    const result = await operation()
    traceLog(`${label} completed requestId=${requestId} durationMs=${Math.round(performance.now() - startedAt)}`)
    return result
  } catch (error) {
    traceLog(`${label} failed requestId=${requestId} durationMs=${Math.round(performance.now() - startedAt)} error=${safePerformanceError(error)}`)
    throw error
  }
}
