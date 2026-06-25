import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), "utf8")
const checks = []
const add = (label, ok) => checks.push({ label, ok })

const actions = read("lib/actions/site-content-actions.ts")
const repository = read("lib/repositories/site-content-repository.ts")
const service = read("lib/services/site-content-service.ts")
const adminForm = read("components/admin/content/banner-management.tsx")
const homepage = read("app/(storefront)/page.tsx")

add("homepage requests homepage_promo banners", homepage.includes('getActiveBannersByPlacement("homepage_promo")'))
add("admin action defaults placement to homepage_promo", actions.includes('placement: text(formData, "placement") ?? "homepage_promo"'))
add("repository normalizes homepage placement", repository.includes('export const HOMEPAGE_PROMO_PLACEMENT = "homepage_promo"'))
add("public query filters placement", repository.includes('.eq("placement", normalizedPlacement)'))
add("public query filters active banners", repository.includes('.eq("is_active", true)'))
add("public query allows null or elapsed start date", repository.includes('starts_at.is.null,starts_at.lte.${now}'))
add("public query allows null or future end date", repository.includes('ends_at.is.null,ends_at.gte.${now}'))
add("active flag is submitted explicitly", adminForm.includes('name="isActive" value={editing.isActive ? "true" : "false"}'))
add("server bool parser accepts true and on", actions.includes('["on", "true", "1", "yes"]'))
add("submitted dates normalize to ISO", actions.includes('return parsed.toISOString()'))
add("service rejects end dates before start dates", service.includes('زمان پایان بنر باید بعد از زمان شروع باشد'))
add("save invalidates homepage path", actions.includes('invalidateHomepageBanners()'))
add("homepage invalidation revalidates slash", actions.includes('revalidatePath("/")'))
add("public query result has guarded diagnostics", repository.includes('[banner-flow] public homepage banners result'))
add("local upload URLs remain accepted", repository.includes('trimmed.startsWith("/")'))
add("no active Supabase Storage calls", ![actions, repository, service].some((source) => source.includes("supabase.storage") || source.includes("storage.from(")))

console.log("Homepage banner-flow audit")
for (const check of checks) console.log(`${check.ok ? "✓" : "✗"} ${check.label}`)
const failures = checks.filter((check) => !check.ok)
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`)
  process.exit(1)
}
console.log(`\nAll ${checks.length} homepage banner-flow checks passed.`)
