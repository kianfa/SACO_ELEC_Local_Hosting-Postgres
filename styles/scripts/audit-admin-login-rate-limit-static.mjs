import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"

const read = async (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")
const actions = await read("lib/actions/auth-actions.ts")
const adminForm = await read("components/admin/auth/admin-login-form.tsx")
const customerLoginForm = await read("components/auth/login-form.tsx")
const customerRegistrationForm = await read("components/auth/register-form.tsx")
const forgotPasswordForm = await read("components/auth/forgot-password-form.tsx")
const resetPasswordForm = await read("components/auth/reset-password-form.tsx")
const limiter = await read("lib/auth/admin-login-rate-limit.ts")
const service = await read("lib/services/auth-service.ts")
const migration = await read("supabase/migrations/20260606_admin_login_rate_limits.sql")

const adminAction = actions.slice(actions.indexOf("export async function loginAdminAction"), actions.indexOf("export async function logoutAdminAction"))
const customerLoginAction = actions.slice(actions.indexOf("export async function loginCustomerAction"), actions.indexOf("export async function registerCustomerAction"))
const customerRegistrationAction = actions.slice(actions.indexOf("export async function registerCustomerAction"), actions.indexOf("export async function forgotPasswordAction"))

assert.ok(!adminForm.includes("TurnstileCaptcha"), "admin login widget must be removed")
assert.ok(!adminForm.includes("turnstileToken"), "admin login token field must be removed")
assert.ok(!adminAction.includes("verifyTurnstileToken") && !adminAction.includes("turnstileToken"), "admin Turnstile validation must be removed")
assert.ok(adminAction.indexOf("consumeAdminLoginAttempt()") < adminAction.indexOf("loginAdminWithEmailPassword(email,password)"), "rate limit must run before authentication provider")
assert.ok(adminAction.includes("clearAdminLoginAttempts(rateLimit.key)"), "successful admin login must clear the counter")
assert.ok(limiter.includes('createHash("sha256")'), "global bucket key must be hashed")
assert.ok(limiter.includes('update("admin-login-global-v1")'), "all admin login requests must use one shared global bucket")
assert.ok(!limiter.includes("headers()") && !limiter.includes("normalizeEmail"), "global limiter must not reset when IP or email changes")
assert.ok(limiter.includes("on conflict (key) do update"), "counter update must be atomic")
assert.ok(limiter.includes("attempt_count <= $3 as allowed"), "first three attempts must be allowed and the fourth blocked")
assert.ok(limiter.includes("delete from public.admin_login_rate_limits"), "expired-row cleanup must exist")
assert.ok(limiter.includes("تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ۱ دقیقه دیگر دوباره تلاش کنید."), "required Persian message must exist")
assert.ok(customerLoginForm.includes("TurnstileCaptcha") && customerLoginForm.includes("turnstileToken"), "customer login Turnstile must remain")
assert.ok(customerRegistrationForm.includes("TurnstileCaptcha") && customerRegistrationForm.includes("turnstileToken"), "customer registration Turnstile must remain")
assert.ok(customerLoginAction.includes("verifyTurnstileToken(captchaToken)"), "customer login Turnstile validation must remain")
assert.ok(customerRegistrationAction.includes("verifyTurnstileToken(captchaToken)"), "customer registration Turnstile validation must remain")
assert.ok(forgotPasswordForm.includes("forgotPasswordAction") && resetPasswordForm.includes("resetPasswordAction"), "password-reset forms must remain present")
assert.ok(service.includes('profile.role === "admin"'), "admin role authorization check must remain")
assert.ok(migration.includes("create table if not exists public.admin_login_rate_limits"), "migration must create persistent table")
assert.ok(migration.includes("revoke all on table public.admin_login_rate_limits"), "rate-limit table must not be exposed to public clients")

const maxAttempts = 3
const windowMs = 60_000
let record
function consume(now) {
  if (!record || record.windowStartedAt <= now - windowMs) record = { attemptCount: 1, windowStartedAt: now }
  else record.attemptCount += 1
  return record.attemptCount <= maxAttempts
}
function clear() { record = undefined }

assert.equal(consume(0), true, "attempt 1 accepted")
assert.equal(consume(1), true, "attempt 2 accepted after changing email and IP")
assert.equal(consume(2), true, "attempt 3 accepted after changing email and IP again")
assert.equal(consume(3), false, "attempt 4 blocked even if email and IP change")
assert.equal(consume(60_000), true, "login accepted after 60 seconds")
clear()
assert.equal(record, undefined, "successful-login clear removes the global record")

console.log("admin login global rate-limit static audit passed")
