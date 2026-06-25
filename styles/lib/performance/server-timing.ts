import "server-only"

export type RequestTimeoutProfile = "external" | "auth" | "publicData" | "adminMutation" | "fileOperation"

const TIMEOUT_DEFAULTS_MS: Record<RequestTimeoutProfile, number> = {
  external: 20_000,
  auth: 25_000,
  publicData: 20_000,
  adminMutation: 30_000,
  fileOperation: 15_000,
}

const TIMEOUT_ENV_KEYS: Record<RequestTimeoutProfile, string> = {
  external: "EXTERNAL_REQUEST_TIMEOUT_MS",
  auth: "AUTH_REQUEST_TIMEOUT_MS",
  publicData: "PUBLIC_DATA_TIMEOUT_MS",
  adminMutation: "ADMIN_MUTATION_TIMEOUT_MS",
  fileOperation: "FILE_OPERATION_TIMEOUT_MS",
}

export function performanceDebugEnabled(): boolean {
  return process.env.DEBUG_PERFORMANCE === "true"
}

export function getRequestTimeoutMs(profile: RequestTimeoutProfile = "external"): number {
  const fallback = TIMEOUT_DEFAULTS_MS[profile]
  const parsed = Number(process.env[TIMEOUT_ENV_KEYS[profile]] ?? fallback)
  return Number.isFinite(parsed) && parsed >= 500 && parsed <= 120_000 ? Math.round(parsed) : fallback
}

export function createRequestTimeoutSignal(profile: RequestTimeoutProfile = "external"): AbortSignal {
  return AbortSignal.timeout(getRequestTimeoutMs(profile))
}

export class RequestTimeoutError extends Error {
  constructor(public readonly operationLabel: string) {
    super("ارتباط با سرور با تأخیر مواجه شد. لطفاً دوباره تلاش کنید.")
    this.name = "RequestTimeoutError"
  }
}

export function safePerformanceError(error: unknown): string {
  const message = error instanceof Error ? error.message : "unknown error"
  return message.replace(/[\r\n]+/g, " ").slice(0, 240)
}

function debugLog(message: string): void {
  if (performanceDebugEnabled()) console.log(message)
}

export function logServerTiming(label: string, startedAt: number): void {
  if (!performanceDebugEnabled()) return
  console.log(`[perf] success ${label} ${Math.round(performance.now() - startedAt)}ms`)
}

export async function withServerTiming<T>(label: string, operation: () => Promise<T>): Promise<T> {
  const startedAt = performance.now()
  debugLog(`[perf] start ${label}`)
  try {
    const result = await operation()
    logServerTiming(label, startedAt)
    return result
  } catch (error) {
    debugLog(`[perf] failure ${label} ${safePerformanceError(error)}`)
    throw error
  }
}

export async function withExternalRequestTimeout<T>(
  label: string,
  operation: PromiseLike<T> | ((signal: AbortSignal) => PromiseLike<T>),
  timeoutOrProfile: number | RequestTimeoutProfile = "external",
): Promise<T> {
  const timeoutMs = typeof timeoutOrProfile === "number" ? timeoutOrProfile : getRequestTimeoutMs(timeoutOrProfile)
  const startedAt = performance.now()
  let timeout: ReturnType<typeof setTimeout> | undefined
  let didTimeout = false
  const controller = new AbortController()

  debugLog(`[perf] start ${label} timeout=${timeoutMs}ms`)

  try {
    const request = typeof operation === "function" ? operation(controller.signal) : operation
    const result = await Promise.race([
      Promise.resolve(request),
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => {
          didTimeout = true
          controller.abort()
          reject(new RequestTimeoutError(label))
        }, timeoutMs)
      }),
    ])
    debugLog(`[perf] success ${label} ${Math.round(performance.now() - startedAt)}ms`)
    return result
  } catch (error) {
    const elapsed = Math.round(performance.now() - startedAt)
    if (didTimeout) {
      debugLog(`[perf] timeout ${label} after ${elapsed}ms configured=${timeoutMs}ms`)
    } else {
      debugLog(`[perf] failure ${label} ${safePerformanceError(error)}`)
    }
    throw error
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

export function withAuthRequestTimeout<T>(label: string, operation: PromiseLike<T> | ((signal: AbortSignal) => PromiseLike<T>)): Promise<T> {
  return withExternalRequestTimeout(label, operation, "auth")
}

export function withPublicDataTimeout<T>(label: string, operation: PromiseLike<T> | ((signal: AbortSignal) => PromiseLike<T>)): Promise<T> {
  return withExternalRequestTimeout(label, operation, "publicData")
}

export function withAdminMutationTimeout<T>(label: string, operation: PromiseLike<T> | ((signal: AbortSignal) => PromiseLike<T>)): Promise<T> {
  return withExternalRequestTimeout(label, operation, "adminMutation")
}

export function withFileOperationTimeout<T>(label: string, operation: PromiseLike<T> | ((signal: AbortSignal) => PromiseLike<T>)): Promise<T> {
  return withExternalRequestTimeout(label, operation, "fileOperation")
}
