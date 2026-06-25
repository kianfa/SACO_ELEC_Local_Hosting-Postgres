import { readFile, access } from "node:fs/promises"

const root = new URL("../", import.meta.url)
const read = async (relativePath) => readFile(new URL(relativePath, root), "utf8")
const checks = []
function check(label, condition) {
  checks.push({ label, ok: Boolean(condition) })
  console.log(`${condition ? "✓" : "✗"} ${label}`)
}

await access(new URL("app/admin/(protected)/products/new/page.tsx", root))
const table = await read("components/admin/admin-products-table.tsx")
const empty = await read("components/admin/admin-empty-state.tsx")
const listPage = await read("app/admin/(protected)/products/page.tsx")
const loading = await read("app/admin/(protected)/products/new/loading.tsx")
const protectedLayout = await read("app/admin/(protected)/layout.tsx")

check("create route exists at /admin/products/new", true)
check("toolbar add-product control is a direct next/link anchor", /data-add-product-link="toolbar"/.test(table) && /href="\/admin\/products\/new"/.test(table))
check("toolbar add-product control is not wrapped in Button asChild", !/<Button asChild[^>]*>\s*<Link[^>]*data-add-product-link="toolbar"/.test(table))
check("toolbar add-product control has no router.push", !/router\.push\("\/admin\/products\/new"/.test(table))
check("toolbar add-product control has no transition or manual click handler", !/data-add-product-link="toolbar"[\s\S]{0,500}(onClick|startTransition|isPending)/.test(table))
check("empty-state add-product control is also a direct link", /data-add-product-link="empty-state"/.test(empty))
check("error-state add-product control is also a direct link", /data-add-product-link="error-state"/.test(listPage))
check("route-level loading fallback remains immediate", /در حال آماده‌سازی فرم محصول/.test(loading))
check("protected admin layout emits guarded render/auth diagnostics", /\[admin-protected-layout\]/.test(protectedLayout) && /performanceDebugEnabled/.test(protectedLayout))

const failures = checks.filter((item) => !item.ok)
if (failures.length) {
  console.error(`\n${failures.length} surgical navigation audit check(s) failed.`)
  process.exit(1)
}
console.log(`\nAll ${checks.length} surgical add-product navigation checks passed.`)
