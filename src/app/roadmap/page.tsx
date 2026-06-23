import type { Metadata } from "next";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import {
  FeatureGrid,
  SuggestionForm,
  type FeatureRow,
} from "@/components/RoadmapInteractive";

export const metadata: Metadata = {
  title: "Roadmap a hlasování",
  description:
    "Co byste v Plzeňské únikovce chtěli mít? Hlasujte pro funkce a navrhněte vlastní. Nejhlasovanější jdou na řadu jako první.",
};

export const revalidate = 60;

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

// Statický fallback, kdyby Supabase neodpověděl. Drží stejný seznam jako
// 0003_feedback_roadmap.sql seed, ať máme co zobrazit při buildu bez DB.
const FALLBACK: FeatureRow[] = [
  {
    id: "push-notifikace",
    title: "Push notifikace pro vaši ulici",
    description: "Zítra zavírá ulice, kterou jezdíte. Pípne vám telefon den dopředu.",
    icon: "🔔",
    status: "considering",
    vote_count: 0,
  },
  {
    id: "sledovani-uzavirky",
    title: "Sledování uzavírky (e-mail / SMS)",
    description: "Označíte uzavírku „sledovat“ a dostanete e-mail, až končí.",
    icon: "👀",
    status: "considering",
    vote_count: 0,
  },
  {
    id: "mhd-mapa",
    title: "Mapa MHD odklonů",
    description: "Vidíte přímo na mapě, kudy jezdí váš autobus a kde má dočasné zastávky.",
    icon: "🚌",
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
    id: "predikce-dopravy",
    title: "Predikce ranní dopravy",
    description: "V pondělí 7:30 odhad: „dnes ráno na X bude cca 25 min kolona“.",
    icon: "🚦",
    status: "considering",
    vote_count: 0,
  },
  {
    id: "offline-pwa",
    title: "Offline režim (jako appka)",
    description: "Přidáte si únikovku na plochu telefonu, funguje i bez signálu.",
    icon: "📱",
    status: "considering",
    vote_count: 0,
  },
  {
    id: "foto-reporty",
    title: "Foto reporty z terénu",
    description: "Vidíte uzavírku v reálu jinak než v JSDI? Pošlete fotku, my ověříme.",
    icon: "📸",
    status: "considering",
    vote_count: 0,
  },
  {
    id: "sdileni-trasy",
    title: "Sdílení trasy s rodinou",
    description: "Pošlete partnerovi nebo dětem odkaz „dnes objízdkou přes X“.",
    icon: "🔗",
    status: "considering",
    vote_count: 0,
  },
  {
    id: "hlasovani-magistrat",
    title: "Hlasování pro magistrát",
    description: "Plzeňáci si vyhlasují, co chtějí od města vidět dřív zveřejněné.",
    icon: "🏛️",
    status: "considering",
    vote_count: 0,
  },
  {
    id: "api-vyvojari",
    title: "Veřejné API",
    description: "Volný přístup pro vývojáře, novináře a další služby k datům úzavírky.",
    icon: "⚙️",
    status: "considering",
    vote_count: 0,
  },
];

async function loadFeatures(): Promise<FeatureRow[]> {
  const supabase = getSupabase();
  if (!supabase) return FALLBACK;
  try {
    const { data, error } = await supabase
      .from("v_feature_vote_counts")
      .select("*")
      .order("display_order", { ascending: true });
    if (error) {
      console.warn("[roadmap] supabase error, fallback:", error.message);
      return FALLBACK;
    }
    return (data as FeatureRow[]) ?? FALLBACK;
  } catch (e) {
    console.warn("[roadmap] fetch failed:", e);
    return FALLBACK;
  }
}

export default async function Page() {
  const features = await loadFeatures();
  const totalVotes = features.reduce((sum, f) => sum + f.vote_count, 0);

  return (
    <article className="mx-auto max-w-4xl space-y-10 pb-12">
      <header className="space-y-3 border-b-[3px] border-ink pb-6">
        <Link
          href="/"
          style={HEAD_FONT}
          className="text-[10px] font-semibold uppercase tracking-[0.3em] text-blue hover:underline"
        >
          ← Zpět na úvod
        </Link>
        <div
          style={HEAD_FONT}
          className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue"
        >
          Roadmap
        </div>
        <h1
          style={HEAD_FONT}
          className="text-4xl font-bold uppercase leading-[0.95] text-ink sm:text-5xl md:text-6xl"
        >
          Co přidáme dál?
        </h1>
        <p className="max-w-2xl text-base leading-snug text-ink/70 sm:text-lg">
          Plzeňská únikovka je teprve začátek. Co byste v ní chtěli dál mít?
          Vyberte z toho, co zvažujeme. Nejhlasovanější jde na řadu první.
        </p>
        <p
          style={HEAD_FONT}
          className="text-[11px] font-semibold uppercase tracking-[0.3em] text-ink/55"
        >
          {totalVotes} {totalVotes === 1 ? "hlas" : totalVotes < 5 ? "hlasy" : "hlasů"} ·
          {" "}
          {features.length} návrhů · 1 hlas / fíčura
        </p>
      </header>

      <section>
        <FeatureGrid features={features} />
      </section>

      <section>
        <SuggestionForm />
      </section>

      <section className="rounded-2xl border-2 border-blue/20 bg-blue/[0.04] p-5 sm:p-6">
        <h3
          style={HEAD_FONT}
          className="text-xl font-bold uppercase text-blue sm:text-2xl"
        >
          Jak to funguje
        </h3>
        <ul className="mt-3 space-y-1.5 text-sm text-ink/80">
          <li>· Hlasujete anonymně. 1 hlas na fíčuru z jednoho zařízení.</li>
          <li>· Žádné cookies. Hlas si pamatuje váš prohlížeč přes localStorage.</li>
          <li>· Návrhy procházíme my, slušné dostanou status „plánujeme“.</li>
          <li>· Hotové fíčury jdou ze seznamu pryč a najdete je v aplikaci.</li>
        </ul>
      </section>
    </article>
  );
}
