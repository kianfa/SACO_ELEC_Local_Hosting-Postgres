import { lookup } from "node:dns/promises"
import { performance } from "node:perf_hooks"
import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const runs = Math.max(1, Number(process.env.SUPABASE_LATENCY_RUNS || 5))
const parallelConcurrency = Math.max(2, Math.min(5, Number(process.env.SUPABASE_LATENCY_CONCURRENCY || 3)))
const timeoutMs = Math.max(500, Number(process.env.PUBLIC_DATA_TIMEOUT_MS || process.env.EXTERNAL_REQUEST_TIMEOUT_MS || 20000))

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.")
  process.exit(1)
}

const hostname = new URL(url).hostname
const supabase = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

function safeMessage(error) {
  return (error instanceof Error ? error.message : String(error)).replace(/[\r\n]+/g, " ").slice(0, 240)
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2
}

function summarize(values, timeoutCount, errors) {
  const rounded = values.map((value) => Math.round(value))
  if (!rounded.length) return { successCount: 0, timeoutCount, errors }
  const total = rounded.reduce((sum, value) => sum + value, 0)
  return {
    successCount: rounded.length,
    timeoutCount,
    minMs: Math.min(...rounded),
    maxMs: Math.max(...rounded),
    medianMs: Math.round(median(rounded)),
    averageMs: Math.round(total / rounded.length),
    runsMs: rounded,
    errors,
  }
}

async function withTimeout(label, operation) {
  let timeout
  let didTimeout = false
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise((_, reject) => {
        timeout = setTimeout(() => {
          didTimeout = true
          reject(new Error(`Timeout while waiting for ${label}`))
        }, timeoutMs)
      }),
    ])
  } catch (error) {
    if (didTimeout) error.isTimeout = true
    throw error
  } finally {
    if (timeout) clearTimeout(timeout)
  }
}

async function measure(label, operation) {
  const startedAt = performance.now()
  await withTimeout(label, operation)
  return performance.now() - startedAt
}

async function sequential(label, operation) {
  const values = []
  const errors = []
  let timeoutCount = 0
  for (let index = 0; index < runs; index += 1) {
    try {
      values.push(await measure(label, operation))
    } catch (error) {
      if (error?.isTimeout) timeoutCount += 1
      errors.push(`run ${index + 1}: ${safeMessage(error)}`)
    }
  }
  console.log(`${label} sequential`, summarize(values, timeoutCount, errors))
}

async function parallel(label, operation) {
  const values = []
  const errors = []
  let timeoutCount = 0
  const startedAt = performance.now()
  const results = await Promise.allSettled(
    Array.from({ length: parallelConcurrency }, () => measure(label, operation)),
  )
  for (const result of results) {
    if (result.status === "fulfilled") values.push(result.value)
    else {
      if (result.reason?.isTimeout) timeoutCount += 1
      errors.push(safeMessage(result.reason))
    }
  }
  console.log(`${label} parallel`, {
    concurrency: parallelConcurrency,
    wallClockMs: Math.round(performance.now() - startedAt),
    ...summarize(values, timeoutCount, errors),
  })
}

async function authSettingsRequest() {
  const response = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
    headers: { apikey: anonKey },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  await response.text()
}

async function siteSettingsQuery() {
  const { error } = await supabase
    .from("site_settings")
    .select("key,value")
    .in("key", ["contact_info", "site_contact", "site_info", "footer_info", "manual_checkout"])
  if (error) throw new Error(error.message)
}

async function lightweightDatabaseQuery() {
  const { error } = await supabase.from("site_settings").select("key").limit(1)
  if (error) throw new Error(error.message)
}

console.log("Supabase latency diagnostic")
console.log({ hostname, runs, parallelConcurrency, timeoutMs })
console.log("This measures raw network/query latency only. It does not render Next.js routes or inspect cache hit latency.")

await sequential("dns lookup", async () => lookup(hostname))
await sequential("auth settings request", authSettingsRequest)
await sequential("site_settings filtered query", siteSettingsQuery)
await sequential("lightweight database query", lightweightDatabaseQuery)
await parallel("site_settings filtered query", siteSettingsQuery)
await parallel("lightweight database query", lightweightDatabaseQuery)

console.log("No credentials, tokens, cookies, database URLs, or personal data were printed.")
