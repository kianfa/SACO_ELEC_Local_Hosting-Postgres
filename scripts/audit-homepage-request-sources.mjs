import { readFileSync } from "node:fs"

const sources = [
  "app/(storefront)/layout.tsx",
  "app/(storefront)/page.tsx",
  "app/loading.tsx",
  "components/auth/customer-auth-status-provider.tsx",
  "components/auth/customer-auth-button.tsx",
  "components/footer.tsx",
  "app/api/public/footer-categories/route.ts",
  "lib/services/categories-service.ts",
]

function count(pattern) {
  let total = 0
  const matches = []
  for (const file of sources) {
    const text = readFileSync(file, "utf8")
    const count = [...text.matchAll(pattern)].length
    if (count) matches.push({ file, count })
    total += count
  }
  return { total, matches }
}

const statusFetches = count(/fetch\("\/api\/auth\/customer\/status/g)
const footerFetches = count(/fetch\("\/api\/public\/footer-categories/g)
const verboseLogs = count(/Homepage categories mapped:|Mapped public product images:|Fetched homepage promo banners:/g)

console.log("Homepage duplicate-request source audit")
console.log(`customer-status browser fetch call sites: ${statusFetches.total}`)
console.log(`footer-categories browser fetch call sites: ${footerFetches.total}`)
console.log(`legacy verbose homepage log strings in audited sources: ${verboseLogs.total}`)

if (statusFetches.total !== 1) {
  console.error("Expected exactly one shared customer-status browser fetch call site.", statusFetches.matches)
  process.exitCode = 1
}
if (footerFetches.total !== 0) {
  console.error("Expected footer categories to be passed from the storefront layout without client fetches.", footerFetches.matches)
  process.exitCode = 1
}
if (verboseLogs.total !== 0) {
  console.error("Expected legacy verbose homepage logs to be removed or renamed.", verboseLogs.matches)
  process.exitCode = 1
}
