import type {
  DetourBranch,
  KeyNumber,
  MhdInfo,
  MhdReroute,
  ScopeIcon,
} from "@/lib/types";

const HEAD_FONT = { fontFamily: "var(--font-oswald), sans-serif" } as const;

const ALERT_RED = "#c0392b";

/* ─── KEY NUMBERS — hero stat row ─── */

export function KeyNumbers({ items }: { items: KeyNumber[] }) {
  if (!items.length) return null;
  return (
    <section className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border-2 border-ink/15 bg-ink/15 sm:grid-cols-4">
      {items.map((it, i) => {
        const color =
          it.tone === "alert"
            ? ALERT_RED
            : it.tone === "blue"
              ? "var(--ods-blue, #153d8a)"
              : "var(--ink, #0b1320)";
        return (
          <div
            key={i}
            className="flex flex-col items-start gap-1 bg-paper p-4 sm:p-5"
          >
            <div className="flex items-baseline gap-1.5">
              <span
                style={{ ...HEAD_FONT, color }}
                className="text-4xl font-bold leading-none sm:text-5xl"
              >
                {it.value}
              </span>
              {it.unit && (
                <span
                  style={HEAD_FONT}
                  className="text-sm font-semibold text-ink/55 sm:text-base"
                >
                  {it.unit}
                </span>
              )}
            </div>
            <div
              style={HEAD_FONT}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink/55 sm:text-[11px]"
            >
              {it.label}
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ─── SCOPE ICONS — co se rekonstruuje ─── */

export function ScopeIconsRow({ items }: { items: ScopeIcon[] }) {
  if (!items.length) return null;
  return (
    <section className="rounded-2xl border-2 border-ink/15 bg-paper p-4 sm:p-5">
      <h3
        style={HEAD_FONT}
        className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55 sm:text-[11px]"
      >
        Co se rekonstruuje
      </h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
        {items.map((it, i) => (
          <div key={i} className="flex flex-col items-center gap-1 text-center">
            <div className="text-2xl sm:text-3xl">{it.icon}</div>
            <div
              style={HEAD_FONT}
              className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink/70 sm:text-[11px]"
            >
              {it.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── DETOUR ITINERARY — svislý itinerář objízdné trasy (jako navigace) ─── */

const DETOUR_GREEN = "#15803d";


/* deep-linky do navigací — route je [lat, lon][] */
function sampleRoute(route: [number, number][], max = 6): [number, number][] {
  if (route.length <= 2) return [];
  const step = (route.length - 1) / (max + 1);
  const pts: [number, number][] = [];
  for (let i = 1; i <= max; i++) {
    const idx = Math.round(i * step);
    if (idx > 0 && idx < route.length - 1) pts.push(route[idx]);
  }
  return pts;
}
function gmapsDirUrl(route: [number, number][]): string {
  const o = route[0];
  const d = route[route.length - 1];
  const wp = sampleRoute(route)
    .map((p) => `${p[0]},${p[1]}`)
    .join("|");
  return (
    `https://www.google.com/maps/dir/?api=1&origin=${o[0]},${o[1]}` +
    `&destination=${d[0]},${d[1]}&travelmode=driving` +
    (wp ? `&waypoints=${encodeURIComponent(wp)}` : "")
  );
}
function mapyRouteUrl(route: [number, number][]): string {
  // Mapy.cz fnc API bere souřadnice jako lon,lat
  const o = route[0];
  const d = route[route.length - 1];
  const wp = sampleRoute(route, 4)
    .map((p) => `${p[1]},${p[0]}`)
    .join(";");
  return (
    `https://mapy.cz/fnc/v1/route?mapset=traffic&start=${o[1]},${o[0]}` +
    `&end=${d[1]},${d[0]}&routeType=car` +
    (wp ? `&waypoints=${wp}` : "")
  );
}

export function DetourItinerary({ detours }: { detours: DetourBranch[] }) {
  const branches = detours.filter((d) => (d.steps?.length ?? 0) >= 2);
  if (branches.length === 0) return null;
  return (
    <section className="rounded-2xl border-2 border-ink/15 bg-paper p-4 sm:p-5">
      <h3
        style={HEAD_FONT}
        className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-ink/55 sm:text-[11px]"
      >
        Objížďka — kudy jet
      </h3>
      <div
        className={
          branches.length > 1 ? "grid gap-6 sm:grid-cols-2" : "grid gap-6"
        }
      >
        {branches.map((d, bi) => {
          const steps = d.steps!;
          return (
            <div key={bi}>
              {d.label && (
                <p
                  style={HEAD_FONT}
                  className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-[#15803d]"
                >
                  {d.label}
                </p>
              )}
              <ol className="m-0 list-none p-0">
                {steps.map((s, i) => {
                  const isEnd = i === 0 || i === steps.length - 1;
                  return (
                    <li key={i} className="relative pb-4 pl-10 last:pb-0">
                      {i < steps.length - 1 && (
                        <span
                          aria-hidden
                          className="absolute bottom-[-2px] left-[11px] top-5 w-[3px] rounded bg-[#15803d]"
                        />
                      )}
                      <span
                        className={
                          "absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold " +
                          (isEnd
                            ? "bg-ink/85 text-paper"
                            : "border-2 border-[#15803d] bg-paper text-[#15803d]")
                        }
                      >
                        {i === 0 ? "A" : i === steps.length - 1 ? "B" : i}
                      </span>
                      <span className="text-sm font-semibold leading-6 text-ink">
                        {s}
                      </span>
                    </li>
                  );
                })}
              </ol>
              {typeof d.km === "number" && (
                <p className="mt-3 inline-block rounded-lg bg-[#15803d]/10 px-3 py-1.5 text-xs font-bold text-[#15803d]">
                  ≈ {String(d.km).replace(".", ",")} km
                </p>
              )}
              {d.route.length >= 2 && (
                <p className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={gmapsDirUrl(d.route)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-bold text-ink hover:border-blue hover:text-blue"
                  >
                    Projet v Google Maps ↗
                  </a>
                  <a
                    href={mapyRouteUrl(d.route)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-ink/20 bg-white px-3 py-1.5 text-xs font-bold text-ink hover:border-blue hover:text-blue"
                  >
                    Projet v Mapy.cz ↗
                  </a>
                </p>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-ink/55">
        Trasa A → B odpovídá zelené čáře na mapě (šipky = směr jízdy).
        Orientační vedení — na místě se řiďte přechodným dopravním značením.
      </p>
    </section>
  );
}

/* ─── MHD LINE CARDS — per linka card grid ─── */

function lineIcon(line: string, mode?: string): string {
  if (line.startsWith("N") || mode === "night") return "🌙";
  if (mode === "tram") return "🚊";
  if (mode === "trolley") return "🚎";
  return "🚌";
}

interface LineEntry {
  line: string;
  mode?: string;
  via: string;
  note?: string;
}

function flattenLines(reroutes: MhdReroute[]): LineEntry[] {
  const out: LineEntry[] = [];
  for (const r of reroutes) {
    if (!r.lines || r.lines.length === 0) continue;
    for (const l of r.lines) {
      out.push({ line: l, mode: r.mode, via: r.via, note: r.note });
    }
  }
  return out;
}

export function MhdLineCards({ info }: { info: MhdInfo }) {
  const lines = flattenLines(info.reroutes ?? []);
  if (lines.length === 0) return null;

  return (
    <section>
      <h3
        style={HEAD_FONT}
        className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-blue sm:text-sm"
      >
        🚌 MHD linky · odklony
      </h3>
      {info.summary && (
        <p className="mb-3 text-sm text-ink/75">{info.summary}</p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        {lines.map((l, i) => (
          <div
            key={`${l.line}-${i}`}
            className="flex flex-col gap-1.5 rounded-xl border-2 border-ink/15 bg-paper p-3 sm:p-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">
                {lineIcon(l.line, l.mode)}
              </span>
              <span
                style={HEAD_FONT}
                className="text-2xl font-bold leading-none text-ink sm:text-3xl"
              >
                {l.line}
              </span>
            </div>
            {l.note && (
              <div
                style={HEAD_FONT}
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-ink/55 sm:text-[10px]"
              >
                {l.note}
              </div>
            )}
            <div className="text-[11px] leading-snug text-ink/70 sm:text-xs">
              {l.via}
            </div>
          </div>
        ))}
      </div>
      {info.tempStops && info.tempStops.length > 0 && (
        <div className="mt-4 rounded-xl border border-line bg-card p-3 sm:p-4">
          <h4
            style={HEAD_FONT}
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-ink/55"
          >
            Dočasně přesunuté zastávky
          </h4>
          <ul className="space-y-1.5 text-sm text-ink/85">
            {info.tempStops.map((s, i) => (
              <li key={i}>
                <strong>{s.name}</strong> → {s.where}
                {s.note && <span className="text-ink/55"> ({s.note})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {info.notes && info.notes.length > 0 && (
        <ul className="mt-3 space-y-1 text-xs text-ink/55">
          {info.notes.map((n, i) => (
            <li key={i}>· {n}</li>
          ))}
        </ul>
      )}
      {info.sourceUrl && (
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink/45">
          Zdroj:{" "}
          <a
            href={info.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue hover:underline"
          >
            {info.sourceLabel ?? "PMDP"}
          </a>
        </p>
      )}
    </section>
  );
}
