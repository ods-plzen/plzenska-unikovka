import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

let _client: SupabaseClient | null = null;

/** Lazy singleton — vrátí klienta jen pokud jsou env vars nastavené.
 *  Jinak null = fallback na statická data z extras.json. */
export function getSupabase(): SupabaseClient | null {
  if (!URL || !KEY) return null;
  if (!_client) {
    _client = createClient(URL, KEY, {
      auth: { persistSession: false },
    });
  }
  return _client;
}
