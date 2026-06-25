import "server-only"

// Unified database client resolver for repositories.
// Returns the Supabase client (anon or service-role) when configured,
// otherwise falls back to the pg shim backed by DATABASE_URL.
// Always server-side — never imported by client components directly.

import { getSupabaseClient } from "@/lib/supabase/client"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { PgShimClient } from "@/lib/supabase/pg-shim"
import type { SupabaseClient } from "@supabase/supabase-js"

export type DbClient = SupabaseClient | PgShimClient

// For public read repositories (previously used anon key).
// Use the anonymous Supabase client only when the server is also configured to
// write to that same Supabase project. If the server secret is absent, the app
// is in plain PostgreSQL fallback mode and public reads must use DATABASE_URL as
// well; otherwise the storefront can read stale rows from an old Supabase
// project while admin mutations are saved to PostgreSQL.
export async function getReadDbClient(): Promise<DbClient> {
  const hasSupabaseServerConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY),
  )

  if (hasSupabaseServerConfig) {
    const publicClient = getSupabaseClient()
    if (publicClient) return publicClient
  }

  return getSupabaseServerClient()
}

// For server/admin write repositories (always uses service-role or pg shim).
export async function getServerDbClient(): Promise<DbClient> {
  return getSupabaseServerClient()
}
