export const categories = [
  {
    id: 1,
    name: "تابلو برق",
    image: "/categories/electrical-panel.jpg",
    href: "/categories/electrical-panel",
  },
  {
    id: 2,
    name: "کابل و سیم",
    image: "/categories/cables.jpg",
    href: "/categories/cables",
  },
  {
    id: 3,
    name: "سنسور و ابزار دقیق",
    image: "/categories/sensors.jpg",
    href: "/categories/sensors",
  },
  {
    id: 4,
    name: "الکتروموتور",
    image: "/categories/motors.jpg",
    href: "/categories/motors",
  },
  {
    id: 5,
    name: "اینورتر",
    image: "/categories/inverters.jpg",
    href: "/categories/inverters",
  },
  {
    id: 6,
    name: "PLC و اتوماسیون",
    image: "/categories/plc.jpg",
    href: "/categories/plc",
  },
  {
    id: 7,
    name: "کنتاکتور",
    image: "/categories/contactors.jpg",
    href: "/categories/contactors",
  },
  {
    id: 8,
    name: "کلید و فیوز",
    image: "/categories/switches.jpg",
    href: "/categories/switches",
  },
]

export interface Product {
  id: number
  name: string
  model: string
  price: number
  oldPrice: number | null
  discount: number | null
  rating: number
  reviewCount: number
  image: string
  brand: string
  category: string
  inStock: boolean
  hasWarranty: boolean
  specs?: string[]
}

