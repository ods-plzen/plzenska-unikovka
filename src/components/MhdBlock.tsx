import type { MhdInfo, MhdMode, MhdReroute, MhdTempStop } from "@/lib/types";

const MODE_STYLE: Record<MhdMode, { bg: string; label: string }> = {
  tram: { bg: "#1f6fb2", label: "T" },
  bus: { bg: "#2C7A3E", label: "B" },
  trolley: { bg: "#7a3e9c", label: "Tr" },
  night: { bg: "#1e1e1e", label: "N" },
};

function LineBadge({ line, mode }: { line: string; mode?: MhdMode }) {
  const style = mode ? MODE_STYLE[mode] : { bg: "#374151", label: "" };
  return (
    <span
      className="inline-flex min-w-[2rem] items-center justify-center rounded-md px-1.5 py-0.5 text-xs font-bold text-white tabular-nums"
      style={{ background: style.bg }}
      aria-label={mode ? `${mode} ${line}` : `linka ${line}`}
    >
      {line}
    </span>
  );
}

function RerouteRow({ r }: { r: MhdReroute }) {
  return (
    <li className="rounded-lg border border-line/60 bg-white p-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {r.lines && r.lines.length > 0 ? (
          r.lines.map((line) => (
            <LineBadge key={line} line={line} mode={r.mode} />
          ))
        ) : (
          <span className="rounded-md bg-muted/15 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
            část MHD
          </span>
        )}
        {r.note && (
          <span className="ml-1 text-[11px] uppercase tracking-wide text-muted">
            {r.note}
          </span>
        )}
      </div>
      <div className="mt-1.5 flex items-start gap-1.5 text-sm text-ink">
        <span aria-hidden className="mt-0.5 text-sky">→</span>
        <span className="leading-snug">{r.via}</span>
      </div>
    </li>
  );
}

function TempStopRow({ s }: { s: MhdTempStop }) {
  return (
    <li className="rounded-lg border border-line/60 bg-white p-3">
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-amber">📍</span>
        <span className="text-sm font-semibold text-ink">{s.name}</span>
      </div>
      <div className="mt-1 pl-6 text-sm text-ink/80">
        dočasně v <span className="font-medium text-ink">{s.where}</span>
        {s.note && <span className="text-muted"> · {s.note}</span>}
      </div>
    </li>
  );
}

export function MhdBlock({ info }: { info: MhdInfo }) {
  const reroutes = info.reroutes ?? [];
  const tempStops = info.tempStops ?? [];
  const notes = info.notes ?? [];

  return (
    <section className="rounded-xl border border-line bg-card p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="head text-lg font-semibold text-blue">🚌 MHD v oblasti</h2>
        {reroutes.length + tempStops.length > 0 && (
          <span className="rounded-full bg-blue/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-blue">
            {reroutes.length > 0 &&
              `${reroutes.length} ${reroutes.length === 1 ? "odklon" : reroutes.length < 5 ? "odklony" : "odklonů"}`}
            {reroutes.length > 0 && tempStops.length > 0 && " · "}
            {tempStops.length > 0 &&
              `${tempStops.length} ${tempStops.length === 1 ? "zastávka" : tempStops.length < 5 ? "zastávky" : "zastávek"}`}
          </span>
        )}
      </div>

      {info.summary && (
        <p className="mb-3 text-sm font-medium text-ink/90">{info.summary}</p>
      )}

      {reroutes.length > 0 && (
        <div className="mb-4">
          <div className="head mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            🔀 Odklony tras
          </div>
          <ul className="space-y-2">
            {reroutes.map((r, i) => (
              <RerouteRow key={i} r={r} />
            ))}
          </ul>
        </div>
      )}

      {tempStops.length > 0 && (
        <div className="mb-4">
          <div className="head mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            📍 Dočasné zastávky
          </div>
          <ul className="space-y-2">
            {tempStops.map((s, i) => (
              <TempStopRow key={i} s={s} />
            ))}
          </ul>
        </div>
      )}

      {notes.length > 0 && (
        <div className="mb-2">
          <div className="head mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            ⚠️ Další informace
          </div>
          <ul className="space-y-1 text-sm text-ink/80">
            {notes.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-sky">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {info.sourceUrl && (
        <div className="mt-3 border-t border-line/60 pt-3 text-xs text-muted">
          Zdroj:{" "}
          <a
            href={info.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue hover:underline"
          >
            {info.sourceLabel ?? "PMDP — Změny v dopravě"} ↗
          </a>
        </div>
      )}
    </section>
  );
}
