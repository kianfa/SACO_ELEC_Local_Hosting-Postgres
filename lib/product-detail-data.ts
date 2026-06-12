export interface ProductDetail {
  id: number
  slug: string
  name: string
  model: string
  brand: string
  category: string
  categorySlug: string
  price: number
  oldPrice: number | null
  discount: number | null
  rating: number
  reviewCount: number
  inStock: boolean
  stockCount: number
  warranty: string
  shortDescription: string
  images: string[]
  badges: string[]
  quickSpecs: { label: string; value: string }[]
  fullSpecs: { label: string; value: string }[]
  description: string
  documents: { name: string; type: string; size: string }[]
  reviews: {
    id: number
    author: string
    role: string
    rating: number
    date: string
    comment: string
    helpful: number
  }[]
  faqs: { question: string; answer: string }[]
}

export const sampleProduct: ProductDetail = {
  id: 1,
  slug: "schneider-nsx100n-tm-d-3p",
  name: "کلید اتوماتیک کامپکت اشنایدر",
  model: "NSX100N TM-D 3P",
  brand: "Schneider Electric",
  category: "کلید و فیوز",
  categorySlug: "switches",
  price: 8650000,
  oldPrice: 9400000,
  discount: 8,
  rating: 4.8,
  reviewCount: 13,
  inStock: true,
  stockCount: 24,
  warranty: "۱۸ ماه ضمانت اصالت و سلامت کالا",
  shortDescription:
    "کلید اتوماتیک کامپکت NSX100N با حفاظت حرارتی-مغناطیسی، مناسب برای حفاظت از مدارهای الکتریکی در تابلوهای برق صنعتی و توزیع. ساخت فرانسه با کیفیت و استاندارد جهانی اشنایدر الکتریک.",
  images: [
    "/products/schneider-switch-1.jpg",
    "/products/schneider-switch-2.jpg",
    "/products/schneider-switch-3.jpg",
    "/products/schneider-switch-4.jpg",
  ],
  badges: ["اصل", "گارانتی‌دار", "مناسب پروژه"],
  quickSpecs: [
    { label: "جریان نامی", value: "۱۰۰ آمپر" },
    { label: "تعداد پل", value: "۳ پل" },
    { label: "قدرت قطع", value: "۳۶ کیلوآمپر" },
    { label: "نوع حفاظت", value: "حرارتی-مغناطیسی" },
  ],
  fullSpecs: [
    { label: "برند", value: "Schneider Electric" },
    { label: "سری", value: "Compact NSX" },
    { label: "مدل", value: "NSX100N TM-D 3P" },
    { label: "نوع محصول", value: "کلید اتوماتیک کامپکت" },
    { label: "جریان نامی", value: "100A" },
    { label: "تعداد پل", value: "3P" },
    { label: "قدرت قطع", value: "36kA" },
    { label: "ولتاژ کاری", value: "690V AC" },
    { label: "نوع حفاظت", value: "Thermal-Magnetic" },
    { label: "استاندارد", value: "IEC 60947-2" },
    { label: "کشور سازنده", value: "فرانسه" },
    { label: "گارانتی", value: "۱۸ ماه" },
  ],
  description: `کلید اتوماتیک کامپکت NSX100N از سری محصولات پیشرفته اشنایدر الکتریک است که برای حفاظت از مدارهای الکتریکی در محیط‌های صنعتی طراحی شده است.

این کلید با مکانیزم قطع حرارتی-مغناطیسی (TM-D) مجهز شده که حفاظت کاملی در برابر اضافه بار و اتصال کوتاه فراهم می‌کند. طراحی کامپکت این محصول امکان نصب آسان در تابلوهای برق با فضای محدود را فراهم می‌سازد.

**کاربردها:**
- تابلوهای برق صنعتی
- حفاظت از الکتروموتورها
- سیستم‌های توزیع برق
- پروژه‌های کارخانه‌ای و صنعتی
- ساختمان‌های اداری و تجاری

**ویژگی‌های کلیدی:**
- قدرت قطع بالای 36kA در 415V
- طراحی ماژولار برای نصب آسان لوازم جانبی
- قابلیت استفاده از رله‌های الکترونیکی
- شاخص وضعیت کنتاکت‌ها
- مقاومت بالا در برابر شرایط محیطی سخت

این محصول مناسب برای پروژه‌های صنعتی، تأمین تجهیزات کارخانه، و خریداران عمده می‌باشد. تیم فنی ساکو الکتریک آماده ارائه مشاوره تخصصی برای انتخاب مناسب‌ترین کلید برای پروژه شما است.`,
  documents: [
    { name: "دیتاشیت محصول", type: "PDF", size: "2.4 MB" },
    { name: "کاتالوگ Schneider Compact NSX", type: "PDF", size: "8.1 MB" },
    { name: "راهنمای نصب", type: "PDF", size: "1.2 MB" },
  ],
  reviews: [
    {
      id: 1,
      author: "مهندس احمدی",
      role: "مهندس برق - شرکت پتروشیمی",
      rating: 5,
      date: "۱۴۰۳/۰۲/۱۵",
      comment:
        "کیفیت عالی و اورجینال. برای پروژه تابلوسازی استفاده کردیم و کاملاً راضی هستیم. بسته‌بندی مناسب و ارسال سریع بود.",
      helpful: 12,
    },
    {
      id: 2,
      author: "آقای محمدی",
      role: "خریدار پروژه‌ای - شرکت ساختمانی",
      rating: 4,
      date: "۱۴۰۳/۰۱/۲۸",
      comment:
        "محصول اصل و با کیفیت. قیمت نسبت به بازار مناسب بود. فقط پیشنهاد می‌کنم گزینه ارسال اکسپرس هم داشته باشید.",
      helpful: 8,
    },
  ],
  faqs: [
    {
      question: "آیا این محصول اصل است؟",
      answer:
        "بله، تمامی محصولات اشنایدر الکتریک عرضه شده در ساکو الکتریک دارای ضمانت اصالت کالا هستند و مستقیماً از نمایندگی‌های رسمی تأمین می‌شوند. هولوگرام و شماره سریال محصول قابل استعلام از سایت اشنایدر است.",
    },
    {
      question: "آیا برای تابلو برق صنعتی مناسب است؟",
      answer:
        "بله، کلید NSX100N با قدرت قطع 36kA مناسب برای تابلوهای برق صنعتی، مراکز توزیع برق، و کاربردهای صنعتی سنگین است. این کلید استاندارد IEC 60947-2 را دارد.",
    },
    {
      question: "زمان ارسال چقدر است؟",
      answer:
        "برای محصولات موجود در انبار، ارسال ظرف ۲۴ تا ۴۸ ساعت کاری انجام می‌شود. برای تهران ارسال همان روز نیز امکان‌پذیر است. برای شهرستان‌ها معمولاً ۳ تا ۵ روز کاری زمان می‌برد.",
    },
    {
      question: "آیا امکان خرید عمده وجود دارد؟",
      answer:
        "بله، برای خرید پروژه‌ای و عمده قیمت‌های ویژه ارائه می‌شود. با تیم فروش پروژه تماس بگیرید یا از طریق فرم درخواست پیش‌فاکتور اقدام کنید. امکان تأمین مستقیم از کارخانه برای پروژه‌های بزرگ وجود دارد.",
    },
  ],
}

export const relatedProducts = [
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
    slug: "siemens-contactor-3rt2026",
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
    slug: "schneider-mcb-c16",
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
    slug: "abb-rccb-f204",
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
    slug: "ls-thermal-relay-mt32",
  },
]
