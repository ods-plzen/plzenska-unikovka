import Link from "next/link";
import type { Closure } from "@/lib/types";

const SEVERITY_BORDER: Record<string, string> = {
  major: "border-l-[5px] border-l-[#c0392b]",
  medium: "border-l-[5px] border-l-[#153d8a]",
  minor: "border-l-[5px] border-l-gray-400",
};

const SEVERITY_LABEL: Record<string, string> = {
  major: "Úplná uzavírka",
  medium: "Omezení",
  minor: "Provoz omezen",
};

function fmtCzDate(iso?: string): string | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return null;
  return `${d}. ${m}. ${y}`;
}

export function ClosureCard({ c }: { c: Closure }) {
  const sev = c.severity ?? "minor";
  const label = SEVERITY_LABEL[sev];
  const dateOd = fmtCzDate(c.od);
  const dateDo = fmtCzDate(c.do);
  const date =
    dateOd && dateDo
      ? `${dateOd} – ${dateDo}`
      : dateOd
        ? `od ${dateOd}`
        : dateDo
          ? `do ${dateDo}`
          : c.termin;

  return (
    <Link
      href={`/?sel=${c.id}`}
      scroll={false}
      className={
        "group flex h-full flex-col rounded-xl border border-line bg-card p-4 transition-colors hover:border-blue " +
        SEVERITY_BORDER[sev]
      }
    >
      <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">
        {c.oblast} · {label}
      </div>
      <div className="head mt-1 text-lg font-bold leading-tight text-ink">
        {c.name}
      </div>
      <p className="mt-1 line-clamp-2 text-sm text-ink/75">{c.akce}</p>
      <div className="mt-auto pt-3 text-xs text-muted">
        {date}
      </div>
    </Link>
  );
}
