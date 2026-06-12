"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import type { CustomerStatus } from "@/types/storefront"

const anonymousStatus: CustomerStatus = { authenticated: false, user: null }
const CustomerAuthStatusContext = createContext<CustomerStatus | null>(null)

type RequestSnapshot = {
  pathname: string
  expiresAt: number
  status: CustomerStatus
}

let inFlightRequest: { pathname: string; promise: Promise<CustomerStatus> } | null = null
let snapshot: RequestSnapshot | null = null

function loadCustomerStatus(pathname: string): Promise<CustomerStatus> {
  const now = Date.now()
  if (snapshot && snapshot.pathname === pathname && snapshot.expiresAt > now) {
    return Promise.resolve(snapshot.status)
  }

  if (!inFlightRequest || inFlightRequest.pathname !== pathname) {
    const promise = fetch("/api/auth/customer/status", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : anonymousStatus))
      .catch(() => anonymousStatus)
      .then((status: CustomerStatus) => {
        // Keep a very short-lived browser-only snapshot so React Strict Mode's
        // development effect replay does not send a duplicate request. Path
        // changes still trigger a fresh status read after login or logout.
        snapshot = { pathname, expiresAt: Date.now() + 1_500, status }
        return status
      })
      .finally(() => {
        if (inFlightRequest?.promise === promise) inFlightRequest = null
      })
    inFlightRequest = { pathname, promise }
  }

  return inFlightRequest.promise
}

export function CustomerAuthStatusProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [status, setStatus] = useState<CustomerStatus | null>(null)

  useEffect(() => {
    let active = true
    loadCustomerStatus(pathname).then((nextStatus) => {
      if (active) setStatus(nextStatus)
    })
    return () => {
      active = false
    }
  }, [pathname])

  return <CustomerAuthStatusContext.Provider value={status}>{children}</CustomerAuthStatusContext.Provider>
}

export function useCustomerAuthStatus(): CustomerStatus | null {
  return useContext(CustomerAuthStatusContext)
}