export const products: Product[] = [
  {
    id: 1,
    name: "کلید اتوماتیک کامپکت اشنایدر",
    model: "NSX100N TM-D 3P",
    price: 8650000,
    oldPrice: null,
    discount: 8,
    rating: 4.8,
    reviewCount: 13,
    image: "/products/schneider-switch.jpg",
    brand: "Schneider Electric",
    category: "کلید و فیوز",
    inStock: true,
    hasWarranty: true,
    specs: ["جریان نامی: 100 آمپر", "تعداد پل: 3", "نوع تریپ: TM-D"],
  },
  {
    id: 2,
    name: "کنتاکتور زیمنس",
    model: "3RT2026-1AP00",
    price: 2940000,
    oldPrice: 3200000,
    discount: 12,
    rating: 4.7,
    reviewCount: 9,
    image: "/products/siemens-contactor.jpg",
    brand: "Siemens",
    category: "کنتاکتور",
    inStock: true,
    hasWarranty: true,
    specs: ["جریان نامی: 25 آمپر", "ولتاژ کویل: 230V AC", "تعداد کنتاکت: 3NO"],
  },
  {
    id: 3,
    name: "PLC دلتا",
    model: "DVP-32ES2",
    price: 9850000,
    oldPrice: null,
    discount: 15,
    rating: 4.9,
    reviewCount: 11,
    image: "/products/delta-plc.jpg",
    brand: "Delta",
    category: "PLC و اتوماسیون",
    inStock: true,
    hasWarranty: true,
    specs: ["ورودی دیجیتال: 16", "خروجی دیجیتال: 16", "تغذیه: 24V DC"],
  },
  {
    id: 4,
    name: "اینورتر دانفوس",
    model: "VLT Micro Drive FC51",
    price: 12700000,
    oldPrice: 14500000,
    discount: 15,
    rating: 4.6,
    reviewCount: 10,
    image: "/products/danfoss-inverter.jpg",
    brand: "Danfoss",
    category: "اینورتر",
    inStock: true,
    hasWarranty: true,
    specs: ["توان: 2.2 کیلووات", "ورودی: تکفاز/سه‌فاز", "فرکانس خروجی: 0-200Hz"],
  },
  {
    id: 5,
    name: "سنسور نوری امرن",
    model: "E3Z-LS61",
    price: 3860000,
    oldPrice: null,
    discount: null,
    rating: 4.8,
    reviewCount: 8,
    image: "/products/omron-sensor.jpg",
    brand: "Omron",
    category: "سنسور و ابزار دقیق",
    inStock: true,
    hasWarranty: true,
    specs: ["نوع: بازتابی", "برد: 1 متر", "خروجی: NPN/PNP"],
  },
  {
    id: 6,
    name: "الکتروموتور سه فاز الکتروژن",
    model: "IE3 - 7.5kW - B3",
    price: 18950000,
    oldPrice: 21000000,
    discount: 10,
    rating: 4.7,
    reviewCount: 17,
    image: "/products/electrojen-motor.jpg",
    brand: "Electrojen",
    category: "الکتروموتور",
    inStock: true,
    hasWarranty: true,
    specs: ["توان: 7.5 کیلووات", "دور: 1500 rpm", "کلاس بازده: IE3"],
  },
  {
    id: 7,
    name: "فیوز مینیاتوری اشنایدر",
    model: "C16 1P",
    price: 450000,
    oldPrice: 520000,
    discount: 13,
    rating: 4.5,
    reviewCount: 22,
    image: "/products/schneider-mcb.jpg",
    brand: "Schneider Electric",
    category: "کلید و فیوز",
    inStock: true,
    hasWarranty: true,
    specs: ["جریان نامی: 16 آمپر", "منحنی قطع: C", "تعداد پل: 1"],
  },
  {
    id: 8,
    name: "منبع تغذیه صنعتی امرن",
    model: "S8VK-G24024",
    price: 4250000,
    oldPrice: null,
    discount: null,
    rating: 4.9,
    reviewCount: 15,
    image: "/products/omron-power.jpg",
    brand: "Omron",
    category: "PLC و اتوماسیون",
    inStock: true,
    hasWarranty: true,
    specs: ["ولتاژ خروجی: 24V DC", "جریان خروجی: 10A", "توان: 240W"],
  },
  {
    id: 9,
    name: "کابل افشان صنعتی",
    model: "4x2.5mm²",
    price: 185000,
    oldPrice: null,
    discount: null,
    rating: 4.4,
    reviewCount: 31,
    image: "/products/cable.jpg",
    brand: "سیمیا",
    category: "کابل و سیم",
    inStock: true,
    hasWarranty: false,
    specs: ["سطح مقطع: 4x2.5mm²", "طول: 100 متر", "عایق: PVC"],
  },
  {
    id: 10,
    name: "تابلو برق دیواری فلزی",
    model: "IP65 - 40x50x20",
    price: 3450000,
    oldPrice: 3800000,
    discount: 9,
    rating: 4.6,
    reviewCount: 7,
    image: "/products/panel.jpg",
    brand: "پارس تابلو",
    category: "تابلو برق",
    inStock: true,
    hasWarranty: true,
    specs: ["ابعاد: 40x50x20 سانتی‌متر", "درجه حفاظت: IP65", "جنس: فولاد گالوانیزه"],
  },
  {
    id: 11,
    name: "رله حرارتی LS",
    model: "MT-32/3K",
    price: 1850000,
    oldPrice: null,
    discount: 5,
    rating: 4.5,
    reviewCount: 12,
    image: "/products/ls-relay.jpg",
    brand: "LS Electric",
    category: "کنتاکتور",
    inStock: false,
    hasWarranty: true,
    specs: ["محدوده تنظیم: 22-32 آمپر", "کلاس قطع: 10A", "تعداد کنتاکت: 1NO+1NC"],
  },
  {
    id: 12,
    name: "کلید محافظ جان ABB",
    model: "F204 AC-40/0.03",
    price: 2750000,
    oldPrice: 3100000,
    discount: 11,
    rating: 4.8,
    reviewCount: 19,
    image: "/products/abb-rccb.jpg",
    brand: "ABB",
    category: "کلید و فیوز",
    inStock: true,
    hasWarranty: true,
    specs: ["جریان نامی: 40 آمپر", "حساسیت: 30mA", "نوع: AC"],
  },
]

