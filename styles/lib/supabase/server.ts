import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { createPgShimClient, type PgShimClient } from "@/lib/supabase/pg-shim"

let serverDatabaseClient: SupabaseClient | PgShimClient | null = null

// Trusted application-server database client.
// On Supabase: uses the service-role key (bypasses RLS).
// On plain PostgreSQL: falls back to a pg Pool shim that speaks the same API.
export async function getSupabaseServerClient(): Promise<SupabaseClient | PgShimClient> {
  if (serverDatabaseClient) return serverDatabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (supabaseUrl && secretKey) {
    serverDatabaseClient = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    })
  } else {
    // Plain PostgreSQL mode — DATABASE_URL is used directly via the pg shim.
    serverDatabaseClient = createPgShimClient()
  }

  return serverDatabaseClient
}
