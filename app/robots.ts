import type { MetadataRoute } from "next"
import { absoluteSiteUrl } from "@/lib/seo/site-url"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/auth/", "/api/", "/checkout", "/cart", "/payment/"],
    },
    sitemap: absoluteSiteUrl("/sitemap.xml"),
  }
}
