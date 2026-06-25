export type PaymentStatus = "success" | "failed"

export interface PaymentOrderItem {
  id: number
  name: string
  quantity: number
  total: number
}

export interface PaymentResultData {
  orderNumber: string
  paymentTrackingCode: string
  orderDate: string
  orderStatus: string
  paymentStatus: string
  paymentMethod: string
  paidAmount: number
  failureReason: string
  items: PaymentOrderItem[]
  supportPhone: string
  supportMessenger: string
  supportHours: string
}

export const mockPaymentResult: PaymentResultData = {
  orderNumber: "ORD-100245",
  paymentTrackingCode: "458921736",
  orderDate: "۱۴۰۳/۰۸/۲۴",
  orderStatus: "پرداخت شده",
  paymentStatus: "ناموفق",
  paymentMethod: "پرداخت آنلاین",
  paidAmount: 26450000,
  failureReason: "انصراف از پرداخت، خطای بانکی، یا عدم تایید تراکنش",
  supportPhone: "04135578876",
  supportMessenger: "واتساپ، بله، روبیکا، تلگرام: 09382073007",
  supportHours: "شنبه تا چهارشنبه، ۹ تا ۱۷",
  items: [
    {
      id: 1,
      name: "کلید اتوماتیک کامپکت اشنایدر NSX100N TM-D 3P",
      quantity: 1,
      total: 8650000,
    },
    {
      id: 2,
      name: "کنتاکتور زیمنس 3RT2026-1AP00",
      quantity: 2,
      total: 5100000,
    },
    {
      id: 3,
      name: "اینورتر دانفوس VLT Micro Drive FC51",
      quantity: 1,
      total: 12700000,
    },
  ],
}

export const paymentNextSteps = [
  "بررسی سفارش توسط کارشناسان فروش",
  "آماده‌سازی و بسته‌بندی کالا",
  "هماهنگی ارسال یا باربری",
  "تحویل سفارش به مشتری",
]

export function formatToman(value: number) {
  return `${value.toLocaleString("fa-IR")} تومان`
}
