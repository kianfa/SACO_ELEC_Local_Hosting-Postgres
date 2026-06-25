import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { CartProvider } from '@/lib/cart/cart-store'
import { SiteSettingsProvider } from '@/components/site-settings-provider'
import { publicSiteSettingsFallback } from '@/lib/site-settings-defaults'


export const metadata: Metadata = {
  title: 'الکتروساکو | فروشگاه تخصصی تجهیزات برق صنعتی',
  description: 'الکتروساکو؛ فروشگاه تخصصی تجهیزات برق صنعتی با ارائه محصولات اصل، قیمت رقابتی و پشتیبانی فنی',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

// Keep the root layout network-free. Storefront routes opt into the cached
// public settings query in app/(storefront)/layout.tsx. Admin auth pages stay light.
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" className="bg-background">
      <body className="font-sans antialiased">
        <SiteSettingsProvider settings={publicSiteSettingsFallback}>
          <CartProvider>{children}</CartProvider>
        </SiteSettingsProvider>
        <Toaster richColors position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
