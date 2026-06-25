import { readFileSync } from "node:fs"

const read = (file) => readFileSync(file, "utf8")
const helper = read("lib/performance/server-timing.ts")
const env = read(".env.local.example")
const auth = read("lib/auth/session.ts")
const settings = read("lib/services/site-settings-service.ts")
const categories = read("lib/services/categories-service.ts")
const storage = read("lib/storage/local-media-storage.ts")
const productActions = read("lib/actions/admin-products-actions.ts")
const siteContentRepo = read("lib/repositories/site-content-repository.ts")

const checks = []
function check(condition, label) {
  checks.push({ condition, label })
  console.log(`${condition ? "✓" : "✗"} ${label}`)
}

for (const [key, value] of [
  ["EXTERNAL_REQUEST_TIMEOUT_MS", "20000"],
  ["AUTH_REQUEST_TIMEOUT_MS", "25000"],
  ["PUBLIC_DATA_TIMEOUT_MS", "20000"],
  ["ADMIN_MUTATION_TIMEOUT_MS", "30000"],
  ["FILE_OPERATION_TIMEOUT_MS", "15000"],
]) {
  check(env.includes(`${key}=${value}`), `.env.local.example contains ${key}=${value}`)
  check(helper.includes(`${key}`), `timeout helper reads ${key}`)
}

check(helper.includes('external: 20_000'), "default external timeout is 20000ms")
check(helper.includes('auth: 25_000'), "default auth timeout is 25000ms")
check(helper.includes('publicData: 20_000'), "default public-data timeout is 20000ms")
check(helper.includes('adminMutation: 30_000'), "default admin-mutation timeout is 30000ms")
check(helper.includes('fileOperation: 15_000'), "default file-operation timeout is 15000ms")
check(helper.includes('AbortSignal.timeout(getRequestTimeoutMs(profile))'), "compatible Supabase queries can use AbortSignal.timeout")
check(auth.includes('withAuthRequestTimeout("supabase.auth.getUser"'), "Supabase Auth uses auth timeout profile")
check(settings.includes('withPublicDataTimeout('), "site settings use public-data timeout profile")
check(categories.includes('withPublicDataTimeout("public categories lookup"'), "public categories use public-data timeout profile")
check(storage.includes('withFileOperationTimeout("write local media file"'), "local media writes use file-operation timeout profile")
check(storage.includes('withFileOperationTimeout("delete local media file"'), "local media deletes use file-operation timeout profile")
check(productActions.includes('withAdminMutationTimeout("create product"'), "product creation uses admin-mutation timeout profile")
check(productActions.includes('withAdminMutationTimeout("delete product"'), "product deletion uses admin-mutation timeout profile")
check(siteContentRepo.includes('createRequestTimeoutSignal("publicData")'), "public content Supabase reads use abort timeout signals")
check(siteContentRepo.includes('createRequestTimeoutSignal("adminMutation")'), "site-content Supabase mutations use abort timeout signals")

if (checks.some(({ condition }) => !condition)) {
  console.error("\nTimeout-profile audit failed.")
  process.exit(1)
}
console.log(`\nAll ${checks.length} timeout-profile checks passed.`)
