import { cache } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/better-auth"
import { getAuthenticatedUserWithProfile } from "@/lib/auth/session"
import { performanceDebugEnabled, withServerTiming } from "@/lib/performance/server-timing"

export type AdminSessionUser = { id: string; email: string | null; fullName: string | null; role: string | null }

export const getCurrentAdminUser = cache(async (): Promise<AdminSessionUser | null> => withServerTiming("getCurrentAdminUser", async () => {
  const user = await getAuthenticatedUserWithProfile()
  if (!user || user.role !== "admin") return null
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
}))

function debug(message: string) { if (performanceDebugEnabled()) console.log(`[admin-new-product] ${message}`) }

export const requireAdminAccess = cache(async (): Promise<AdminSessionUser> => withServerTiming("requireAdminAccess", async () => {
  const startedAt = performance.now(); debug("admin auth check started")
  const user = await getAuthenticatedUserWithProfile()
  if (!user) { debug(`redirecting reason=unauthenticated destination=/admin/login durationMs=${Math.round(performance.now()-startedAt)}`); redirect("/admin/login") }
  if (user.role !== "admin") { debug(`redirecting reason=non-admin destination=/admin/login durationMs=${Math.round(performance.now()-startedAt)}`); redirect("/admin/login") }
  debug(`admin auth check completed durationMs=${Math.round(performance.now()-startedAt)}`)
  return { id: user.id, email: user.email, fullName: user.fullName, role: user.role }
}))

export async function signOutAdmin(): Promise<void> { await auth.api.signOut({ headers: await headers() }) }
