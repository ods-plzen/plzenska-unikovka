import { getSupabase } from "@/lib/supabase";

export interface ChangelogEntry {
  id: number;
  title: string;
  body: string | null;
  attribution: string | null;
  kind: "fix" | "feature" | "data" | "event";
  published_at: string;
  link_href: string | null;
  link_label: string | null;
}

export async function getLatestChange(): Promise<ChangelogEntry | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("changelog")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getLatestChange:", error.message);
    return null;
  }
  return (data as ChangelogEntry | null) ?? null;
}

export async function getAllChanges(limit = 50): Promise<ChangelogEntry[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("changelog")
    .select("*")
    .eq("is_active", true)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getAllChanges:", error.message);
    return [];
  }
  return (data as ChangelogEntry[]) ?? [];
}

export function kindLabel(kind: ChangelogEntry["kind"]): string {
  switch (kind) {
    case "fix":
      return "Oprava";
    case "feature":
      return "Novinka";
    case "data":
      return "Data";
    case "event":
      return "Událost";
  }
}

export function formatPublishedAt(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  });
}
