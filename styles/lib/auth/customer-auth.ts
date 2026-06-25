import { cache } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth/better-auth"
import { getAuthenticatedUserWithProfile, getMinimalCustomerStatus } from "@/lib/auth/session"
import { withServerTiming } from "@/lib/performance/server-timing"

export type CustomerSessionUser = { id: string; email: string | null; fullName: string | null; phone: string | null; role: string | null }
export const getCurrentCustomerUser = cache(async (): Promise<CustomerSessionUser | null> => withServerTiming("getCurrentCustomerUser", async () => getAuthenticatedUserWithProfile()))
export { getMinimalCustomerStatus }
export const requireCustomerAccess = cache(async (): Promise<CustomerSessionUser> => { const user = await getCurrentCustomerUser(); if (!user) redirect("/auth/login"); return user })
export async function signOutCustomer(): Promise<void> { await auth.api.signOut({ headers: await headers() }) }
