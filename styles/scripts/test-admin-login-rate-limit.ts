import { randomBytes } from "node:crypto"
import { existsSync, readFileSync } from "node:fs"
import { Pool } from "pg"

function loadLocalEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return
  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const separator = line.indexOf("=")
    if (separator <= 0) continue
    const key = line.slice(0, separator).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || process.env[key] !== undefined) continue
    let value = line.slice(separator + 1).trim()
    if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))) value = value.slice(1, -1)
    process.env[key] = value
  }
}

loadLocalEnvFile(".env.local")
loadLocalEnvFile(".env")

const databaseUrl = process.env.DATABASE_URL?.trim()
if (!databaseUrl) throw new Error("DATABASE_URL is missing")

const pool = new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 20_000 })
const testKey = `admin-login-rate-limit-test-${randomBytes(16).toString("hex")}`

async function consume(): Promise<{ allowed: boolean; attemptCount: number }> {
  const result = await pool.query<{ allowed: boolean; attempt_count: number }>({
    text: `
      with cleanup as (
        delete from public.admin_login_rate_limits
        where window_started_at < now() - interval '1 day'
      ), updated as (
        insert into public.admin_login_rate_limits (key, attempt_count, window_started_at)
        values ($1, 1, now())
        on conflict (key) do update
        set
          attempt_count = case
            when public.admin_login_rate_limits.window_started_at <= now() - make_interval(secs => $2)
              then 1
            else public.admin_login_rate_limits.attempt_count + 1
          end,
          window_started_at = case
            when public.admin_login_rate_limits.window_started_at <= now() - make_interval(secs => $2)
              then now()
            else public.admin_login_rate_limits.window_started_at
          end
        returning attempt_count, window_started_at
      )
      select attempt_count <= $3 as allowed, attempt_count
      from updated
    `,
    values: [testKey, 60, 3],
  })
  const row = result.rows[0]
  if (!row) throw new Error("No rate-limit row returned")
  return { allowed: row.allowed, attemptCount: row.attempt_count }
}

async function main(): Promise<void> {
  await pool.query("delete from public.admin_login_rate_limits where key = $1", [testKey])

  const attempts = []
  for (let index = 0; index < 4; index += 1) attempts.push(await consume())
  const pattern = attempts.map((attempt) => attempt.allowed)
  if (JSON.stringify(pattern) !== JSON.stringify([true, true, true, false])) throw new Error(`Unexpected attempt pattern: ${JSON.stringify(pattern)}`)

  await pool.query("update public.admin_login_rate_limits set window_started_at = now() - interval '61 seconds' where key = $1", [testKey])
  const afterExpiry = await consume()
  if (!afterExpiry.allowed || afterExpiry.attemptCount !== 1) throw new Error("Expired window did not reset correctly")

  await pool.query("delete from public.admin_login_rate_limits where key = $1", [testKey])
  const remaining = await pool.query<{ count: string }>("select count(*)::text as count from public.admin_login_rate_limits where key = $1", [testKey])
  if (remaining.rows[0]?.count !== "0") throw new Error("Cleanup did not remove the synthetic row")

  console.log("✓ attempts 1, 2, and 3 are allowed")
  console.log("✓ attempt 4 is blocked")
  console.log("✓ the 60-second expiry resets the window")
  console.log("✓ limiter row cleanup works")
}

main()
  .catch((error) => {
    console.error("Admin login rate-limit database test failed:", error instanceof Error ? error.message : "unknown error")
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end().catch(() => undefined)
  })
