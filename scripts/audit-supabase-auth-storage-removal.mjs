import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const root = process.cwd()
const runtimeRoots = ["app", "components", "lib", "proxy.ts"].filter((entry) => existsSync(join(root, entry)))
const checks = []

function check(label, condition) {
  checks.push({ label, condition })
  console.log(`${condition ? "✓" : "✗"} ${label}`)
}

function read(file) { return readFileSync(join(root, file), "utf8") }
function walk(entry) {
  const absolute = join(root, entry)
  if (statSync(absolute).isFile()) return [entry]
  return readdirSync(absolute).flatMap((name) => walk(relative(root, join(absolute, name))))
}
function matches(pattern, roots = runtimeRoots) {
  return roots.flatMap(walk).filter((file) => pattern.test(read(file))).sort()
}

const forbiddenRuntimeAuth = /supabase\.auth|@supabase\/ssr|createServerClient|signInWithPassword|resetPasswordForEmail|auth\.uid\(\)|auth\.jwt\(\)|auth\.role\(\)/
const forbiddenRuntimeStorage = /supabase\.storage|storage\.from\(|createSignedUrl|getPublicUrl/

check("runtime Supabase Auth APIs are absent", matches(forbiddenRuntimeAuth).length === 0)
check("runtime Supabase Storage client APIs are absent", matches(forbiddenRuntimeStorage).length === 0)
check("Supabase SSR package is absent", !read("package.json").includes("@supabase/ssr"))
check("Supabase JS remains temporarily for table queries", read("package.json").includes("@supabase/supabase-js"))

const authService = read("lib/services/auth-service.ts")
const session = read("lib/auth/session.ts")
const adminAuth = read("lib/auth/admin-auth.ts")
const customerAuth = read("lib/auth/customer-auth.ts")
const proxy = read("proxy.ts")
const actions = [
  "lib/actions/admin-brand-actions.ts",
  "lib/actions/admin-categories-actions.ts",
  "lib/actions/admin-category-actions.ts",
  "lib/actions/admin-price-actions.ts",
  "lib/actions/admin-products-actions.ts",
  "lib/actions/site-content-actions.ts",
].map(read).join("\n")

for (const method of ["signInEmail", "signUpEmail", "requestPasswordReset", "resetPassword", "signOut"]) {
  check(`Better Auth ${method} is wired`, authService.includes(`auth.api.${method}`) || adminAuth.includes(`auth.api.${method}`) || customerAuth.includes(`auth.api.${method}`))
}
check("sessions use Better Auth server-side", session.includes('auth.api.getSession({ headers: await headers() })'))
check("proxy uses Better Auth cookie helper", proxy.includes('from "better-auth/cookies"') && proxy.includes("getSessionCookie(request)"))
check("protected admin actions validate server-side admin access", actions.includes("await requireAdminAccess()"))
check("admin login keeps explicit profile.role === admin check", authService.includes('profile.role === "admin"'))
check("admin protected layout keeps server-side role enforcement", adminAuth.includes('user.role !== "admin"'))

const storage = read("lib/storage/local-media-storage.ts")
const productRepo = read("lib/repositories/admin-products-repository.ts")
const contentRepo = read("lib/repositories/site-content-repository.ts")
const brandRepo = read("lib/repositories/admin-brands-repository.ts")
const categoryRepo = read("lib/repositories/admin-categories-repository.ts")
const env = read(".env.local.example")

check("default media root is public/uploads", storage.includes('process.cwd(), "public", "uploads"'))
check("default public media base URL is /uploads", storage.includes('const DEFAULT_PUBLIC_BASE_URL = "/uploads"'))
check("local deletion ignores remote URLs", storage.includes('if (/^https?:\\/\\//i.test(trimmed)) return null'))
check("local paths reject traversal", storage.includes('part === ".."') && storage.includes('resolved.startsWith(`${root}${path.sep}`)'))
check("product uploads write under products/{slug}", productRepo.includes('folder: `products/${safeSlug}`'))
check("site uploads write under site-media", contentRepo.includes('folder: `site-media/${folder}`'))
check("banner deletion only calls safe local deletion", contentRepo.includes("deleteLocalMediaByPublicUrl(imageUrl)"))
check("brand deletion only calls safe local deletion", brandRepo.includes("deleteLocalMediaByPublicUrl"))
check("category deletion only calls safe local deletion", categoryRepo.includes("deleteCategoryLocalMedia"))
check("legacy Supabase image URL readers remain", [contentRepo, brandRepo, categoryRepo].every((source) => source.includes("/storage/v1/object/public/")))

for (const required of [
  "DATABASE_URL=",
  "BETTER_AUTH_SECRET=",
  "BETTER_AUTH_URL=",
  "MEDIA_UPLOAD_DIR=./public/uploads",
  "NEXT_PUBLIC_MEDIA_BASE_URL=/uploads",
  "NEXT_PUBLIC_SUPABASE_URL=",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY=",
]) check(`environment example contains ${required}`, env.includes(required))

if (checks.some(({ condition }) => !condition)) {
  console.error("\nSupabase Auth/Storage removal audit failed.")
  process.exit(1)
}

console.log(`\nAll ${checks.length} Supabase Auth/Storage removal checks passed.`)
