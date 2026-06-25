import { getReadDbClient } from "@/lib/supabase/get-db-client"

const PUBLIC_SITE_SETTING_KEYS = [
  "contact_info",
  "site_contact",
  "site_info",
  "footer_info",
  "manual_checkout",
] as const

type RawSiteSetting = {
  key: string | null
  value: Record<string, unknown> | null
}

function isMissingTableOrColumn(message: string) {
  const lower = message.toLowerCase()
  return lower.includes("does not exist") || lower.includes("schema cache")
}

// One browser-safe anonymous database request for storefront-only settings.
// `site_settings.key` is already UNIQUE in the schema, which creates the
// supporting index used by this filtered query.
export async function fetchPublicSiteSettingsRows(signal?: AbortSignal): Promise<Record<string, Record<string, unknown>>> {
  const supabase = await getReadDbClient()
  let query = supabase
    .from("site_settings")
    .select("key,value")
    .in("key", [...PUBLIC_SITE_SETTING_KEYS])

  if (signal) query = query.abortSignal(signal)
  const { data, error } = await query

  if (error) {
    if (isMissingTableOrColumn(error.message)) return {}
    throw new Error(`Failed to fetch public site settings: ${error.message}`)
  }

  return ((data ?? []) as RawSiteSetting[]).reduce<Record<string, Record<string, unknown>>>((acc, row) => {
    if (row.key) acc[row.key] = row.value ?? {}
    return acc
  }, {})
}
