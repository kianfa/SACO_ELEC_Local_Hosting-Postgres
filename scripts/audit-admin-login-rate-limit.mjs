import { readFileSync } from "node:fs"

const checks = []
function check(name, condition) {
  checks.push({ name, ok: Boolean(condition) })
}
function read(path) { return readFileSync(path, "utf8") }

const adminForm = read("components/admin/auth/admin-login-form.tsx")
const authActions = read("lib/actions/auth-actions.ts")
const limiter = read("lib/auth/admin-login-rate-limit.ts")
const migration = read("supabase/migrations/20260607_admin_login_rate_limits.sql")
const customerLogin = read("components/auth/login-form.tsx")
const registerForm = read("components/auth/register-form.tsx")

check("admin login form no longer imports Turnstile", !adminForm.includes("TurnstileCaptcha"))
check("admin login action no longer reads turnstileToken", !authActions.match(/loginAdminAction[\s\S]*turnstileToken[\s\S]*loginCustomerAction/))
check("customer login still renders Turnstile", customerLogin.includes("TurnstileCaptcha") && customerLogin.includes("turnstileToken"))
check("customer registration still renders Turnstile", registerForm.includes("TurnstileCaptcha") && registerForm.includes("turnstileToken"))
check("admin login checks rate limit before auth provider", authActions.indexOf("checkAdminLoginRateLimit(email)") < authActions.indexOf("loginAdminWithEmailPassword(email, password)"))
check("successful admin login clears rate limit", authActions.includes("clearAdminLoginRateLimit(email)"))
check("rate limit key is SHA-256 hashed", limiter.includes("createHash(\"sha256\")"))
check("rate limit uses IP and normalized email", limiter.includes("`${ip}:${normalizedEmail}`"))
check("rate limit allows 3 attempts", limiter.includes("const MAX_ATTEMPTS = 3"))
check("rate limit uses 60-second window", limiter.includes("const WINDOW_SECONDS = 60"))
check("rate limit state uses PostgreSQL pool", limiter.includes("authPool.connect()"))
check("rate limit update is atomic through insert on conflict", limiter.includes("on conflict (key) do update"))
check("expired rows are cleaned up", limiter.includes("delete from public.admin_login_rate_limits"))
check("blocked Persian message exists", limiter.includes("تعداد تلاش‌های ورود بیش از حد مجاز است"))
check("migration creates admin_login_rate_limits table", migration.includes("create table if not exists public.admin_login_rate_limits"))
check("migration stores key as primary key", migration.includes("key text primary key"))
check("migration does not include raw_ip column", !migration.includes("raw_ip") && !migration.includes("ip_address"))

const failed = checks.filter((item) => !item.ok)
for (const item of checks) console.log(`${item.ok ? "✓" : "✗"} ${item.name}`)
if (failed.length) {
  console.error(`\n${failed.length} admin-login rate-limit checks failed.`)
  process.exit(1)
}
console.log(`\nAll ${checks.length} admin-login rate-limit checks passed.`)
