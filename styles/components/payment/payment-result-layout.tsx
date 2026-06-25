import Link from "next/link"
import { ChevronLeft, Home } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TopBar } from "@/components/top-bar"
import { PaymentStatusCard } from "@/components/payment/payment-status-card"
import { OrderInfoCard } from "@/components/payment/order-info-card"
import { OrderItemsSummary } from "@/components/payment/order-items-summary"
import { PaymentNextSteps } from "@/components/payment/payment-next-steps"
import { PaymentSupportBox } from "@/components/payment/payment-support-box"
import { FailedPaymentHelp } from "@/components/payment/failed-payment-help"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { mockPaymentResult, PaymentStatus } from "@/lib/payment-data"

interface PaymentResultLayoutProps {
  status: PaymentStatus
}

export function PaymentResultLayout({ status }: PaymentResultLayoutProps) {
  const isSuccess = status === "success"

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <TopBar />
      <Header />

      <main className="bg-muted/20 pb-12">
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="flex items-center gap-1 text-muted-foreground hover:text-primary">
                      <Home className="h-4 w-4" />
                      صفحه اصلی
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/checkout" className="text-muted-foreground hover:text-primary">
                      تسویه حساب
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronLeft className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-medium text-foreground">
                    {isSuccess ? "پرداخت موفق" : "پرداخت ناموفق"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-10">
          <div className="mx-auto max-w-6xl">
            <PaymentStatusCard status={status} data={mockPaymentResult} />

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
              <section className="space-y-6 lg:order-1">
                <OrderInfoCard status={status} data={mockPaymentResult} />
                {isSuccess ? <PaymentNextSteps /> : <FailedPaymentHelp orderNumber={mockPaymentResult.orderNumber} />}
              </section>

              <aside className="space-y-6 lg:sticky lg:top-32 lg:order-2">
                <OrderItemsSummary items={mockPaymentResult.items} />
                <PaymentSupportBox data={mockPaymentResult} compact={!isSuccess} />
              </aside>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
