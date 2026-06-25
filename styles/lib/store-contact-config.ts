export const storeContactConfig = {
  brandName: "الکتروساکو",
  tagline: "فروشگاه تخصصی تجهیزات برق صنعتی",
  landline: "04135578876",
  mobile: "09382073007",
  address: "تبریز، خیابان فردوسی، روبروی پاساژ تجارت، نبش کوچه اردبیلی‌ها، ساختمان ساکو، پلاک ۱",
  telegram: {
    label: "تلگرام",
    username: "@electro_saco",
    phone: "09382073007",
    url: "https://t.me/electro_saco",
  },
  whatsapp: {
    label: "واتساپ",
    username: null,
    phone: "09382073007",
    url: "https://wa.me/989382073007",
  },
  channels: ["واتساپ", "بله", "روبیکا", "تلگرام"] as const,
  workingHours: "شنبه تا چهارشنبه، ۹ تا ۱۷",
  defaultFooterDescription:
    "فروشگاه تخصصی تأمین تجهیزات برق صنعتی، اتوماسیون، تابلو برق و ملزومات کنترلی با تمرکز بر اصالت کالا، مشاوره فنی و تأمین پروژه‌ای.",
  defaultCopyright: "© الکتروساکو. تمامی حقوق این سایت محفوظ است.",
} as const

export const manualCheckoutExplanation =
  "برای نهایی‌سازی سفارش، لطفاً از سبد خرید یا خلاصه سفارش خود اسکرین‌شات تهیه کرده و از طریق تلگرام، واتساپ، بله یا روبیکا برای پشتیبانی ارسال کنید. کارشناسان فروش پس از بررسی موجودی کالا، تأیید قیمت نهایی و هماهنگی شرایط ارسال، اطلاعات پرداخت کارت‌به‌کارت را در اختیار شما قرار می‌دهند. پس از پرداخت، سفارش شما در سریع‌ترین زمان ممکن آماده پردازش و ارسال خواهد شد."

export const manualCheckoutHelperText =
  "اسکرین‌شات سبد خرید خود را از طریق تلگرام، واتساپ، بله یا روبیکا ارسال کنید تا موجودی، قیمت نهایی و شرایط ارسال توسط کارشناسان ما تأیید شود. پس از تأیید، اطلاعات کارت‌به‌کارت برای تکمیل خرید ارسال خواهد شد."

export const manualCheckoutConfig = {
  telegram: {
    label: "تلگرام",
    username: storeContactConfig.telegram.username,
    phone: storeContactConfig.telegram.phone,
    url: storeContactConfig.telegram.url,
  },
  phone: {
    label: "تماس تلفنی",
    landline: storeContactConfig.landline,
    mobile: storeContactConfig.mobile,
  },
  channels: storeContactConfig.channels,
  bale: {
    label: "بله",
    username: null,
    phone: storeContactConfig.mobile,
    url: null,
  },
  rubika: {
    label: "روبیکا",
    username: null,
    phone: storeContactConfig.mobile,
    url: null,
  },
  whatsapp: {
    label: storeContactConfig.whatsapp.label,
    username: storeContactConfig.whatsapp.username,
    phone: storeContactConfig.whatsapp.phone,
    url: storeContactConfig.whatsapp.url,
  },
} as const
