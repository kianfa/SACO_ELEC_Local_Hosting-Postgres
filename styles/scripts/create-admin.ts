import { existsSync, readFileSync } from "node:fs"
import { createInterface } from "node:readline/promises"
import { stdin as input, stdout as output } from "node:process"
import { betterAuth } from "better-auth"
import { Pool } from "pg"

function loadLocalEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return

  for (const rawLine of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue

    const separator = line.indexOf("=")
    if (separator <= 0) continue

    const key = line.slice(0, separator).trim()
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue
    if (process.env[key] !== undefined) continue

    let value = line.slice(separator + 1).trim()
    if (
      value.length >= 2 &&
      ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'")))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}

// Standalone tsx scripts do not automatically read Next.js .env files.
// Keep explicit shell variables highest priority, then load local project files.
loadLocalEnvFile(".env.local")
loadLocalEnvFile(".env")

const databaseUrl = process.env.DATABASE_URL?.trim()
const betterAuthSecret = process.env.BETTER_AUTH_SECRET?.trim()

if (!databaseUrl) {
  throw new Error("DATABASE_URL is missing. Add it to .env.local or the current PowerShell session.")
}
if (!betterAuthSecret || betterAuthSecret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET is missing or shorter than 32 characters.")
}

const pool = new Pool({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 20_000,
})

const auth = betterAuth({
  database: pool,
  secret: betterAuthSecret,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  advanced: { database: { generateId: "uuid" } },
})

async function value(name: string, label: string): Promise<string> {
  const existing = process.env[name]?.trim()
  if (existing) return existing

  const rl = createInterface({ input, output })
  try {
    return (await rl.question(`${label}: `)).trim()
  } finally {
    rl.close()
  }
}

function safeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "Unknown error"

  const details = error as Error & {
    code?: unknown
    cause?: unknown
    status?: unknown
    statusCode?: unknown
  }
  const cause = details.cause as { code?: unknown; message?: unknown } | undefined
  const parts = [
    details.name && details.name !== "Error" ? details.name : undefined,
    typeof details.code === "string" ? `code=${details.code}` : undefined,
    typeof details.statusCode === "number" ? `status=${details.statusCode}` : undefined,
    typeof details.status === "number" ? `status=${details.status}` : undefined,
    details.message?.trim() || undefined,
    typeof cause?.code === "string" ? `causeCode=${cause.code}` : undefined,
    typeof cause?.message === "string" ? cause.message.trim() : undefined,
  ].filter(Boolean)

  const message = parts.join(" | ") || "Unknown database or authentication error"
  return message
    .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[DATABASE_URL hidden]")
    .replace(/sb_secret_[A-Za-z0-9_-]+/g, "[Supabase secret hidden]")
}

async function verifyDatabaseSetup(): Promise<void> {
  console.log("Checking PostgreSQL connection...")
  const result = await pool.query<{
    user_table: string | null
    session_table: string | null
    account_table: string | null
    verification_table: string | null
    profiles_table: string | null
  }>(`
    select
      to_regclass('public."user"')::text as user_table,
      to_regclass('public.session')::text as session_table,
      to_regclass('public.account')::text as account_table,
      to_regclass('public.verification')::text as verification_table,
      to_regclass('public.profiles')::text as profiles_table
  `)

  const tables = result.rows[0]
  const missing = Object.entries(tables)
    .filter(([, tableName]) => !tableName)
    .map(([key]) => key.replace(/_table$/, ""))

  if (missing.length > 0) {
    throw new Error(`Missing required PostgreSQL tables: ${missing.join(", ")}. Apply the Better Auth SQL migration first.`)
  }

  console.log("PostgreSQL connection and Better Auth tables are ready")
}

async function main(): Promise<void> {
  await verifyDatabaseSetup()

  const email = (await value("ADMIN_EMAIL", "Admin email")).toLowerCase()
  const fullName = await value("ADMIN_FULL_NAME", "Admin full name")
  const phone = await value("ADMIN_PHONE", "Admin phone")
  const password = process.env.ADMIN_PASSWORD

  if (!email || !fullName || !phone) {
    throw new Error("Missing required admin fields: email, full name, and phone are required")
  }

  const existing = await pool.query<{ id: string }>(
    'select id from public."user" where lower(email)=lower($1) limit 1',
    [email],
  )

  let userId = existing.rows[0]?.id
  if (!userId) {
    if (!password || password.length < 8) {
      throw new Error("Set ADMIN_PASSWORD with at least 8 characters for a new admin")
    }

    console.log("Creating Better Auth user...")
    const result = await auth.api.signUpEmail({ body: { email, password, name: fullName } })
    userId = result.user?.id
    if (!userId) throw new Error("Better Auth did not return a user ID")
    console.log("Created Better Auth admin user")
  } else {
    await pool.query('update public."user" set name=$2, "updatedAt"=now() where id=$1', [userId, fullName])
    console.log("Better Auth user already exists; profile role will be updated")
  }

  await pool.query(
    `insert into public.profiles (id, full_name, phone, role)
     values ($1,$2,$3,'admin')
     on conflict (id) do update set full_name=excluded.full_name, phone=excluded.phone, role='admin'`,
    [userId, fullName, phone],
  )

  console.log("Admin profile is ready")
}

main()
  .catch((error) => {
    console.error("Admin creation failed:", safeErrorMessage(error))
    process.exitCode = 1
  })
  .finally(async () => {
    await pool.end().catch(() => undefined)
  })
