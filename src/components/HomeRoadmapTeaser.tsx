import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { FeatureRow } from "@/components/RoadmapInteractive";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

const STATIC: FeatureRow[] = [
  {
    id: "push-notifikace",
    title: "Push notifikace pro vaši ulici",
    description: "Zítra zavírá ulice, kterou jezdíte. Pípne vám telefon.",
    icon: "🔔",
    status: "considering",
    vote_count: 0,
  },
  {
    id: "tydenni-email",
    title: "Týdenní e-mail digest",
    description: "Každé pondělí ráno přehled toho, co se za týden v Plzni změní.",
    icon: "✉️",
    status: "considering",
    vote_count: 0,
  },
  {
    id: "offline-pwa",
    title: "Offline režim (jako appka)",
    description: "Přidáte si únikovku na plochu telefonu.",
    icon: "📱",
    status: "considering",
    vote_count: 0,
  },
];

async function loadTop3(): Promise<{ items: FeatureRow[]; total: number }> {
  const supabase = getSupabase();
  if (!supabase) return { items: STATIC, total: 0 };
  try {
    const { data, error } = await supabase
      .from("v_feature_vote_counts")
      .select("*")
      .order("vote_count", { ascending: false })
      .limit(3);
    if (error || !data) return { items: STATIC, total: 0 };
    // Plus total
    const { data: all } = await supabase
      .from("v_feature_vote_counts")
      .select("vote_count");
    const total =
      (all as { vote_count: number }[] | null)?.reduce(
        (s, r) => s + (r.vote_count ?? 0),
        0,
      ) ?? 0;
    return { items: data as FeatureRow[], total };
  } catch {
    return { items: STATIC, total: 0 };
  }
}

export async function HomeRoadmapTeaser() {
  const { items, total } = await loadTop3();
  return (
    <section className="rounded-3xl border-2 border-blue/15 bg-paper/80 p-5 sm:p-7">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2
          style={HEAD_FONT}
          className="text-2xl font-bold uppercase tracking-tight text-blue sm:text-3xl"
        >
          Co přidáme dál?
        </h2>
        <span
          style={HEAD_FONT}
          className="text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55 sm:text-[11px]"
        >
          {total} {total === 1 ? "hlas" : total < 5 ? "hlasy" : "hlasů"} ·{" "}
          {items.length === 1 ? "návrh" : "návrhy"}
        </span>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink/70 sm:text-base">
        Plzeňská únikovka je teprve začátek. Vyberte z toho, co zvažujeme.
        Nejhlasovanější jde na řadu první.
      </p>

      <ul className="mt-5 grid gap-2 sm:gap-3">
        {items.map((f) => (
          <li
            key={f.id}
            className="flex items-center gap-3 rounded-xl bg-paper px-4 py-3 ring-1 ring-ink/10"
          >
            <span className="text-2xl">{f.icon ?? "•"}</span>
            <div className="min-w-0 flex-1">
              <div
                style={HEAD_FONT}
                className="text-sm font-bold uppercase tracking-tight text-ink sm:text-base"
              >
                {f.title}
              </div>
              {f.description && (
                <div className="text-xs leading-snug text-ink/65 sm:text-sm">
                  {f.description}
                </div>
              )}
            </div>
            <span
              style={HEAD_FONT}
              className="shrink-0 rounded-full bg-blue/[0.08] px-3 py-1 text-xs font-bold tabular-nums text-blue sm:text-sm"
            >
              {f.vote_count}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-ink/55 sm:text-sm">
          Hlasování 1× za zařízení. Žádné cookies, žádná registrace.
        </p>
        <Link
          href="/roadmap"
          style={HEAD_FONT}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-blue px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-paper transition-colors hover:bg-blue-deep sm:text-xs"
        >
          Hlasovat
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}
