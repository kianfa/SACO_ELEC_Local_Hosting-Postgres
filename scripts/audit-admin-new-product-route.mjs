import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const read = (file) => readFileSync(resolve(root, file), "utf8")
const checks = []
const check = (ok, label) => { checks.push({ ok, label }); console.log(`${ok ? "✓" : "✗"} ${label}`) }

const pagePath = "app/admin/(protected)/products/new/page.tsx"
const loadingPath = "app/admin/(protected)/products/new/loading.tsx"
const errorPath = "app/admin/(protected)/products/new/error.tsx"
const page = read(pagePath)
const session = read("lib/auth/session.ts")
const brands = read("lib/repositories/admin-brands-repository.ts")
const categories = read("lib/repositories/admin-categories-repository.ts")
const rootLayout = read("app/layout.tsx")

check(existsSync(resolve(root, pagePath)), "new-product route exists at /admin/products/new")
check(existsSync(resolve(root, loadingPath)), "new-product route has synchronous loading UI")
check(existsSync(resolve(root, errorPath)), "new-product route has handled error boundary")
check(page.includes('Promise.all([getAdminBrandOptions(\"admin-new-product\"), getAdminCategoryOptions(\"admin-new-product\")])'), "brand and category options load in parallel")
check(!page.includes("getAdminBrands("), "new-product page does not load full brand management data")
check(!page.includes("getAdminCategories("), "new-product page does not load full category management data")
check(brands.includes(".abortSignal(signal)"), "brand option query receives abort signal")
check(categories.includes(".abortSignal(signal)"), "category option query receives abort signal")
check(session.includes('.abortSignal(signal)\n        .maybeSingle<ProfileRow>()'), "admin profile query receives abort signal")
check(!rootLayout.includes("getPublicSiteSettings"), "root layout remains free of storefront settings queries")
check(!page.includes("getPublicSiteSettings") && !page.includes("footer-categories") && !page.includes("customer/status"), "new-product page has no storefront data dependency")

if (checks.some((item) => !item.ok)) process.exit(1)
console.log(`\nAll ${checks.length} admin new-product route checks passed.`)
