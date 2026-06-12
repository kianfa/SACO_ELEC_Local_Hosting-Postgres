"use client"

import Link from "next/link"
import { Zap, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { navLinks } from "@/lib/data"
import { useState } from "react"
import { CartDrawer } from "@/components/cart/cart-drawer"
import { CustomerAuthButton } from "@/components/auth/customer-auth-button"
import { HeaderSearch } from "@/components/layout/header-search"
import { useContactInfo } from "@/components/site-settings-provider"
import { storeContactConfig } from "@/lib/store-contact-config"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const contact = useContactInfo()
  const brandName = contact.brandName || storeContactConfig.brandName

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      {/* Main Header */}
      <div className="container mx-auto max-w-full px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary sm:h-12 sm:w-12">
              <Zap className="h-6 w-6 text-accent sm:h-7 sm:w-7" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">{brandName}</h1>
              <p className="text-xs text-muted-foreground">فروشگاه تخصصی تجهیزات برق صنعتی</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <HeaderSearch />
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
            <CustomerAuthButton />
            <CartDrawer />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <HeaderSearch compact placeholder="جستجو برای محصولات..." />
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:block bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1">
            <Button asChild className="flex items-center gap-2 bg-primary hover:bg-primary/90 rounded-xl my-2 px-4">
              <Link href="/categories">
                <Menu className="w-5 h-5" />
                <span>دسته‌بندی کالاها</span>
              </Link>
            </Button>
            <div className="flex items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="px-4 py-4 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border">
          <div className="container mx-auto max-h-[70vh] max-w-full overflow-y-auto px-3 py-2 sm:px-4">
            <Button asChild className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 rounded-xl mb-2">
              <Link href="/categories" onClick={() => setMobileMenuOpen(false)}>
                <Menu className="w-5 h-5" />
                <span>دسته‌بندی کالاها</span>
              </Link>
            </Button>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="block px-4 py-3 text-foreground hover:text-primary hover:bg-muted transition-colors font-medium border-b border-border last:border-0"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
