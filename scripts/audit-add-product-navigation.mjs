import { readFile, stat } from "node:fs/promises"

const checks = []

async function fileExists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

function check(label, condition) {
  checks.push({ label, condition })
  console.log(`${condition ? "✓" : "✗"} ${label}`)
}

const table = await readFile("components/admin/admin-products-table.tsx", "utf8")
const newPage = await readFile("app/admin/(protected)/products/new/page.tsx", "utf8")
const loading = await readFile("app/admin/(protected)/products/new/loading.tsx", "utf8")
const proxy = await readFile("proxy.ts", "utf8")

check("create route exists", await fileExists("app/admin/(protected)/products/new/page.tsx"))
check("add-product button uses App Router Link", table.includes('href="/admin/products/new"'))
check("add-product Link is rendered through Button asChild", table.includes('<Button asChild className="h-11 rounded-xl bg-accent'))
check("create page uses lightweight brand options", newPage.includes("getAdminBrandOptions"))
check("create page uses lightweight category options", newPage.includes("getAdminCategoryOptions"))
check("create page does not use full brand management loader", !newPage.includes("getAdminBrands"))
check("create page does not use full category management loader", !newPage.includes("getAdminCategories"))
check("form option loads run in parallel", newPage.includes("Promise.all([getAdminBrandOptions(), getAdminCategoryOptions()])"))
check("route loading fallback is synchronous", !loading.includes("async function"))
check("route loading fallback is network-free", !loading.includes("AdminLayout") && !loading.includes("supabase") && !loading.includes("fetch("))
check("loading fallback shows Persian progress text", loading.includes("در حال آماده‌سازی فرم محصول..."))
check("proxy stays lightweight", !proxy.includes("supabase.auth") && !proxy.includes("createServerClient") && !proxy.includes('.from("profiles")'))

const failed = checks.filter((item) => !item.condition)
if (failed.length) {
  console.error(`\n${failed.length} navigation audit check(s) failed.`)
  process.exit(1)
}

console.log(`\nAll ${checks.length} add-product navigation checks passed.`)
