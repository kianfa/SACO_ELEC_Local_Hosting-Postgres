export interface CartItem {
  id: number
  name: string
  model: string
  brand: string
  price: number
  quantity: number
  warranty: string
  inStock: boolean
  stockLabel: string
  priceUpdated?: boolean
}

export const mockCartItems: CartItem[] = [
  {
    id: 1,
    name: "کلید اتوماتیک کامپکت اشنایدر NSX100N TM-D 3P",
    model: "NSX100N TM-D 3P",
    brand: "Schneider Electric",
    price: 8650000,
    quantity: 1,
    warranty: "۱۸ ماه ضمانت اصالت و سلامت کالا",
    inStock: true,
    stockLabel: "موجود در انبار مرکزی",
    priceUpdated: true,
  },
  {
    id: 2,
    name: "کنتاکتور زیمنس 3RT2026-1AP00",
    model: "3RT2026-1AP00",
    brand: "Siemens",
    price: 2940000,
    quantity: 2,
    warranty: "۱۲ ماه گارانتی معتبر شرکتی",
    inStock: true,
    stockLabel: "آماده ارسال",
  },
  {
    id: 3,
    name: "اینورتر دانفوس VLT Micro Drive FC51",
    model: "VLT Micro Drive FC51",
    brand: "Danfoss",
    price: 12700000,
    quantity: 1,
    warranty: "اصالت کالا + پشتیبانی فنی راه‌اندازی",
    inStock: false,
    stockLabel: "موجودی نیازمند استعلام",
  },
]

export function getCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = Math.round(subtotal * 0.06)
  const payable = subtotal - discount
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    subtotal,
    discount,
    payable,
    totalQuantity,
  }
}
