import "server-only"

// ---------------------------------------------------------------------------
// profiles-db.ts
//
// Unified profiles table access that works on both:
//   • Supabase  — uses the Supabase server client (service-role key, bypasses RLS)
//   • Plain PostgreSQL — uses the pg Pool from DATABASE_URL directly
//
// The decision is made at runtime by checking whether NEXT_PUBLIC_SUPABASE_URL
// is set. Both paths expose the same small interface so callers don't care.
// ---------------------------------------------------------------------------

import { databasePool } from "@/lib/db/postgres"

export type ProfileRow = {
  id: string
  full_name: string | null
  phone: string | null
  role: string | null
}

function useSupabase(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY))
}

// SELECT id, full_name, phone, role FROM profiles WHERE id = $1
export async function getProfileById(id: string): Promise<ProfileRow | null> {
  if (useSupabase()) {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server")
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", id)
      .maybeSingle<ProfileRow>()
    if (error) throw new Error(`profiles lookup failed: ${error.message}`)
    return data
  }

  const { rows } = await databasePool.query<ProfileRow>(
    "SELECT id, full_name, phone, role FROM public.profiles WHERE id = $1",
    [id],
  )
  return rows[0] ?? null
}

// SELECT full_name FROM profiles WHERE id = $1
export async function getProfileFullNameById(id: string): Promise<string | null> {
  if (useSupabase()) {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server")
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", id)
      .maybeSingle<{ full_name: string | null }>()
    if (error) throw new Error(`profiles full_name lookup failed: ${error.message}`)
    return data?.full_name ?? null
  }

  const { rows } = await databasePool.query<{ full_name: string | null }>(
    "SELECT full_name FROM public.profiles WHERE id = $1",
    [id],
  )
  return rows[0]?.full_name ?? null
}

// INSERT into profiles (customer registration)
export async function insertCustomerProfile(profile: {
  id: string
  full_name: string | null
  phone: string | null
}): Promise<void> {
  if (useSupabase()) {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server")
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase
      .from("profiles")
      .insert({ id: profile.id, full_name: profile.full_name, phone: profile.phone, role: "customer" })
    if (error) throw new Error(`profiles insert failed: ${error.message}`)
    return
  }

  await databasePool.query(
    "INSERT INTO public.profiles (id, full_name, phone, role) VALUES ($1, $2, $3, 'customer')",
    [profile.id, profile.full_name, profile.phone],
  )
}

// UPSERT into profiles (customer registration via signUp)
export async function upsertCustomerProfile(profile: {
  id: string
  full_name: string | null
  phone: string | null
}): Promise<void> {
  if (useSupabase()) {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server")
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: profile.id, full_name: profile.full_name, phone: profile.phone, role: "customer" }, { onConflict: "id" })
    if (error) throw new Error(`profiles upsert failed: ${error.message}`)
    return
  }

  await databasePool.query(
    `INSERT INTO public.profiles (id, full_name, phone, role)
     VALUES ($1, $2, $3, 'customer')
     ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone`,
    [profile.id, profile.full_name, profile.phone],
  )
}
