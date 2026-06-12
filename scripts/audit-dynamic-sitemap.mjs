import { readFileSync } from "node:fs"

const read = (path) => readFileSync(path, "utf8")
const sitemap = read("app/sitemap.ts")
const robots = read("app/robots.ts")
const repository = read("lib/repositories/sitemap-repository.ts")
const products = read("lib/actions/admin-products-actions.ts")
const categories = read("lib/actions/admin-category-actions.ts")
const homepageCategories = read("lib/actions/admin-categories-actions.ts")
const env = read(".env.local.example")
const readme = read("README.md")

const checks = [
  ["sitemap metadata route exists", sitemap.includes('import type { MetadataRoute } from "next"') && sitemap.includes("MetadataRoute.Sitemap")],
  ["robots metadata route exists", robots.includes('import type { MetadataRoute } from "next"') && robots.includes("MetadataRoute.Robots")],
  ["canonical URL environment variable documented", env.includes("NEXT_PUBLIC_SITE_URL=https://example.com") && readme.includes("NEXT_PUBLIC_SITE_URL=https://example.com")],
  ["dynamic product rows select only sitemap fields", repository.includes('.select("slug, updated_at, is_active").eq("is_active", true)')],
  ["dynamic category rows select only sitemap fields", repository.match(/\.select\("slug, updated_at, is_active"\)\.eq\("is_active", true\)/g)?.length === 2],
  ["product route uses existing detail pattern", sitemap.includes("/products/${encodeURIComponent(product.slug)}")],
  ["category route uses existing filtered products pattern", sitemap.includes("/products?category=${encodeURIComponent(category.slug)}")],
  ["private paths excluded from robots", ["/admin/", "/account/", "/auth/", "/api/"].every((path) => robots.includes(`"${path}"`))],
  ["sitemap URL dynamically referenced by robots", robots.includes('absoluteSiteUrl("/sitemap.xml")')],
  ["database failure falls back to static routes", sitemap.includes("return STATIC_PUBLIC_ROUTES") && sitemap.includes("console.error")],
  ["sitemap data uses stable cache tag", repository.includes('tags: ["sitemap-data"]')],
  ["product mutations invalidate sitemap", products.includes('revalidateTag("sitemap-data", "max")') && products.includes('revalidatePath("/sitemap.xml")')],
  ["category mutations invalidate sitemap", categories.includes('revalidateTag("sitemap-data", "max")') && categories.includes('revalidatePath("/sitemap.xml")')],
  ["homepage category row mutations invalidate sitemap", homepageCategories.includes('revalidateCategorySitemap()') && homepageCategories.includes('revalidateTag("sitemap-data", "max")') && homepageCategories.includes('revalidatePath("/sitemap.xml")')],
  ["no physical XML file is referenced", !sitemap.includes("writeFile") && !robots.includes("writeFile")],
  ["no private sitemap URLs", !sitemap.includes('absoluteSiteUrl("/admin') && !sitemap.includes('absoluteSiteUrl("/account') && !sitemap.includes('absoluteSiteUrl("/auth') && !sitemap.includes('absoluteSiteUrl("/api')],
]

const failures = checks.filter(([, ok]) => !ok)
for (const [name, ok] of checks) console.log(`${ok ? "PASS" : "FAIL"}: ${name}`)
if (failures.length) process.exit(1)
console.log(`All ${checks.length} dynamic sitemap checks passed.`)
