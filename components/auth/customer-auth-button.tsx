"use client"

import Link from "next/link"
import { LogOut, User, UserCircle } from "lucide-react"
import { logoutCustomerAction } from "@/lib/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { useCustomerAuthStatus } from "@/components/auth/customer-auth-status-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CustomerAuthButton() {
  const status = useCustomerAuthStatus()

  if (!status?.authenticated) {
    return (
      <>
        <Button asChild variant="outline" className="hidden sm:flex items-center gap-2 rounded-xl">
          <Link href="/auth/login">
            <User className="w-5 h-5" />
            <span className="hidden lg:inline">ورود / ثبت‌نام</span>
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon" className="rounded-xl sm:hidden">
          <Link href="/auth/login" aria-label="ورود / ثبت نام">
            <User className="w-5 h-5" />
          </Link>
        </Button>
      </>
    )
  }

  const displayName = status.user?.fullName || "حساب کاربری"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="hidden sm:flex items-center gap-2 rounded-xl">
          <UserCircle className="w-5 h-5" />
          <span className="hidden lg:inline max-w-32 truncate">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" style={{ direction: "rtl" }}>
        <DropdownMenuLabel className="truncate">{displayName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/account">حساب کاربری</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={logoutCustomerAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="flex w-full items-center gap-2 text-right">
              <LogOut className="h-4 w-4" />
              خروج
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
      <Button asChild variant="outline" size="icon" className="rounded-xl sm:hidden">
        <Link href="/account" aria-label="حساب کاربری">
          <UserCircle className="w-5 h-5" />
        </Link>
      </Button>
    </DropdownMenu>
  )
}
