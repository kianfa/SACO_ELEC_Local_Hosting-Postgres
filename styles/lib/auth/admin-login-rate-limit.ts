import "server-only"

import crypto from "node:crypto"
import { headers } from "next/headers"
import { authPool } from "@/lib/auth/better-auth"

const WINDOW_SECONDS = 60
const MAX_ATTEMPTS = 3

export const ADMIN_LOGIN_RATE_LIMIT_MESSAGE =
  "تعداد تلاش‌های ورود بیش از حد مجاز است. لطفاً ۱ دقیقه دیگر دوباره تلاش کنید."

export const ADMIN_LOGIN_RATE_LIMIT_INTERNAL_ERROR_MESSAGE =
  "خطا در بررسی محدودیت ورود. لطفاً دوباره تلاش کنید."

type RateLimitResult =
  | { allowed: true; retryAfterSeconds: 0 }
  | { allowed: false; retryAfterSeconds: number; message: string }

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function firstHeaderValue(value: string | null): string {
  return (value ?? "").split(",")[0]?.trim() || ""
}

async function getRequestIp(): Promise<string> {
  const requestHeaders = await headers()

  return (
    firstHeaderValue(requestHeaders.get("cf-connecting-ip")) ||
    firstHeaderValue(requestHeaders.get("x-real-ip")) ||
    firstHeaderValue(requestHeaders.get("x-forwarded-for")) ||
    "unknown"
  )
}

async function getRateLimitKey(email: string): Promise<string> {
  const ip = await getRequestIp()
  const normalizedEmail = normalizeEmail(email)
  const digest = crypto
    .createHash("sha256")
    .update(`${ip}:${normalizedEmail}`)
    .digest("hex")

  return `admin-login:${digest}`
}

export async function checkAdminLoginRateLimit(email: string): Promise<RateLimitResult> {
  const key = await getRateLimitKey(email)
  let client: Awaited<ReturnType<typeof authPool.connect>> | null = null

  try {
    client = await authPool.connect()
    await client.query("begin")

    await client.query(
      `delete from public.admin_login_rate_limits
       where window_started_at < now() - make_interval(secs => $1::int)`,
      [WINDOW_SECONDS],
    )

    const result = await client.query<{
      attempt_count: number
      retry_after_seconds: string | number
    }>(
      `insert into public.admin_login_rate_limits as limits
         (key, attempt_count, window_started_at, updated_at)
       values ($1, 1, now(), now())
       on conflict (key) do update
       set
         attempt_count = case
           when limits.window_started_at < now() - make_interval(secs => $2::int) then 1
           else limits.attempt_count + 1
         end,
         window_started_at = case
           when limits.window_started_at < now() - make_interval(secs => $2::int) then now()
           else limits.window_started_at
         end,
         updated_at = now()
       returning
         attempt_count,
         greatest(
           0::numeric,
           ceil($2::numeric - extract(epoch from (now() - window_started_at)))
         ) as retry_after_seconds`,
      [key, WINDOW_SECONDS],
    )

    await client.query("commit")

    const row = result.rows[0]
    const retryAfterSeconds = Number(row?.retry_after_seconds ?? WINDOW_SECONDS)

    if (!row || row.attempt_count <= MAX_ATTEMPTS) {
      return { allowed: true, retryAfterSeconds: 0 }
    }

    return {
      allowed: false,
      retryAfterSeconds,
      message: ADMIN_LOGIN_RATE_LIMIT_MESSAGE,
    }
  } catch (error) {
    if (client) {
      await client.query("rollback").catch(() => undefined)
    }
    const safeMessage = error instanceof Error ? error.message : "unknown error"
    console.error("[admin-login-rate-limit] failed", `safeMessage=${safeMessage}`)
    return {
      allowed: false,
      retryAfterSeconds: WINDOW_SECONDS,
      message: ADMIN_LOGIN_RATE_LIMIT_INTERNAL_ERROR_MESSAGE,
    }
  } finally {
    client?.release()
  }
}

export async function clearAdminLoginRateLimit(email: string): Promise<void> {
  const key = await getRateLimitKey(email)
  await authPool.query("delete from public.admin_login_rate_limits where key = $1", [key])
}
