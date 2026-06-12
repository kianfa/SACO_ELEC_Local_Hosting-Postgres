import type { ReactNode } from "react"
import { requireAdminAccess } from "@/lib/auth/admin-auth"
import { performanceDebugEnabled, safePerformanceError, withServerTiming } from "@/lib/performance/server-timing"
import { AdminRouteLoadError } from "@/components/admin/admin-route-load-error"

function debugAdminProtectedLayout(message: string) {
  if (performanceDebugEnabled()) console.log(`[admin-protected-layout] ${message}`)
}

export default async function ProtectedAdminRoutesLayout({ children }: { children: ReactNode }) {
  debugAdminProtectedLayout("render started")
  debugAdminProtectedLayout("auth check started")
  if (performanceDebugEnabled()) console.log("[admin-new-product] request started")
  if (performanceDebugEnabled()) console.log("[admin-new-product] protected layout started")
  const authStartedAt = performance.now()
  try {
    await withServerTiming("protected admin layout auth", () => requireAdminAccess())
    debugAdminProtectedLayout(`auth check completed durationMs=${Math.round(performance.now() - authStartedAt)}`)
    return <>{children}</>
  } catch (error) {
    // Next.js redirects are implemented as thrown control-flow errors. Preserve
    // them so unauthenticated and non-admin users still follow the secure flow.
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error
    if (typeof error === "object" && error && "digest" in error && String(error.digest).startsWith("NEXT_REDIRECT")) throw error
    if (performanceDebugEnabled()) {
      console.log(`[admin-new-product] failed stage=admin-auth safeMessage=${safePerformanceError(error)}`)
    }
    return <AdminRouteLoadError />
  }
}
