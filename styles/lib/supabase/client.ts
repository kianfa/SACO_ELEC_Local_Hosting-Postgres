import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let publicClient: SupabaseClient | null = null

// Browser-safe anonymous database client for public reads.
// Only used when NEXT_PUBLIC_SUPABASE_URL is configured.
// On plain PostgreSQL setups, repositories fall back to the server-side pg client.
export function getSupabaseClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return null

  if (!publicClient) {
    publicClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  return publicClient
}