export const filterCategories = [
  "تابلو برق",
  "کابل و سیم",
  "سنسور و ابزار دقیق",
  "الکتروموتور",
  "اینورتر",
  "PLC و اتوماسیون",
  "کنتاکتور",
  "کلید و فیوز",
]

export const filterBrands = [
  "Schneider Electric",
  "Siemens",
  "ABB",
  "LS Electric",
  "Omron",
  "Danfoss",
  "CHINT",
  "Delta",
]

export const filterApplications = [
  "تابلو برق",
  "اتوماسیون صنعتی",
  "راه‌اندازی موتور",
  "ابزار دقیق",
  "پروژه‌های کارخانه‌ای",
]

export const sortOptions = [
  { value: "bestselling", label: "پرفروش‌ترین" },
  { value: "newest", label: "جدیدترین" },
  { value: "cheapest", label: "ارزان‌ترین" },
  { value: "expensive", label: "گران‌ترین" },
  { value: "discount", label: "بیشترین تخفیف" },
]

export const brands = [
  { id: 1, name: "Schneider Electric", logo: "/brands/schneider.png" },
  { id: 2, name: "Siemens", logo: "/brands/siemens.png" },
  { id: 3, name: "ABB", logo: "/brands/abb.png" },
  { id: 4, name: "LS Electric", logo: "/brands/ls-electric.png" },
  { id: 5, name: "Omron", logo: "/brands/omron.png" },
  { id: 6, name: "Danfoss", logo: "/brands/danfoss.png" },
  { id: 7, name: "CHINT", logo: "/brands/chint.png" },
  { id: 8, name: "Phoenix Contact", logo: "/brands/phoenix.png" },
]

export const navLinks = [
  { name: "صفحه اصلی", href: "/" },
  { name: "دسته‌بندی تجهیزات", href: "/categories" },
  { name: "محصولات", href: "/products" },
  { name: "برندها", href: "/brands" },
  { name: "پروژه‌ها", href: "/projects" },
  { name: "وبلاگ", href: "/blog" },
  { name: "تماس با ما", href: "/contact" },
]

export const trustFeatures = [
  {
    id: 1,
    title: "ارسال سریع",
    description: "ارسال به سراسر کشور",
    icon: "truck",
  },
  {
    id: 2,
    title: "ضمانت اصالت کالا",
    description: "تضمین اصالت و سلامت",
    icon: "shield",
  },
  {
    id: 3,
    title: "مشاوره فنی تخصصی",
    description: "پیش از خرید و پروژه",
    icon: "headphones",
  },
  {
    id: 4,
    title: "پشتیبانی پروژه",
    description: "همراهی در اجرا و راه‌اندازی",
    icon: "settings",
  },
]

export const footerLinks = {
  quickAccess: [
    { name: "دسته‌بندی تجهیزات", href: "/categories" },
    { name: "برندها", href: "/brands" },
    { name: "پروژه‌ها", href: "/projects" },
    { name: "وبلاگ", href: "/blog" },
    { name: "تماس با ما", href: "/contact" },
  ],
  services: [
    { name: "مشاوره فنی", href: "/services/consultation" },
    { name: "طراحی و تامین پروژه", href: "/services/project" },
    { name: "برنامه‌نویسی PLC", href: "/services/plc" },
    { name: "راه‌اندازی و تست", href: "/services/commissioning" },
    { name: "تامین تجهیزات پروژه", href: "/services/supply" },
  ],
  customerGuide: [
    { name: "سوالات متداول", href: "/faq" },
    { name: "روش‌های پرداخت", href: "/payment" },
    { name: "شرایط بازگشت کالا", href: "/returns" },
    { name: "پیگیری سفارش", href: "/track" },
    { name: "راهنمای خرید", href: "/guide" },
  ],
}

export function formatPrice(price: number): string {
  return price.toLocaleString('fa-IR')
}

export function formatEnglishPrice(price: number): string {
  return price.toLocaleString('en-US')
}
