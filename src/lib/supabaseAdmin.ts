import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Service-role klient — POUZE pro server (API routes). Obchází RLS,
// takže se nikdy nesmí dostat do klientského bundle (žádný NEXT_PUBLIC_ prefix).
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

let _admin: SupabaseClient | null = null;

/** Vrátí service klienta, nebo null když env chybí (graceful 503 v routes). */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!URL || !SERVICE_KEY) return null;
  if (!_admin) {
    _admin = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return _admin;
}
