import "server-only"

import { cache } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/better-auth"
import { getProfileById, getProfileFullNameById } from "@/lib/db/profiles"
import { withAuthRequestTimeout } from "@/lib/performance/server-timing"
import { withRequestTraceTiming } from "@/lib/performance/request-tracing"

export type ProfileRow = { id: string; full_name: string | null; phone: string | null; role: string | null }
export type AuthenticatedUserWithProfile = { id: string; email: string | null; fullName: string | null; phone: string | null; role: string | null }

const getBetterAuthSession = cache(async () =>
  withAuthRequestTimeout("better-auth.getSession", async () => auth.api.getSession({ headers: await headers() })),
)

export const getAuthenticatedUserWithProfile = cache(async (): Promise<AuthenticatedUserWithProfile | null> => {
  const session = await getBetterAuthSession()
  if (!session?.user) return null

  const profile = await withAuthRequestTimeout("profiles lookup", async () =>
    getProfileById(session.user.id),
  )

  return {
    id: session.user.id,
    email: session.user.email ?? null,
    fullName: profile?.full_name ?? null,
    phone: profile?.phone ?? null,
    role: profile?.role ?? null,
  }
})

async function readMinimalCustomerStatus(requestId?: string) {
  const loadSession = () => getBetterAuthSession()
  const session = requestId
    ? await withRequestTraceTiming("customer-status better-auth.getSession", requestId, loadSession)
    : await loadSession()
  if (!session?.user) return { authenticated: false as const, user: null }

  const loadProfile = () => withAuthRequestTimeout("minimal customer profile lookup", async () =>
    getProfileFullNameById(session.user.id),
  )
  const fullName = requestId
    ? await withRequestTraceTiming("customer-status profile lookup", requestId, loadProfile)
    : await loadProfile()

  return { authenticated: true as const, user: { id: session.user.id, fullName: fullName ?? null } }
}

export const getMinimalCustomerStatus = cache(async () => readMinimalCustomerStatus())
export async function getMinimalCustomerStatusWithTrace(requestId: string) { return readMinimalCustomerStatus(requestId) }
